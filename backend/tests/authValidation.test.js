import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLogin, validateRegistration } from "../utils/authValidation.js";

test("registration trims and normalizes user identity fields", () => {
  const result = validateRegistration({
    name: "  Ada Lovelace  ",
    email: "  ADA@Example.com ",
    password: "correct-horse-9!",
  });
  assert.deepEqual(result.value, {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "correct-horse-9!",
    preferredLanguage: "English",
  });
});

test("registration rejects missing and non-string fields instead of throwing", () => {
  for (const body of [null, [], {}, { name: 42, email: "x@example.com", password: "password" },
    { name: "Ada", email: "x@example.com", password: 123 }]) {
    assert.equal(typeof validateRegistration(body).error, "string");
  }
});

test("registration validates name, email, password length and language", () => {
  assert.match(validateRegistration({ name: "A", email: "a@example.com", password: "password" }).error, /Name/);
  assert.match(validateRegistration({ name: "Ada", email: "invalid", password: "password" }).error, /valid email/);
  assert.match(validateRegistration({ name: "Ada", email: "a@example.com", password: "short" }).error, /8 characters/);
  assert.match(validateRegistration({ name: "Ada", email: "a@example.com", password: "x".repeat(73) }).error, /72 bytes/);
  assert.match(validateRegistration({ name: "Ada", email: "a@example.com", password: "password", preferredLanguage: "French" }).error, /English or Hindi/);
});

test("login normalizes email and rejects malformed requests", () => {
  assert.deepEqual(validateLogin({ email: " User@Example.com ", password: "secret" }).value, {
    email: "user@example.com",
    password: "secret",
  });
  assert.ok(validateLogin({ email: 10, password: "secret" }).error);
  assert.ok(validateLogin({ email: "not-an-email", password: "secret" }).error);
  assert.ok(validateLogin({ email: "user@example.com" }).error);
});
