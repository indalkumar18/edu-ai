import { test } from "node:test";
import assert from "node:assert/strict";
import { feedbackFor, gradeQuestions } from "../utils/grading.js";

const questions = [
  { _id: "a", correctAnswer: 1, explanation: "because" },
  { _id: "b", correctAnswer: 0 },
  { _id: "c", correctAnswer: 2 },
  { _id: "d", correctAnswer: 3 },
];

test("scores correct, wrong and skipped answers", () => {
  const map = new Map([["a", 1], ["b", 2], ["c", 2]]); // d is skipped
  const result = gradeQuestions(questions, map);
  assert.equal(result.score, 2);
  assert.equal(result.totalQuestions, 4);
  assert.equal(result.percentage, 50);
  assert.deepEqual(result.gradedAnswers.map((a) => a.isCorrect), [true, false, true, false]);
  assert.equal(result.gradedAnswers[3].selectedOption, -1);
});

test("keeps the explanation and defaults it to an empty string", () => {
  const result = gradeQuestions(questions, new Map());
  assert.equal(result.gradedAnswers[0].explanation, "because");
  assert.equal(result.gradedAnswers[1].explanation, "");
});

test("a perfect quiz is 100 percent", () => {
  const map = new Map([["a", 1], ["b", 0], ["c", 2], ["d", 3]]);
  const result = gradeQuestions(questions, map);
  assert.equal(result.percentage, 100);
  assert.equal(result.score, 4);
});

test("non-integer selections are never marked correct", () => {
  const result = gradeQuestions([{ _id: "a", correctAnswer: 1 }], new Map([["a", 1.5]]));
  assert.equal(result.score, 0);
});

test("rounds percentage to two decimals", () => {
  const three = [{ _id: "a", correctAnswer: 0 }, { _id: "b", correctAnswer: 0 }, { _id: "c", correctAnswer: 0 }];
  const result = gradeQuestions(three, new Map([["a", 0]]));
  assert.equal(result.percentage, 33.33);
});

test("an empty question list does not divide by zero", () => {
  assert.equal(gradeQuestions([], new Map()).percentage, 0);
});

test("feedback thresholds", () => {
  assert.match(feedbackFor(80), /Great work/);
  assert.match(feedbackFor(79.99), /Good attempt/);
  assert.match(feedbackFor(50), /Good attempt/);
  assert.match(feedbackFor(49), /review the basics/);
});
