const { ADD, Matrix } = require('./cjs/dotadd');

let add = new ADD();


add.setName("Test Decoder");

add.addMatrix(new Matrix(0, 'sn3d', [[1,0,0,0],[1,0,0,0]]));

add.repair();

process.exit(!add.valid());