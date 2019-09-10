const ADD = require('./cjs/dotadd').ADD;

let b = new ADD({revision:3, decoder:{filter:{test:1}}});

console.log(b);