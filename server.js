// mongodb
require("./config/db");
const express = require("express");
const app = require("express")();
const port = 3005;
const path = require("path");
//cors
const cors = require("cors");
app.use(cors());

// importing session and flash and cookieParse and morgan
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// importing indexRouter
const indexRouter = require("./routes/index");
const UserRouter = require("./routes/User");

// for accepting post form data
const bodyParser = require("express").json;
app.use(bodyParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// where the pictures will be stored
app.use(express.static(path.join(__dirname, "public")));
app.use("/upload", express.static("upload"));

// use session and flash and logger and cookieParser
app.use(
  session({
    secret: "webslesson",
    cookie: { maxAge: 60000 },
    saveUninitialized: false.valueOf,
    resave: false,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(flash());
app.use(cookieParser());

// to show the index view of the ejs and the app
// app.use("/", indexRouter);
// app.use("/user", UserRouter);

// App Routes
app.use('/api/auth', require('./routes/auth/auth.routes'));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
