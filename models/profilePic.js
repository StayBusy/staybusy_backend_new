const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfilePicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("ProfilePic", ProfilePicSchema);
