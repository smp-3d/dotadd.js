const ADD = require('./dotadd');
const fs = require('fs');



try {

    let test = new ADD();

    test.setName('Default test-decoder');

    test.addMatrix(new ADD.Matrix(0, [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0]
    ]));

    console.log(test.export({sumMatrixOutputs:true}).serialize());


} catch(e) {
    console.log(e);
}