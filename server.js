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
    let username = req.body.un

    let htmlCode = "Hello, " + username + "!<br>Work in Progress Build..."

    res.send(htmlCode)
})

app.listen(3500, ()=> {
    console.log("Webpage is Up at port 3500!")
})