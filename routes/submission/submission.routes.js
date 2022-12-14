const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const authenticateUser = require("../../middlewares/authentication");
const Submission = require("../../models/Submission");
const Wallet = require("../../models/Wallet");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const User = require("../../models/User");
const Task = require("../../models/Task");

const submissionRouter = express.Router();

async function getSubmission(req, res) {
  const { _id } = req.user;
  // await Submission.updateMany({$set: {active:true}})
  const submissions = await Submission.find({ submittedBy: _id, active: true }).populate("taskId");
  res.status(StatusCodes.OK).json({
    status: true,
    message: "success",
    submissions,
  });
}

function uploadFile(userId, file) {
  let fileId = `${uuidv4()}-${userId}`;
  const filePath = path.join(
    __dirname,
    "../../submissions/" + `${fileId}-${file.name}`
  );

  file.mv(filePath, function (err) {
    if (err) {
      throw new BadRequestError("file failed to upload");
    }
  });

  return `submissions/${fileId}-${file.name}`;
}

const saveSubmission = async (req, res) => {
  const { _id } = req.user;
  const { taskId } = req.params;
  const { url } = req.body;

  let urls;

  if (url) {
    urls = url.split(" ");
  }

  const files = req.files?.uploadedFiles;

  if (files || urls) {
     const task = await Task.findById(taskId);

  if (task === null) {
    throw new NotFoundError("Task not found. Contact Admin");
  }

  // Checking if the task has been completed before
  if (task.completed) {
    throw new BadRequestError("The task has completed before now");
  }

  let filesArr = [];
  if (req.files !== null) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        filesArr.push(uploadFile(_id, file));
      });
    } else {
      filesArr.push(await uploadFile(_id, files));
    }
  }


  await Submission.create({
    urls,
    files: filesArr,
    submittedBy: _id,
    taskId,
    price: task.price,
  });

  // I will remove later
  const wallet = await Wallet.findOne({ submittedBy: _id });
  if (!wallet) {
    await Wallet.create({ userId: _id, balance: 0 });
  }

  if (task.taken && task.takenBy.toString() === _id.toString()) {
    task.pending = false;
    task.completed = true;
    task.completedBy = _id;
    await task.save();
    await User.findByIdAndUpdate(_id, {
      $addToSet: { completedTasks: taskId },
      $pull: { taskTaken: taskId },
    });
  const submissions = await Submission.find({ submittedBy: _id, active: true }).populate("taskId");

    res.status(StatusCodes.OK).json({
      status: true,
      message: `Task completed`,
      submissions
    });
  } else {
    throw new BadRequestError("Task not taken by you");
  }

  // const wallet =await Wallet.findOne({userId: user._id})
  // wallet.balance = +wallet.balance + +task.price
  // await wallet.save()
    
  } else {
    throw new BadRequestError("Upload a file or submit a link");
  }
};

const deleteSubmission =async (req, res) => {
  const { _id } = req.user;
  const { submissionId } = req.params;

  const submission = await Submission.findOne({ _id: submissionId })

  if (_id.toString() !== submission.submittedBy.toString()) {
    throw new BadRequestError("You cannot delete the task")
  }

  submission.active = false
  await submission.save()

  res.status(StatusCodes.OK).json({
    status: true,
    message: "submission deleted successfully"
  })
}

submissionRouter.post("/:taskId", authenticateUser, saveSubmission);
submissionRouter.get("/", authenticateUser, getSubmission);
submissionRouter.delete("/:submissionId", authenticateUser, deleteSubmission);

module.exports = submissionRouter;
