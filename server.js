const express = require("express")
const app = express()
const session = require("express-session")

const hbs = require("hbs")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")
const url = require("url")

const MongoClient = require('mongodb').MongoClient

const connectionString = "mongodb+srv://test:NKVqUJMsIqxy9N9x@cluster0-r73sb.mongodb.net/test?retryWrites=true&w=majority"

const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended:false
})

mongoose.Promise = global.Promise
mongoose.connect(connectionString, {
    useNewUrlParser:true
})

app.use(cookieparser())


app.use(express.static(__dirname+ "/public"))
const User = require("./user.js").User
const Task = require("./user.js").Task

app.use(session({
    resave: true,
    name:"cookieMonster",
    saveUninitialized: true,
    secret : "secretpass",
    cookie:{
        maxAge: 5*60*1000
    }
}))

app.get("/", (req, res)=> {
    //req = what the user sent us
    //res = what we send to the user
    
    res.sendFile(__dirname + "/login.html")
})

app.post("/login", urlencoder, (req, res)=>{
    let username = req.body.un
    let password = req.body.pw

    User.findOne({username:username, password:password}, function(err, doc){
        if(err){
            console.log(err)
        }
        
        if(doc){
            console.log(doc.username + " in database!")
            var tasks
            var daytasks
            var weektasks
            var monthtasks
            var finishedtasks
            
            Task.find({username: username, frequency: 0, isCompleted:false}, function(err, docs){
                if(err){
                    res.send(err)
                }
                else{
                    tasks = docs
                    console.log("single" + tasks)
                }
            })     
            
            Task.find({username: username, frequency: 1}, function(err, docs){
                if(err){
                    res.send(err)
                }
                 else{
                   daytasks = docs
                    console.log("daily" + daytasks)
                }
            })
            
            Task.find({username: username, frequency: 2}, function(err, docs){
                if(err){
                    res.send(err)
                }
                 else{
                   weektasks = docs
                    console.log("weekly" + weektasks)
                }
            })
            
            Task.find({username: username, frequency: 3}, function(err, docs){
                if(err){
                    res.send(err)
                }
                 else{
                   monthtasks = docs
                    console.log("monthly" + monthtasks)
                }
            })
            
            Task.find({username: username, frequency: 0, isCompleted:true}, function(err, docs){
                if(err){
                    res.send(err)
                }
                 else{
                   finishedtasks = docs
                    console.log("finished" + finishedtasks)
                }
            })
            
            setTimeout(function(){
                res.render("main.hbs", {
                    user: doc.username,
                    tasks: tasks,
                    daytasks: daytasks,
                    weektasks: weektasks,
                    monthtasks: monthtasks,
                    finishedtasks: finishedtasks
                })
            }, 1000)
            /*res.render("main.hbs", {
                username: doc.username
            })*/
        }
        else{
            console.log("user not found")
            res.render("nouser.hbs")
        }
    })
    
})

app.post("/register", urlencoder, (req, res)=>{
    var username = req.body.un
    var password = req.body.pw
    
    let user = new User({
        username : username,
        password: password,
        credit: 0
    })
    
    user.save().then((doc)=>{
        console.log(doc)
        req.session.username = doc.username
        
        var task1 = new Task({
            username: username,
            taskName: "Getting Started P1",
            taskDesc: "create your first task",
            reward: 100,
            frequency: 0,
            isCompleted: false,
        })
        
        task1.save().then((doc)=>{
            console.log(doc)
            
            var task2 = new Task({
                username: username,
                taskName: "Getting Started P2",
                taskDesc: "explore the website",
                reward: 100,
                frequency: 0,
                isCompleted: false,
            })

            task2.save().then((doc)=>{
                console.log(doc)
                
                res.redirect("/")
                
            }, (err)=>{
                res.send(err)
            })
            
        }, (err)=>{
            res.send(err)
        })
        
        
    }, (err)=>{
        res.send(err)
    })
})

app.post("/delete",urlencoder, (req,res)=>{
    console.log("deleting task")
    let id = req.body.id
    
    Task.deleteOne({
        _id: id
    }, (err,doc)=>{
        if(err){
            res.render("main.hbs", {
                err
            })
        }
        else{
            res.send(doc)
        }
    })
})

app.post("/newtask", urlencoder, (req,res)=>{
    var username = req.body.taskuser
    var taskName = req.body.taskname
    var taskDesc = req.body.taskdesc
    var reward = req.body.taskreward
    var frequency = req.body.taskfreq
    
    var task = new Task({
        username: username,
        taskName: taskName,
        taskDesc: taskDesc,
        reward: reward,
        frequency: frequency,
        isCompleted: false,
    })

    task.save().then((doc)=>{
        console.log(doc)
        
    }, (err)=>{
        res.send(err)
    })
    
    var tasks
    var daytasks
    var weektasks
    var monthtasks
    var finishedtasks
    
    Task.find({username: username, frequency: 0, isCompleted:false}, function(err, docs){
        if(err){
            res.send(err)
        }
        else{
            tasks = docs
            console.log("single" + tasks)
        }
    })
    
    Task.find({username: username, frequency: 1}, function(err, docs){
        if(err){
            res.send(err)
        }
         else{
            daytasks = docs
            console.log("daily" + daytasks)
        }
    })
            
    Task.find({username: username, frequency: 2}, function(err, docs){
        if(err){
            res.send(err)
        }
        else{
            weektasks = docs
            console.log("weekly" + weektasks)
        }
    })
            
    Task.find({username: username, frequency: 3}, function(err, docs){
        if(err){
            res.send(err)
        }
        else{
            monthtasks = docs
            console.log("monthly" + monthtasks)
        }
    })
            
    Task.find({username: username, frequency: 0, isCompleted:true}, function(err, docs){
        if(err){
            res.send(err)
        }
        else{
            finishedtasks = docs
            console.log("finished" + finishedtasks)
        }
    })
            
    setTimeout(function(){
        res.render("main.hbs", {
            user: username,
            tasks: tasks,
            daytasks: daytasks,
            weektasks: weektasks,
            monthtasks: monthtasks,
            finishedtasks: finishedtasks
        })
    }, 1000)
})

app.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
        console.log("Error in Logging Out")
    })
    res.redirect("/")
})

app.listen(process.env.PORT || 5000, ()=> {
    console.log("Webpage is Up at port 5000!")
})