$('#first-train-input').mask('00:00');
$('#frequency-input').mask('0#');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyC0-cotXf_Em8uZbI-fIIwsy-wymhnZ31I",
  authDomain: "train-time-62d03.firebaseapp.com",
  databaseURL: "https://train-time-62d03.firebaseio.com",
  projectId: "train-time-62d03",
  storageBucket: "",
  messagingSenderId: "115861977982"
};

firebase.initializeApp(config);

var database = firebase.database();

// Current Time
var updateTime = function () {
  var currentTime = moment();
  $("#current-time").html(moment(currentTime).format("H:mm:ss"));
};
setInterval(updateTime, 1000); // every second



$("#submit").on("click", function() {
  event.preventDefault();

  database.ref().push({
    name: $("#name-input").val().trim(),
    destination: $("#destination-input").val().trim(),
    starttime: $("#first-train-input").val().trim(),
    frequency: $("#frequency-input").val().trim()
  });

  $("#name-input").val('');
  $("#destination-input").val('');
  $("#first-train-input").val('');
  $("#frequency-input").val('');

});


database.ref().on("child_added", function(snapshot, prevChildKey) {

  // generate remove button
  var btn = $("<button>");
    btn.addClass("trash-btn");
    btn.attr("data-key", snapshot.key);
    var i = $("<i>");
      i.addClass("material-icons");
      i.text("delete")   
    btn.append(i);
    btn.click(remove);

  // generate table
  var $tr = $('<tr>').append(
    $('<td>').text(snapshot.val().name),
    $('<td>').text(snapshot.val().destination).addClass('destination'),
    $('<td>').text(snapshot.val().starttime).addClass('starttime'),
    $('<td>').text(snapshot.val().frequency).addClass('frequency'),
    $('<td>').addClass('arrival'),
    $('<td>').addClass('min-away'),
    $('<td>').append(btn) 
  ).appendTo('#train-table');


  update();
});

// run update function every minute (on the minute)
var date = new Date();
setTimeout(function() {
    setInterval(update, 60000);
    update();
}, (60 - date.getSeconds()) * 1000);


function update() {
  $('tbody tr').each(function() {

    var frequency = $(this).find('.frequency').html();
    var firstTime = $(this).find('.starttime').html();

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

    // Current Time
    var currentTime = moment();

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % frequency;

    // Minute Until Train
    var minTillTrain = frequency - tRemainder;

    // Next Train
    var nextTrain = moment().add(minTillTrain, "minutes");

    $(this).find('.arrival').html((nextTrain).format("H:mm"));  
    $(this).find('.min-away').html(minTillTrain);

  });
}


function remove() {
  database.ref().child($(this).attr('data-key')).remove();
  this.closest("tr").remove();
}

