import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  syllabus: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "High" },
}, { timestamps: true });

export default (mongoose.models.Exam || mongoose.model("Exam", examSchema)) as any;
