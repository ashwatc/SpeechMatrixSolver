A = [[6, -4, 4], [3, -2, 2]]
console.log(gauss(2, 3, A))

function gauss(rows, columns, A){
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
    console.log(A)
    var zeroes = []
    for (var i = 0; i < A[0].length - 1; i ++) {    //checking simplified matrix for dependency
        zeroes.push(0)
    }
    for (var i = 0; i < n; i ++) {
        if (A[i].slice(0, A[0].length - 1) === zeroes){
            console.log(zeroes)
            if (A[i][-1] == 0){
                console.log("Infinite solutions")
            }else {
                console.log("No solutions")
                }
        }
    }
    // Solve equation Ax=b for an upper triangular matrix A
    var x= new Array(n);
    for (var i=n-1; i>-1; i--) {
        x[i] = A[i][n]/A[i][i];
        }
        for (var k=i-1; k>-1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    
  
    for (var i = 0; i < x.length; i++){
      if (Number.isNaN(x[i])){
        x = "No unique solution!"
      }
    }
    return x;
}