const { ADD, Matrix, Filter } = require('./cjs/dotadd');

let add = new ADD();

add.setName("Test Decoder");

add.addFilter(Filter.makeLowpass("lp", 0, 300));
add.addFilter(Filter.makeHighpass("hp", 1, 300));

let mat = new Matrix("sn3d", [[1, 0, 0, 0],[1,0,0,0]]);
let mat2 = new Matrix("sn3d", [[1, 0, 0, 0],[1,0,0,0]]);

mat.setWeighting("maxre");
mat2.setWeighting("maxre");

add.addMatrix(mat);
add.addMatrix(mat2);

add.repair();

add.valid();

console.log(add.inv_reasons);

console.log(JSON.stringify(add.export(), null, 4));

process.exit(!add.valid());