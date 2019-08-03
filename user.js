const mongoose = require("mongoose")

var userSchema = mongoose.Schema({
    username : String,
    password : String,
    credit: Number
})

var taskSchema = mongoose.Schema({
    username : String,
    taskName : String,
    taskDesc : String,
    reward : Number,
    frequency : Number, //0 = one time, 1 = daily, 2 = weekly, 3 = monthly
    isCompleted : Boolean
})

var User = mongoose.model("User", userSchema)
var Task = mongoose.model("Task", taskSchema)

module.exports = {
    User,
    Task
}