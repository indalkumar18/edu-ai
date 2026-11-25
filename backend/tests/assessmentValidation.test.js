import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAssessmentSubmission, validateSelectionsAgainstQuestions } from "../utils/assessmentValidation.js";

const idA = "64b000000000000000000001";
const idB = "64b000000000000000000002";

test("accepts valid answers and the -1 skipped sentinel", () => {
  const result = validateAssessmentSubmission({
    topic: "  DBMS  ",
    answers: [
      { questionId: idA, selectedOption: 2 },
      { questionId: idB, selectedOption: -1 },
    ],
  });
  assert.deepEqual(result.value, {
    topic: "DBMS",
    answers: [
      { questionId: idA, selectedOption: 2 },
      { questionId: idB, selectedOption: -1 },
    ],
  });
});

test("rejects empty or malformed quiz submissions", () => {
  assert.ok(validateAssessmentSubmission({ topic: "", answers: [] }).error);
  assert.ok(validateAssessmentSubmission({ topic: "DBMS", answers: [null] }).error);
  assert.ok(validateAssessmentSubmission({ topic: "DBMS", answers: [{ questionId: "bad", selectedOption: 1 }] }).error);
  assert.ok(validateAssessmentSubmission({ topic: "DBMS", answers: [{ questionId: [idA], selectedOption: 1 }] }).error);
});

test("rejects non-integer and negative option indexes other than -1", () => {
  for (const selectedOption of ["1", 1.5, -2, null, undefined]) {
    assert.ok(validateAssessmentSubmission({
      topic: "DBMS",
      answers: [{ questionId: idA, selectedOption }],
    }).error);
  }
});

test("rejects duplicate question IDs and overly large attempts", () => {
  assert.match(validateAssessmentSubmission({
    topic: "DBMS",
    answers: [{ questionId: idA, selectedOption: 0 }, { questionId: idA, selectedOption: 1 }],
  }).error, /Duplicate/);

  const tooMany = Array.from({ length: 21 }, (_, index) => ({
    questionId: (BigInt(`0x${idA}`) + BigInt(index)).toString(16).padStart(24, "0"),
    selectedOption: -1,
  }));
  assert.match(validateAssessmentSubmission({ topic: "DBMS", answers: tooMany }).error, /at most 20/);
});


test("checks submitted selections against each question option count", () => {
  const questions = [
    { _id: idA, options: ["A", "B", "C"] },
    { _id: idB, options: ["Yes", "No"] },
  ];
  assert.ok(validateSelectionsAgainstQuestions([
    { questionId: idA, selectedOption: 2 },
    { questionId: idB, selectedOption: -1 },
  ], questions).value);
  assert.match(validateSelectionsAgainstQuestions([
    { questionId: idB, selectedOption: 2 },
  ], questions).error, /not available/);
});
