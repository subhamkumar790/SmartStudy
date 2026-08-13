import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Task = mongoose.models.Task || mongoose.model("Task", new mongoose.Schema({ title: String, subject: String, userId: mongoose.Schema.Types.ObjectId }));
  const results = await Task.find({}).limit(5);
  console.log("All Tasks:", results);
  mongoose.disconnect();
}
run().catch(console.error);
