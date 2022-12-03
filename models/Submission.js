const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
  urls: { type: Array, default: [] },
  files: { type: Array, default: [] },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "UserId is required"],
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "TaskId is required"],
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed"],
  },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
