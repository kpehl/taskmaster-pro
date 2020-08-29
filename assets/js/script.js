var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


// edit tasks
// edit task description
// delegated <p> click to replace the text with an input form
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});
// blur event listener for when the user interacts with something other than the active text box
$(".list-group").on("blur", "textarea", function() {
  //get the text area's current value/text
  var text = $(this)
    .val()
    .trim();
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li element
  var index = $(this)
    .closest(".list-group-item")
    .index();
  // define the new task text within the tasks object by specifying the status array 
  //and then the text of the specific task object within that array
  tasks[status][index].text = text;
  // save the task
  saveTasks();
  // recreate the p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  // replace the textarea with the p element
  $(this).replaceWith(taskP);
});

// edit task due date
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get the current text
  var date = $(this)
    .text()
    .trim();
  // create a new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap out the elements
  $(this).replaceWith(dateInput);
  // enable the jQueryUI datepicker for the input
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      // when the calendar is closed, force a change event on dateInput to reset the element and save the task
      $(this).trigger("change");
    }
  });
  // automatically focus on the new element
  dateInput.trigger("focus");
});
// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  // update the task in the array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();
  // recreate the span element with a bootsrap class
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace the input with the new span element
  $(this).replaceWith(taskSpan);
});


// jQueryUI to make the task lists sortable and connected
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", this);
  },
  out: function(event) {
    console.log("out", this);
  },
  // when a task is updated, i.e. order changes or the task status changes
  update: function(event) {
    // define a temporary array
    var tempArr = [];
    // loop over the current set of children in the sortable list and get the task description and due date
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
    
      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add the task data to the temporary array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    // trim down list's id to match the object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    // update the array on the tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// Delete a task area
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  },
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// a date picker is added to the due date
$('#modalDueDate').datepicker({
  // prevent selection of a date that is already past
  minDate: 1
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


