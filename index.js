const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

//Establishing Connection to database
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
//Used to access static files from public folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Routing Starts
app.get("/", function (req, res) {
    res.render("index.html");
});

app.get("/dashboard", function (req, res) {
    res.sendFile(__dirname + "/public/dashboard.html");
});

app.get("/customer_management", function (req, res) {
    res.sendFile(__dirname + "/public/customer_mg.html");
});
//Add Customer Form 
app.post("/customer_management", function (req, res) {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var email = req.body.email;
    var pno = req.body.pcon;
    var sno = req.body.scon;
    var gender = req.body.gender;
    var dob = req.body.DOB;
    var aadhar = req.body.aadhar;
    var pan = req.body.pan;
    var balance = 0;
    var acc_type = req.body.acc_type;
    var min_bal;
    var interest;
    //Derived Attributes
    if (acc_type === 'Saving') {
        min_bal = 1000;
        interest = 6.4;

    }
    else {
        min_bal = 5000;
        interest = 4;
    }

    //String building for query
    var query = "INSERT INTO cust_account values(" + "5010" + ",'TECH0000101',";
    query += "'" + first_name + " " + last_name + "',";
    query += "'" + gender + "',";
    query += "'" + address + "',";
    query += "'" + dob + "',";
    query += "21457846,";
    query += "'" + acc_type + "',";
    query += balance + ",";
    query += min_bal + ",";
    query += interest + ",";
    query += "'" + city + "',";
    query += "'" + state + "',";
    query += zip + ",";
    query += "'" + email + "')";


    //Executing Query
    console.log(query);
    connection.query(query, function (error, rows, fields) {
        if (error) {
            console.log("Error in query");
            console.log(error);
        }
        else {
            console.log("Successful Query");
            //console.log(rows);
        }
    });
    res.redirect("/customer_management")
});

// connection.end(function (error) {
//     if (error) {
//         console.log("Error in Disconnecting Database");
//         throw error;
//     }
//     else {
//         console.log("Disconnected from Database");
//     }
// });

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
