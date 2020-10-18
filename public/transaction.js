//Styling Sidebar Customer Management
var sidebar = document.getElementsByClassName("sidebar-tile");
var previous;

for (var i = 0; i < sidebar.length; i++) {
  sidebar[i].addEventListener("click", select);
}

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
      document.getElementsByName("trans_no")[0].focus();
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
      break;
  }
}