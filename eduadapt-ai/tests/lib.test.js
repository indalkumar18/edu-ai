import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { formatTime, letter, cap, scoreTone } from "../src/lib/quiz.js";
import { strength, EMAIL_RE } from "../src/lib/password.js";
import { groupChats } from "../src/lib/chats.js";

describe("quiz helpers", () => {
  test("formats elapsed seconds as mm:ss", () => {
    assert.equal(formatTime(0), "00:00");
    assert.equal(formatTime(65), "01:05");
    assert.equal(formatTime(3599), "59:59");
  });

  test("maps option indexes to letters", () => {
    assert.deepEqual([0, 1, 2, 3].map(letter), ["A", "B", "C", "D"]);
  });

  test("capitalises difficulty labels", () => {
    assert.equal(cap("medium"), "Medium");
    assert.equal(cap(""), "");
    assert.equal(cap(undefined), "");
  });

  test("picks the correct score tone at the feedback boundaries", () => {
    assert.equal(scoreTone(100), "good");
    assert.equal(scoreTone(80), "good");
    assert.equal(scoreTone(79.99), "mid");
    assert.equal(scoreTone(50), "mid");
    assert.equal(scoreTone(49.99), "bad");
  });
});

describe("password strength", () => {
  test("is empty for an empty password", () => {
    assert.deepEqual(strength("").label, "");
    assert.equal(strength("").score, 0);
  });

  test("rates weak, fair, good and strong passwords", () => {
    assert.equal(strength("abc").label, "Weak");
    assert.equal(strength("abcdefgh").label, "Weak");
    assert.equal(strength("abcdefg1").label, "Fair");
    assert.equal(strength("Abcdefg1").label, "Good");
    assert.equal(strength("Abcdefg1!").label, "Strong");
  });

  test("lists which password rules are met", () => {
    const { checks } = strength("Abcdefg1");
    assert.equal(checks.filter((check) => check.ok).length, 3);
  });
});

describe("email validation", () => {
  test("accepts normal addresses and rejects malformed ones", () => {
    assert.equal(EMAIL_RE.test("you@example.com"), true);
    assert.equal(EMAIL_RE.test("bad"), false);
    assert.equal(EMAIL_RE.test("a@b"), false);
    assert.equal(EMAIL_RE.test("a b@c.com"), false);
  });
});

describe("groupChats", () => {
  const now = 1_700_000_000_000;
  const day = 86_400_000;
  const chats = [
    { id: "old", updatedAt: now - 20 * day },
    { id: "today", updatedAt: now - 1000 },
    { id: "week", updatedAt: now - 3 * day },
  ];

  test("buckets chats by age and sorts newest first", () => {
    const grouped = groupChats(chats, now);
    assert.deepEqual(grouped.map(([label]) => label), ["Today", "Previous 7 days", "Older"]);
    assert.equal(grouped[0][1][0].id, "today");
  });

  test("omits empty buckets and does not mutate the input", () => {
    const input = [{ id: "a", updatedAt: now }];
    assert.equal(groupChats(input, now).length, 1);
    assert.deepEqual(groupChats([], now), []);
    assert.equal(chats[0].id, "old");
  });
});
