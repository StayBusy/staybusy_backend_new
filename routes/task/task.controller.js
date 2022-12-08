const User = require("../../models/User");
const Task = require("../../models/Task");
const Wallet = require("../../models/Wallet");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../../errors");
const { StatusCodes } = require("http-status-codes");
const Submission = require("../../models/Submission");

const getTaskOld = async (req, res) => {
  let { _id } = req.user;
  const { isVerified, tags } = await User.findOne({ _id });

  if (isVerified === false) {
    throw new BadRequestError("Verify your account");
  }

  let searchObj = {
    // tag: { $in: tags },
    userDecline: { $nin: [_id] }, // The currentUser cannot get task if the user has declined the task before
    taken: false,
    completed: false,
    ...req.query,
  };

  if (req.query.title) {
    const queryRegx = new RegExp(req.query.title, "i");
    searchObj.title = queryRegx;
  }

  const excludeFields = ["sort", "page", "limit", "fields"];
  excludeFields.forEach((field) => delete searchObj[field]);

  let queryStr = JSON.stringify(searchObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|eq)\b/g,
    (match) => `$${match}`
  );

  let query = Task.find(JSON.parse(queryStr));

  // sorting the task
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  }

  const tasks = await query;
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: "Tasks", result: tasks.length, tasks });
};

const getTasks = async (req, res) => {
  // let { _id, isVerified, tags } = req.user;
  let { _id } = req.user;
  // const { isVerified, tags } = await User.findOne({ _id });
  const user = await User.findOne({ _id });
  if(user === null) throw new UnauthenticatedError("User not found with the given id")

  let { title, location, price, sort, priceFilter, tagFilter, date } =
    req.query;

  if (user.isVerified === false) {
    throw new BadRequestError("Verify your account");
  }

  const queryObject = {};

  if (title) queryObject.title = { $regex: title, $options: "i" };
  if (price) queryObject.price = { $eq: +price };
  if (location) queryObject.location = location;

  // { start: '2022-11-03', end: '2022-11-02' }
  if (date?.start) {
    if (!queryObject["createdBy"]) queryObject["createdAt"] = {};
    var dateFrom = moment(new Date(date.start)).toDate();
    queryObject["createdAt"]["$gte"] = dateFrom;
  }

  if (date?.end) {
    if (!queryObject["createdAt"]) queryObject["createdAt"] = {};
    var dateTo = moment(new Date(date.end)).toDate();
    queryObject["createdAt"]["$lte"] = dateTo;
  }

  // console.log(queryObject)

  if (priceFilter) {
    let queryStr = JSON.stringify(priceFilter);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|eq)\b/g,
      (match) => `$${match}`
    );
    const prices = JSON.parse(queryStr);
    queryObject.price = prices;
    // queryObject.price = { $gte: 20, $lte:2000 };
  }

  queryObject.tag = { $in: user.tags };

  if (tagFilter) {
    const tagToGet = tagFilter.split(",").filter(Boolean);
    queryObject.tag = { $in: tagToGet };
  }

  queryObject.taken = false;
  queryObject.completed = false;
  queryObject.userDecline = { $nin: [_id] };

  let query = Task.find(queryObject);

  if (sort) {
    let sortingIn = sort === "Newest" ? "createdAt" : "-createdAt";
    query = query.sort(sortingIn);
  } else {
    query = query.sort("createdAt");
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

  await User.findByIdAndUpdate(_id, { $addToSet: { declinedTasks: taskId } });

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
  let { _id } = req.user;
  const { taskTaken } = await User.findOne({ _id });
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

const pendingTask = async (req, res) => {
  const { _id } = req.user;
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (task === null) {
    throw new NotFoundError("Task not found");
  }

  // Checking if the task has been completed before
  if (task.completed) {
    throw new BadRequestError("The task is completed");
  }

  if (task.taken && task.takenBy.toString() === _id.toString()) {
    task.pending = true;
    task.completed = false;
    let taskNew = await task.save();
  
    await User.findByIdAndUpdate(_id, {
      $addToSet: { completedTasks: taskId },
      $pull: { taskTaken: taskId },
    });
    res.status(StatusCodes.OK).json({
      status: true,
      message: `Task pending`,
    });
  } else {
    throw new BadRequestError("Task not taken by you");
  }
};

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

const taskComplete = async (req, res) => {
  const { _id } = req.user;
  const { taskId } = req.params;
  const { url } = req.body;
  const urls = url.split(" ");
  const files = req.files?.uploadedFiles;

  const task = await Task.findById(taskId);

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

  if (task === null) {
    throw new NotFoundError("Task not found");
  }

  await Submission.create({
    urls,
    files: filesArr,
    submittedBy: _id,
    taskId,
  });

  if (task.taken && task.takenBy.toString() === _id.toString()) {
    task.pending = false;
    task.completed = true;
    task.completedBy = _id;
    await task.save();
    // await User.findByIdAndUpdate(user._id, {
    //   $addToSet: { completedTasks: taskId },
    //   $pull: { taskTaken: taskId },
    // });
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

module.exports = {
  getTasks,
  declineTask,
  acceptTask,
  taskComplete,
  pendingTask,
};
