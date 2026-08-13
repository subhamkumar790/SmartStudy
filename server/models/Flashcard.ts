import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deckName: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  nextReview: { type: Date, default: Date.now },
}, { timestamps: true });

export default (mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema)) as any;
