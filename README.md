# dotadd.js

This repository contains an implementation of the .add-format for JavaScript.

## Guide

To setup the JavaScript library only a few lines of code are necessary.

To install dotadd.js in your npm based project, just run 
```bash
$ npm install dotadd.js --save
```

Import the library in CommonJS Environments such as node.js:

```javascript
const { ADD, Matrix, Filter, OutputChannel } = require('dotadd.js');
```

or with ES2015 imports

```js
import { ADD, Matrix, Filter } from 'dotadd.js'
```

Then the ADD-object has to be declared and at least on matrix loaded: 

```javascript
let add = new ADD();

let mat = new Matrix("sn3d", [[1, 0, 0, 0],[1, 0, 0, 0]]);

mat.setWeighting("maxre"); // optional value as example

add.addMatrix(mat);
```

If needed you can add components using:

```javascript
add.addOutput(OutputChannel("Name", "Type", {a: 0., e: 0., d: 1.}));

add.addFilter(Filter.makeLowpass("Name", /* freq: */ 100, /* to matrix: */ 0));
```

You can also use `valid()` to check for completeness of a component or `add.repair()` to create missing metadata and default components from the matrices. There are many other functions you can use so please try around what is possible.

------

To read .add from files use:

```js
let add = new ADD(JSON.parse('data_here'));
```

To write .add to files use:

```js
let data = add.export().serialize();
```
or
```js
let data = JSON.stringify(add.export());
```

------

## Other repositories

- [dotadd - Overview](https://github.com/smp-3d/dotadd "dotadd Overview")

### Integrations

- [libdotadd - C++ integration](https://github.com/smp-3d/libdotadd ".ADD C++")
- [dotadd.py - Python integration](https://github.com/smp-3d/dotadd.py ".ADD Python")

### Tools

- [.ADD-console tool](https://github.com/smp-3d/dotadd.tools ".ADD-console tool")
- [.DD-browser app](https://github.com/smp-3d/dotadd-online-converter ".ADD-browser app")
- [.ADD-extractor VSTs](https://github.com/smp-3d/dotadd-dec-ripper ".ADD-extractor VST")

------

## Further information

.ADD was developed by students of the [University of Applied Sciences Darmstadt](https://h-da.de/ "h_da - University of Applied Sciences Darmstadt")

Feel free to contribute!
