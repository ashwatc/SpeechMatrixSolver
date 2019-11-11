try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

recognition.onstart = function() { 
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');  
  };
}



/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent += '';
  }
  recognition.start();
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#solve-matrix-btn').on('click', function(e) {
  recognition.stop();

  if(!noteContent.length) {
    instructions.text('Could not calculate empty input. Please dictate a matrix equation to solve.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.

    noteContent = "USER INPUT: " + noteContent
    answer = stringToMatrices(noteContent)

    if (!Number.isSafeInteger(answer[0])){
      instructions.text("ERROR!: " + answer + " Please check your input and try again.")
    }
    else{
      noteContent += " \n\n --> ANSWER: [" + answer + "]"
  
      saveNote(new Date().toLocaleString(), noteContent);
  
      // Reset variables and update UI.
      noteContent = '';
      renderNotes(getAllNotes());
      noteTextarea.val('');
      instructions.text('Result saved successfully.');
    } 
  }
})

$('#clear-input-btn').on('click', function(e) {
  // Delete all input text, start over
  noteContent = '';
  noteTextarea.val('');
  instructions.text('Input Cleared.');
});


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected answer.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  
	window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Answer">Listen to Answer</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;    
    });
  }
  else {
    html = '<li><p class="content">You don\'t have any matrices or recent calculations.</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}

inputMatrix = []

function stringToMatrices(inpStr){
  inputMatrix = []
  bounds = []
  foundBy = false
  splitStr = inpStr.split(' ')
  for (i = 0; i < splitStr.length; i++){
    if (splitStr[i] == "by"){
      foundBy = true
      bounds[0] = parseInt(splitStr[i - 1])
      bounds[1] = parseInt(splitStr[i + 1])
      splitStr = splitStr.slice(i + 2, splitStr.length)
      // console.log(splitStr)
    }
  }

  if (!foundBy){
    return "Sorry, I don't understand."
  }

  matrixRow = []

  numVals = 0

  for (i = 0; i < splitStr.length; i++){
    column = 0
    if (splitStr[i] == "values"){
      for (j = i; j < splitStr.length; j++){
        val = parseInt(splitStr[j].split('.')[0])
        if (Number.isSafeInteger(val)){
          // val = parseInt(val)
          matrixRow.push(val)
          numVals++
          // console.log(matrixRow)
          column++
          if (column == bounds[1]){
            // inputMatrix[row] = matrixRow
            inputMatrix.push(matrixRow)
            column = 0
            matrixRow = []
          }
        }
      }
      break;
    }
  }

  // A = [[1, 2, 3], [2, 1, 3]]
  // A = [[1, 0, 7], [0, 1, 4]]
  // *** A = [[1, 1, 0, 1, 21], [1, 1, 1, 0, 21], [0, 2, 3, 0, 37], [2, 1, 0, 0, 19]] ***

  if (numVals != bounds[0] * bounds[1]){
    return "You didn't give the right amount of values for the size of the matrix that you specified."
  }
  console.log(inputMatrix)
  return gauss(bounds[0], bounds[1], inputMatrix)
}

// A = [[1, 2, 3], [2, -1, 1], [3, 1, 4]]
// console.log(gauss(3, 3, A))

function gauss(rows, columns, A) {
    var n = A.length;
    
    if (n !== rows) {  // Number of expected rows != number of rows
        var x = "The dimensions of the expected matrix are different from the dimensions of the given matrix!"
        return x
    }

    for (var i = 0; i < n - 1; i ++) {
        if (A[i].length !== A[i + 1].length) {
            var x = "The dimensions of the expected matrix are different from the dimensions of the given matrix!"
            return x
        }

    }

    for (var i=0; i<n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for(var k=i+1; k<n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k=i; k<n+1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k=i+1; k<n; k++) {
            var c = -A[k][i]/A[i][i];
            for(var j=i; j<n+1; j++) {
                if (i==j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    var zeroes = []
    for (var i = 0; i < A[0].length - 1; i ++) {    //checking simplified matrix for dependency
        zeroes.push(0)
    }
    for (var i = 0; i < n; i ++) {
        if (JSON.stringify(A[i].slice(0, A[0].length - 1)) == JSON.stringify(zeroes)){ //if LHS is zeroes only (ie. row of zeroes for LHS) 
            if (A[i][A[0].length - 1] == 0){ //if 0 = 0
                //if (A.slice())
                return gauss(rows-1, columns, A.splice(i,1))
            }else { //if 0 = 1 or something
                return "No solutions" // check for row comparison
                }
        }
    }
    // Solve equation Ax=b for an upper triangular matrix A
    var x= new Array(n);
    for (var i=n-1; i>-1; i--) {
        x[i] = A[i][n]/A[i][i];
        for (var k=i-1; k>-1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    console.log(x)
    return x;
}