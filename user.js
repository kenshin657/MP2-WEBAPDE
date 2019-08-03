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
    isRepeating : Boolean
})

var User = mongoose.model("User", userSchema)
var Task = mongoose.model("Task", taskSchema)

module.exports = {
    User,
    Task
}