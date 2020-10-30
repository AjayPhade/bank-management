// For validation
(function () {
  'use strict';
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

//Styling Sidebar Customer Management
var sidebar = document.getElementsByClassName("sidebar-tile");
var previous;

for (var i = 0; i < sidebar.length; i++) {
  sidebar[i].addEventListener("click", select);
}

var trans_table = document.getElementsByClassName("trans_table")[0];
var repay_confirm = document.getElementsByClassName("confirm")[0];
function select(event) {
  var element = event.target;
  switch (element.id) {
    case "add":
      if (previous != undefined) {
        previous.style.transform = "initial";
        div = document.getElementsByClassName(previous.id + "-custdiv")[0];
        div.style.display = "none";
      }
      element.style.backgroundColor = "#29e681";
      element.style.transform = "scale(1.1)";
      div = document.getElementsByClassName(element.id + "-custdiv")[0];
      div.style.display = "inherit";
      document.getElementsByName("acc_no")[1].focus();
      previous = element;
      if (trans_table !== undefined) {
        trans_table.style.display = "none";
      }
      break;

    case "view":
      if (previous != undefined) {
        previous.style.transform = "initial";
        div = document.getElementsByClassName(previous.id + "-custdiv")[0];
        div.style.display = "none";
      }
      element.style.backgroundColor = "#e6a400";
      element.style.transform = "scale(1.1)";
      div = document.getElementsByClassName(element.id + "-custdiv")[0];
      div.style.display = "inherit";
      document.getElementsByName("acc_no")[0].focus();
      previous = element;
      break;

    case "remove":
      if (previous != undefined) {
        previous.style.transform = "initial";
        div = document.getElementsByClassName(previous.id + "-custdiv")[0];
        div.style.display = "none";
      }
      element.style.backgroundColor = "#cf1b1b";
      element.style.transform = "scale(1.1)";
      div = document.getElementsByClassName(element.id + "-custdiv")[0];
      div.style.display = "inherit";
      document.getElementsByName("acc_no")[0].focus();
      previous = element;
      if (trans_table !== undefined) {
        trans_table.style.display = "none";
      }
      break;
  }
}

var table = document.getElementsByClassName("trans_table");

if (table[0] !== undefined) {
  document.getElementsByClassName("view")[0].click();
  table[0].style.display = "inherit";
}

if (repay_confirm !== undefined) {
  document.getElementsByClassName("add")[0].click();

}

var error1 = document.getElementsByClassName("remove_error");

if (error1[0] !== undefined) {
  document.getElementsByClassName("remove")[0].click();
}

var error2 = document.getElementsByClassName("add_error");

if (error2[0] !== undefined) {
  document.getElementsByClassName("add")[0].click();
}

var error3 = document.getElementsByClassName("balance_error");

if (error3[0] !== undefined) {
  document.getElementsByClassName("add")[0].click();
  alert("Insufficient Balance\nCurrent Balance: " + error3[0].innerHTML);
}

var error4 = document.getElementsByClassName("view_error");

if (error4[0] !== undefined) {
  document.getElementsByClassName("view")[0].click();
}

var success1 = document.getElementsByClassName("sanction_success");

if (success1[0] !== undefined) {
  document.getElementsByClassName("remove")[0].click();
  alert("Loan Sanctioned Successfully");
}

var success2 = document.getElementsByClassName("repayment_success");

if (success2[0] !== undefined) {
  document.getElementsByClassName("add")[0].click();
  alert("Loan Repaid Successfully");
}

var success3 = document.getElementsByClassName("repayment_success_deleted");

if (success3[0] !== undefined) {
  document.getElementsByClassName("add")[0].click();
  alert("Loan Repaid Successfully and Loan is closed.");
}