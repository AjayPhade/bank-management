var input = document.getElementById('validatedCustomFile');
var infoArea = document.getElementById('place-hold');
input.addEventListener('change', showFileName);

function showFileName(event) {

  // the change event gives us the input it occurred in
  var input = event.srcElement;

  // the input has an array of files in the `files` property, each one has a name that you can use. We're just using the name here.
  var fileName = input.files[0].name;

  // change the text to the actual filename
  infoArea.textContent = fileName;
}

var sidebar = document.getElementsByClassName("sidebar-tile");
var previous;

for (var i = 0; i < sidebar.length; i++) {
  sidebar[i].addEventListener("click", select);
}

function select(event) {
  var element = event.target;
  switch (element.id) {
    case "add":
      if (previous != undefined)
        previous.style.transform = "initial";
      element.style.backgroundColor = "#29e681";
      element.style.transform = "scale(1.1)";
      previous = element;
      break;
    case "view":
      if (previous != undefined)
        previous.style.transform = "initial";
      element.style.backgroundColor = "#e6a400";
      element.style.transform = "scale(1.1)";
      previous = element;
      break;

    case "update":
      if (previous != undefined)
        previous.style.transform = "initial";
      element.style.backgroundColor = "#393e46";
      element.style.transform = "scale(1.1)";
      previous = element;
      break;

    case "remove":
      if (previous != undefined)
        previous.style.transform = "initial";
      element.style.backgroundColor = "#cf1b1b";
      element.style.transform = "scale(1.1)";
      previous = element;
      break;
  }
}