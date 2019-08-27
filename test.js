const ADD = require('./dotadd');
const fs = require('fs');



try {

    let test = new ADD();

    test.setName("Test Decoder");

    test.addMatrix(new ADD.Matrix(0,[[1.,0.,0.,0.], [1.,0.,0.,0.]]));
    test.addMatrix(new ADD.Matrix(0,[[1.,0.,0.,0.]]));

    console.log(JSON.stringify(test.export(), null, 4));


} catch(e) {
    console.log(e);
}