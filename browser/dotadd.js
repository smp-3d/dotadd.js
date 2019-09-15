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
  _exports.ADD = _exports.OutputChannel = _exports.AEDCoord = _exports.Matrix = _exports.Filter = void 0;

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
  /**
   * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
   * which specifies the input band it receives audio from
   */


  _exports.Filter = Filter;

  var Matrix =
  /*#__PURE__*/
  function () {
    /**
     * Construct a new Matrix.
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    function Matrix(input, channels) {
      _classCallCheck(this, Matrix);

      this.input = input;

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
    }], [{
      key: "fromObject",
      value: function fromObject(obj) {
        return new Matrix(obj.input, obj.matrix);
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
      key: "valid",
      value: function valid() {
        return true;
      }
    }, {
      key: "addMatrix",
      value: function addMatrix(mat) {
        if (!this.decoder.matrices) this.decoder.matrices = [];
        this.decoder.matrices.push(mat);
      }
    }, {
      key: "addFilter",
      value: function addFilter(flt) {
        if (!this.decoder.filter) this.decoder.filter = [];
        this.decoder.filter.push(flt);
      }
    }, {
      key: "addOutput",
      value: function addOutput(out, gain, index) {
        if (gain == null) gain = 1.0;
        if (index == null) index = this.decoder.output.channels.length;
      }
    }]);

    return ADD;
  }();

  _exports.ADD = ADD;
});