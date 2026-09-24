import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { configured, supabase } from "@/lib/supabase";
import {
  store,
  addAccount,
  login,
  session,
  sessionUser,
  publicUser,
  rateLimit,
} from "@/lib/store";
import {
  canAccess,
  validateUpload,
  validConsent,
  categories,
  statuses,
  preferredGoals,
  MAX_FILE_SIZE,
} from "@/lib/security";
import type { User, MedicalCase, MedicalFile } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const text = z.string().trim().max(4000);
const caseSchema = z.object({
  full_name: text.min(1),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) => !isNaN(Date.parse(v)) && Date.parse(v) <= Date.now(),
      "Invalid birth date",
    ),
  gender: text,
  nationality: text.min(1),
  current_country: text.min(1),
  main_condition: text.min(1),
  diagnosis: text,
  symptoms: text,
  duration: text.default(""),
  previous_surgeries: text.default(""),
  preferred_goal: z.enum(["", ...preferredGoals]).default(""),
  previous_treatment: text,
  medication: text,
  allergies: text,
});
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const [area, id, action] = path;
    const method = req.method;
    const host = new URL(req.url).hostname;
    if (!configured && !["localhost", "127.0.0.1", "[::1]"].includes(host))
      return json({ error: "Configure Supabase before deploying." }, 503);
    if (method !== "GET") {
      const origin = req.headers.get("origin");
      const expected = new URL(process.env.APP_URL || req.url).origin;
      const localOrigin =
        origin &&
        /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):3100$/.test(origin);
      if (!origin || !(configured ? origin === expected : localOrigin))
        return json({ error: "Invalid request origin." }, 403);
      if (
        Number(req.headers.get("content-length") || 0) >
        MAX_FILE_SIZE + 1024 * 1024
      )
        return json({ error: "Request too large." }, 413);
    }
    const jar = await cookies();
    const db = configured ? await supabase() : null;
    let user: User | null = null;
    if (db) {
      const { data } = await db.auth.getUser();
      if (data.user) {
        const u = data.user;
        user = {
          id: u.id,
          email: u.email || "",
          full_name: u.user_metadata.full_name || "",
          country: u.user_metadata.country || "",
          preferred_language: u.user_metadata.preferred_language || "en",
          admin: u.app_metadata.role === "admin",
        };
      }
    } else {
      const a = sessionUser(jar.get("care_session")?.value || "");
      if (a) user = publicUser(a);
    }
    if (area === "session" && method === "GET")
      return json({ user, mode: configured ? "supabase" : "demo" });
    if (area === "auth" && method === "POST") {
      rateLimit("auth:" + (req.headers.get("x-forwarded-for") || host), 20);
      const body = await req.json();
      if (id === "logout") {
        if (db) await db.auth.signOut();
        else store.sessions.delete(jar.get("care_session")?.value || "");
        jar.delete("care_session");
        return json({ ok: true });
      }
      if (id === "demo-admin" && !db) {
        let a = [...store.accounts.values()].find((u) => u.admin);
        if (!a)
          a = addAccount(
            {
              email: "coordinator@demo.invalid",
              full_name: "Demo Coordinator",
              country: "China",
              preferred_language: "en",
            },
            randomUUID(),
            true,
          );
        jar.set("care_session", session(a.id), {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 28800,
        });
        return json({ user: publicUser(a) });
      }
      if (id === "password") {
        if (!user || !db)
          return json(
            { error: "Open the password recovery link from your email first." },
            401,
          );
        const password = z.string().min(10).max(128).parse(body.password);
        const { error } = await db.auth.updateUser({ password });
        if (error)
          throw Error(
            "Unable to update password. Request a new recovery link.",
          );
        await db.auth.signOut();
        return json({ message: "Password updated. Please log in." });
      }
      const email = z.email().max(254).parse(body.email).toLowerCase();
      if (id === "reset") {
        if (db) {
          const { error } = await db.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.APP_URL || new URL(req.url).origin}/auth/callback?next=/reset-password`,
          });
          if (error)
            throw Error("Unable to send a reset email. Please try again.");
        }
        return json({
          message: db
            ? "If an account exists, a recovery email will arrive shortly."
            : "Demo mode cannot send emails. Register a new synthetic account or restart the server.",
        });
      }
      const password = z.string().min(10).max(128).parse(body.password);
      if (id === "register") {
        if (body.terms !== true)
          return json(
            { error: "Please accept the Terms and Privacy Policy." },
            400,
          );
        const profile = z
          .object({
            full_name: text.min(1).max(100),
            country: text.min(1).max(100),
            preferred_language: z.enum(["en", "zh"]),
          })
          .parse(body);
        if (db) {
          const { data, error } = await db.auth.signUp({
            email,
            password,
            options: {
              data: { ...profile, terms_version: "2026-09-v1" },
              emailRedirectTo: `${process.env.APP_URL || new URL(req.url).origin}/auth/callback`,
            },
          });
          if (error)
            throw Error(
              "Registration could not be completed. Check your details or try logging in.",
            );
          return json({
            confirmation: !data.session,
            message: "Check your email to confirm your account.",
          });
        }
        const a = addAccount({ email, ...profile }, password);
        jar.set("care_session", session(a.id), {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 28800,
        });
        return json({ user: publicUser(a) });
      }
      if (id === "login") {
        if (db) {
          const { error } = await db.auth.signInWithPassword({
            email,
            password,
          });
          if (error)
            return json(
              {
                error:
                  "Email or password is incorrect, or email is unconfirmed.",
              },
              401,
            );
          return json({ ok: true });
        }
        const a = login(email, password);
        if (!a) return json({ error: "Email or password is incorrect." }, 401);
        jar.set("care_session", session(a.id), {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 28800,
        });
        return json({ user: publicUser(a) });
      }
    }
    if (area === "contact" && method === "POST") {
      rateLimit("contact:" + (req.headers.get("x-forwarded-for") || host), 5);
      const b = z
        .object({
          name: text.min(1).max(100),
          email: z.email(),
          country: text.min(1).max(100),
          phone: text.max(80),
          message: text.min(10),
          consent: z.literal(true),
        })
        .parse(await req.json());
      if (db) {
        const { error } = await db.from("inquiries").insert(b);
        if (error) throw Error("Unable to save inquiry. Please try again.");
      }
      return json({
        message: db
          ? "Your inquiry has been received."
          : "Demo inquiry validated. No message was sent.",
      });
    }
    if (!user) return json({ error: "Please log in to continue." }, 401);
    if (method !== "GET") rateLimit("user:" + user.id, 60);
    const getCase = async (caseId: string): Promise<MedicalCase | null> => {
      if (db) {
        const { data, error } = await db
          .from("medical_cases")
          .select("*,files:medical_files(*)")
          .eq("id", caseId)
          .maybeSingle();
        if (error) throw Error("Unable to load case.");
        return data;
      }
      const c = store.cases.get(caseId);
      return c &&
        (c.user_id === user!.id ||
          (user!.admin &&
            c.status !== "Draft" &&
            store.consents.some((x) => x.case_id === c.id)))
        ? c
        : null;
    };
    if (area === "cases") {
      if (!id && method === "GET") {
        if (req.nextUrl.searchParams.get("admin") === "true" && !user.admin)
          return json({ error: "Administrator access required." }, 403);
        if (db) {
          let q = db
            .from("medical_cases")
            .select("*,files:medical_files(*)")
            .order("created_at", { ascending: false });
          q =
            user.admin && req.nextUrl.searchParams.get("admin") === "true"
              ? q.neq("status", "Draft")
              : q.eq("user_id", user.id);
          const { data, error } = await q;
          if (error) throw Error("Unable to load cases.");
          return json({ cases: data });
        }
        return json({
          cases: [...store.cases.values()]
            .filter((c) =>
              user.admin && req.nextUrl.searchParams.get("admin") === "true"
                ? c.status !== "Draft"
                : c.user_id === user.id,
            )
            .map((c) =>
              user!.admin ? c : { ...c, coordinator_notes: undefined },
            ),
        });
      }
      if (!id && method === "POST") {
        const b = caseSchema.parse(await req.json());
        if (db) {
          const { data, error } = await db
            .from("medical_cases")
            .insert({ ...b, user_id: user.id })
            .select()
            .single();
          if (error) throw Error("Unable to save draft.");
          return json({ case: { ...data, files: [] } }, 201);
        }
        const c: MedicalCase = {
          ...b,
          id: randomUUID(),
          user_id: user.id,
          status: "Draft",
          created_at: new Date().toISOString(),
          files: [],
        };
        store.cases.set(c.id, c);
        return json({ case: c }, 201);
      }
      if (id) {
        const c = await getCase(id);
        if (!c) return json({ error: "Case not found." }, 404);
        if (method === "GET") {
          let notes = "";
          if (db && user.admin) {
            const { data } = await db
              .from("coordinator_notes")
              .select("body")
              .eq("case_id", id)
              .maybeSingle();
            notes = data?.body || "";
          }
          return json({
            case: {
              ...c,
              coordinator_notes: user.admin
                ? db
                  ? notes
                  : c.coordinator_notes
                : undefined,
            },
          });
        }
        if (action === "submit" && method === "POST") {
          if (c.user_id !== user.id || c.status !== "Draft")
            return json(
              { error: "Only your own draft can be submitted." },
              403,
            );
          const b = await req.json();
          if (!validConsent(b.consent, b.version))
            return json(
              { error: "Separate medical processing consent is required." },
              400,
            );
          if (!c.files.length)
            return json(
              {
                error: "Upload at least one medical record before submitting.",
              },
              400,
            );
          if (db) {
            const { error } = await db.rpc("submit_medical_case", {
              case_uuid: id,
              accepted: true,
              version: b.version,
            });
            if (error)
              throw Error(
                "Submission could not be completed. Refresh and try again.",
              );
          } else {
            if (c.status !== "Draft")
              return json({ error: "Case is no longer a draft." }, 403);
            c.status = "Records Submitted";
            c.submitted_at = new Date().toISOString();
            store.consents.push({
              user_id: user.id,
              case_id: id,
              version: b.version,
              accepted_at: c.submitted_at,
            });
          }
          return json({ ok: true });
        }
        if (action === "admin" && method === "PATCH") {
          if (!user.admin || c.status === "Draft")
            return json(
              { error: "Administrator access required for submitted cases." },
              403,
            );
          const b = z
            .object({
              status: z.enum(statuses).refine((s) => s !== "Draft"),
              notes: text,
            })
            .parse(await req.json());
          if (db) {
            const { error } = await db.rpc("update_case_coordination", {
              case_uuid: id,
              new_status: b.status,
              notes: b.notes,
            });
            if (error) throw Error("Unable to update case.");
          } else {
            c.status = b.status;
            c.coordinator_notes = b.notes;
          }
          return json({ ok: true });
        }
        if (action === "files" && method === "POST") {
          if (c.user_id !== user.id || c.status !== "Draft")
            return json(
              { error: "Files can only be added to your draft." },
              403,
            );
          if (c.files.length >= 10)
            return json({ error: "Maximum 10 files per case." }, 400);
          const form = await req.formData();
          const file = form.get("file");
          const category = String(form.get("category"));
          if (!(file instanceof File) || !categories.includes(category))
            return json({ error: "Select a file and category." }, 400);
          if (file.size > MAX_FILE_SIZE)
            return json({ error: "Maximum file size is 20 MB." }, 413);
          const bytes = Buffer.from(await file.arrayBuffer());
          const error = validateUpload(file.name, file.type, bytes);
          if (error) return json({ error }, 400);
          const fileId = randomUUID();
          const storage_path = `${user.id}/${c.id}/${fileId}.${file.name.split(".").pop()!.toLowerCase()}`;
          const f: MedicalFile = {
            id: fileId,
            case_id: id,
            user_id: user.id,
            file_name: file.name.replace(/[\x00-\x1f/\\]/g, "_").slice(0, 180),
            file_type: file.type,
            category,
            file_size: file.size,
            storage_path,
            created_at: new Date().toISOString(),
          };
          if (db) {
            const { error: up } = await db.storage
              .from("medical-records")
              .upload(storage_path, bytes, {
                contentType: file.type,
                upsert: false,
              });
            if (up) throw Error("Unable to upload file.");
            const { error: insert } = await db.from("medical_files").insert(f);
            if (insert) {
              await db.storage.from("medical-records").remove([storage_path]);
              throw Error("Unable to register file. Please retry.");
            }
          } else {
            if (c.status !== "Draft")
              return json({ error: "Case is no longer a draft." }, 403);
            store.blobs.set(fileId, bytes);
            c.files.push(f);
          }
          return json({ file: f }, 201);
        }
      }
    }
    if (area === "files" && id) {
      let f: MedicalFile | undefined;
      if (db) {
        const { data } = await db
          .from("medical_files")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        f = data ?? undefined;
      } else
        f = [...store.cases.values()]
          .flatMap((c) => c.files)
          .find(
            (f) =>
              f.id === id &&
              (f.user_id === user!.id ||
                (user!.admin &&
                  store.consents.some((x) => x.case_id === f.case_id))),
          );
      if (!f) return json({ error: "File not found." }, 404);
      if (method === "GET") {
        let bytes: Buffer;
        if (db) {
          const { data, error } = await db.storage
            .from("medical-records")
            .download(f.storage_path);
          if (error || !data) throw Error("File unavailable.");
          bytes = Buffer.from(await data.arrayBuffer());
        } else bytes = store.blobs.get(id)!;
        const preview =
          req.nextUrl.searchParams.get("preview") === "1" &&
          ["application/pdf", "image/jpeg", "image/png"].includes(f.file_type);
        return new NextResponse(new Uint8Array(bytes), {
          headers: {
            "Content-Type": f.file_type,
            "Content-Disposition": `${preview ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(f.file_name)}`,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox; default-src 'none'",
          },
        });
      }
      if (method === "DELETE") {
        const c = await getCase(f.case_id);
        if (f.user_id !== user.id || c?.status !== "Draft")
          return json(
            { error: "Only files in your draft can be deleted." },
            403,
          );
        if (db) {
          const { error: begin } = await db.rpc("begin_file_deletion", {
            file_uuid: id,
          });
          if (begin)
            throw Error("Unable to start file deletion. Refresh your case.");
          const { error } = await db.storage
            .from("medical-records")
            .remove([f.storage_path]);
          if (error)
            throw Error(
              "File deletion is pending. Please retry Delete before submitting.",
            );
          const { error: del } = await db.rpc("complete_file_deletion", {
            file_uuid: id,
          });
          if (del)
            throw Error(
              "File deletion is pending. Please retry Delete before submitting.",
            );
        } else {
          store.blobs.delete(id);
          c.files = c.files.filter((x) => x.id !== id);
        }
        return json({ ok: true });
      }
    }
    return json({ error: "Not found." }, 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        {
          error:
            "Please check required fields, valid email, and password length (10+ characters).",
        },
        400,
      );
    return json(
      {
        error:
          error instanceof Error && !error.message.includes("fetch")
            ? error.message
            : "Service unavailable. Please try again.",
      },
      400,
    );
  }
}
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
