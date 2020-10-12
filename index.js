const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require('multer');
const path = require('path');
const { log } = require("console");
var md5 = require('md5');
var ejs = require("ejs");
var loginstatus = false;
//ID of logged in employee
var login_empid;
var ifsc_code;
var branch;
//Configure View Engine
app.set('view engine', 'ejs');

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
    res.render("dashboard", { ifsc_code: ifsc_code, br_name: branch });
});


app.get("/customer_management", function (req, res) {
    res.render("customer_mg", { ifsc_code: ifsc_code, br_name: branch });
});
//Add Customer Form
//FOR FILE UPLOAD
// Set The Storage Engine
const storage = multer.diskStorage({
    destination: 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//For Image
const upload1 = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

//For Aadhar image
const upload2 = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('aadhar');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

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
    //Image Upload Function
    upload1(req, res, (err) => {
        if (err) {
            console.log(err);
        } else {
            if (req.file == undefined) {
                console.log("File not found");
            } else {
                console.log("File Uploaded Successfully!!");
            }
        }
    });
    upload2(req, res, (err) => {
        if (err) {
            console.log(err);
        } else {
            if (req.file == undefined) {
                console.log("File not found");
            } else {
                console.log("File Uploaded Successfully!!");
            }
        }
    });

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
    /*connection.query(query, function (error, rows, fields) {
        if (error) {
            console.log("Error in query");
            console.log(error);
        }
        else {
            console.log("Successful Query");
            //console.log(rows);
        }
    });*/
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

/*Login Starts*/
app.post("/dashboard", function (req, res) {
    login_empid = req.body.login_id;
    var password = md5(req.body.password);

    var query = "select password,ifsc_code from employee where emp_id = " + login_empid;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            if (rows.length == 0) {
                console.log("Employee Id not found!!");
                res.redirect("/");
            }
            else if (rows[0].password == password) {
                console.log("Successfully Logged In");
                loginstatus = true;
                connection.query("select br_name from branch where ifsc_code = ?", [rows[0].ifsc_code], function (err, result, field) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ifsc_code = rows[0].ifsc_code;
                        branch = result[0].br_name;
                        res.redirect("/dashboard");
                    }
                })



            }
            else {
                console.log("Wrong Password");
                res.redirect("/");

            }
        }
    });
});
//Login Ends

/*Profile Starts*/
app.get("/profile", function (req, res) {
    var query = "select * from employee where emp_id=" + login_empid;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {

            res.render("emp_profile", {
                ifsc_code: ifsc_code,
                br_name: branch,
                emp_id: login_empid,
                emp_name: rows[0].emp_name,
                address: rows[0].address,
                gender: rows[0].gender,
                designation: rows[0].designation,
                emp_email: rows[0].emp_email,
                salary: rows[0].salary,
                emp_photo: rows[0].emp_photo.toString("base64")

            });
        }
    });
});

/************************View Customer Starts*******************************/

app.post("/view_profile",function(req,res){
    var query = "select * from cust_account where acc_no=" + req.body.accno;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if(rows.length === 0){
            console.log("Account Not Found!!");
        }
        else {

            res.render("cust_profile", {
                ifsc_code: ifsc_code,
                br_name: branch,
                cust_id: rows[0].cust_id,
                cust_name: rows[0].cust_name,
                address: rows[0].address,
                gender: rows[0].gender,
                dob: rows[0].dob,
                email: rows[0].email,
                city: rows[0].city,
                photo: rows[0].photo.toString("base64"),
                state: rows[0].state,
                zip: rows[0].zip,
                acc_type: rows[0].acc_type,
                city: rows[0].city,
                acc_no: req.body.accno,
                balance: rows[0].balance                

            });
        }
    });
});
/************************View Customer Starts*******************************/

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
