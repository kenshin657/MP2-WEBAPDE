const express = require("express")
const app = express()
const session = require("express-session")

const hbs = require("hbs")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")
const url = require("url")


const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended:false
})

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/sample_Db", {
    useNewUrlParser:true
})

app.use(cookieparser())

app.use(express.static(__dirname+ "/public"))
const User = require("./user.js").User

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

    let htmlCode = "Hello, " + username + "!<br>Work in Progress Build..."

    res.send(htmlCode)
})

app.post("/register", urlencoder, (req, res)=>{
    var username = req.body.un
    var password = req.body.pw
    
    let user = new User({
        username : username,
        password: password
    })
    
    user.save().then((doc)=>{
        console.log(doc)
        req.session.username = doc.username
        res.render("main.hbs", {
            username : doc.username
        })
    }, (err)=>{
        res.send(err)
    })
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