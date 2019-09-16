const { ADD, Matrix, Normalisation, ACN, Filter } = require('./cjs/dotadd');

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

let k = new ADD(b.export());

k.decoder.matrices[0].renormalizeTo(Normalisation.N3D);

console.log(k.export().serialize());