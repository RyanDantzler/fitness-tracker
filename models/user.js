const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkoutSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [WorkoutSchema]
});

module.exports = mongoose.model("User", UserSchema);