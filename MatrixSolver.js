// A = [[1, 2, 3], [2, -1, 1], [3, 1, 4]]

// A = [[1, 2, 3], [2, 1, 3]]
// A = [[1, 0, 7], [0, 1, 4]]
// *** A = [[1, 1, 0, 1, 21], [1, 1, 1, 0, 21], [0, 2, 3, 0, 37], [2, 1, 0, 0, 19]] ***
console.log(gauss(A))

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
// - Represent infinite solutions with a parameter                  //
//////////////////////////////////////////////////////////////////////



A = [[1, 2, 3], [2, 1, 3]]
function gauss(rows, columns, A){
    var sol = []
    var i = 0
    var j = 0
    while (i < (rows - 1) && i < columns){ //last column is augmented
        swap(i, j, A)
        divide(i, j, A)
        eliminate(i, j, A)
        i = i + 1
        j = j + 1
    }
    //Should have RREF at this point according to algorithm

    //Check for infinite/no solutions
    var zeroes = []
    for (var i = 0; i < A[0].length - 1; i ++) {    //checking simplified matrix for dependency
        zeroes.push(0)
    }
    for (var i = 0; i < n; i ++) {
        if (JSON.stringify(A[i].slice(0, A[0].length - 1)) == JSON.stringify(zeroes)){ //if LHS is zeroes only (ie. row of zeroes for LHS)
            if (A[i][A[0].length - 1] == 0){ //if 0 = 0
                if ((columns - 1) > A.length){ // if more variables than equations
                    return "Infinite solutions"
                } else{
                    return gauss(rows-1, columns, A.splice(i,1))
                }
            }else { //if 0 = 1 or something
                return "No solutions" // check for row comparison
                }
        }
    }

    //if there is a unique solution
    for (k = 0; k < A.length; k++){
        sol.push(A[k][columns - 1])
    }
    return sol



    //functions
    function col_all_zeroes(i, j, A){ //Step 1: Change columns until we get to a pivot column (non-zero)
        for (i = 0; i < A.length; i++){ //j is column input
            if (A[i][j] != 0){
                return j
            }
        col_all_zeroes(i, j + 1, A)
        }
    }

    function swap(i, j, A){                 //Step 1: Swap i-th row with some
        var j =  col_all_zeroes(0, j, A) //other row so that the first element != 0

        while (A[i][j] == 0){
            var first = A[i]
            var swap = A[i + 1]
            A[i] = swap
            A[i + 1] = first
            i = i + 1
    }

    function divide(i, j, A){ //Step 2: Divide all elements in row by Aij
        var divconstant = A[i][j]
        A[i][j] = 1
        for (k = 0; k < A[0].length; k++){
            A[i][k] = A[i][k] / divconstant
        }
    }

    function eliminate(i, j, A){ //Step 3: Make other elements in the column zero
        for (k = 0; k < A.length; k++){  //j is which column we are "on"
            for (l = 0; l < A[l].length; l++){
                var multiplier = A[k][j]
                A[k][l] = A[k][l] - multiplier * A[i][l]
                }
            }
        }
    }
}
