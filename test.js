const ADD = require('./dotadd');
const fs = require('fs');



try {

    let test = new ADD();

    test.setName("test decoder").setAuthor("Jonas Ohland").setDescription("Test description");

    console.log(test.export());

    console.log(test.isRevisionSupported());

    let test2 = new ADD(test.export());

    console.log(test2.export());

    fs.writeFileSync('./testoutput.json', JSON.stringify(test2.export()));


} catch(e) {
    console.log(e);
}