const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require("multer");
const path = require('path');
const md5 = require('md5');
const e = require("express");

//ID of logged in employee
var emp_id, name;
var ifsc_code;
var br_name;
var cust_id;
var logged_in = false;

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

// To check whether employee has logged in or not
function loggedIn(res) {
    if (!logged_in) {
        console.log("------------------- SOMEONE TRIED TO ACCESS THE SITE WITHOUT LOGGING IN -------------------")
        res.redirect("/");
        return 0;
    }

    return 1;
}

//Routing Starts
app.get("/", function (req, res) {
    res.render("index.html");
});

app.get("/dashboard", function (req, res) {
    if (loggedIn(res))
        res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name });
});

app.get("/customer_management", function (req, res) {
    if (loggedIn(res))
        res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name });
});

app.get("/logout", function (req, res) {
    logged_in = false;
    console.log("-------------------" + name + " LOGGED OUT (ID: " + emp_id + ", IFSC: " + ifsc_code + ") -------------------");
    res.redirect("/");
});

/*************************** Login Starts ***************************/
app.post("/dashboard", function (req, res) {
    logged_in = true;

    if (loggedIn(res)) {
        emp_id = req.body.login_id;
        var password = md5(req.body.password);

        var query = "select password, ifsc_code, name from employee where emp_id = " + emp_id;
        connection.query(query, function (err, rows, fields) {
            if (err) {
                throw err;
            }
            else {
                if (rows.length === 0) {
                    console.log("Employee Id not found!!");
                    logged_in = false;
                    res.redirect("/");
                }
                else if (rows[0].password === password) {
                    logged_in = true;

                    connection.query("select br_name from branch where ifsc_code = ?", [rows[0].ifsc_code], function (err, result, field) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            ifsc_code = rows[0].ifsc_code;
                            name = rows[0].name;
                            br_name = result[0].br_name;
                            console.log("-------------------" + name + " LOGGED IN (ID: " + emp_id + ", IFSC: " + ifsc_code + ") -------------------");
                            res.redirect("/dashboard");
                        }
                    });
                }
                else {
                    console.log("Wrong Password");
                    logged_in = false;
                    res.redirect("/");
                }
            }
        });
    }
});
/*************************** Login Ends ***************************/

/*************************** Add Customer Form Starts ***************************/
//FOR FILE UPLOAD
// Set The Storage Engine
var extension1, extension2;

const storage = multer.diskStorage({
    destination: 'D:/ProgramData/MySQL/MySQL Server 8.0/Uploads/',
    filename: function (req, file, cb) {
        /*****************************To get cust_id of last customer************************************/
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
    if (loggedIn(res)) {
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
                if (Number.isNaN(sno))
                    phone = [[acc_no, pno]];
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
    }
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

/*************************** Employee Profile Starts ***************************/
app.get("/profile", function (req, res) {
    if (loggedIn(res)) {
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
    }
});
/*************************** Employee Profile Ends ***************************/

/************************Customer Profile Starts*******************************/

app.post("/view_profile", function (req, res) {
    if (loggedIn(res)) {
        var acc_no = req.body.acc_no;

        var query = "select * from cust_info where acc_no=" + acc_no;

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
                    cust_id: row.cust_id,
                    cust_name: row.name,
                    address: row.address,
                    gender: row.gender,
                    dob: row.dob,
                    email: row.email,
                    city: row.city,
                    photo: row.photo.toString("base64"),
                    state: row.state,
                    zip: row.zip,
                    acc_type: row.acc_type,
                    city: row.city,
                    acc_no: acc_no,
                    balance: row.balance
                });
            }
        });
    }
});
/************************Customer Profile Starts*******************************/

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
