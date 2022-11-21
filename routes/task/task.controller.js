const User = require("../../models/User");
const Task = require("../../models/Task");
const Wallet = require("../../models/Wallet");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../../errors");
const { StatusCodes } = require("http-status-codes");

const getTasks = async (req, res) => {
  let { _id, isVerified, tags } = req.user;

  if (isVerified === false) {
    throw new BadRequestError("Verify your account");
  }

  const searchObj = {
    tag: { $in: tags },
    userDecline: { $nin: [_id] }, // The currentUser cannot get task if the user has declined the task before
    taken: false,
    completed: false,
    ...req.query
  };

  const excludeFields = ["sort", "page", "limit", "fields"];
  excludeFields.forEach((field) => delete searchObj[field]);

  let queryStr = JSON.stringify(searchObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|eq)\b/g,
    (match) => `$${match}`
  );
  // console.log(JSON.parse(queryStr))

  let query = Task.find(JSON.parse(queryStr));

  // sorting the task
  if(req.query){
    // console.log(query.sort(req.query.sort))
    query = query.sort(req.query.sort)
  }

  const tasks = await query;
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Tasks", result: tasks.length, tasks });
};

const declineTask = async (req, res) => {
  const { _id } = req.user;
  const { taskId } = req.params;

  if (!taskId) {
    throw new BadRequestError("Task ID not provided");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $addToSet: { userDecline: _id } },
    { new: true }
  );

  if (updatedTask === null) {
    throw new NotFoundError("Task not found");
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Task declined: ${updatedTask.title}`,
    task: updatedTask,
  });
};

const acceptTask = async (req, res) => {
  const { _id, taskTaken } = req.user;
  const { taskId } = req.params;

  if (!taskId) {
    throw new BadRequestError("Task ID not provided");
  }

  const task = await Task.findOne({ _id: taskId });

  if (task === null) {
    throw new NotFoundError("Task not found");
  }

  if (task.takenBy && task.takenBy.toString() === _id.toString()) {
    throw new BadRequestError("You have already accepted the task");
  }

  if (task.taken || task.completed || task.userDecline.includes(_id)) {
    throw new BadRequestError("You cannot take task");
  }

  if (taskTaken.length >= 4) {
    throw new BadRequestError(
      "You cannot take task at this moment, You have unfinished tasks"
    );
  }

  await User.findByIdAndUpdate(_id, { $addToSet: { taskTaken: taskId } });
  task.taken = true;
  task.takenBy = _id;
  await task.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Task Accepted `,
  });
};

const taskComplete = async (req, res) => {
  const user = req.user;
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (task === null) {
    throw new NotFoundError("Task not found");
  }

  // Checking if the task has been completed before
  if (task.completed) {
    throw new BadRequestError("The task has completed before now");
  }

  if (task.taken && task.takenBy.toString() === user._id.toString()) {
    task.completed = true;
    task.completedBy = user._id;
    await task.save();
    res.status(StatusCodes.OK).json({
      status: true,
      message: `Task completed`,
    });
  } else {
    throw new BadRequestError("Task not taken by you");
  }

  // const wallet =await Wallet.findOne({userId: user._id})
  // wallet.balance = +wallet.balance + +task.price
  // await wallet.save()
};

module.exports = { getTasks, declineTask, acceptTask, taskComplete };
