const { readFile } = require("fs/promises");

const dotenv = require("dotenv");
dotenv.config();


const connectDB = require("../config/db");
const Task = require("../models/Task");
const path = require("path");
const Tag = require("../models/Tags");

const start = async () => {
  try {
    // await connectDB(process.env.MONGODB_LOCAL); 
    await connectDB(process.env.MONGODB_URI);
    // console.log(path.join(__dirname, 'task.json'))
    const jsonTask = JSON.parse(
      await readFile(path.join(__dirname, "tasks.json"), "utf-8")
    );
    const jsonTag = JSON.parse(
      await readFile(path.join(__dirname, "tags.json"), "utf-8")
    );
    await Task.deleteMany()
    await Tag.deleteMany()
    await Tag.create(jsonTag);
    await Task.create(jsonTask);
    console.log("Success ScriptEnabled");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
