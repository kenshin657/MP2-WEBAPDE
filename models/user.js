const mongoose = require("mongoose")

var userSchema = mongoose.Schema({
    username : String,
    password : String,
    credit: Number,
    image : String,
    register : Date
})

var taskSchema = mongoose.Schema({
    username : String,
    taskName : String,
    taskDesc : String,
    reward : Number,
    frequency : Number, //0 = one time, 1 = daily, 2 = weekly, 3 = monthly
    isComplete : String,
    lastCompleted : Date
})

var User = mongoose.model("User", userSchema)
var Task = mongoose.model("Task", taskSchema)

module.exports = {
    User,
    Task
}