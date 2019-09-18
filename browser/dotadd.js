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

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function is_valid_string(str) {
    return str && str != '';
  }

  function validateProp(prop, validator) {
    if (typeof validator == 'string') return _typeof(prop) == validator;else return validator(prop);
  }

  function assign_if_valid(me, from, validator) {
    var to = me;

    for (var _len = arguments.length, prop = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      prop[_key - 3] = arguments[_key];
    }

    assign_if_valid_recurse(to, from, validator, prop);
  }

  function assign_if_valid_recurse(me, from, validator, props) {
    if (props.length === 1) {
      if (from.hasOwnProperty(props[0]) && validateProp(from[props[0]], validator)) me[props[0]] = from[props[0]];
    } else {
      var nextp = props.shift();

      if (from.hasOwnProperty(nextp) && validateProp(from[nextp], 'object')) {
        if (!me.hasOwnProperty(nextp)) me[nextp] = {};
        assign_if_valid_recurse(me[nextp], from[nextp], validator, props);
      }
    }
  }
  /**
   * The dotadd Filter class. Respresents a single filter band.
   */


  var Filter =
  /*#__PURE__*/
  function () {
    /**
     * Construct a new Filterband. At least high or low must be given to construct a valid filter band object
     * @param high beginning of the high frequency stopbband can be null
     * @param low beginning of the high frequency stopbband can be null or omitted
     */
    function Filter(high, low) {
      _classCallCheck(this, Filter);

      if (high == null && low == null) throw new Error('Cannot construct a Filterband without frequencies');
      if (high != null) this.hi = high;
      if (low != null) this.lo = low;
    }

    _createClass(Filter, [{
      key: "isLowpass",
      value: function isLowpass() {
        return this.lo == null && this.hi != null;
      }
    }, {
      key: "isHighpass",
      value: function isHighpass() {
        return this.hi == null && this.lo != null;
      }
    }, {
      key: "isBandpass",
      value: function isBandpass() {
        return this.hi != null && this.lo != null;
      }
    }], [{
      key: "makeLowpass",
      value: function makeLowpass(freq) {
        return new Filter(freq);
      }
    }, {
      key: "makeHighpass",
      value: function makeHighpass(freq) {
        return new Filter(null, freq);
      }
    }, {
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
  /**
   * Function to handle Ambisonic Channel Numbers (ACN)
   */

  _exports.Normalisation = Normalisation;
  var ACN = {
    /**
     * Get the Ambisonic Order (l) from an ACN
     * @param acn ACN
     */
    order: function order(acn) {
      return Math.floor(Math.sqrt(acn));
    },

    /**
     * Get the Ambisonic Index (n) from an ACN
     * @param acn ACN
     */
    index: function index(acn) {
      var order = ACN.order(acn);
      return acn - order * (order + 1);
    },

    /**
     * Calculate an ACN from Order l and Index n
     * @param order Ambisonic Order (l)
     * @param index Ambisonic Index (n)
     */
    acn: function acn(order, index) {
      return Math.pow(order, 2) * order + index;
    },

    /**
     * Calculate the maximum channels needed for a given ambisonic order. Returns (order+1)^2
     */
    maxChannels: function maxChannels(order) {
      return Math.pow(order + 1, 2);
    }
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
      /**
       * Get the Ambisonic Order (l) from this decoding matrix
       */

    }, {
      key: "ambisonicOrder",
      value: function ambisonicOrder() {
        return ACN.order(this.numCoeffs() - 1);
      }
      /**
       * Set the normalisation the matrix has. This will not change any values other than the 'normalisation' field
       * @param normalisation the Normalisation type ('n3d' or 'sn3d')
       */

    }, {
      key: "setNormalisation",
      value: function setNormalisation(normalisation) {
        this.normalisation = normalisation.toLowerCase();
      }
      /**
       *
       */

    }, {
      key: "getNormalisation",
      value: function getNormalisation() {
        return this.normalisation;
      }
      /**
       * change the normalisation of the matrix values
       * @param normalisation the new normalisation type ('n3d' or 'sn3d')
       */

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
    }, {
      key: "valid",
      value: function valid() {
        if (!this.matrix.length) return false;
        var len = this.matrix[0].length;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.matrix[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var ch = _step2.value;
            if (ch.length != len) return false;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return true;
      }
    }], [{
      key: "fromObject",
      value: function fromObject(obj) {
        return new Matrix(obj.input, obj.normalisation, obj.matrix);
      }
    }]);

    return Matrix;
  }();
  /**
   * An AE(D) Coordinate. The distance value is optional
   */


  _exports.Matrix = Matrix;

  var AEDCoord =
  /*#__PURE__*/
  function () {
    /**
     * construct a new AE(D) Coordinate
     */
    function AEDCoord(a, e, d) {
      _classCallCheck(this, AEDCoord);

      this.a = a;
      this.e = e;
      this.d = d;
    }
    /**
     * true if the Coordinate has a distance value
     */


    _createClass(AEDCoord, [{
      key: "hasDistance",
      value: function hasDistance() {
        return this.d != null;
      }
    }]);

    return AEDCoord;
  }();
  /**
   * Output channel class. Represents a named output of an Ambisonic decoder.
   */


  _exports.AEDCoord = AEDCoord;

  var OutputChannel =
  /*#__PURE__*/
  function () {
    /**
     *
     * @param name name for the Output
     * @param type type of output e.g. 'spk', 'sub', 'stereo-submix'
     * @param options supply coordinates or a description for the output here
     */
    function OutputChannel(name, type, options) {
      _classCallCheck(this, OutputChannel);

      this.name = name;
      this.type = type;

      if (options) {
        this.description = options.description;
        this.coords = options.coords;
      }
    }
    /**
     * Create a new OutputChannel from a plain Javascript Object
     */


    _createClass(OutputChannel, null, [{
      key: "fromObject",
      value: function fromObject(obj) {
        var ret = new OutputChannel(obj.name, obj.type);
        if (obj.coords) Object.assign(ret.coords, obj.coords);
        if (obj.description) ret.description = obj.description;
        return ret;
      }
    }]);

    return OutputChannel;
  }();
  /**
   * Where all the magic happens. The ADD Class.
   * Represents all properties of an ambisonic decoder that can be stored in a .add File
   */


  _exports.OutputChannel = OutputChannel;

  var ADD =
  /*#__PURE__*/
  function () {
    /**
     * Construct a new ADD
     * @param add
     */
    function ADD(add) {
      _classCallCheck(this, ADD);

      this.revision = 0;
      this.inv_reasons = [];
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
        assign_if_valid(this, pobj, 'number', 'revision');
        assign_if_valid(this, pobj, 'string', 'name');
        assign_if_valid(this, pobj, 'string', 'author');
        assign_if_valid(this, pobj, 'string', 'description');
        assign_if_valid(this, pobj, 'string', 'date');
        assign_if_valid(this, pobj, 'number', 'version');

        if (pobj.decoder) {
          if (pobj.decoder.filter) this.decoder.filter = pobj.decoder.filter.map(function (obj) {
            return Filter.fromObject(obj);
          });
          if (pobj.decoder.matrices) this.decoder.matrices = pobj.decoder.matrices.map(function (mat) {
            return Matrix.fromObject(mat);
          });

          if (pobj.decoder.output) {
            if (pobj.decoder.output.channels && pobj.decoder.output.matrix) {
              this.decoder.output = {
                channels: pobj.decoder.output.channels.map(function (channel) {
                  return OutputChannel.fromObject(channel);
                }),
                matrix: pobj.decoder.output.matrix || []
              };
            }
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
      key: "export",
      value: function _export() {
        if (!this.valid()) throw new Error('Cannot export invalid ADD');
        var export_obj = {
          name: this.name,
          description: this.description,
          author: this.author,
          date: this.date,
          revision: this.revision,
          version: this.version,
          decoder: {
            filter: this.decoder.filter.map(function (flt) {
              return Filter.fromObject(flt);
            }),
            matrices: this.decoder.matrices.map(function (mat) {
              return {
                normalisation: mat.normalisation,
                input: mat.input,
                matrix: mat.matrix.map(function (chs) {
                  return Array.from(chs);
                })
              };
            }),
            output: {
              channels: this.decoder.output.channels.map(function (chan) {
                return OutputChannel.fromObject(chan);
              }),
              matrix: this.decoder.output.matrix.map(function (chan) {
                return Array.from(chan);
              })
            }
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
      key: "createDefaultMetadata",
      value: function createDefaultMetadata() {
        this.author = this.author || 'the dotadd library creators';
        this.description = this.description || 'created with the dotadd.js library';
        this.version = this.version || 0;
        if (!this.dateValid()) this.date = new Date(Date.now()).toISOString();
      }
    }, {
      key: "repair",
      value: function repair() {
        if (this.hasNoOutputs()) this.createDefaultSummedOutputs();
        if (!this.valid()) this.createDefaultMetadata();

        if (!this.valid()) {
          if (this.decoder.output.channels.length != this.totalMatrixOutputs()) this.decoder.output.channels = [];
          this.decoder.output.matrix = [];
          this.createDefaultSummedOutputs();
        }
      }
    }, {
      key: "valid",
      value: function valid() {
        this.clearInvMessageCache();
        if (!is_valid_string(this.name)) return this.invalidateWith('Missing or invalid "name" field');
        if (!is_valid_string(this.author)) return this.invalidateWith('Missing or invalid "author" field');
        if (!is_valid_string(this.description)) return this.invalidateWith('Missing or invalid "author" field');
        if (this.version && Number.parseInt(this.version.toString()) == NaN) return this.invalidateWith('Missing or invalid "version" field');
        if (!this.dateValid()) return this.invalidateWith('Missing or invalid "date" field');
        if (!this.validateDecodingMatrices()) return this.invalidateWith('Invalid decoding matrix configuration');
        if (!this.validateOutputs()) return this.invalidateWith('Invalid output configuration');
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
      value: function addOutput(out) {
        this.decoder.output.channels.push(out);
      }
    }, {
      key: "addOutputAndFillMatrix",
      value: function addOutputAndFillMatrix(out, gain) {
        var _this = this;

        if (gain == null) gain = 1.;
        this.decoder.output.channels.push(out);
        var channel_num = this.decoder.output.channels.length - 1;
        this.decoder.output.matrix[channel_num] = new Array(this.decoder.output.channels.length).fill(0);
        this.decoder.output.matrix[channel_num][channel_num] = gain;
        this.decoder.output.matrix.forEach(function (ch) {
          while (ch.length != _this.decoder.output.channels.length) {
            ch.push(0);
          }
        });
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
      key: "maxMatrixOutputCount",
      value: function maxMatrixOutputCount() {
        return Math.max.apply(Math, _toConsumableArray(this.decoder.matrices.map(function (mat) {
          return mat.numChannels();
        })));
      }
    }, {
      key: "numOutputs",
      value: function numOutputs() {
        return this.decoder.output.channels.length;
      }
    }, {
      key: "hasNoOutputs",
      value: function hasNoOutputs() {
        return this.decoder.output.channels.length == 0 || this.decoder.output.matrix.length == 0;
      }
    }, {
      key: "createDefaultOutputs",
      value: function createDefaultOutputs() {
        var _this2 = this;

        this.decoder.matrices.forEach(function (mat, midx) {
          for (var i = 0; i < mat.numChannels(); ++i) {
            _this2.decoder.output.channels.push(new OutputChannel("DEFAULT_".concat(midx, "_").concat(i), 'default'));

            var arr = new Array(_this2.totalMatrixOutputs()).fill(0);
            arr[i + (midx ? _this2.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;

            _this2.decoder.output.matrix.push(arr);
          }
        });
      }
    }, {
      key: "createDefaultSummedOutputs",
      value: function createDefaultSummedOutputs() {
        var _this3 = this;

        for (var i = 0; i < this.maxMatrixOutputCount(); ++i) {
          this.decoder.output.channels.push(new OutputChannel("DEFAULT_".concat(i), 'default'));
          this.decoder.output.matrix[i] = new Array(this.totalMatrixOutputs()).fill(0);
        }

        this.decoder.matrices.forEach(function (mat, midx) {
          for (var _i = 0; _i < mat.numChannels(); ++_i) {
            _this3.decoder.output.matrix[_i][_i + (midx ? _this3.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;
          }
        });
      }
    }, {
      key: "createDefaultOutputMatrix",
      value: function createDefaultOutputMatrix() {
        this.decoder.output.matrix.length = 0;

        for (var i = 0; i < this.numOutputs(); ++i) {
          this.decoder.output.matrix.push(new Array(this.numOutputs()).fill(0));
          this.decoder.output.matrix[this.decoder.output.matrix.length - 1][this.decoder.output.matrix.length - 1] = 1.;
        }
      }
    }, {
      key: "refitOutputChannels",
      value: function refitOutputChannels() {
        if (this.numOutputs() < this.totalMatrixOutputs()) {
          while (this.numOutputs() != this.totalMatrixOutputs()) {
            this.addOutput(new OutputChannel('DEFAULT', 'default'));
          }
        } else if (this.numOutputs() > this.totalMatrixOutputs()) {
          while (this.numOutputs() != this.totalMatrixOutputs()) {
            this.decoder.output.channels.pop();
          }
        }
      }
    }, {
      key: "refitOutputMatrix",
      value: function refitOutputMatrix() {
        var _this4 = this;

        var ol = this.decoder.output.matrix.length;

        if (ol > this.numOutputs()) {
          this.decoder.output.matrix.length = this.numOutputs();
          this.decoder.output.matrix.map(function (ch) {
            ch.length = _this4.numOutputs();
            return ch;
          });
        } else if (ol < this.numOutputs()) {
          while (this.decoder.output.matrix.length != this.numOutputs()) {
            this.decoder.output.matrix.push([]);
          }

          this.decoder.output.matrix.map(function (ch, i) {
            var l = ch.length;

            while (ch.length != _this4.numOutputs()) {
              ch.push(0);
            }

            ch[i] = 1;
          });
        }
      }
    }, {
      key: "invalidateWith",
      value: function invalidateWith(reason) {
        this.inv_reasons.push(reason);
        return false;
      }
    }, {
      key: "clearInvMessageCache",
      value: function clearInvMessageCache() {
        this.inv_reasons.length = 0;
      }
    }, {
      key: "dateValid",
      value: function dateValid() {
        return !Number.isNaN(Date.parse(this.date));
      }
    }, {
      key: "validateOutputs",
      value: function validateOutputs() {
        if (this.hasNoOutputs()) return this.invalidateWith('No outputs');
        if (!(this.decoder.output.channels.length == this.decoder.output.matrix.length)) return this.invalidateWith('Output matrix dimensions do not match output channel count');
        var inputs = this.decoder.output.matrix[0].length;
        var valid = true;
        var mixer_inputs = this.decoder.output.matrix.forEach(function (channel) {
          if (channel.length != inputs) valid = false;
        });
        if (!valid) return this.invalidateWith('Irregular output matrix');
        if (this.totalMatrixOutputs() != inputs) return this.invalidateWith('Total Matrix output count does not match output channel count');
        return true;
      }
    }, {
      key: "validateDecodingMatrices",
      value: function validateDecodingMatrices() {
        var _this5 = this;

        if (!this.decoder.matrices.length) return this.invalidateWith('No decoding matrices');

        var _loop = function _loop(i) {
          if (_this5.decoder.matrices.find(function (m) {
            return m.input == Number.parseInt(i);
          }) == undefined) return {
            v: _this5.invalidateWith('Missing matrix for filter output ' + i)
          };
        };

        for (var i in this.decoder.filter) {
          var _ret = _loop(i);

          if (_typeof(_ret) === "object") return _ret.v;
        }

        for (var i in this.decoder.matrices) {
          if (!this.decoder.matrices[i].valid()) return this.invalidateWith('Invalid matrix #' + i);
        }

        return true;
      }
    }]);

    return ADD;
  }();

  _exports.ADD = ADD;
});