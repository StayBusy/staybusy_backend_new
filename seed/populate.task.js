const { readFile } = require("fs/promises");

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Task = require("../models/Task");
const path = require("path");

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_LOCAL);
    // console.log(path.join(__dirname, 'task.json'))
    const jsonTask = JSON.parse(
      await readFile(path.join(__dirname, "MOCK_DATA_2.json"), "utf-8")
    );
    await Task.deleteMany()
    await Task.create(jsonTask);
    console.log("Success ScriptEnabled");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
