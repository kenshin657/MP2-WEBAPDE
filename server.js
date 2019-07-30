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


app.listen(3500, ()=> {
    console.log("Webpage is Up!")
})