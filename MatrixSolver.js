// A = [[1, 2, 3], [2, -1, 1], [3, 1, 4]]

// A = [[1, 2, 3], [2, 1, 3]]
// A = [[1, 0, 7], [0, 1, 4]]
// *** A = [[1, 1, 0, 1, 21], [1, 1, 1, 0, 21], [0, 2, 3, 0, 37], [2, 1, 0, 0, 19]] ***

/* Old algo
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
///////////////////SEE NEW IMPLEMENTATION FOR UPDATED VERSION OF THIS CHECK///////////
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
    ///////////////////SEE NEW IMPLEMENTATION FOR UPDATED VERSION OF THIS CHECK///////////
    // Solve equation Ax=b for an upper triangular matrix A
    var x= new Array(n);
    for (var i=n-1; i>-1; i--) {
        x[i] = A[i][n]/A[i][i];
        for (var k=i-1; k>-1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
}

*/




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TRYING TO IMPLEMENT GAUSSIAN ELIMINATION ON OUR OWN

//////////////////////////////////////////////////////////////////////
// TODO: Replace A.length and equivalents with "rows" and "columns" //
// - fix swap so that final vars match order of inital vars                  //
//////////////////////////////////////////////////////////////////////



var A = [[0, 2, 3], [2, 1, 3]]
A= [[3,1,-1,1],[1,-1,1,-3],[2,1,1,0]]
//A = [[1,0,6],[1,0,3]]
// A= [[0,0,2,6],[0,2,0,8],[2,0,0,10]]

//console.log(A)
console.log(gauss(3,4,A))

//algorithm adapted from: https://www.csun.edu/~panferov/math262/262_rref.pdf
function gauss(rows, columns, A){
    var sol = []
    var i = 0
    var j = 0
    while (i < (rows) && j < (columns - 1) && (j!= null)) { //last column is augmented, we don't want to change it
        A, j = swap(i, j, A) //swap swaps rows and reassigns column
        console.log("swapped", A)
        //might need conditions to handle end j value
          if(j==null) {
            return solutions(i,j,A)
          }

          A = divide(i, j, A)
          console.log("divided", A)
          A = eliminate(i, j, A)
          console.log("eliminated", A)

          i = i + 1
          j = j + 1
          console.log(i, j)

    }
    console.log("getting out of functions")
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
                  if ((columns - 1) > A.length){ // if more variables than equations
                      A= convert_dec(rows, columns, A)
                      return ["Infinite solutions", A]
                    } else{
                      return gauss(rows-1, columns, A.splice(i,1))
                    }
                  }else { //if 0 = 1 or something
                    A= convert_dec(rows, columns, A)
                    return ["No solutions", A] // check for row comparison
                  }
                }
              }
              A= convert_dec(rows, columns, A)
              console.log('formatted'+A)

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
                  console.log('here,'+ j)
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

      /*if(toString(Math.round(x)-x).length>5){
        A[k][i] = parseFloat(Number.parseFloat(x).toFixed(5))
      }*/
    }
}
return A
}
}
