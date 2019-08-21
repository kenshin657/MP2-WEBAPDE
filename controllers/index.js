const express = require("express")
const app = express()
const session = require("express-session")

const router = express.Router()

const hbs = require("hbs")
const url = require("url")

const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended:false
})

router.use(urlencoder)


const crypto = require('crypto')
const algorithim = 'aes-256-ctr'
const password = 'd6UwUEfeqpopo42069'


app.use(express.static(__dirname+ "/public"))
const User = require("../models/user.js").User
const Task = require("../models/user.js").Task

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


router.get("/", (req, res)=> {
    res.sendFile(__dirname + "/login.html")
})



router.post("/login", urlencoder, (req, res)=>{
    let username = req.body.un
    let password = req.body.pw

    User.findOne({username:username}, function(err, doc){
        if(err){
            console.log(err)
        }
        
        if(doc && password == decrypt(doc.password)){
            console.log(doc.username + " in database!")
            
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

router.post("/register", urlencoder, (req, res)=>{
    var username = req.body.un
    var password = req.body.pw
    
    let user = new User({
        username : username,
        password: encrypt(password),
        credit: 50,
        image: "/base_avatar.png"
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

router.post("/delete",urlencoder, (req,res)=>{
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

router.post("/newtask", urlencoder, (req,res)=>{
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

router.post("/edittask", urlencoder, (req,res)=>{
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

router.post("/finish", urlencoder, (req,res)=>{
    console.log("completing task")
    let id = req.body.finishid
    let username = req.body.un
    let credit = req.body.credit
    let reward =req.body.reward
    let img = req.body.img
    
    Task.updateOne({_id : id}, {isComplete : "complete"}, (err,doc)=>{
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

router.post("/purchase", urlencoder, (req, res)=>{
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

router.post("/purchase1", urlencoder, (req, res)=>{
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


router.post("/purchase2", urlencoder, (req, res)=>{
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
router.post("/purchase3", urlencoder, (req, res)=>{
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
router.post("/purchase4", urlencoder, (req, res)=>{
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
router.post("/purchase5", urlencoder, (req, res)=>{
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

router.post("/purchase6", urlencoder, (req, res)=>{
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

router.post("/purchase7", urlencoder, (req, res)=>{
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

router.post("/purchase8", urlencoder, (req, res)=>{
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

router.post("/purchase9", urlencoder, (req, res)=>{
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

router.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
        console.log("Error in Logging Out")
    })
    res.redirect("/")
})

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

module.exports = router