function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

export var Filter =
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

export var Matrix =
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
export var AEDCoord =
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
export var Output = function Output(name, type, options) {
  _classCallCheck(this, Output);

  this.name = name;
  this.type = type;

  if (options) {
    this.description = options.description;
    this.coords = options.coords;
  }
};
export var ADD =
/*#__PURE__*/
function () {
  function ADD(add) {
    _classCallCheck(this, ADD);

    var pobj = {};
    if (!add) return;else if (typeof add == 'string' || add instanceof String) pobj = JSON.parse(add.toString());else if (add instanceof Object) pobj = add;
    this.assignIfExists(pobj, 'number', 'revision');
    this.assignIfExists(pobj, 'string', 'name');
    this.assignIfExists(pobj, 'string', 'author');
    this.assignIfExists(pobj, 'string', 'description');
    this.assignIfExists(pobj, 'string', 'date');
    this.assignIfExists(pobj, 'number', 'version');
    this.assignIfExists(pobj, 'object', 'decoder', 'filter');
  }

  _createClass(ADD, [{
    key: "assignIfExists",
    value: function assignIfExists(from, type) {
      var to = this;

      for (var _len = arguments.length, prop = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        prop[_key - 2] = arguments[_key];
      }

      this.assignIfExistsRecurse(to, from, type, prop);
    }
  }, {
    key: "assignIfExistsRecurse",
    value: function assignIfExistsRecurse(me, from, type, props) {
      if (props.length === 1) {
        if (from.hasOwnProperty(props[0]) && _typeof(from[props[0]]) == type) me[props[0]] == from[props[0]];
      } else {
        var nextp = props.shift();

        if (from.hasOwnProperty(nextp) && _typeof(from[nextp]) == 'object') {
          if (!me.hasOwnProperty(nextp)) me[nextp] = {};
          this.assignIfExistsRecurse(me[nextp], from[nextp], type, props);
        }
      }
    }
  }]);

  return ADD;
}();