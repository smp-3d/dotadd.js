(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.dotadd = mod.exports;
  }
})(this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ADD = _exports.OutputChannel = _exports.AEDCoord = _exports.Matrix = _exports.ACN = _exports.Normalisation = _exports.Filter = void 0;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var Filter =
  /*#__PURE__*/
  function () {
    function Filter(high, low) {
      _classCallCheck(this, Filter);

      this.hi = high;
      this.lo = low;
    }

    _createClass(Filter, [{
      key: "isLowpass",
      value: function isLowpass() {
        return this.lo == undefined && this.hi != undefined;
      }
    }, {
      key: "isHighpass",
      value: function isHighpass() {
        return this.hi == undefined && this.lo != undefined;
      }
    }, {
      key: "isBandpass",
      value: function isBandpass() {
        return this.hi != undefined && this.lo != undefined;
      }
    }], [{
      key: "fromObject",
      value: function fromObject(obj) {
        return new Filter(obj.hi, obj.lo);
      }
    }]);

    return Filter;
  }();

  _exports.Filter = Filter;
  var Normalisation = Object.freeze({
    N3D: 'n3d',
    SN3D: 'sn3d'
  });
  _exports.Normalisation = Normalisation;
  var ACN = {
    order: function order(acn) {
      return Math.floor(Math.sqrt(acn));
    },
    index: function index(acn) {
      var order = ACN.order(acn);
      return acn - order * (order + 1);
    },
    acn: function acn(order, index) {}
  };
  /**
   * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
   * which specifies the input band it receives audio from
   */

  _exports.ACN = ACN;

  var Matrix =
  /*#__PURE__*/
  function () {
    /**
     * Construct a new Matrix.
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    function Matrix(input, normalisation, channels) {
      _classCallCheck(this, Matrix);

      this.input = input;
      this.normalisation = normalisation.toLowerCase();

      if (channels && channels.length) {
        var csize = channels[0].length;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = channels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var channel = _step.value;
            if (channel.length != csize) throw new Error("channel size mismatch");
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.matrix = channels;
      }
    }
    /**
     * Set the input band the Matrix will receive signal from
     * @param {Number} input
     */


    _createClass(Matrix, [{
      key: "setInput",
      value: function setInput(input) {
        this.input = input;
      }
      /**
       * @returns {Number} the input channel this Matrix will receive signal from
       */

    }, {
      key: "getInput",
      value: function getInput() {
        return this.input;
      }
      /**
       * @returns {Number} the input number of coeffs for each channel
       */

    }, {
      key: "numCoeffs",
      value: function numCoeffs() {
        if (this.matrix) return this.matrix[0].length;else return 0;
      }
      /**
       * @returns the number of channels in the matrix
       */

    }, {
      key: "numChannels",
      value: function numChannels() {
        if (this.matrix) return this.matrix.length;else return 0;
      }
      /**
       * set the coefficents for a channels in the Matrix
       * @param {Number} chan the channel number to set
       * @param {Array<Number>} coeffs an array of coefficents
       */

    }, {
      key: "setCoeffsForChannel",
      value: function setCoeffsForChannel(chan, coeffs) {
        if (!this.matrix) this.matrix = [];
        this.matrix[chan] = coeffs;
      }
      /**
      * get the coefficents for a channel in the Matrix
      * @param {number} chan the channel number
      * @returns {number[]} an array of coefficents
      */

    }, {
      key: "getCoeffsForChannel",
      value: function getCoeffsForChannel(chan) {
        if (!this.matrix) return;
        return this.matrix[chan];
      }
    }, {
      key: "ambisonicOrder",
      value: function ambisonicOrder() {
        return ACN.order(this.numCoeffs() - 1);
      }
    }, {
      key: "setNormalisation",
      value: function setNormalisation(normalisation) {
        this.normalisation = normalisation.toLowerCase();
      }
    }, {
      key: "getNormalisation",
      value: function getNormalisation() {
        return this.normalisation;
      }
    }, {
      key: "renormalizeTo",
      value: function renormalizeTo(normalisation) {
        normalisation = normalisation.toLowerCase();
        if (this.normalisation == normalisation) return;

        if (normalisation === Normalisation.N3D) {
          this.matrix.forEach(function (ch) {
            ch.forEach(function (coeff, cidx) {
              ch[cidx] = coeff * Math.sqrt(2 * ACN.order(cidx) + 1);
            });
          });
        } else if (normalisation === Normalisation.SN3D) {
          this.matrix.forEach(function (ch) {
            ch.forEach(function (coeff, cidx) {
              ch[cidx] = coeff / Math.sqrt(2 * ACN.order(cidx) + 1);
            });
          });
        }

        this.normalisation = normalisation;
        return this;
      }
    }], [{
      key: "fromObject",
      value: function fromObject(obj) {
        return new Matrix(obj.input, obj.normalisation, obj.matrix);
      }
    }]);

    return Matrix;
  }();

  _exports.Matrix = Matrix;

  var AEDCoord =
  /*#__PURE__*/
  function () {
    function AEDCoord(a, e, d) {
      _classCallCheck(this, AEDCoord);

      this.a = a;
      this.e = e;
      this.d = d;
    }

    _createClass(AEDCoord, [{
      key: "hasDistance",
      value: function hasDistance() {
        return this.d != null;
      }
    }]);

    return AEDCoord;
  }();

  _exports.AEDCoord = AEDCoord;

  var OutputChannel =
  /*#__PURE__*/
  function () {
    function OutputChannel(name, type, options) {
      _classCallCheck(this, OutputChannel);

      this.name = name;
      this.type = type;

      if (options) {
        this.description = options.description;
        this.coords = options.coords;
      }
    }

    _createClass(OutputChannel, null, [{
      key: "fromObject",
      value: function fromObject(obj) {
        return new OutputChannel(obj.name, obj.type);
      }
    }]);

    return OutputChannel;
  }();

  _exports.OutputChannel = OutputChannel;

  var ADD =
  /*#__PURE__*/
  function () {
    function ADD(add) {
      _classCallCheck(this, ADD);

      var pobj = {};
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
          if (pobj.decoder.filter) this.decoder.filter = pobj.filter.map(function (obj) {
            return Filter.fromObject(obj);
          });
          if (pobj.decoder.matrices) this.decoder.matrices = pobj.decoder.matrices.map(function (mat) {
            return Matrix.fromObject(mat);
          });

          if (pobj.decoder.output.channels && pobj.decoder.output.matrix) {
            this.decoder.output = {
              channels: pobj.decoder.output.channels.map(function (channel) {
                return OutputChannel.fromObject(channel);
              }),
              matrix: pobj.decoder.matrix
            };
          }
        }
      }
    }

    _createClass(ADD, [{
      key: "_set",
      value: function _set(prop, val) {
        this[prop] = val;
        return this;
      }
    }, {
      key: "validateProp",
      value: function validateProp(prop, validator) {
        if (typeof validator == 'string') return _typeof(prop) == validator;else return validator(prop);
      }
    }, {
      key: "assign_if_valid",
      value: function assign_if_valid(from, validator) {
        var to = this;

        for (var _len = arguments.length, prop = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          prop[_key - 2] = arguments[_key];
        }

        this.assign_if_valid_recurse(to, from, validator, prop);
      }
    }, {
      key: "assign_if_valid_recurse",
      value: function assign_if_valid_recurse(me, from, validator, props) {
        if (props.length === 1) {
          if (from.hasOwnProperty(props[0]) && this.validateProp(from[props[0]], validator)) me[props[0]] = from[props[0]];
        } else {
          var nextp = props.shift();

          if (from.hasOwnProperty(nextp) && this.validateProp(from[nextp], 'object')) {
            if (!me.hasOwnProperty(nextp)) me[nextp] = {};
            this.assign_if_valid_recurse(me[nextp], from[nextp], validator, props);
          }
        }
      }
    }, {
      key: "export",
      value: function _export() {
        if (!this.valid()) throw new Error('Cannot export invalid ADD');
        var export_obj = {
          name: this.name,
          description: this.description || "created with the dotadd.js library",
          author: this.author || "the dotadd library creators",
          date: this.date || new Date(Date.now()).toISOString(),
          revision: this.revision,
          version: this.version || 0,
          decoder: {
            filter: this.decoder.filter.map(function (flt) {
              return Object.create(flt);
            }),
            matrices: this.decoder.matrices.map(function (mat) {
              return {
                normalisation: mat.normalisation,
                input: mat.input,
                matrix: mat.matrix.map(function (chs) {
                  return Array.from(chs);
                })
              };
            })
          },
          serialize: function serialize() {
            return JSON.stringify(export_obj);
          }
        };
        return export_obj;
      }
    }, {
      key: "setAuthor",
      value: function setAuthor(author) {
        return this._set('author', author);
      }
    }, {
      key: "setName",
      value: function setName(name) {
        return this._set('name', name);
      }
    }, {
      key: "setDescription",
      value: function setDescription(desc) {
        return this._set('description', desc);
      }
    }, {
      key: "setDate",
      value: function setDate(date) {
        return this._set('date', new Date(date).toISOString());
      }
    }, {
      key: "setVersion",
      value: function setVersion(version) {
        return this._set('version', version);
      }
    }, {
      key: "valid",
      value: function valid() {
        return true;
      }
    }, {
      key: "addMatrix",
      value: function addMatrix(mat) {
        this.decoder.matrices.push(mat);
      }
    }, {
      key: "addFilter",
      value: function addFilter(flt) {
        this.decoder.filter.push(flt);
      }
    }, {
      key: "addOutput",
      value: function addOutput(out, gain, index) {
        if (gain == null) gain = 1.0;
        if (index == null) index = this.decoder.output.channels.length;
      }
    }, {
      key: "maxAmbisonicOrder",
      value: function maxAmbisonicOrder() {
        return Math.max.apply(Math, _toConsumableArray(this.decoder.matrices.map(function (mat) {
          return mat.ambisonicOrder();
        })));
      }
    }, {
      key: "totalMatrixOutputs",
      value: function totalMatrixOutputs() {
        return this.decoder.matrices.reduce(function (val, mat) {
          return val + mat.numChannels();
        }, 0);
      }
    }, {
      key: "maxMatrixOutputs",
      value: function maxMatrixOutputs() {
        return Math.max.apply(Math, _toConsumableArray(this.decoder.matrices.map(function (mat) {
          return mat.numChannels();
        })));
      }
    }, {
      key: "createDefaultOutputs",
      value: function createDefaultOutputs() {
        var _this = this;

        this.decoder.matrices.forEach(function (mat, midx) {
          for (var i = 0; i < mat.numChannels(); ++i) {
            _this.decoder.output.channels.push(new OutputChannel("DEFAULT_".concat(midx, "_").concat(i), 'default'));

            var arr = new Array(_this.totalMatrixOutputs()).fill(0);
            arr[i + (midx ? _this.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;

            _this.decoder.output.matrix.push(arr);
          }
        });
      }
    }, {
      key: "createDefaultSummedOutputs",
      value: function createDefaultSummedOutputs() {
        var _this2 = this;

        for (var i = 0; i < this.maxMatrixOutputs(); ++i) {
          this.decoder.output.channels.push(new OutputChannel("DEFAULT_".concat(i), 'default'));
          this.decoder.output.matrix[i] = new Array(this.totalMatrixOutputs()).fill(0);
        }

        this.decoder.matrices.forEach(function (mat, midx) {
          for (var _i = 0; _i < mat.numChannels(); ++_i) {
            _this2.decoder.output.matrix[_i][_i + (midx ? _this2.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;
          }
        });
      }
    }]);

    return ADD;
  }();

  _exports.ADD = ADD;
});