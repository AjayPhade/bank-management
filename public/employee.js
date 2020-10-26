


//Styling Sidebar Customer Management
var sidebar = document.getElementsByClassName("sidebar-tile");
var previous;

for (var i = 0; i < sidebar.length; i++) {
  sidebar[i].addEventListener("click", select);
}
var update = document.getElementsByClassName("update-cust")[0];
var remove = document.getElementsByClassName("remove-cust")[0];
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
      document.getElementsByName("first_name")[0].focus();
      previous = element;
      if(update !==undefined){
        update.style.display = "none";
      }
      if(remove !==undefined){
        remove.style.display = "none";
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
      document.getElementsByName("emp_id")[0].focus();
      previous = element;
      if(update !==undefined){
        update.style.display = "none";
      }
      if(remove !==undefined){
        remove.style.display = "none";
      }
      break;

    case "update":
      if (previous != undefined) {
        previous.style.transform = "initial";
        div = document.getElementsByClassName(previous.id + "-custdiv")[0];
        div.style.display = "none";
      }
      element.style.backgroundColor = "#393e46";
      element.style.transform = "scale(1.1)";
      div = document.getElementsByClassName(element.id + "-custdiv")[0];
      div.style.display = "inherit";
      previous = element;
      if(remove !==undefined){
        remove.style.display = "none";
      }
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
      previous = element;
      if(update !==undefined){
        update.style.display = "none";
      }
      break;
  }
}

//////////To change placeholder of file upload//////////////

var input1 = document.getElementById('validatedCustomFile1');
var infoArea1 = document.getElementById('place-hold1');
input1.addEventListener('change', showFileName);

var input2 = document.getElementById('validatedCustomFile2');
var infoArea2 = document.getElementById('place-hold2');
input2.addEventListener('change', showFileName);

function showFileName(event) {

  // the change event gives us the input it occurred in
  var input = event.srcElement;

  // the input has an array of files in the `files` property, each one has a name that you can use. We're just using the name here.
  var fileName = input.files[0].name;

  // change the text to the actual filename
  if (event.target.id === "validatedCustomFile1") {
    infoArea1.textContent = fileName;
  }
  else {
    infoArea2.textContent = fileName;
  }

  console.log(event.target);
}


//File upload placeholder change End

////Update Customer/////////////

if(update !==undefined){
  document.getElementsByClassName("update")[0].click();
  update.style.display = "inherit";

  Array.from(document.getElementsByClassName("form-control")).forEach(function(element){
    element.addEventListener("dblclick",()=>{
      element.removeAttribute("readonly");
    });
  });
  
}

if(remove !==undefined){
  document.getElementsByClassName("remove")[0].click();
  remove.style.display = "inherit";
  
}