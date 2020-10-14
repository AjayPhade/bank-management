const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require("multer");
const path = require('path');
const md5 = require('md5');

//ID of logged in employee
var emp_id;
var ifsc_code;
var br_name;
var cust_id;

//Configure View Engine
app.set('view engine', 'ejs');

//Establishing Connection to database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sql123',
    database: 'bank',
    dateStrings: 'date'
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
    res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name });
});

app.get("/customer_management", function (req, res) {
    res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name });
});

/*************************** Add Customer Form Starts ***************************/
//FOR FILE UPLOAD
// Set The Storage Engine
var extension1, extension2;

const storage = multer.diskStorage({
    destination: 'D:/ProgramData/MySQL/MySQL Server 8.0/Uploads/',
    filename: function (req, file, cb) {
        connection.query("select cust_id from cust_account order by cust_id desc limit 1", function (err, rows, fields) {
            if (rows.length === 0) {
                cust_id = 5000;
                connection.query("alter table cust_account auto_increment = 74001000", function (err, rows, fields) {
                    if (err) {
                        console.log("Error in query");
                        console.log(error);
                    }
                    else {
                        console.log("Successful Query");
                        // console.log(rows);
                    }
                });
            }
            else
                cust_id = rows[0].cust_id + 1;

            // console.log(cust_id);

            if (file.fieldname === 'myImage') {
                extension1 = path.extname(file.originalname);
                cb(null, cust_id + '-photo' + path.extname(file.originalname));
            }
            else if (file.fieldname === 'aadhaar') {
                extension2 = path.extname(file.originalname);
                cb(null, cust_id + '-aadhaar' + path.extname(file.originalname));
            }
        });
    }
});

//For Image
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images or Pdfs Only!');
    }
};

app.post("/add_customer", upload.fields([{ name: 'myImage', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]), function (req, res) {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var name = first_name + " " + last_name;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var email = req.body.email;
    var pno = parseInt(req.body.pcon);
    var sno = parseInt(req.body.scon);
    var gender = req.body.gender;
    var dob = req.body.dob;
    var aadhaar_no = req.body.aadhaar_no;
    var pan_no = req.body.pan;
    var balance = 0;
    var acc_type = req.body.acc_type;
    var interest;

    console.log(name, address, req.body.first_name);
    console.log(extension1, extension2);

    var photo = 'load_file("D:/ProgramData/MySQL/MySQL Server 8.0/Uploads/' + cust_id + '-photo' + extension1 + '")';
    var aadhaar = cust_id + '-aadhaar' + extension2;

    //Derived Attributes
    if (acc_type === 'Saving') {
        interest = 6.4;
    }
    else {
        interest = 4;
    }

    var query1 = "insert into cust_account (cust_id, ifsc_code, name, email, gender, dob, address, city, state, zip, acc_type, balance, pan_no, aadhaar_no, aadhaar, photo) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " + photo + ")";
    var list = [cust_id, ifsc_code, name, email, gender, dob, address, city, state, zip, acc_type, balance, pan_no, aadhaar_no, aadhaar];

    console.log(list);

    //Executing Query
    connection.query(query1, list, function (error, rows, fields) {
        if (error) {
            console.log("Error in query");
            console.log(error);
        }
        else {
            console.log("Successful Query");
            // console.log(rows);

            var query2 = "insert into cust_phone values ?";
            var phone;
            var acc_no = rows.insertId;

            if (sno === undefined)
                phone = [acc_no, pno];
            else
                phone = [[acc_no, pno], [acc_no, sno]];

            connection.query(query2, [phone], function (error, rows, fields) {
                if (error) {
                    console.log("Error in query");
                    console.log(error);
                }
                else {
                    console.log("Successful Query");
                    // console.log(rows);
                }
            });
        }
    });

    res.redirect("/customer_management");
});

/*************************** Add Customer Form Ends ***************************/

// connection.end(function (error) {
//     if (error) {
//         console.log("Error in Disconnecting Database");
//         throw error;
//     }
//     else {
//         console.log("Disconnected from Database");
//     }
// });

/*************************** Login Starts ***************************/
app.post("/dashboard", function (req, res) {
    emp_id = req.body.login_id;
    var password = md5(req.body.password);

    var query = "select password,ifsc_code from employee where emp_id = " + emp_id;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            if (rows.length === 0) {
                console.log("Employee Id not found!!");
                res.redirect("/");
            }
            else if (rows[0].password === password) {
                console.log("Successfully Logged In");
                loginstatus = true;
                connection.query("select br_name from branch where ifsc_code = ?", [rows[0].ifsc_code], function (err, result, field) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ifsc_code = rows[0].ifsc_code;
                        br_name = result[0].br_name;
                        res.redirect("/dashboard");
                    }
                });
            }
            else {
                console.log("Wrong Password");
                res.redirect("/");

            }
        }
    });
});
/*************************** Login Ends ***************************/

/*************************** Employee Profile Starts ***************************/
app.get("/profile", function (req, res) {
    var query = "select * from emp_info where emp_id=" + emp_id;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            var row = rows[0];
            var phone_no1, phone_no2;
            phone_no1 = rows[0].phone_no;

            if (rows.length === 2)
                phone_no2 = rows[1].phone_no;
            else
                phone_no2 = "Not Available";

            // console.log(typeof(row.dob), row.dob);

            res.render("emp_profile", {
                ifsc_code: ifsc_code,
                br_name: br_name,
                phone_no1: phone_no1,
                phone_no2: phone_no2,
                photo: row.photo.toString("base64"),
                row: row
            });
        }
    });
});
/*************************** Employee Profile Ends ***************************/

/************************Customer Profile Starts*******************************/

app.post("/view_profile", function (req, res) {
    var query = "select * from cust_info where acc_no=" + req.body.accno;
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Account Not Found!!");
        }
        else {
            var row = rows[0];

            res.render("cust_profile", {
                ifsc_code: ifsc_code,
                br_name: br_name,
                cust_id: rows.cust_id,
                cust_name: rows.cust_name,
                address: rows.address,
                gender: rows.gender,
                dob: rows.dob,
                email: rows.email,
                city: rows.city,
                photo: rows.photo.toString("base64"),
                state: rows.state,
                zip: rows.zip,
                acc_type: rows.acc_type,
                city: rows.city,
                acc_no: req.body.accno,
                balance: rows.balance

            });
        }
    });
});
/************************Customer Profile Starts*******************************/

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
