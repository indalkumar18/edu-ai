import { describe, it, expect } from "vitest";
import { formatTime, letter, cap, scoreTone } from "../src/lib/quiz";
import { strength, EMAIL_RE } from "../src/lib/password";
import { groupChats } from "../src/lib/chats";

describe("quiz helpers", () => {
  it("formats elapsed seconds as mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(3599)).toBe("59:59");
  });
  it("maps option indexes to letters", () => {
    expect([0, 1, 2, 3].map(letter)).toEqual(["A", "B", "C", "D"]);
  });
  it("capitalises difficulty labels", () => {
    expect(cap("medium")).toBe("Medium");
    expect(cap("")).toBe("");
    expect(cap(undefined)).toBe("");
  });
  it("picks a tone from the percentage", () => {
    expect(scoreTone(100)).toBe("good");
    expect(scoreTone(80)).toBe("good");
    expect(scoreTone(79)).toBe("mid");
    expect(scoreTone(50)).toBe("mid");
    expect(scoreTone(49)).toBe("bad");
  });
});

describe("password strength", () => {
  it("is empty for an empty password", () => {
    expect(strength("")).toMatchObject({ score: 0, label: "" });
  });
  it("rates weak, fair, good and strong passwords", () => {
    expect(strength("abc").label).toBe("Weak");
    expect(strength("abcdefgh").label).toBe("Weak");
    expect(strength("abcdefg1").label).toBe("Fair");
    expect(strength("Abcdefg1").label).toBe("Good");
    expect(strength("Abcdefg1!").label).toBe("Strong");
  });
  it("lists which rules are met", () => {
    const { checks } = strength("Abcdefg1");
    expect(checks.filter((c) => c.ok)).toHaveLength(3);
  });
});

describe("email validation", () => {
  it("accepts normal addresses and rejects malformed ones", () => {
    expect(EMAIL_RE.test("you@example.com")).toBe(true);
    expect(EMAIL_RE.test("bad")).toBe(false);
    expect(EMAIL_RE.test("a@b")).toBe(false);
    expect(EMAIL_RE.test("a b@c.com")).toBe(false);
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
  it("buckets chats by age and sorts newest first", () => {
    const grouped = groupChats(chats, now);
    expect(grouped.map(([label]) => label)).toEqual(["Today", "Previous 7 days", "Older"]);
    expect(grouped[0][1][0].id).toBe("today");
  });
  it("omits empty buckets and does not mutate the input", () => {
    const input = [{ id: "a", updatedAt: now }];
    expect(groupChats(input, now)).toHaveLength(1);
    expect(groupChats([], now)).toEqual([]);
    expect(chats[0].id).toBe("old");
  });
});
