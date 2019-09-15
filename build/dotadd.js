export class Filter {
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
/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
 * which specifies the input band it receives audio from
 */
export class Matrix {
    /**
     * Construct a new Matrix.
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(input, channels) {
        this.input = input;
        if (channels && channels.length) {
            let csize = channels[0].length;
            for (let channel of channels) {
                if (channel.length != csize)
                    throw new Error("channel size mismatch");
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
        if (this.matrix)
            return this.matrix[0].length;
        else
            return 0;
    }
    /**
     * @returns the number of channels in the matrix
     */
    numChannels() {
        if (this.matrix)
            return this.matrix.length;
        else
            return 0;
    }
    /**
     * set the coefficents for a channels in the Matrix
     * @param {Number} chan the channel number to set
     * @param {Array<Number>} coeffs an array of coefficents
     */
    setCoeffsForChannel(chan, coeffs) {
        if (!(this.matrix))
            this.matrix = [];
        this.matrix[chan] = coeffs;
    }
    /**
 * get the coefficents for a channel in the Matrix
 * @param {number} chan the channel number
 * @returns {number[]} an array of coefficents
 */
    getCoeffsForChannel(chan) {
        if (!(this.matrix))
            return;
        return this.matrix[chan];
    }
    static fromObject(obj) {
        return new Matrix(obj.input, obj.matrix);
    }
}
export class AEDCoord {
    constructor(a, e, d) {
        this.a = a;
        this.e = e;
        this.d = d;
    }
    hasDistance() {
        return this.d != null;
    }
}
export class OutputChannel {
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
export class ADD {
    constructor(add) {
        let pobj = {};
        if (typeof add == 'string' || add instanceof String)
            pobj = JSON.parse(add.toString());
        else if (add instanceof Object)
            pobj = add;
        this.decoder = { filter: [], matrices: [], output: { channels: [], matrix: [] } };
        if (add) {
            this.assign_if_valid(pobj, 'number', 'revision');
            this.assign_if_valid(pobj, 'string', 'name');
            this.assign_if_valid(pobj, 'string', 'author');
            this.assign_if_valid(pobj, 'string', 'description');
            this.assign_if_valid(pobj, 'string', 'date');
            this.assign_if_valid(pobj, 'number', 'version');
            if (pobj.decoder) {
                if (pobj.decoder.filter)
                    this.decoder.filter = pobj.filter.map(obj => Filter.fromObject(obj));
                if (pobj.decoder.matrices)
                    this.decoder.matrices = pobj.decoder.matrices.map(mat => Matrix.fromObject(mat));
                if (pobj.decoder.output.channels && pobj.decoder.output.matrix) {
                    this.decoder.output = {
                        channels: pobj.decoder.output.channels.map(channel => OutputChannel.fromObject(channel)),
                        matrix: pobj.decoder.matrix
                    };
                }
            }
        }
    }
    validateProp(prop, validator) {
        if (typeof validator == 'string')
            return typeof prop == validator;
        else
            return validator(prop);
    }
    assign_if_valid(from, validator, ...prop) {
        let to = this;
        this.assign_if_valid_recurse(to, from, validator, prop);
    }
    assign_if_valid_recurse(me, from, validator, props) {
        if (props.length === 1) {
            if (from.hasOwnProperty(props[0]) && this.validateProp(from[props[0]], validator))
                me[props[0]] = from[props[0]];
        }
        else {
            let nextp = props.shift();
            if (from.hasOwnProperty(nextp) && this.validateProp(from[nextp], 'object')) {
                if (!me.hasOwnProperty(nextp))
                    me[nextp] = {};
                this.assign_if_valid_recurse(me[nextp], from[nextp], validator, props);
            }
        }
    }
    valid() {
        return true;
    }
    addMatrix(mat) {
        if (!this.decoder.matrices)
            this.decoder.matrices = [];
        this.decoder.matrices.push(mat);
    }
    addFilter(flt) {
        if (!this.decoder.filter)
            this.decoder.filter = [];
        this.decoder.filter.push(flt);
    }
    addOutput(out, gain, index) {
        if (gain == null)
            gain = 1.0;
        if (index == null)
            index = this.decoder.output.channels.length;
    }
}
