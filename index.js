const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sql123',
    database: 'bank'
});

connection.connect(function (error) {
    if (error) {
        console.log("Error in Connecting Database");
        throw error;
    }
    else {
        console.log("Connected to Database");
    }
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("index.html");
});

app.get("/dashboard", function (req, res) {
    res.sendFile(__dirname + "/public/dashboard.html");
});
app.get("/customer_management", function (req, res) {
    res.sendFile(__dirname + "/public/customer_mg.html");
});

app.post("/customer_management", function (req, res) {
    res.redirect("/customer_management")
});

connection.end(function (error) {
    if (error) {
        console.log("Error in Disconnecting Database");
        throw error;
    }
    else {
        console.log("Disconnected from Database");
    }
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
