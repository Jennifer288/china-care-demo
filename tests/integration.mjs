import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:3100";
const a = { cookie: "" },
  b = { cookie: "" },
  admin = { cookie: "" };
async function request(client, path, method = "GET", body, expected = 200) {
  const headers = { Origin: base, Cookie: client.cookie };
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const r = await fetch(base + "/api/" + path, {
    method,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (r.headers.get("set-cookie"))
    client.cookie = r.headers.get("set-cookie").split(";")[0];
  const content = await r.text();
  assert.equal(r.status, expected, `${method} ${path}: ${content}`);
  return r.headers.get("content-type")?.includes("json")
    ? JSON.parse(content)
    : content;
}
const nonce = Date.now();
await request(a, "cases", "GET", undefined, 401);
for (const [client, n] of [
  [a, "a"],
  [b, "b"],
])
  await request(client, "auth/register", "POST", {
    email: `synthetic-${n}-${nonce}@example.test`,
    password: "SyntheticTest!123",
    full_name: `Synthetic Patient ${n}`,
    country: "Test country",
    preferred_language: "en",
    terms: true,
  });
const details = {
  full_name: "Synthetic Patient",
  date_of_birth: "1990-01-01",
  gender: "not-specified",
  nationality: "Test",
  current_country: "Test",
  main_condition: "Synthetic test case",
  diagnosis: "",
  symptoms: "",
  previous_treatment: "",
  medication: "",
  allergies: "",
};
const { case: legacy } = await request(a, "cases", "POST", details, 201);
assert.equal(legacy.duration, "");
assert.equal(legacy.preferred_goal, "");
await request(a, "cases", "POST", { ...details, preferred_goal: "Cure" }, 400);
const { case: c } = await request(
  a,
  "cases",
  "POST",
  {
    ...details,
    duration: "Two months",
    previous_surgeries: "None reported",
    preferred_goal: "Second Opinion",
  },
  201,
);
assert.equal(c.duration, "Two months");
assert.equal(c.previous_surgeries, "None reported");
assert.equal(c.preferred_goal, "Second Opinion");
await request(b, `cases/${c.id}`, "GET", undefined, 404);
await request(
  b,
  `cases/${c.id}/admin`,
  "PATCH",
  { status: "Completed", notes: "" },
  404,
);
await request(a, "cases?admin=true", "GET", undefined, 403);
await request(admin, "auth/demo-admin", "POST", {});
await request(admin, `cases/${c.id}`, "GET", undefined, 404);
await request(
  a,
  `cases/${c.id}/submit`,
  "POST",
  { consent: false, version: "2026-09-v1" },
  400,
);
await request(
  a,
  `cases/${c.id}/submit`,
  "POST",
  { consent: true, version: "2026-09-v1" },
  400,
);
const bad = new FormData();
bad.set("category", "Medical Report");
bad.set(
  "file",
  new File(["<script>evil</script>"], "fake.pdf", { type: "application/pdf" }),
);
await request(a, `cases/${c.id}/files`, "POST", bad, 400);
const f = new FormData();
f.set("category", "Diagnosis");
f.set(
  "file",
  new File(["%PDF-1.7\nSynthetic test only\n%%EOF"], "synthetic.pdf", {
    type: "application/pdf",
  }),
);
const { file } = await request(a, `cases/${c.id}/files`, "POST", f, 201);
await request(b, `files/${file.id}`, "GET", undefined, 404);
await request(admin, `files/${file.id}`, "GET", undefined, 404);
assert.match(await request(a, `files/${file.id}`), /%PDF/);
await request(a, `files/${file.id}`, "DELETE");
await request(a, `files/${file.id}`, "GET", undefined, 404);
const { file: finalFile } = await request(
  a,
  `cases/${c.id}/files`,
  "POST",
  f,
  201,
);
await request(
  a,
  `cases/${c.id}/submit`,
  "POST",
  { consent: true, version: "old" },
  400,
);
await request(a, `cases/${c.id}/submit`, "POST", {
  consent: true,
  version: "2026-09-v1",
});
await request(a, `cases/${c.id}/files`, "POST", f, 403);
await request(a, `files/${finalFile.id}`, "DELETE", undefined, 403);
await request(
  a,
  `cases/${c.id}/submit`,
  "POST",
  { consent: true, version: "2026-09-v1" },
  403,
);
assert.equal(
  (await request(admin, `cases/${c.id}`)).case.status,
  "Records Submitted",
);
await request(admin, `cases/${c.id}/admin`, "PATCH", {
  status: "Under Review",
  notes: "Synthetic internal note",
});
const patientCase = (await request(a, `cases/${c.id}`)).case;
assert.equal(patientCase.status, "Under Review");
assert.equal(patientCase.coordinator_notes, undefined);
for (const status of [
  "Case Preparation",
  "Ready for Hospital Review",
  "Treatment Completed",
  "Follow-up",
  "Closed",
  "Completed",
]) {
  await request(admin, `cases/${c.id}/admin`, "PATCH", { status, notes: "" });
  assert.equal((await request(a, `cases/${c.id}`)).case.status, status);
}
await request(
  admin,
  `cases/${c.id}/admin`,
  "PATCH",
  { status: "Cured", notes: "" },
  400,
);
assert.match(await request(admin, `files/${finalFile.id}`), /%PDF/);
assert.equal((await request(b, "cases")).cases.length, 0);
await request(a, "auth/logout", "POST", {});
await request(a, "cases", "GET", undefined, 401);
const csrf = await fetch(base + "/api/contact", {
  method: "POST",
  headers: {
    Origin: "https://untrusted.invalid",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(csrf.status, 403);
console.log(
  "PASS: registration, authentication, draft isolation, consent, upload validation, file ownership/read/delete, admin access, note isolation, logout and CSRF.",
);
