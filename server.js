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

const crypto = require('crypto')
const algorithim = 'aes-256-ctr'
const password = 'd6UwUEfeqpopo42069'


app.use(express.static(__dirname+ "/public"))
const User = require("./models/user.js").User
const Task = require("./models/user.js").Task

function encrypt(text) {
    var cypher = crypto.createCipher(algorithim, password)
    var encrypted = cypher.update(text, 'utf8', 'hex')
    encrypted += cypher.final('hex')
    return encrypted
}

function decrypt(text) {
    var decypher = crypto.createDecipher(algorithim, password)
    var dec = decypher.update(text, 'hex', 'utf8')
    dec += decypher.final('utf8')
    return dec
}

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

    if(req.cookies.user) {
        //renderTasks(req.cookies.user, req.cookies.credit, req.cookies.img, res)
        console.log("Cookies Work , but not w/ renderTasks")
    }
    
    res.sendFile(__dirname + "/login.html")
})

app.post("/login", urlencoder, (req, res)=>{
    let username = req.body.un
    let password = req.body.pw

    User.findOne({username:username}, function(err, doc){
        if(err){
            console.log(err)
        }
        
        if(doc && password == decrypt(doc.password)){
            console.log(doc.username + " in database!")
            //updateDaily()
            //updateWeekly()
            //updateMonthly()

            res.cookie("user", doc.username, {
                maxAge: 5 *60 * 1000
            })

            res.cookie("credit", doc.credit, {
                maxAge: 5 * 60 * 1000
            })

            res.cookie("img", doc.image,  {
                maxAge: 5 * 60 * 1000
            })

            renderTasks(doc.username, doc.credit, doc.image,res)
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
        password: encrypt(password),
        credit: 50,
        image: "/base_avatar.png"
    })

    User.findOne({username:username}, function(err, doc){
        if(err){
            console.log(err)
        }
        
        if(doc){
          res.render("nouser.hbs")  
        }
        else{
            console.log("user not found")
        }
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
            isComplete: "incomplete",
        })
        
        task1.save().then((doc2)=>{
            console.log(doc2)
            
            var task2 = new Task({
                username: username,
                taskName: "Getting Started P2",
                taskDesc: "explore the website",
                reward: 100,
                frequency: 0,
                isComplete: "incomplete",
            })

            task2.save().then((doc3)=>{
                console.log(doc3)

                renderTasks(doc.username, doc.credit, doc.image,res)
                
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
    var username = req.body.un
    var credit = req.body.credit
    var taskName = req.body.taskname
    var taskDesc = req.body.taskdesc
    var reward = req.body.taskreward
    var frequency = req.body.taskfreq
    var image = req.body.img
    
    var task = new Task({
        username: username,
        taskName: taskName,
        taskDesc: taskDesc,
        reward: reward,
        frequency: frequency,
        isComplete: "incomplete",
    })

    task.save().then((doc)=>{
        console.log(doc)
        
    }, (err)=>{
        res.send(err)
    })
    
    renderTasks(username, credit, image,res)
    
})

app.post("/edittask", urlencoder, (req,res)=>{
    console.log("editing task")
    var id = req.body.editid
    var username = req.body.un
    var credit = req.body.credit
    var taskName = req.body.taskname
    var taskDesc = req.body.taskdesc
    var reward = req.body.taskreward
    var frequency = req.body.taskfreq
    var image = req.body.img
    
    Task.updateOne({_id : id}, {
        taskName: taskName,
        taskDesc: taskDesc,
        reward: reward,
        frequency: frequency
    }, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully edited")
            renderTasks(username, credit, image, res)
        }
    })
})

app.post("/finish", urlencoder, (req,res)=>{
    console.log("completing task")
    let id = req.body.finishid
    let username = req.body.un
    let credit = req.body.credit
    let reward =req.body.reward
    let img = req.body.img
    let finishdate = Date.now()
    
    Task.updateOne({_id : id}, {
        isComplete : "complete",
        lastCompleted : finishdate
    }, (err,doc)=>{
        if(err){
            
        }
        else{
            console.log("successfully completed")
            console.log("reward: " + reward)
            credit = Number(credit) + Number(reward);
            
            User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
                if(err){

                }
                else{
                    console.log("successfully rewarded")
                    console.log(doc)
                    renderTasks(username, credit, img, res)
                }
            })
        }
    })
    
})

app.post("/purchase", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 100) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-100

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.post("/purchase1", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 100) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-100

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})


app.post("/purchase2", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 100) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-100

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})
app.post("/purchase3", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 100) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-100

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})
app.post("/purchase4", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 100) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-100

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})
app.post("/purchase5", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 180) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-180

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.post("/purchase6", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 180) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-180

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.post("/purchase7", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 180) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-180

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.post("/purchase8", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 200) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-200

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.post("/purchase9", urlencoder, (req, res)=>{
    let username = req.body.un
    let credit = req.body.credit
    var image = req.body.imgO

    if(credit < 150) {
        renderTasks(username, credit, image, res)
    }

    else{
    image = req.body.img
    credit = Number(credit)-150

    
    User.updateOne({username: username}, {credit: Number(credit)}, (err,doc)=>{
        if(err){

        }
        else{
            console.log("successfully bought")
        }
    })

    console.log("Username: " +username + "Credit: " +credit + "LOGGING TEST")

    User.updateOne({username: username}, {image: image}, (err, doc)=>{
        if(err) {

        }
        else{
            console.log("Image should be changed")
            console.log(doc)
            renderTasks(username, credit, image, res)
        }
    })

    }
})

app.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
        //res.clearCookie('cookieMonster')
        //res.clearCookie('credit')
        //res.clearCookie('img')
        //res.clearCookie('user')
        console.log("Error in Logging Out")
    })
    res.redirect("/")
})

app.listen(process.env.PORT || 5000, ()=> {
    console.log("Webpage is Up at port 5000!")
})

function updateDaily(){
    Task.updateMany({frequency: 1}, {isComplete:"incomplete"},function(err, docs){
        if(err){
            res.send(err)
        }
         else{
            console.log("reset daily")
        }
    })
}

function updateWeekly(){
    Task.updateMany({frequency: 2}, {isComplete:"incomplete"},function(err, docs){
        if(err){
            res.send(err)
        }
         else{
            console.log("reset weekly")
        }
    })
}

function updateMonthly(){
    Task.updateMany({frequency: 3}, {isComplete:"incomplete"},function(err, docs){
        if(err){
            res.send(err)
        }
         else{
            console.log("reset monthly")
        }
    })
}

function renderTasks(username, credit, image, res){
    var tasks
    var daytasks
    var weektasks
    var monthtasks
    var finishedtasks
    
    setTimeout(function(){
        Task.find({username: username, frequency: 0, isComplete:"incomplete"}, function(err, docs){
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

        Task.find({username: username, frequency: 0, isComplete:"complete"}, function(err, docs){
            if(err){
                res.send(err)
            }
            else{
                finishedtasks = docs
                console.log("finished" + finishedtasks)
            }
        })

        setTimeout(function(){
            console.log("rendering page")
            console.log("User: " + username + " Credit: " + credit)
            res.render("main.hbs", {
                user: username,
                credit: credit,
                tasks: tasks,
                image: image,
                daytasks: daytasks,
                weektasks: weektasks,
                monthtasks: monthtasks,
                finishedtasks: finishedtasks
            })
        }, 1000)
    },1000)
}