const { ADD, Matrix, Normalisation, ACN, Filter } = require('./cjs/dotadd');
const fs = require('fs');


let b = new ADD();

b.setAuthor('Jonas Ohland').setDate(Date.now()).setDescription('Test Decoder');

b.addMatrix(
    new Matrix(0,
        Normalisation.SN3D,
        [
            [1, 0, 0.6, 0],
            [1, 0, 0.6, 0],
            [1, 0, 0.6, 0]
        ]));

b.addFilter(new Filter(200));
b.addFilter(new Filter(null, 200));

b.createDefaultSummedOutputs();

console.log(b.export().serialize());

fs.writeFileSync('/Users/jonasohland/Desktop/test_add.add', b.export().serialize());