// mongodb
require("./config/db");
const app = require("express")();
const port = 3005;
//cors
const cors = require("cors");
app.use(cors());
const UserRouter = require("./api/User");

// for accepting post form data
const bodyParser = require("express").json;
app.use(bodyParser());
app.use("/user", UserRouter);
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
