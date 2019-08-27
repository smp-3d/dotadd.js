const ADD = require('./dotadd');
const fs = require('fs');



try {

    let test = new ADD(fs.readFileSync('./testoutput.json').toString());

    console.log(test.export());


} catch(e) {
    console.log(e);
}