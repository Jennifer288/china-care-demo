import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateUpload,
  canAccess,
  validConsent,
  MAX_FILE_SIZE,
} from "../src/lib/security";
test("ownership cannot be bypassed by a guessed id", () => {
  assert.equal(canAccess({ id: "a", admin: false }, "b"), false);
  assert.equal(canAccess({ id: "a", admin: false }, "a"), true);
  assert.equal(canAccess({ id: "c", admin: true }, "b"), true);
});
test("uploads require allowed extension, MIME, size and signature", () => {
  assert.equal(
    validateUpload(
      "report.pdf",
      "application/pdf",
      new Uint8Array(Buffer.from("%PDF-1.7\n")),
    ),
    null,
  );
  assert.ok(validateUpload("report.html", "text/html", new Uint8Array([1])));
  assert.ok(
    validateUpload(
      "report.pdf",
      "application/pdf",
      new Uint8Array(Buffer.from("<script>")),
    ),
  );
  assert.ok(
    validateUpload(
      "report.pdf",
      "text/html",
      new Uint8Array(Buffer.from("%PDF-")),
    ),
  );
  assert.ok(
    validateUpload(
      "report.pdf",
      "application/pdf",
      new Uint8Array(MAX_FILE_SIZE + 1),
    ),
  );
  assert.ok(validateUpload("report.pdf", "application/pdf", new Uint8Array()));
});
test("submission needs separate explicit current-version consent", () => {
  assert.equal(validConsent(true, "2026-09-v1"), true);
  assert.equal(validConsent(false, "2026-09-v1"), false);
  assert.equal(validConsent("true", "2026-09-v1"), false);
  assert.equal(validConsent(true, "old"), false);
});
