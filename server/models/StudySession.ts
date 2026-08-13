import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // Optional link to a task
  status: { type: String, enum: ["Active", "Paused", "Finished"], default: "Active" },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // Accumulated duration in seconds for paused sessions
  lastResumedAt: { type: Date }, // To calculate elapsed time when resuming
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema)) as any;
