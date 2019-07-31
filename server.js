const express = require("express")
const app = express()

const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended:false
})

app.use(express.static(__dirname+ "/public"))


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

app.listen(process.env.PORT || 5000, ()=> {
    console.log("Webpage is Up at port 3500!")
})