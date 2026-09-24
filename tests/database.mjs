// Local PostgreSQL/WASM verification, not a live Supabase integration test.
// All fixtures are synthetic and the database exists only in memory.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
let checks = 0;
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const VERSION = "2026-09-v1";
const query = (sql, params = []) => db.query(sql, params);
const equal = (actual, expected, message) => {
  assert.deepEqual(actual, expected, message);
  checks++;
};
async function rejected(
  sql,
  params,
  pattern = /permission denied|row-level security|Not authorized|Explicit consent|Records required|pending file deletion|Storage deletion|draft records|Invalid case/i,
) {
  await assert.rejects(() => query(sql, params), pattern);
  checks++;
}
async function asUser(id, admin = false, spoofAdmin = false) {
  await db.exec("reset role");
  await query(
    "select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claims',$2,false)",
    [
      id,
      JSON.stringify({
        sub: id,
        app_metadata: admin ? { role: "admin" } : {},
        user_metadata: spoofAdmin ? { role: "admin" } : {},
      }),
    ],
  );
  await db.exec("set role authenticated");
}
async function count(table, where = "true", params = []) {
  return Number(
    (await query(`select count(*) as n from ${table} where ${where}`, params))
      .rows[0].n,
  );
}
async function draft(owner) {
  return (
    await query(
      `insert into public.medical_cases(user_id,full_name,date_of_birth,nationality,current_country,main_condition,duration,previous_surgeries,preferred_goal)
    values($1,'Synthetic Patient','1990-01-01','Test','Test','Synthetic condition','Two months','None reported','Second Opinion') returning id`,
      [owner],
    )
  ).rows[0].id;
}
async function file(owner, caseId, category = "Medical Report") {
  const path = `${owner}/${caseId}/${crypto.randomUUID()}.pdf`;
  await query(
    "insert into storage.objects(bucket_id,name) values('medical-records',$1)",
    [path],
  );
  const id = (
    await query(
      `insert into public.medical_files(case_id,user_id,file_name,file_type,category,storage_path,file_size)
    values($1,$2,'synthetic.pdf','application/pdf',$4,$3,20) returning id`,
      [caseId, owner, path, category],
    )
  ).rows[0].id;
  return { id, path };
}
async function submit(id) {
  return query("select public.submit_medical_case($1,true,$2)", [id, VERSION]);
}

try {
  // Emulate only the Supabase schemas/helpers/grants needed by this migration.
  // PGlite already supplies gen_random_uuid; its pgcrypto extension is omitted.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create schema storage;
    grant usage on schema public,auth,storage to anon,authenticated;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    create function storage.foldername(name text) returns text[] language sql immutable as $$
      select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,unique(bucket_id,name));
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to authenticated;
    alter default privileges in schema public grant all on tables to anon,authenticated;
  `);
  const migration = (
    await readFile(
      new URL("../supabase/migrations/001_initial.sql", import.meta.url),
      "utf8",
    )
  ).replace("create extension if not exists pgcrypto;", "");
  await db.exec(migration);
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/002_coordination_details.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  checks++;
  equal(
    (
      await query(
        "select public from storage.buckets where id='medical-records'",
      )
    ).rows[0].public,
    false,
    "bucket stays private",
  );
  for (const [id, email] of [
    [A, "synthetic-a@example.invalid"],
    [B, "synthetic-b@example.invalid"],
    [ADMIN, "synthetic-admin@example.invalid"],
  ]) {
    await query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [
        id,
        email,
        JSON.stringify({ full_name: "Synthetic", terms_version: VERSION }),
      ],
    );
  }
  await asUser(A);
  const aCase = await draft(A);
  equal(
    (
      await query(
        "select duration,previous_surgeries,preferred_goal from public.medical_cases where id=$1",
        [aCase],
      )
    ).rows[0],
    {
      duration: "Two months",
      previous_surgeries: "None reported",
      preferred_goal: "Second Opinion",
    },
    "owner can insert structured details",
  );
  await rejected(
    "insert into public.medical_cases(user_id,full_name,date_of_birth,nationality,current_country,main_condition,preferred_goal) values($1,'Synthetic','1990-01-01','Test','Test','Test','Cure')",
    [A],
    /check constraint/i,
  );
  const aFile = await file(A, aCase, "Diagnosis");
  equal(
    (
      await query("select category from public.medical_files where id=$1", [
        aFile.id,
      ])
    ).rows[0].category,
    "Diagnosis",
    "new file category accepted",
  );
  const deletionCase = await draft(A);
  const deletionFile = await file(A, deletionCase);
  equal(
    await count("public.patient_profiles"),
    1,
    "profile trigger populates own profile",
  );
  await rejected(
    "update public.medical_cases set status='Records Submitted' where id=$1",
    [aCase],
  );
  await rejected(
    "insert into public.medical_cases(user_id,full_name,date_of_birth,nationality,current_country,main_condition,status) values($1,'Synthetic','1990-01-01','Test','Test','Test','Records Submitted')",
    [A],
  );
  await rejected(
    "insert into public.consents(user_id,case_id,consent_type,consent_version) values($1,$2,'medical_processing',$3)",
    [A, aCase, VERSION],
  );
  await rejected("select public.submit_medical_case($1,false,$2)", [
    aCase,
    VERSION,
  ]);
  await rejected("select public.submit_medical_case($1,true,'obsolete')", [
    aCase,
  ]);
  equal(
    await count("public.consents", "consent_type='medical_processing'"),
    0,
    "failed submissions do not record consent",
  );
  // Referenced records cannot be removed from storage before the pending marker.
  equal(
    (
      await query("delete from storage.objects where name=$1 returning id", [
        aFile.path,
      ])
    ).rows.length,
    0,
    "storage requires deletion marker",
  );
  await asUser(B, false, true);
  const bCase = await draft(B);
  const bFile = await file(B, bCase);
  equal(
    (await query("select public.is_coordinator() as admin")).rows[0].admin,
    false,
    "user_metadata cannot grant admin",
  );
  equal(
    await count("public.medical_cases", "id=$1", [aCase]),
    0,
    "B cannot read A case",
  );
  equal(
    await count("public.medical_files", "id=$1", [aFile.id]),
    0,
    "B cannot read A metadata",
  );
  equal(
    await count("storage.objects", "name=$1", [aFile.path]),
    0,
    "B cannot read A storage",
  );
  equal(
    await count("public.patient_profiles", "user_id=$1", [A]),
    0,
    "B cannot read A profile",
  );
  equal(await count("public.users", "id=$1", [A]), 0, "B cannot read A user");
  await rejected("select public.submit_medical_case($1,true,$2)", [
    aCase,
    VERSION,
  ]);
  await rejected("select public.begin_file_deletion($1)", [aFile.id]);
  await rejected(
    "insert into storage.objects(bucket_id,name) values('medical-records',$1)",
    [`${B}/${aCase}/forged.pdf`],
  );
  await rejected(
    "insert into public.medical_files(case_id,user_id,file_name,file_type,category,storage_path,file_size) values($1,$2,'fake.pdf','application/pdf','Other',$3,10)",
    [aCase, B, `${B}/${aCase}/fake.pdf`],
  );
  await asUser(A);
  equal(
    await count("public.medical_cases", "id=$1", [bCase]),
    0,
    "A cannot read B case",
  );
  equal(
    await count("storage.objects", "name=$1", [bFile.path]),
    0,
    "A cannot read B storage",
  );
  await asUser(ADMIN, true);
  equal(await count("public.medical_cases"), 0, "admin cannot read drafts");
  equal(
    await count("public.medical_files"),
    0,
    "admin cannot read draft metadata",
  );
  equal(await count("storage.objects"), 0, "admin cannot read draft objects");
  await rejected(
    "select public.update_case_coordination($1,'Under Review','Synthetic note')",
    [aCase],
  );
  await asUser(A);
  await query("select public.begin_file_deletion($1)", [deletionFile.id]);
  equal(
    (
      await query(
        "select pending_delete from public.medical_files where id=$1",
        [deletionFile.id],
      )
    ).rows[0].pending_delete,
    true,
    "deletion is marked",
  );
  await rejected("select public.submit_medical_case($1,true,$2)", [
    deletionCase,
    VERSION,
  ]);
  await rejected("select public.complete_file_deletion($1)", [deletionFile.id]);
  // A retry of begin is idempotent, then deletion may safely complete.
  await query("select public.begin_file_deletion($1)", [deletionFile.id]);
  equal(
    (
      await query("delete from storage.objects where name=$1 returning id", [
        deletionFile.path,
      ])
    ).rows.length,
    1,
    "marked object deletes",
  );
  await query("select public.complete_file_deletion($1)", [deletionFile.id]);
  equal(
    await count("public.medical_files", "id=$1", [deletionFile.id]),
    0,
    "metadata deletion completes",
  );
  await rejected("select public.submit_medical_case($1,true,$2)", [
    deletionCase,
    VERSION,
  ]);
  await submit(aCase);
  equal(
    (
      await query(
        "select status,submitted_at is not null as dated from public.medical_cases where id=$1",
        [aCase],
      )
    ).rows[0],
    { status: "Records Submitted", dated: true },
    "submission sets status and time",
  );
  equal(
    await count(
      "public.consents",
      "case_id=$1 and consent_type='medical_processing' and consent_version=$2",
      [aCase, VERSION],
    ),
    1,
    "versioned consent recorded once",
  );
  await rejected("select public.submit_medical_case($1,true,$2)", [
    aCase,
    VERSION,
  ]);
  await rejected("select public.begin_file_deletion($1)", [aFile.id]);
  equal(
    (
      await query("delete from public.medical_files where id=$1 returning id", [
        aFile.id,
      ])
    ).rows.length,
    0,
    "patient cannot delete submitted metadata",
  );
  equal(
    (
      await query("delete from storage.objects where name=$1 returning id", [
        aFile.path,
      ])
    ).rows.length,
    0,
    "patient cannot delete submitted object",
  );
  await rejected(
    "update public.medical_files set pending_delete=true where id=$1",
    [aFile.id],
  );
  await rejected(
    "insert into storage.objects(bucket_id,name) values('medical-records',$1)",
    [`${A}/${aCase}/late.pdf`],
  );
  await rejected(
    "select public.update_case_coordination($1,'Completed','Spoof')",
    [aCase],
  );
  await asUser(ADMIN, true);
  equal(
    await count("public.medical_cases"),
    1,
    "admin sees only submitted case",
  );
  equal(
    await count("public.medical_files"),
    1,
    "admin sees only submitted file",
  );
  equal(await count("storage.objects"), 1, "admin sees only submitted object");
  await query(
    "select public.update_case_coordination($1,'Under Review','Synthetic internal note')",
    [aCase],
  );
  equal(
    await count("public.coordinator_notes"),
    1,
    "admin can read coordination notes",
  );
  await rejected("select public.update_case_coordination($1,'Draft','')", [
    aCase,
  ]);
  for (const status of [
    "Case Preparation",
    "Ready for Hospital Review",
    "Treatment Completed",
    "Follow-up",
    "Closed",
    "Completed",
  ]) {
    await query(
      "select public.update_case_coordination($1,$2,'Synthetic internal note')",
      [aCase, status],
    );
    equal(
      (
        await query("select status from public.medical_cases where id=$1", [
          aCase,
        ])
      ).rows[0].status,
      status,
      "new and legacy statuses supported",
    );
  }
  await rejected(
    "select public.update_case_coordination($1,'Cured','')",
    [aCase],
    /check constraint/i,
  );
  await asUser(A);
  equal(
    await count("public.coordinator_notes"),
    0,
    "patient cannot see internal note",
  );
  await db.exec("reset role; set role anon");
  await rejected("select * from public.medical_cases", []);
  await rejected("select public.submit_medical_case($1,true,$2)", [
    aCase,
    VERSION,
  ]);
  console.log(
    `Database migration and ${checks} assertions passed (in-memory PGlite; not live Supabase).`,
  );
} finally {
  await db.close();
}
