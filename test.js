const {ADD, OutputChannel} = require('./cjs/dotadd')

let b = new ADD();

b.addOutput(new OutputChannel('Subwoofer', 'spk', { description: 'tiefton' }));

console.log(b);