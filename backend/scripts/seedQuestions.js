import "dotenv/config";
import mongoose from "mongoose";
import Question from "../models/Question.js";

const questions = [
  { topic: "DBMS", question: "What is the main purpose of DBMS normalization?", options: ["Increase duplication", "Reduce redundancy", "Delete tables", "Increase file size"], correctAnswer: 1, explanation: "Normalization organizes tables to reduce unnecessary duplication and update problems.", difficulty: "beginner" },
  { topic: "DBMS", question: "Which normal form requires each cell to contain a single atomic value?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 0, explanation: "First Normal Form (1NF) requires atomic values and no repeating groups.", difficulty: "beginner" },
  { topic: "DBMS", question: "A relation is in 2NF when it is in 1NF and has no what?", options: ["Foreign keys", "Partial dependency of non-key attributes", "Primary key", "Rows"], correctAnswer: 1, explanation: "2NF removes partial dependency on part of a candidate key.", difficulty: "intermediate" },
  { topic: "DBMS", question: "Which key uniquely identifies each row in a table?", options: ["Foreign key", "Candidate value", "Primary key", "Duplicate key"], correctAnswer: 2, explanation: "A primary key uniquely identifies each record in a table.", difficulty: "beginner" },
  { topic: "DBMS", question: "A foreign key is mainly used to:", options: ["Compress a table", "Link related tables", "Sort rows", "Encrypt columns"], correctAnswer: 1, explanation: "A foreign key references a key in another (or the same) table to maintain relationships.", difficulty: "beginner" },
  { topic: "DSA", question: "Which data structure follows LIFO order?", options: ["Queue", "Stack", "Tree", "Graph"], correctAnswer: 1, explanation: "A stack follows Last In, First Out (LIFO).", difficulty: "beginner" },
  { topic: "DSA", question: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n²)", "O(log n)", "O(1) always"], correctAnswer: 2, explanation: "Binary search halves the search space each step, giving O(log n) time.", difficulty: "intermediate" },
  { topic: "DSA", question: "Which data structure follows FIFO order?", options: ["Stack", "Queue", "Heap", "Tree"], correctAnswer: 1, explanation: "A queue follows First In, First Out (FIFO).", difficulty: "beginner" },
  { topic: "DSA", question: "In a singly linked list, each node stores:", options: ["Only data", "Data and next pointer", "Two child pointers", "Only previous pointer"], correctAnswer: 1, explanation: "A singly linked-list node stores data and a pointer to the next node.", difficulty: "beginner" },
  { topic: "DSA", question: "Which traversal of a BST visits keys in sorted order?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correctAnswer: 2, explanation: "Inorder traversal of a Binary Search Tree visits keys in ascending order.", difficulty: "intermediate" },
  { topic: "HTML & CSS", question: "Which HTML element is used for the largest heading by default?", options: ["<h6>", "<head>", "<h1>", "<header>"], correctAnswer: 2, explanation: "The h1 element represents the highest-level heading.", difficulty: "beginner" },
  { topic: "HTML & CSS", question: "Which CSS property changes text colour?", options: ["font-style", "color", "background", "text-size"], correctAnswer: 1, explanation: "The color property sets the foreground colour of text.", difficulty: "beginner" },
  { topic: "HTML & CSS", question: "Which attribute provides alternative text for an image?", options: ["title", "src", "alt", "href"], correctAnswer: 2, explanation: "The alt attribute provides text alternative for an image.", difficulty: "beginner" },
  { topic: "HTML & CSS", question: "Which CSS layout system is designed for one-dimensional layouts?", options: ["Grid", "Flexbox", "Float only", "Table"], correctAnswer: 1, explanation: "Flexbox is mainly used to arrange items in a row or column.", difficulty: "intermediate" },
  { topic: "HTML & CSS", question: "Which HTML element is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], correctAnswer: 1, explanation: "The anchor element creates hyperlinks.", difficulty: "beginner" },
  { topic: "JavaScript", question: "Which keyword declares a block-scoped variable that can be reassigned?", options: ["const", "let", "static", "varname"], correctAnswer: 1, explanation: "let declares a block-scoped variable that can be reassigned.", difficulty: "beginner" },
  { topic: "JavaScript", question: "Which method converts a JSON string into a JavaScript object?", options: ["JSON.stringify", "JSON.parse", "Object.toJSON", "JSON.convert"], correctAnswer: 1, explanation: "JSON.parse converts valid JSON text into a JavaScript value.", difficulty: "beginner" },
  { topic: "JavaScript", question: "What does === compare?", options: ["Only values after coercion", "Only types", "Value and type", "Object keys"], correctAnswer: 2, explanation: "Strict equality compares value and type without type coercion.", difficulty: "intermediate" },
  { topic: "JavaScript", question: "Which array method creates a new array by transforming every element?", options: ["forEach", "map", "push", "pop"], correctAnswer: 1, explanation: "map returns a new array containing each callback result.", difficulty: "intermediate" },
  { topic: "JavaScript", question: "Which feature lets a function remember variables from its outer scope?", options: ["Hoisting", "Closure", "Prototype", "Casting"], correctAnswer: 1, explanation: "A closure retains access to its lexical scope after the outer function returns.", difficulty: "advanced" }
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  let insertedOrUpdated = 0;
  for (const question of questions) {
    await Question.updateOne(
      { topic: question.topic, question: question.question },
      { $set: question },
      { upsert: true }
    );
    insertedOrUpdated += 1;
  }
  console.log(`Added or updated ${insertedOrUpdated} sample questions.`);
  await mongoose.disconnect();
}

seed().catch(async error => {
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
