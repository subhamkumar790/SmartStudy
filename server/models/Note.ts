import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, required: true },
  tags: [{ type: String }],
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

export default (mongoose.models.Note || mongoose.model("Note", noteSchema)) as any;
