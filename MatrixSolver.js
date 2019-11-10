A = [[1, 2, 3], [2, -1, 1], [3, 1, 4]]
console.log(gauss(A))

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
    return x;
}






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TRYING TO IMPLEMENT GAUSSIAN ELIMINATION ON OUR OWN

function gauss(rows, columns, A){
    var i = 0
    var j = 0

    while (A[0][0] == 0){
        var first = A[0]
        var swap = A[i + 1]
        A[0] = swap
        A[i + 1] = first
        i = i + 1
        j = j + 1
    }

    var mult = A[0][0]
    for (i = 0; i < A[0].length; i++){
        A[0][i] = A[0][i] / A[0][0]
    }

}