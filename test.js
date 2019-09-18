const { ADD, Matrix, Normalisation, ACN, Filter } = require('./cjs/dotadd');
const fs = require('fs');


let b = new ADD();

b.setName('Test Decoder')

b.addMatrix(
    new Matrix(0,
        Normalisation.SN3D,
        [
            [1, 0, 0.6, 0],
            [1, 0, 0.6, 0],
            [1, 0, 0.6, 0]
        ]));

b.repair();

console.log(JSON.stringify(b.export(), null, 4));
