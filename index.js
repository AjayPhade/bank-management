const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require("multer");
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const move = require('fs-extra');
//const { check, validationResult } = require('express-validator');

//ID of logged in employee
var emp_id, name;
var ifsc_code;
var br_name;
var cust_id;
var logged_in = false;
var designation;
var counter_no;
var login_time;

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
app.use(bodyParser.urlencoded({ extended: false }));

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
    logged_in = false;
    res.render("login", { error: undefined });
});

app.get("/dashboard", function (req, res) {
    if (loggedIn(res)) {
        if (designation === "Manager") {
            counter_no = 0;
            res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name, designation: "Manager" });
        }
        else if (designation === "General Employee") {
            res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name, designation: "General" });
        }
        else {
            connection.query("select counter_no from cash_counter where emp_id = ?", [emp_id], function (err, rows, fields) {
                if (err) {
                    console.log(err);
                }
                else {
                    counter_no = rows[0].counter_no;
                    console.log("Query Successful");

                    res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name, designation: "Cashier", error: undefined });
                }
            });
        }
    }
});

app.get("/customer_management", function (req, res) {
    if (loggedIn(res)) {
        res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: [undefined, undefined] });
    }
});

app.get("/logout", function (req, res) {
    logged_in = false;
    connection.query("insert into login_sessions (emp_id,login_time) values(?,from_unixtime(?*0.001))", [emp_id, login_time], function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log("-------------------" + name + " LOGGED OUT (ID: " + emp_id + ", IFSC: " + ifsc_code + ") -------------------");
    res.redirect("/");
});

/*************************** Login Starts ***************************/

app.post("/", function (req, res) {
    emp_id = req.body.emp_id;
    var password = md5(req.body.password);
    var query = "select password, ifsc_code, name, designation from employee where emp_id = " + emp_id;

    connection.query(query, function (err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            if (rows.length === 0) {
                console.log("Employee Id not found!!");
                logged_in = false;
                res.render("login", { error: "Employee ID Not Found" });
            }
            else if (rows[0].password === password) {
                logged_in = true;
                date = new Date().getTime()
                login_time = date;
                console.log(date);
                designation = rows[0].designation;

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
                res.render("login", { error: "Wrong Password" });
            }
        }
    });
});
/*************************** Login Ends ***************************/

/*************************** Add Customer Form Starts ***************************/
//FOR FILE UPLOAD
// Set The Storage Engine
var extension1, extension2;

const storage1 = multer.diskStorage({
    destination: 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer',
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
const upload1 = multer({
    storage: storage1,
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

app.post("/add_customer", upload1.fields([{ name: 'myImage', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]), function (req, res) {
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

    var photo = 'load_file("C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/' + cust_id + '-photo' + extension1 + '")';
    var aadhaar = cust_id + '-aadhaar' + extension2;

    //to retrive int_rate
    connection.query("select int_rate from acc_limit_int where acc_type = ?", [acc_type], function (err, row, col) {
        if (err) {
            console.log(err);
        }
        else {
            interest = row[0].int_rate;
            var query1 = "insert into cust_account (cust_id, ifsc_code, name, email, gender, dob, address, city, state, zip, acc_type, balance, pan_no, aadhaar_no, aadhaar, photo, int_rate,created_by,status) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " + photo + ",?,?,'ACTIVE')";
            var list = [cust_id, ifsc_code, name, email, gender, dob, address, city, state, zip, acc_type, balance, pan_no, aadhaar_no, aadhaar, interest, emp_id];

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

                    var newPath1 = "D:/Web Development/College Project/DBE-Bank/public/pdfs/" + cust_id + '-aadhaar' + extension2;
                    move.move('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/' + cust_id + '-aadhaar' + extension2, newPath1, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Moved");
                            res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: ["success_added", acc_no] });
                        }
                    });
                }
            });
        }
    });
});

/*************************** Add Customer Form Ends ***************************/

/************************ Customer Profile Starts *******************************/

app.post("/view_profile", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var query = "select * from cust_info where acc_no=" + acc_no;

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Account Not Found!!");
            if (req.body.cash_dash !== undefined) {
                res.render("dashboard", { ifsc_code: ifsc_code, br_name: br_name, designation: "Cashier", error: 'cash_dash_error' });
            }
            else {
                res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: ["view_error", "Account Not Found"] });
            }
        }
        else {
            var row = rows[0];
            var phone_no1, phone_no2;
            phone_no1 = rows[0].phone_no;

            if (rows.length === 2)
                phone_no2 = rows[1].phone_no;
            else
                phone_no2 = "Not Available";
            connection.query("select * from acc_limit_int where acc_type=?", [row.acc_type], function (err, ro, fields) {
                if (err) {
                    console.log(err);
                }
                else {
                    connection.query("select * from transaction where acc_no = ? order by time_stamp desc", [acc_no], function (err, rows, fields) {
                        if (err) {
                            console.log(err);

                        }
                        else {
                            connection.query("select * from loan_trans where acc_no=? order by time_stamp desc", [acc_no], function (err, r) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    res.render("cust_profile", {
                                        ifsc_code: ifsc_code,
                                        br_name: br_name,
                                        phone_no1: phone_no1,
                                        phone_no2: phone_no2,
                                        photo: row.photo.toString("base64"),
                                        row: row,
                                        rows: rows,
                                        length: rows.length,
                                        min_bal: ro[0].min_bal,
                                        r: r
                                    });
                                }
                            })


                        }
                    })
                }
            });
        }
    });
});
app.post("/reopen", function (req, res) {
    var acc_no = req.body.acc_no;
    connection.query("update cust_account set status='ACTIVE' where acc_no = ?", [acc_no], function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Account Reopened");
            var query = "select * from cust_info where acc_no=" + acc_no;

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
                    connection.query("select * from acc_limit_int where acc_type=?", [row.acc_type], function (err, ro, fields) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            connection.query("select * from transaction where acc_no = ? order by time_stamp desc", [acc_no], function (err, rows, fields) {
                                if (err) {
                                    console.log(err);

                                }
                                else {
                                    connection.query("select * from loan_trans where acc_no=? order by time_stamp desc", [acc_no], function (err, r) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            res.render("cust_profile", {
                                                ifsc_code: ifsc_code,
                                                br_name: br_name,
                                                phone_no1: phone_no1,
                                                phone_no2: phone_no2,
                                                photo: row.photo.toString("base64"),
                                                row: row,
                                                rows: rows,
                                                length: rows.length,
                                                min_bal: ro[0].min_bal,
                                                r: r
                                            });
                                        }
                                    })


                                }
                            })
                        }
                    });
                }
            });
        }
    })
});

/************************ Customer Profile Ends *******************************/

/***************************Update Customer Starts ****************************/

app.post("/update_customer", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);

    connection.query("select * from cust_info where acc_no = ? and status='ACTIVE'", [acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Customer Not Found!!");
            res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: ["update_error", "Account Not Found"] });
        }
        else {
            row = rows[0];
            var phone_no1 = row.phone_no, phone_no2;
            if (rows.length == 2) {
                phone_no2 = rows[1].phone_no;
            }
            else {
                phone_no2 = "Not Available";
            }
            res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, phone_no1: phone_no1, phone_no2: phone_no2, rows: undefined, error: [undefined, undefined] });
        }
    });
});


app.post("/update_customer_details", function (req, res) {
    var name = req.body.name;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var email = req.body.email;
    var pno = parseInt(req.body.pcon);
    var sno = parseInt(req.body.scon);
    var dob = req.body.dob;
    var aadhaar_no = req.body.aadhaar_no;
    var pan_no = req.body.pan;
    var acc_no = parseInt(req.body.acc_no);
    console.log(req.body);
    var query = "update cust_account set name=?, address=?, city=?, state=?, zip=?, email=?, dob=?,aadhaar_no = ?,pan_no=? where acc_no = ?";
    connection.query(query, [name, address, city, state, zip, email, dob, aadhaar_no, pan_no, acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Successful!");
            connection.query("select * from cust_phone where acc_no = ?", [acc_no], function (err, rows, fields) {
                var oldphone1 = rows[0].phone_no;

                if (rows.length === 1) {
                    if (!Number.isNaN(sno)) {
                        connection.query("insert into cust_phone values(?,?)", [acc_no, sno], function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("Successfully Added Secondary No.");
                            }
                        });
                    }
                    connection.query("update cust_phone set phone_no = ? where acc_no = ? and phone_no = ?", [pno, acc_no, oldphone1], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Primary ");
                        }
                    });
                }
                else {
                    var oldphone2 = rows[1].phone_no;
                    connection.query("update cust_phone set phone_no = ? where acc_no = ? and phone_no = ?", [pno, acc_no, oldphone1], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Primary ");
                        }
                    });
                    connection.query("update cust_phone set phone_no = ? where acc_no = ? and phone_no = ?", [sno, acc_no, oldphone2], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Secondary ");
                        }
                    });
                }
            });
            res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, phone_no1: pno, phone_no2: sno, rows: undefined, error: ["success_updated", undefined] });
        }
    });

});

/*****************************Update Customer Ends*******************************/

/*****************************Remove Customer Starts*****************************/

app.post("/remove_customer", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);

    connection.query("select * from cust_info where acc_no = ? and status='ACTIVE'", [acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Customer Not Found!!");
            res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: ["remove_error", "Account Not Found"] });
        }
        else {
            connection.query("select * from loan where acc_no = ?", [acc_no], function (err, row) {
                if (err) {
                    console.log(err);
                }
                else if (row.length > 0) {
                    console.log("Cannot delete account due to active loan");
                    res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, error: ["remove_error", "Cannot remove this account due to active loan."] });
                }
                else {
                    row = rows[0];
                    var phone_no1 = row.phone_no, phone_no2;

                    if (rows.length == 2) {
                        phone_no2 = rows[1].phone_no;
                    }
                    else {
                        phone_no2 = "Not Available";
                    }

                    res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, phone_no1: phone_no1, phone_no2: phone_no2, rows: row, error: [undefined, undefined] });
                }
            });
        }
    });
});

app.post("/remove_customer_details", function (req, res) {
    var acc_no = req.body.acc_no;
    connection.query("Update cust_account set status='INACTIVE' WHERE acc_no = ?", [acc_no], function (err) {
        if (err) {
            console.log(err);
        }
        else {
            connection.query("select balance from cust_account where acc_no=?", [acc_no], function (err, row) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (row[0].balance > 0) {
                        connection.query("insert into transaction (trans_type,amount,acc_no,ifsc_code,rem_bal) values(?,?,?,?,?)", ['Debit', row[0].balance, acc_no, ifsc_code, 0], function (err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                connection.query("update cust_account set balance=0 where acc_no=?", [acc_no], function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log("Deleted from cust_account");
                                        res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, phone_no1: undefined, phone_no2: undefined, rows: undefined, error: ["success_removed", undefined] });
                                    }
                                })
                            }
                        });
                    }
                    else {
                        console.log("Deleted from cust_account");
                        res.render("customer_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, phone_no1: undefined, phone_no2: undefined, rows: undefined, error: ["success_removed", undefined] });
                    }
                }
            })


        }
    });

});

/*****************************Remove Customer Ends*****************************/

/*************************** Employee Profile Starts ***************************/
var emp_login_details;
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
                emp_login_details = {
                    phone_no1,
                    phone_no2,
                    photo: row.photo.toString("base64"),
                    row
                }
                res.render("emp_profile", {
                    ifsc_code,
                    br_name,
                    row: emp_login_details.row,
                    phone_no1: emp_login_details.phone_no1,
                    phone_no2: emp_login_details.phone_no2,
                    photo: emp_login_details.photo,
                    success: undefined
                });
            }
        });
    }
});

app.post("/change_password", function (req, res) {
    var pass = md5(req.body.pass);
    connection.query("update employee set password=? where emp_id=?", [pass, emp_id], function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("emp_profile", {
                ifsc_code,
                br_name,
                row: emp_login_details.row,
                phone_no1: emp_login_details.phone_no1,
                phone_no2: emp_login_details.phone_no2,
                photo: emp_login_details.photo,
                success: 'Success'
            }
            )
        }
    })
});


/*************************** Employee Profile Ends ***************************/


/************************ Employee Managenment Starts ********************************************************/
var emp_details;

app.get("/emp_management", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from employee where ifsc_code = ? and emp_id != ?", [ifsc_code, emp_id], function (err, r) {
            if (err) {
                console.log(err);
            }
            else {
                emp_details = r;
                res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, emp_details, error: [undefined, undefined] });
            }
        });
    }
});

/**********************************Configure storage for employee************************************************* */
const storage2 = multer.diskStorage({
    destination: 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee',
    filename: function (req, file, cb) {
        connection.query("select emp_id from employee order by emp_id desc limit 1", function (err, rows, fields) {
            if (rows.length === 0) {
                connection.query("alter table employee auto_increment = 1000", function (err, rows, fields) {
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
        });

        if (file.fieldname === 'myImage') {
            extension1 = path.extname(file.originalname);
            cb(null, 'photo' + path.extname(file.originalname));
        }
        else if (file.fieldname === 'aadhaar') {
            extension2 = path.extname(file.originalname);
            cb(null, 'aadhaar' + path.extname(file.originalname));
        }
    }
});

//For Image
const upload2 = multer({
    storage: storage2,
    limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

app.post("/add_employee", upload2.fields([{ name: 'myImage', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]), function (req, res) {
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
    var salary = req.body.salary;
    var designation = req.body.designation;
    var password;

    console.log(extension1, extension2);

    var photo = 'load_file("C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/' + 'photo' + extension1 + '")';
    var aadhaar = 'aadhaar' + extension2;

    //Derived Attributes
    if (designation === 'Cashier' || designation === 'General Employee') {
        password = md5('admin@123');
    }

    var query1 = "insert into employee (ifsc_code, name, email, gender, dob, address, city, state, zip, designation, salary, pan_no, aadhaar_no, aadhaar, photo,password) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?," + photo + ",?)";
    var list = [ifsc_code, name, email, gender, dob, address, city, state, zip, designation, salary, pan_no, aadhaar_no, aadhaar, password];

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

            var query2 = "insert into emp_phone values ?";
            var phone;
            var emp_id = rows.insertId;

            if (Number.isNaN(sno))
                phone = [[emp_id, pno]];
            else
                phone = [[emp_id, pno], [emp_id, sno]];


            /////To rename uploaded files
            var oldPath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/" + 'photo' + extension1;
            var newPath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/" + emp_id + '-photo' + extension1;

            fs.rename(oldPath, newPath, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Renamed Photo");
                }
            });

            oldPath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/" + 'aadhaar' + extension2;
            newPath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/" + emp_id + '-aadhaar' + extension2;

            fs.rename(oldPath, newPath, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Renamed Aadhaar");

                    var newPath1 = "D:/Web Development/College Project/DBE-Bank/public/pdfs/" + emp_id + '-aadhaar' + extension2;
                    move.move(newPath, newPath1, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Moved");
                        }
                    });
                }
            });

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
            connection.query("update employee set aadhaar = ? where emp_id = ?", [emp_id + "-aadhaar" + extension2, emp_id], function (err, rows, fields) {
                if (err) {
                    console.log("Error in Query");
                    console.log(err);
                }
                else {
                    console.log("Successful Query");
                }
            });

            //Adding Cash counter if employee is cashier
            if (designation == "Cashier") {
                connection.query("select * from cash_counter where ifsc_code= ?", [ifsc_code], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var counter_no = rows.length + 1;
                        var q = "insert into cash_counter values(?, ?, ?)";

                        connection.query(q, [counter_no, emp_id, ifsc_code], function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("Successful Query:- Adding to Counter");
                            }
                        });
                    }

                });
            }
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, rows: undefined, emp_details, error: ["success_added", emp_id] });
        }
    });
});

/////////////View Employee
app.post("/emp_profile", function (req, res) {
    var query = "select * from emp_info where emp_id = ? and ifsc_code = ?";

    connection.query(query, [req.body.emp_id, ifsc_code], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Employee Not Found!!");
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, emp_details, rows: undefined, error: ["view_error", "Employee Not Found"] });
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

            res.render("emp_profile 2", {
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
/******************************Update Employee Starts */
app.post("/update_employee", function (req, res) {
    var emp_id = parseInt(req.body.emp_id);

    connection.query("select * from emp_info where emp_id = ? and ifsc_code = ?", [emp_id, ifsc_code], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Employee Not Found!!");
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, emp_details, rows: undefined, error: ["update_error", "Employee Not Found"] });
        }
        else {
            row = rows[0];
            var phone_no1 = row.phone_no, phone_no2;
            if (rows.length == 2) {
                phone_no2 = rows[1].phone_no;
            }
            else {
                phone_no2 = "Not Available";
            }
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, emp_details, phone_no1: phone_no1, phone_no2: phone_no2, rows: undefined, error: [undefined, undefined] });
        }
    });
});


app.post("/update_employee_details", function (req, res) {
    var name = req.body.name;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var email = req.body.email;
    var pno = parseInt(req.body.pcon);
    var sno = parseInt(req.body.scon);
    var dob = req.body.dob;
    var aadhaar_no = req.body.aadhaar_no;
    var pan_no = req.body.pan;
    var emp_id = parseInt(req.body.emp_id);
    var designation = req.body.designation;
    var salary = parseInt(req.body.salary);
    console.log(req.body);
    var query = "update employee set name=?, address=?, city=?, state=?, zip=?, email=?, dob=?,aadhaar_no = ?,pan_no=?, designation=?,salary=? where emp_id = ?";
    connection.query(query, [name, address, city, state, zip, email, dob, aadhaar_no, pan_no, designation, salary, emp_id], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Successful!");
            connection.query("select * from emp_phone where emp_id = ?", [emp_id], function (err, rows, fields) {
                var oldphone1 = rows[0].phone_no;

                if (rows.length === 1) {
                    if (!Number.isNaN(sno)) {
                        connection.query("insert into emp_phone values(?,?)", [emp_id, sno], function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("Successfully Added Secondary No.");
                            }
                        });
                    }
                    connection.query("update emp_phone set phone_no = ? where emp_id = ? and phone_no = ?", [pno, emp_id, oldphone1], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Primary ");
                        }
                    });
                }
                else {
                    var oldphone2 = rows[1].phone_no;
                    connection.query("update emp_phone set phone_no = ? where emp_id = ? and phone_no = ?", [pno, emp_id, oldphone1], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Primary ");
                        }
                    });
                    connection.query("update emp_phone set phone_no = ? where emp_id = ? and phone_no = ?", [sno, emp_id, oldphone2], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated Secondary ");
                        }
                    });
                }
            });
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, emp_details, rows: undefined, error: ["success_updated", undefined] });
        }
    });

});


/*****************************Update Employee Ends*******************************/
/*****************************Remove Employee Starts*****************************/

app.post("/remove_employee", function (req, res) {
    var emp_id = parseInt(req.body.emp_id);

    connection.query("select * from emp_info where emp_id = ? and ifsc_code = ?", [emp_id, ifsc_code], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            console.log("Employee Not Found!!");
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, emp_details, rows: undefined, error: ["remove_error", "Employee Not Found"] });
        }
        else {
            row = rows[0];
            var phone_no1 = row.phone_no, phone_no2;
            if (rows.length == 2) {
                phone_no2 = rows[1].phone_no;
            }
            else {
                phone_no2 = "Not Available";
            }
            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, phone_no1, emp_details, phone_no2, row: undefined, rows: row, error: [undefined, undefined] });
        }
    });
});
app.post("/remove_employee_details", function (req, res) {
    var emp_id = req.body.emp_id;
    connection.query("DELETE FROM emp_phone WHERE emp_id = ?", [emp_id], function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Deleted from emp_phone");
            connection.query("select * from employee where emp_id=?", [emp_id], function (err, row) {
                if (err) {
                    console.log(err);
                }
                else if (row[0].designation === "Cashier") {
                    connection.query("delete from cash_counter where emp_id=?", [emp_id], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            connection.query("DELETE FROM employee WHERE emp_id = ?", [emp_id], function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Deleted from employee");
                                    res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, emp_details, row: undefined, rows: undefined, error: ["success_removed", undefined] });

                                }
                            });
                        }
                    });

                }
                else {
                    connection.query("DELETE FROM employee WHERE emp_id = ?", [emp_id], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Deleted from employee");
                            res.render("employee_mg", { ifsc_code: ifsc_code, br_name: br_name, emp_details, row: undefined, rows: undefined, error: ["success_removed", undefined] });

                        }
                    });
                }
            });

        }
    });
});

/*****************************Remove Employee Ends*****************************/

/************************ Employee Managenment Ends *******************************/

/************************ Transaction Managenment Starts *******************************/

app.get("/transaction_management", function (req, res) {
    if (loggedIn(res)) {
        res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: [undefined, undefined] });
    }
});

app.post("/withdraw", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var amount = parseInt(req.body.amount);
    console.log(req.body);

    connection.query("select * from cust_account where acc_no=? and status='ACTIVE'", [acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length === 0) {
                console.log("Customer Not Found");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["withdraw_error", "Account Not Found"] });
            }
            else {
                if (rows[0].balance < amount) {
                    console.log("Insufficient Balance.... Cannot Withdraw Amount!!");
                    res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["withdraw_error", "Insufficient Balance!! Current Balance: " + rows[0].balance] });
                }
                else {
                    var q = "insert into transaction (counter_no, trans_type,amount, acc_no, ifsc_code, rem_bal) values(?,?,?,?,?,?)";

                    connection.query(q, [counter_no, "Debit", amount, acc_no, ifsc_code, rows[0].balance - amount], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            connection.query("Update cust_account set balance= balance-? where acc_no = ?", [amount, acc_no], function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Successful Withdraw.");
                                    res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["success_withdraw", rows[0].balance - amount] });
                                }
                            });
                        }
                    });
                }
            }
        }
    });

});

app.post("/deposit", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var amount = parseInt(req.body.amount);
    console.log(req.body);

    connection.query("select * from cust_account where acc_no=? AND status='ACTIVE'", [acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length === 0) {
                console.log("Customer Not Found");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["deposit_error", "Account Not Found"] });
            }
            else {
                var q = "insert into transaction (counter_no, trans_type,amount, acc_no,ifsc_code,rem_bal) values(?,?,?,?,?,?)";

                connection.query(q, [counter_no, "Credit", amount, acc_no, ifsc_code, rows[0].balance + amount], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        connection.query("Update cust_account set balance= balance+? where acc_no=?", [amount, acc_no], function (err, rows, fields) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("Successful Deposit.");
                                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["success_deposit", undefined] });
                            }
                        });
                    }
                });
            }
        }
    });

});

/////////View Transaction
app.post("/particular_trans", function (req, res) {
    var trans_no = parseInt(req.body.trans_no);
    connection.query("select * from transaction where trans_no = ?", [trans_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length == 0) {
                console.log("Transaction Not Found!!!");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["view_error", "Transaction Number Not Found"] });
            }
            else {
                console.log("Successful");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: rows, length: rows.length, class_name: "trans_table", error: [undefined, undefined] });
            }
        }

    });
});

app.post("/trans_by_acc", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    connection.query("select * from transaction where acc_no = ?", [acc_no], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length == 0) {
                console.log("Account Not Found!!!");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["view_error", "Account Number Not Found"] });
            }
            else {
                console.log("Successful");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: rows, length: rows.length, class_name: "trans_table", error: [undefined, undefined] });
            }
        }

    });
});

app.post("/all_trans", function (req, res) {
    connection.query("select * from transaction where counter_no = ? and ifsc_code = ? order by time_stamp desc", [counter_no, ifsc_code], function (err, rows, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (rows.length == 0) {
                console.log("Transaction Not Found!!!");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined, class_name: undefined, error: ["view_error", "No Transactions Found"] });
            }
            else {
                console.log("Successful");
                res.render("transaction_mg", { ifsc_code: ifsc_code, br_name: br_name, rows: rows, length: rows.length, class_name: "trans_table", error: [undefined, undefined] });
            }
        }

    });
});

/************************ Transaction Managenment Ends *******************************/


/**************************Loan Management Starts*************************************/

app.get("/loan_management", function (req, res) {
    if (loggedIn(res)) {
        res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: [undefined, undefined] });
    }

});

app.post("/sanction", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var amount = parseFloat(req.body.amount);
    var loan_type = req.body.loan_type;
    var mortgage = req.body.mortgage;
    var int_rate = parseFloat(req.body.int_rate);
    var tenure = parseInt(req.body.tenure);
    connection.query("select * from cust_account c join branch b on c.ifsc_code = b.ifsc_code where acc_no=? and status='ACTIVE'", [acc_no], function (err, row) {
        if (err) {
            console.log(err);
        }
        else {
            if (row.length > 0) {
                if (row[0].ifsc_code !== ifsc_code) {
                    res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["remove_error", "Can't Saction Loan!! Account belongs to Branch: " + row[0].br_name] });
                }
                else {
                    var query = "select * from loan where acc_no=?";

                    connection.query(query, [acc_no], function (err, rows) {
                        if (rows.length === 0) {
                            var query1 = "insert into loan (loan_type,amount,mortgage,int_rate,tenure,acc_no,rem_amt,sanctioned_by) values(?,?,?,?,?,?,?,?)";

                            connection.query(query1, [loan_type, amount, mortgage, int_rate, tenure, acc_no, amount, emp_id], function (err, rows) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Inserted Successfully!");
                                    var query2 = "insert into loan_trans (type,amount,int_amt,total_amt,acc_no,rem_amt,done_by) values(?,?,?,?,?,?,?)";

                                    connection.query(query2, ["Sanctioned", amount, 0, amount, acc_no, amount, emp_id], function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            console.log("Loan Sanctioned");
                                            var query3 = "update cust_account set balance = balance+? where acc_no=?";

                                            connection.query(query3, [amount, acc_no], function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["sanction_success", undefined] });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            console.log("Loan Already Exists.");
                            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["remove_error", "Can't Sanction Loan!! Loan Already Exists"] });
                        }
                    });
                }
            }
            else {
                console.log("Account Not Found");
                res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["remove_error", "Account Not Found"] });
            }

        }
    });

});

app.post("/repayment", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var amount = parseFloat(req.body.amount);
    connection.query("select * from cust_account c join branch b on c.ifsc_code = b.ifsc_code where acc_no=? and status='ACTIVE'", [acc_no], function (err, row) {
        if (err) {
            console.log(err);
        }
        else if (row.length === 0) {
            console.log("Account Not Found!");
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["add_error", "Account Not Found"] });
        }
        else {
            if (row[0].ifsc_code !== ifsc_code) {
                res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["add_error", "Can't Repay Loan!! Account belongs to Branch: " + row[0].br_name] });
            }
            else {
                connection.query("select * from loan where acc_no=?", [acc_no], function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (rows.length === 0) {
                            console.log("This account doesn't have any loan");
                            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["add_error", "This account doesn't have any active loan"] });
                        }
                        else if (rows[0].rem_amt < amount) {
                            console.log("You are paying higher than remaining loan.");
                            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["add_error", "Can't Repay Loan!! Remaining Loan: " + rows[0].rem_amt] });
                        }
                        else {
                            var int_rate = rows[0].int_rate;
                            var rem_amt = rows[0].rem_amt;
                            var total_amt;
                            connection.query("select DATEDIFF(CURDATE(),time_stamp) as days from loan_trans where acc_no=? order by time_stamp desc limit 1 ", [acc_no], function (err, row) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    var int_amt = ((rem_amt * int_rate) / 36500) * row[0].days;
                                    int_amt = parseFloat(int_amt.toFixed(2));
                                    total_amt = amount + int_amt;
                                    var rem_amt2 = rem_amt - amount;
                                    console.log(rem_amt, int_rate, row[0].days, typeof (total_amt));
                                    row = {
                                        int_amt, total_amt, amount, acc_no, rem_amt2
                                    }
                                    res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: row, cls: "confirm", rows: undefined, class_name: undefined, error: [undefined, undefined] });
                                }
                            });
                        }
                    }
                });
            }
        }
    });

});

app.post("/repayment_confirmed", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    var amount = parseFloat(req.body.amount);
    var int_amt = parseFloat(req.body.int_amt);
    var total_amt = parseFloat(req.body.total_amt);
    var rem_amt2 = parseFloat(req.body.rem_amt2);

    connection.query("select balance from cust_account where acc_no=?", [acc_no], function (err, row) {
        if (err) {
            console.log(err);
        }
        else if (row[0].balance >= total_amt) {
            var query = "insert into loan_trans (type,amount,int_amt,total_amt,acc_no,rem_amt,done_by) values ('Repayment',?,?,?,?,?,?)";

            connection.query(query, [amount, int_amt, total_amt, acc_no, rem_amt2, emp_id], function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Added into loan_trans");

                    connection.query("update loan set rem_amt=? where acc_no=?", [rem_amt2, acc_no], function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("Updated in loan");

                            connection.query("update cust_account set balance = balance-? where acc_no=?", [total_amt, acc_no], function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Balance Updated!!");

                                    if (rem_amt2 === 0.0) {
                                        connection.query("insert into loan_history (loan_type,amount,mortgage,int_rate,tenure,acc_no,time_stamp,rem_amt,sanctioned_by) select * from loan where acc_no = ?;", [acc_no], function (err, rows) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                connection.query("delete from loan where acc_no=?", [acc_no], function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        console.log("Deleted");
                                                        res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["repayment_success_deleted", undefined] });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["repayment_success", undefined] });
                                    }
                                }

                            });
                        }
                    })
                }
            });
        }
        else {
            console.log("Insufficient Balance!");
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: 'cdf', rows: undefined, class_name: undefined, error: ["balance_error", row[0].balance] });
        }
    });
});

//////////////View Loan Trans Starts
app.post("/particular_loan_trans", function (req, res) {
    var acc_no = parseInt(req.body.acc_no);
    connection.query("select * from loan_trans where acc_no=? order by time_stamp desc", [acc_no], function (err, rows) {
        if (err) {
            console.log(err);
        }
        else if (rows.length === 0) {
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: "cdf", rows: rows, class_name: "trans_table", error: ["view_error", "Account Not Found"] });
        }
        else {
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: "cdf", rows: rows, class_name: "trans_table", error: [undefined, undefined] });
        }
    });
});

app.post("/all_loan_trans", function (req, res) {
    connection.query("select * from loan_trans natural join cust_account where ifsc_code = ? order by time_stamp desc", [ifsc_code], function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: "cdf", rows: rows, class_name: "trans_table", error: [undefined, undefined] });
        }
    });
});

app.post("/sanctioned_loan_trans", function (req, res) {
    connection.query("select * from loan_trans natural join cust_account where ifsc_code = ? and type='sanctioned' order by time_stamp desc", [ifsc_code], function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: "cdf", rows: rows, class_name: "trans_table", error: [undefined, undefined] });
        }
    });
});

app.post("/repayment_loan_trans", function (req, res) {
    connection.query("select * from loan_trans natural join cust_account where ifsc_code = ? and type='repayment' order by time_stamp desc", [ifsc_code], function (err, rows) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("loan_mg", { ifsc_code: ifsc_code, br_name: br_name, row: undefined, cls: "cdf", rows: rows, class_name: "trans_table", error: [undefined, undefined] });
        }
    });
});
///////////////View Loan Trans Ends
/**************************Loan Management Ends****************************************/

/**************************INFO Starts****************************************/

app.get("/info", function (req, res) {
    if (loggedIn(res)) {
        res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows: undefined });
    }
});

app.get("/info/active_accounts", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from cust_info where status = 'active' and ifsc_code = ? group by acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [0, 1, 3, 11, 12, 17, 4, 10, 18, 20];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/inactive_accounts", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from cust_info where status = 'inactive' and ifsc_code = ? group by acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [0, 1, 3, 11, 12, 17, 4, 10, 18, 20];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/critical_accounts", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from cust_info c join acc_limit_int a on c.acc_type = a.acc_type where status = 'active' and ifsc_code = ? and balance < min_bal group by acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [0, 1, 3, 11, 12, 17, 4, 10, 18, 20];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/active_loans", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select *, l.int_rate from loan l join cust_info c on l.acc_no = c.acc_no where ifsc_code = ? group by c.acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [6, 5, 12, 0, 1, 7, 2, 30, 4, 8, 13, 29];
            //console.log(fields);
            //console.log(rows);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/inactive_loans", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select *,l.int_rate from loan_history l join cust_info c on l.acc_no = c.acc_no where ifsc_code = ? group by c.acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [9, 0, 5, 13, 1, 2, 31, 4, 6, 8];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/overdue_loans", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select *,l.int_rate from loan l join cust_info c on l.acc_no = c.acc_no where ifsc_code = ? and TIMESTAMPDIFF(YEAR,time_stamp,CURRENT_TIMESTAMP) >= tenure group by c.acc_no", [ifsc_code], function (err, rows, fields) {
            var columns = [6, 5, 12, 0, 1, 7, 2, 30, 4, 8, 13, 29];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/all_transactions", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from transaction t natural join cash_counter natural join employee where ifsc_code = ?", [ifsc_code], function (err, rows, fields) {
            var columns = [3, 7, 4, 5, 8, 6, 2, 1, 9];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

app.get("/info/all_loan_transactions", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select * from loan_trans natural join cust_account where ifsc_code = ?", [ifsc_code], function (err, rows, fields) {
            var columns = [1, 0, 2, 3, 4, 5, 6, 7, 8];
            //console.log(fields);

            res.render("info", { ifsc_code: ifsc_code, br_name: br_name, rows, columns, fields });
        });
    }
});

/**************************INFO Ends****************************************/

app.get("/sessions", function (req, res) {
    if (loggedIn(res)) {
        connection.query("select *,timestampdiff(Minute,login_time,logout_time) as Duration from login_sessions natural join employee where ifsc_code=?", [ifsc_code], function (err, rows) {
            if(err){
                console.log(err);
            }
            else{
                res.render('sessions',{ifsc_code, br_name,rows});
            }
        })
    }
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
