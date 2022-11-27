const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  tag: String,
});

const Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;
