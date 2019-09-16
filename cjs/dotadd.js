"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ADD = exports.OutputChannel = exports.AEDCoord = exports.Matrix = exports.ACN = exports.Normalisation = exports.Filter = void 0;

class Filter {
  constructor(high, low) {
    this.hi = high;
    this.lo = low;
  }

  isLowpass() {
    return this.lo == undefined && this.hi != undefined;
  }

  isHighpass() {
    return this.hi == undefined && this.lo != undefined;
  }

  isBandpass() {
    return this.hi != undefined && this.lo != undefined;
  }

  static fromObject(obj) {
    return new Filter(obj.hi, obj.lo);
  }

}

exports.Filter = Filter;
const Normalisation = Object.freeze({
  N3D: 'n3d',
  SN3D: 'sn3d'
});
exports.Normalisation = Normalisation;
const ACN = {
  order(acn) {
    return Math.floor(Math.sqrt(acn));
  },

  index(acn) {
    let order = ACN.order(acn);
    return acn - order * (order + 1);
  },

  acn(order, index) {}

};
/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
 * which specifies the input band it receives audio from
 */

exports.ACN = ACN;

class Matrix {
  /**
   * Construct a new Matrix.
   * @param {number} input the input band the matrix will receive signal from
   * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
   */
  constructor(input, normalisation, channels) {
    this.input = input;
    this.normalisation = normalisation.toLowerCase();

    if (channels && channels.length) {
      let csize = channels[0].length;

      for (let channel of channels) {
        if (channel.length != csize) throw new Error("channel size mismatch");
      }

      this.matrix = channels;
    }
  }
  /**
   * Set the input band the Matrix will receive signal from
   * @param {Number} input
   */


  setInput(input) {
    this.input = input;
  }
  /**
   * @returns {Number} the input channel this Matrix will receive signal from
   */


  getInput() {
    return this.input;
  }
  /**
   * @returns {Number} the input number of coeffs for each channel
   */


  numCoeffs() {
    if (this.matrix) return this.matrix[0].length;else return 0;
  }
  /**
   * @returns the number of channels in the matrix
   */


  numChannels() {
    if (this.matrix) return this.matrix.length;else return 0;
  }
  /**
   * set the coefficents for a channels in the Matrix
   * @param {Number} chan the channel number to set
   * @param {Array<Number>} coeffs an array of coefficents
   */


  setCoeffsForChannel(chan, coeffs) {
    if (!this.matrix) this.matrix = [];
    this.matrix[chan] = coeffs;
  }
  /**
  * get the coefficents for a channel in the Matrix
  * @param {number} chan the channel number
  * @returns {number[]} an array of coefficents
  */


  getCoeffsForChannel(chan) {
    if (!this.matrix) return;
    return this.matrix[chan];
  }

  ambisonicOrder() {
    return ACN.order(this.numCoeffs() - 1);
  }

  setNormalisation(normalisation) {
    this.normalisation = normalisation.toLowerCase();
  }

  getNormalisation() {
    return this.normalisation;
  }

  renormalizeTo(normalisation) {
    normalisation = normalisation.toLowerCase();
    if (this.normalisation == normalisation) return;

    if (normalisation === Normalisation.N3D) {
      this.matrix.forEach(ch => {
        ch.forEach((coeff, cidx) => {
          ch[cidx] = coeff * Math.sqrt(2 * ACN.order(cidx) + 1);
        });
      });
    } else if (normalisation === Normalisation.SN3D) {
      this.matrix.forEach(ch => {
        ch.forEach((coeff, cidx) => {
          ch[cidx] = coeff / Math.sqrt(2 * ACN.order(cidx) + 1);
        });
      });
    }

    this.normalisation = normalisation;
    return this;
  }

  static fromObject(obj) {
    return new Matrix(obj.input, obj.normalisation, obj.matrix);
  }

}

exports.Matrix = Matrix;

class AEDCoord {
  constructor(a, e, d) {
    this.a = a;
    this.e = e;
    this.d = d;
  }

  hasDistance() {
    return this.d != null;
  }

}

exports.AEDCoord = AEDCoord;

class OutputChannel {
  constructor(name, type, options) {
    this.name = name;
    this.type = type;

    if (options) {
      this.description = options.description;
      this.coords = options.coords;
    }
  }

  static fromObject(obj) {
    return new OutputChannel(obj.name, obj.type);
  }

}

exports.OutputChannel = OutputChannel;

class ADD {
  constructor(add) {
    let pobj = {};
    if (typeof add == 'string' || add instanceof String) pobj = JSON.parse(add.toString());else if (add instanceof Object) pobj = add;
    this.decoder = {
      filter: [],
      matrices: [],
      output: {
        channels: [],
        matrix: []
      }
    };

    if (add) {
      this.assign_if_valid(pobj, 'number', 'revision');
      this.assign_if_valid(pobj, 'string', 'name');
      this.assign_if_valid(pobj, 'string', 'author');
      this.assign_if_valid(pobj, 'string', 'description');
      this.assign_if_valid(pobj, 'string', 'date');
      this.assign_if_valid(pobj, 'number', 'version');

      if (pobj.decoder) {
        if (pobj.decoder.filter) this.decoder.filter = pobj.filter.map(obj => Filter.fromObject(obj));
        if (pobj.decoder.matrices) this.decoder.matrices = pobj.decoder.matrices.map(mat => Matrix.fromObject(mat));

        if (pobj.decoder.output.channels && pobj.decoder.output.matrix) {
          this.decoder.output = {
            channels: pobj.decoder.output.channels.map(channel => OutputChannel.fromObject(channel)),
            matrix: pobj.decoder.matrix
          };
        }
      }
    }
  }

  _set(prop, val) {
    this[prop] = val;
    return this;
  }

  validateProp(prop, validator) {
    if (typeof validator == 'string') return typeof prop == validator;else return validator(prop);
  }

  assign_if_valid(from, validator, ...prop) {
    let to = this;
    this.assign_if_valid_recurse(to, from, validator, prop);
  }

  assign_if_valid_recurse(me, from, validator, props) {
    if (props.length === 1) {
      if (from.hasOwnProperty(props[0]) && this.validateProp(from[props[0]], validator)) me[props[0]] = from[props[0]];
    } else {
      let nextp = props.shift();

      if (from.hasOwnProperty(nextp) && this.validateProp(from[nextp], 'object')) {
        if (!me.hasOwnProperty(nextp)) me[nextp] = {};
        this.assign_if_valid_recurse(me[nextp], from[nextp], validator, props);
      }
    }
  }

  export() {
    if (!this.valid()) throw new Error('Cannot export invalid ADD');
    let export_obj = {
      name: this.name,
      description: this.description || "created with the dotadd.js library",
      author: this.author || "the dotadd library creators",
      date: this.date || new Date(Date.now()).toISOString(),
      revision: this.revision,
      version: this.version || 0,
      decoder: {
        filter: this.decoder.filter.map(flt => Object.create(flt)),
        matrices: this.decoder.matrices.map(mat => {
          return {
            normalisation: mat.normalisation,
            input: mat.input,
            matrix: mat.matrix.map(chs => Array.from(chs))
          };
        })
      },

      serialize() {
        return JSON.stringify(export_obj);
      }

    };
    return export_obj;
  }

  setAuthor(author) {
    return this._set('author', author);
  }

  setName(name) {
    return this._set('name', name);
  }

  setDescription(desc) {
    return this._set('description', desc);
  }

  setDate(date) {
    return this._set('date', new Date(date).toISOString());
  }

  setVersion(version) {
    return this._set('version', version);
  }

  valid() {
    return true;
  }

  addMatrix(mat) {
    this.decoder.matrices.push(mat);
  }

  addFilter(flt) {
    this.decoder.filter.push(flt);
  }

  addOutput(out, gain, index) {
    if (gain == null) gain = 1.0;
    if (index == null) index = this.decoder.output.channels.length;
  }

  maxAmbisonicOrder() {
    return Math.max(...this.decoder.matrices.map(mat => mat.ambisonicOrder()));
  }

  totalMatrixOutputs() {
    return this.decoder.matrices.reduce((val, mat) => val + mat.numChannels(), 0);
  }

  maxMatrixOutputs() {
    return Math.max(...this.decoder.matrices.map(mat => mat.numChannels()));
  }

  createDefaultOutputs() {
    this.decoder.matrices.forEach((mat, midx) => {
      for (let i = 0; i < mat.numChannels(); ++i) {
        this.decoder.output.channels.push(new OutputChannel(`DEFAULT_${midx}_${i}`, 'default'));
        let arr = new Array(this.totalMatrixOutputs()).fill(0);
        arr[i + (midx ? this.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;
        this.decoder.output.matrix.push(arr);
      }
    });
  }

  createDefaultSummedOutputs() {
    for (let i = 0; i < this.maxMatrixOutputs(); ++i) {
      this.decoder.output.channels.push(new OutputChannel(`DEFAULT_${i}`, 'default'));
      this.decoder.output.matrix[i] = new Array(this.totalMatrixOutputs()).fill(0);
    }

    this.decoder.matrices.forEach((mat, midx) => {
      for (let i = 0; i < mat.numChannels(); ++i) this.decoder.output.matrix[i][i + (midx ? this.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;
    });
  }

}

exports.ADD = ADD;
//# sourceMappingURL=dotadd.js.map