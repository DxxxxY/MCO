const express = require("express")
const app = express()
const path = require("path")
const bodyParser = require("body-parser")
const sessions = require("express-session")
const mongoose = require("mongoose")
const wge = require("wge");
const Register = require(path.join(__dirname, "/models/register.js"))

require('dotenv').config()

var session
var port = process.env.PORT || 80

mongoose.connect( /*"mongodb://localhost:27017/MCO"*/ process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.connection.on('connected', () => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
})

mongoose.connection.on('err', err => {
    console.error(`Mongoose connection error: \n ${err.stack}`)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static("public"));

const
    second = 1000,
    minute = 60 * second,
    hour = 60 * minute,
    day = 24 * hour,
    week = 7 * day

app.use(sessions({
    secret: "asda89-7129-37123123$%!#$1354135",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: week,
        sameSite: true,
        secure: false
    }
}))

app.get("/", (req, res) => { res.redirect("/login") })

app.get("/login", (req, res) => {
    session = req.session
    if (session.uniqueID) res.redirect("/redirects")
    else res.sendFile(path.join(__dirname, "/public/login/login.html"))
})

app.get("/register", (req, res) => {
    session = req.session
    if (session.uniqueID) res.redirect("/redirects")
    else res.sendFile(path.join(__dirname, "/public/register/register.html"))
})

app.post("/login", (req, res) => {
    session = req.session
    Register.findOne({
        username: req.body.username
    }, (err, res2) => {
        if (err) console.log(err)
        if (!res2) res.redirect("/redirects")
        else if (res2.password === req.body.password) {
            session.uniqueID = req.body.username
            res.redirect("/redirects")
        } else res.redirect("/redirects")
    })
})

app.post("/register", (req, res) => {
    session = req.session
    Register.findOne({
        username: req.body.username
    }, (err, res2) => {
        if (err) console.log(err)
        if (!res2) {
            const newRegister = new Register({
                username: req.body.username,
                password: req.body.password,
            })
            newRegister.save()
            res.redirect("/redirects")
        } else res.redirect("/redirects")
    })
})

app.get("/redirects", (req, res) => {
    session = req.session
    if (session.uniqueID) res.redirect("/dashboard")
    else res.redirect("/login")
})

app.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/login")
})

app.get("/dashboard", (req, res) => {
    session = req.session
    username = session.uniqueID
    if (!session.uniqueID) res.redirect("/redirects")
    else {
        const dashboard = wge.render(path.join(__dirname, "public/dashboard/dashboard.html"), { username: username })
        res.send(dashboard)
    }
})