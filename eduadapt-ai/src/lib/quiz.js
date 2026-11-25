export const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const letter = (index) => String.fromCharCode(65 + index);

export const cap = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "");

export const scoreTone = (percentage) => (percentage >= 80 ? "good" : percentage >= 50 ? "mid" : "bad");
