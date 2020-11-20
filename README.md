# Bank Management System
This is Bank Management Web Application similar to application used by employees in the bank. 
# Preview
![image](https://i.ibb.co/4STBy1Q/Screenshot-128.png)
# Prerequisites

* [MySQL Workbench](https://dev.mysql.com/downloads/installer/)
* [Node](https://nodejs.org/en/)

# Installation

## NPM
Use the package manager [npm](https://www.npmjs.com/) to install modules. Run this command where you have cloned the project.

```bash
npm i
```

## Database
Open MySQL Workbench and import database from 'bank.sql' file stored in 'Database' directory.

## .env
In project directory make '.env' file to store environment variables. 
Copy the following text and paste in '.env' file you just created. Replace the content where specified.
```
DB_HOST=<MySQL Connection Hostname>
DB_USER=<MYSQL Connection Username>
DB_PASS=<MySQL Connection Password>
DB_SCHEMA=bank

CUST_SERVER=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer
CUST_LOAD="C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/
CUST_MOVE_FROM=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/

EMP_SERVER=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee
EMP_LOAD="C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/
EMP_RENAME=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/

MOVE_TO=<Path to directory where you cloned project>/bank-management/public/pdfs/
``` 
_Example :-_
Don't copy this. Just for reference.
```
DB_HOST=localhost
DB_USER=root
DB_PASS=sql123
DB_SCHEMA=bank

CUST_SERVER=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer
CUST_LOAD="C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/
CUST_MOVE_FROM=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Customer/

EMP_SERVER=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee
EMP_LOAD="C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/
EMP_RENAME=C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Employee/

MOVE_TO=D:/Web Development/College Project/DBE-Bank/public/pdfs/
```
# Usage
1) Run this command on the terminal in the project directory to start the local server.
```python
node index.js
```
2) Open your browser and paste this into the URL field.
```
localhost:3000
```
3) Use 1001 as Employee ID and admin@123 as a Password to log in as a manager. You can add a new employee, the default password is admin@123. 
