const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    number: {
      type: String
    },
    name: {
      type: String
    },
name: {
      type: String
    },
  },
  {
    timestamps: true
  }
);

let History = mongoose.model("histories", historySchema);
module.exports = History;