const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: [true, "Description is required"] },
    tag: { type: String },
    price: {
      type: Number,
      get: (val) => (val / 100).toFixed(2),
      set: (val) => val * 100,
    },
    location: {type: String},
    completed: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    taken: { type: Boolean, default: false },
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userDecline: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { toJSON: { getters: true }, timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
