require("dotenv").config();
require("express-async-errors");

const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require('express-fileupload')

// importing session and flash and cookieParse and morgan
// const session = require("express-session");
// const cookieParser = require("cookie-parser");

// mongoDB connection
const connectDB = require("./config/db");

const app = express();

//cors
app.use(cors());
app.use(express.json());
app.use(fileUpload())

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// where the pictures will be stored
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/v1/uploads", express.static("uploads"));

// use session and flash and logger and cookieParser
// app.use(
//   session({
//     secret: "webslesson",
//     cookie: { maxAge: 60000 },
//     saveUninitialized: false.valueOf,
//     resave: false,
//   })
// );

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// to show the index view of the ejs and the app
// app.use("/", indexRouter);
// app.use("/user", UserRouter);

// App Routes
app.use("/api/v1/auth", require("./routes/auth/auth.routes"));
app.use("/api/v1/users", require("./routes/user/user.routes"));

// APP ErrorHandler
const notFoundMiddleware = require("./middlewares/not-found")
const errorHandlerMiddleware = require('./middlewares/error-handler')
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

let DB;

if (process.env.NODE_ENV === "development") {
  DB = process.env.MONGODB_LOCAL;
} else {
  DB = process.env.MONGODB_URI;
}

const start = async () => {
  const PORT = process.env.PORT || 3005;
  try {
    await connectDB(DB);
    console.log("DB connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
