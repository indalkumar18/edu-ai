export function feedbackFor(percentage) {
  if (percentage >= 80) return "Great work! You understand this topic well.";
  if (percentage >= 50) return "Good attempt. Revise the questions you missed and try again.";
  return "Let's review the basics of this topic and practise once more.";
}

// questions: documents with _id and correctAnswer (and optional explanation).
// answerMap: Map of questionId (string) -> selected option index. Missing means unanswered (-1).
export function gradeQuestions(questions, answerMap) {
  const gradedAnswers = questions.map((question) => {
    const key = String(question._id);
    const selectedOption = answerMap.has(key) ? answerMap.get(key) : -1;
    const isCorrect = Number.isInteger(selectedOption) && selectedOption === question.correctAnswer;
    return {
      questionId: question._id,
      selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || "",
    };
  });
  const score = gradedAnswers.filter((a) => a.isCorrect).length;
  const totalQuestions = gradedAnswers.length;
  const percentage = totalQuestions ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;
  return { gradedAnswers, score, totalQuestions, percentage };
}
