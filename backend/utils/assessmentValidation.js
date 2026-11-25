const MAX_QUESTIONS_PER_ATTEMPT = 20;

export function validateAssessmentSubmission(body) {
  const topic = body?.topic;
  const answers = body?.answers;

  if (typeof topic !== "string" || !topic.trim() || topic.trim().length > 100
    || !Array.isArray(answers) || answers.length === 0) {
    return { error: "Topic and answers are required." };
  }
  if (answers.length > MAX_QUESTIONS_PER_ATTEMPT) {
    return { error: `A quiz can contain at most ${MAX_QUESTIONS_PER_ATTEMPT} answers.` };
  }

  const normalizedAnswers = [];
  const seenIds = new Set();
  for (const item of answers) {
    if (!item || typeof item !== "object" || typeof item.questionId !== "string"
      || !/^[a-f\d]{24}$/i.test(item.questionId)) {
      return { error: "Every answer must include a valid question ID." };
    }
    if (!Number.isInteger(item.selectedOption) || item.selectedOption < -1) {
      return { error: "Each selected option must be an integer index or -1 for skipped." };
    }
    const questionId = String(item.questionId);
    if (seenIds.has(questionId)) {
      return { error: "Duplicate question IDs are not allowed." };
    }
    seenIds.add(questionId);
    normalizedAnswers.push({ questionId, selectedOption: item.selectedOption });
  }

  return { value: { topic: topic.trim(), answers: normalizedAnswers } };
}

export function validateSelectionsAgainstQuestions(answers, questions) {
  const questionById = new Map(questions.map((question) => [String(question._id), question]));
  const outOfRange = answers.some(({ questionId, selectedOption }) => {
    const question = questionById.get(questionId);
    return !question || !Array.isArray(question.options) || selectedOption >= question.options.length;
  });
  return outOfRange
    ? { error: "A selected option is not available for its question." }
    : { value: answers };
}
