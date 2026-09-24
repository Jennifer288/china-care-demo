import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addAccount,
  login,
  session,
  sessionUser,
  store,
  publicUser,
} from "../src/lib/store";
test("password hash is private and expired sessions cannot authenticate", () => {
  const a = addAccount(
    {
      email: "unit@example.test",
      full_name: "Synthetic",
      country: "Test",
      preferred_language: "en",
    },
    "SyntheticPassword123",
  );
  assert.notEqual(a.hash, "SyntheticPassword123");
  assert.equal(login(a.email, "IncorrectPassword"), null);
  assert.equal(login(a.email, "SyntheticPassword123")?.id, a.id);
  assert.equal("hash" in publicUser(a), false);
  const token = session(a.id);
  assert.equal(sessionUser(token)?.id, a.id);
  store.sessions.get(token)!.expires = Date.now() - 1;
  assert.equal(sessionUser(token), null);
});
