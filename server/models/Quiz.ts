import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  score: { type: Number },
  totalQuestions: { type: Number, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    userAnswer: String,
  }],
}, { timestamps: true });

export default (mongoose.models.Quiz || mongoose.model("Quiz", quizSchema)) as any;
