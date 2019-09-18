const {ADD, OutputChannel, Matrix} = require('./cjs/dotadd');

let add = new ADD();

add.setName('Test Decoder');

add.createDefaultMetadata();

add.addMatrix(new Matrix(0, 'n3d', [[1,0,0,0]]));

add.addOutput(new OutputChannel('Test Output', 'spk'));

add.createDefaultOutputMatrix();

add.repair();

process.exit(add.valid()? 0 : 1);