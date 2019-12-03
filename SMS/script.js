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

// recognition.onspeechend = function() {
//   instructions.text('You were quiet for a while so voice recognition turned itself off.');
// }

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
    noteContent = '';
    noteTextarea.val('')
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
  inputtedMatrix = formatInput(noteContent)

  if(!noteContent.length) {
    instructions.text('Could not calculate empty input. Please dictate a matrix equation to solve.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.

    noteContent = "USER INPUT: " + noteContent
    outputType = stringToMatrices(noteContent)[0]
    answer = stringToMatrices(noteContent)[1]

    if (typeof(answer[0]) == "string"){
      // noteContent = "Something's wrong with this --> " + noteContent
      noteTextarea.val("Something's wrong with this --> " + noteContent)
      instructions.text("ERROR!: " + answer + " Please check your input and try again.")
    }
    else{
      noteContent = "INPUT:\n"
      noteContent += inputtedMatrix
      noteContent += "--> \n RESULT: " + outputType + "\n" + formatMatrix(answer)

      saveNote(new Date().toLocaleString(), noteContent);

      // Reset variables and update UI.
      noteContent = '';
      renderNotes(getAllNotes());
      noteTextarea.val('');
      instructions.text('Result saved successfully at ' + new Date().toLocaleString());
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
        <p class="content" style="white-space: pre-line;">${note.content}</p>
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
    if (splitStr[i] == "by" || splitStr[i] == "x"){
      foundBy = true
      bounds[0] = parseInt(splitStr[i - 1])
      bounds[1] = parseInt(splitStr[i + 1])
      splitStr = splitStr.slice(i + 2, splitStr.length)
    }
  }

  if (!foundBy){
    return ["", "Sorry, I don't understand."]
  }

  matrixRow = []

  numVals = 0

  for (i = 0; i < splitStr.length; i++){
    column = 0
    if (splitStr[i] == "values"){
      for (j = i; j < splitStr.length; j++){
        val = parseInt(splitStr[j].split('.')[0])
        if (Number.isSafeInteger(val)){
          matrixRow.push(val)
          numVals++
          column++
          if (column == bounds[1]){
            inputMatrix.push(matrixRow)
            column = 0
            matrixRow = []
          }
        }
      }
      break;
    }
  }

  if (numVals != bounds[0] * bounds[1]){
    if (Number.isSafeInteger(bounds[0]) && Number.isSafeInteger(bounds[1])){
      return ["", "You didn't give the right amount of values for the matrix size you specified."]
    }
    return ["", "Sorry, I don't understand."]
  }
  return gauss(bounds[0], bounds[1], inputMatrix)
}

function formatInput(inpStr){
  returnInpMatrix = []
  bounds = []
  foundBy = false
  splitStr = inpStr.split(' ')
  for (i = 0; i < splitStr.length; i++){
    if (splitStr[i] == "by" || splitStr[i] == "x"){
      foundBy = true
      bounds[0] = parseInt(splitStr[i - 1])
      bounds[1] = parseInt(splitStr[i + 1])
      splitStr = splitStr.slice(i + 2, splitStr.length)
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
          matrixRow.push(val)
          numVals++
          column++
          if (column == bounds[1]){
            returnInpMatrix.push(matrixRow)
            column = 0
            matrixRow = []
          }
        }
      }
      break;
    }
  }

  returnInpMatString = ""
  for (i = 0; i < returnInpMatrix.length; i++){
    returnInpMatString += "[ "
    for (j = 0; j < returnInpMatrix[0].length; j++){
      if (j == returnInpMatrix[0].length - 1){
        returnInpMatString += " || "
      }
      returnInpMatString += returnInpMatrix[i][j] + " "
    }
    returnInpMatString += "]\n"
  }
  return returnInpMatString
}

function formatMatrix(returnInpMatrix){
  returnInpMatString = ""
  if (returnInpMatrix[0].length != undefined){
    for (i = 0; i < returnInpMatrix.length; i++){
      returnInpMatString += "[ "
      for (j = 0; j < returnInpMatrix[0].length; j++){
        if (j == returnInpMatrix[0].length - 1){
          returnInpMatString += " || "
        }
        returnInpMatString += returnInpMatrix[i][j] + " "
      }
      returnInpMatString += "]\n"
    }
  }
  else{
    for (i = 0; i < returnInpMatrix.length; i++){
      returnInpMatString += "[ " + returnInpMatrix[i] + " ]\n"
    }
  }

  return returnInpMatString
}

var A = [[0, 2, 3], [2, 1, 3]]
  // A = [[1,0,6],[1,0,3]]
  // A= [[0,0,2,6],[0,2,0,8],[2,0,0,10]]
  // A = [[1, 2, 3], [2, 1, 3]]
  // A = [[1, 0, 7], [0, 1, 4]]
  // A = [[1, 1, 0, 1, 21], [1, 1, 1, 0, 21], [0, 2, 3, 0, 37], [2, 1, 0, 0, 19]]


//algorithm adapted from: https://www.csun.edu/~panferov/math262/262_rref.pdf


function gauss(rows, columns, A){
    var sol = []
    var i = 0
    var j = 0
    while (i < (rows) && j < (columns - 1) && (j!= null)) { //last column is augmented, we don't want to change it
        A, j = swap(i, j, A) //swap swaps rows and reassigns column
         if(j==null) {
            return solutions(i,j,A)
          }

          A = divide(i, j, A)
          A = eliminate(i, j, A)

          i = i + 1
          j = j + 1

    }
    return solutions(i, j, A);
    //Should have RREF at this point according to algorithm
    function solutions(i, j, A){


      //Check for infinite/no solutions
      var zeroes = []
      for (var i = 0; i < A[0].length - 1; i ++) {    //checking simplified matrix for dependency
          zeroes.push(0)
        }
        for (var i = 0; i < rows; i ++) {
          if (JSON.stringify(A[i].slice(0, A[0].length - 1)) == JSON.stringify(zeroes)){ //if LHS is zeroes only (ie. row of zeroes for LHS)
              if (A[i][A[0].length - 1] == 0){ //if 0 = 0
                  if ((columns) > A.length){ // if more variables than equations
                      A= convert_dec(rows, columns, A)
                      return ["Infinite solutions", A]
                    } else{
                      A.splice(i, 1)
                      return gauss(rows-1, columns, A)
                    }
                  }else { //if 0 = 1 or something
                    A= convert_dec(rows, columns, A)
                    return ["No solutions", A] // check for row comparison
                  }
                }
              }
              A = convert_dec(rows, columns, A)
              for (k = 0; k < A.length; k++){
                sol.push(A[k][columns - 1])
              }


              return ["Unique solutions", sol]
        }




    //functions
    function col_all_zeroes(i, j, A){ //Step 1: Change columns until we get to a pivot column (non-zero)
        while (j < (columns - 1)){
            for (iter = i; iter < A.length; iter++){ //j is column input
                if (A[iter][j] != 0){
                    return j
                }


            }
            j = j + 1
        }
        return (null) //returns None if every element after is 0 within the bounds of the curent row and column (basically everything in the inner square)
      }
    function swap(i, j, A){                 //Step 1: Swap i-th row with some other row so that element ij is nonzero
        var oldj = j
        if (A[i][j] == 0){
            j = col_all_zeroes(i, j, A)
        }

        if (j==null){
          return A, j
        }

        var curr = i               //other row so that the first element != 0

        var first = A[i]
        while (A[i][j] == 0 && curr < rows){
            var swap = A[curr]
            if (swap[j] != 0){
              A[i] = swap
              A[curr] = first
            }
            curr = curr + 1
        }
        return A, j
    }

    function divide(i, j, A){ //Step 2: Divide all elements in row by Aij
        var divconstant = A[i][j]
        for (iter = 0; iter < A[0].length; iter++){
            A[i][iter] = A[i][iter] / divconstant
        }
        return A
      }




    function eliminate(i, j, A){ //Step 3: Make other elements in the column zero
      for (var k = 0; k < rows; k++){  //j is which column we are "on"
          if (k!=i) {
          var multiplier = A[k][j]
          for (var l = 0; l < A[0].length; l++){
            A[k][l] = A[k][l] - multiplier * A[i][l]
          }
        }
      }
    return A
    }

    function convert_dec(rows, columns, A){
      function isInt(value) {
      return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    }
    for (k=0; k<rows; k++){
      for (i=0; i<columns; i++){
        var x = A[k][i]
        if (!isInt(x)){
          A[k][i] = parseFloat(Number.parseFloat(x).toFixed(5))
        }
    }
  }
  return A
  }
}
