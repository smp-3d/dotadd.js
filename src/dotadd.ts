function is_valid_string(str): boolean {
    return (str) && str != '';
}


function validateProp(prop: any, validator: Function): boolean;
function validateProp(prop: any, validator: string): boolean;
function validateProp(prop: any, validator: any): boolean {
    if (typeof validator == 'string')
        return typeof prop == validator;
    else return validator(prop);
}


function assign_if_valid(me: any, from: Object, validator: any, ...prop: string[]) {
    let to = me;
    assign_if_valid_recurse(to, from, validator, prop);
}

function assign_if_valid_recurse(me: Object, from: Object, validator: any, props: string[]) {

    if (props.length === 1) {
        if (from.hasOwnProperty(props[0]) && validateProp(from[props[0]], validator))
            me[props[0]] = from[props[0]];

    } else {

        let nextp = props.shift();

        if (from.hasOwnProperty(nextp) && validateProp(from[nextp], 'object')) {

            if (!me.hasOwnProperty(nextp))
                me[nextp] = {};

            assign_if_valid_recurse(me[nextp], from[nextp], validator, props);

        }
    }
}

/**
 * The dotadd Filter class. Respresents a single filter band. 
 */
export class Filter {

    /**
     * Construct a new Filterband. At least high or low must be given to construct a valid filter band object
     * @param high beginning of the high frequency stopbband can be null
     * @param low beginning of the high frequency stopbband can be null or omitted
     */
    constructor(name: string, matrix: number, high: number, low?: number) {

        this.name = name;

        if ((high == null) && (low == null))
            throw new Error('Cannot construct a Filterband without frequencies');

        if (high != null)
            this.hi = high;

        if (low != null)
            this.lo = low;
    }

    isLowpass() {
        return this.lo == null && this.hi != null;
    }

    isHighpass() {
        return this.hi == null && this.lo != null;
    }

    isBandpass() {
        return this.hi != null && this.lo != null;
    }

    static makeLowpass(name: string, matrix: number, freq: number){
        return new Filter(name, matrix, freq);
    }

    static makeHighpass(name: string, matrix: number, freq: number){
        return new Filter(name, matrix, null, freq);
    }

    static fromObject(obj: any) {
        return new Filter(obj.name, obj.matrix, obj.hi, obj.lo);
    }

    name: string;
    matrix: number;
    lo: number;
    hi: number;
}

export const Normalization = Object.freeze({
    N3D: 'n3d',
    SN3D: 'sn3d'
});

/**
 * Function to handle Ambisonic Channel Numbers (ACN)
 */
export const ACN = {

    /**
     * Get the Ambisonic Order (l) from an ACN
     * @param acn ACN
     */
    order(acn: number) {
        return Math.floor(Math.sqrt(acn));
    },

    /**
     * Get the Ambisonic Index (n) from an ACN
     * @param acn ACN
     */
    index(acn: number) {
        let order = ACN.order(acn);
        return acn - order * (order + 1);
    },

    /**
     * Calculate an ACN from Order l and Index n
     * @param order Ambisonic Order (l)
     * @param index Ambisonic Index (n)
     */
    acn(order: number, index: number) {
        return Math.pow(order, 2) + order + index;
    },

    /**
     * Calculate the maximum channels needed for a given ambisonic order. Returns (order+1)^2
     */
    maxChannels(order: number): number {
        return Math.pow(order + 1, 2);
    }
}

/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field 
 * which specifies the input band it receives audio from
 */
export class Matrix {

    normalization: string;
    weights: string;
    matrix: number[][] = [];

    /**
     * Construct a new Matrix. 
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(normalization: string, channels: number[][]) {

        this.normalization = normalization.toLowerCase();

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
     * @returns {Number} the input number of coeffs for each channel
     */
    numCoeffs(): number {
        if (this.matrix)
            return this.matrix[0].length;
        else return 0;
    }

    /**
     * @returns the number of channels in the matrix
     */
    numChannels(): number {
        if (this.matrix)
            return this.matrix.length;
        else return 0;
    }

    /**
     * set the coefficents for a channels in the Matrix
     * @param {Number} chan the channel number to set
     * @param {Array<Number>} coeffs an array of coefficents
     */
    setCoeffsForChannel(chan: number, coeffs: number[]) {

        if (!(this.matrix))
            this.matrix = [];

        this.matrix[chan] = coeffs;

    }

    /**
     * get the coefficents for a channel in the Matrix
     * @param {number} chan the channel number
     * @returns {number[]} an array of coefficents
     */
    getCoeffsForChannel(chan: number) {

        if (!(this.matrix))
            return;

        return this.matrix[chan];
    }

    /**
     * Get the Ambisonic Order (l) from this decoding matrix
     */
    ambisonicOrder(): number {
        return ACN.order(this.numCoeffs() - 1);
    }

    /**
     * Set the normalization the matrix has. This will not change any values other than the 'normalization' field
     * @param normalization the normalization type ('n3d' or 'sn3d')
     */
    setNormalization(normalization: string): void {
        this.normalization = normalization.toLowerCase();
    }

    /**
     * 
     */
    getNormalization(): string {
        return this.normalization;
    }

    /**
     * change the normalization of the matrix values
     * @param normalization the new normalization type ('n3d' or 'sn3d')
     */
    renormalizeTo(normalization: string) {

        normalization = normalization.toLowerCase();

        if (this.normalization == normalization)
            return;

        if (normalization === Normalization.N3D) {

            this.matrix.forEach((ch) => {
                ch.forEach((coeff, cidx) => {
                    ch[cidx] = coeff * (Math.sqrt(2 * ACN.order(cidx) + 1));
                });
            })

        }
        else if (normalization === Normalization.SN3D) {
            this.matrix.forEach((ch) => {
                ch.forEach((coeff, cidx) => {
                    ch[cidx] = coeff / (Math.sqrt(2 * ACN.order(cidx) + 1));
                });
            })
        }

        this.normalization = normalization;

        return this;
    }

    setWeighting(weighting: string){
        this.weights = weighting.toLowerCase();
    }

    valid(): boolean {
        
        if(!this.matrix.length)
            return false;

        let len = this.matrix[0].length;

        for(let ch of this.matrix){
            if(ch.length != len)
                return false;
        }

        if(!(this.normalization == 'n3d' || this.normalization == 'sn3d'))
            return false;

        if(this.weights){
            if(!(this.weights == "inhpase" || this.weights == "maxre"))
                return false;
        }

        return true;
    }

    static fromObject(obj: any): Matrix {
        return new Matrix(obj.input, obj.normalization);
    }
}

/**
 * An AE(D) Coordinate. The distance value is optional
 */
export class AEDCoord {

    a: number;
    e: number;
    d: number;

    /**
     * construct a new AE(D) Coordinate
     */
    constructor(a: number, e: number, d?: number) {
        this.a = a;
        this.e = e;
        this.d = d;
    }

    /**
     * true if the Coordinate has a distance value
     */
    hasDistance(): boolean {
        return this.d != null;
    }
}

/**
 * Output channel class. Represents a named output of an Ambisonic decoder.
 */
export class OutputChannel {

    /**
     * name of the output
     */
    name: string;

    /**
     * type of output, e.g. 'spk', 'sub', 'stereo-submix'
     */
    type: string;

    /**
     * 
     */
    coords: AEDCoord;

    /**
     * 
     * @param name name for the Output
     * @param type type of output e.g. 'spk', 'sub', 'stereo-submix'
     * @param options supply coordinates or a description for the output here
     */
    constructor(name: string, type: string, coords?: AEDCoord) {

        this.name = name;
        this.type = type;

        if (coords) 
            this.coords = coords;
    }

    /**
     * Create a new OutputChannel from a plain Javascript Object
     */
    static fromObject(obj: any): OutputChannel {

        let ret = new OutputChannel(obj.name, obj.type);

        if (obj.coords)
            ret.coords = new AEDCoord(obj.coords.a, obj.coords.e, obj.coords.d);

        return ret;
    }
}

/**
 * Where all the magic happens. The ADD Class. 
 * Represents all properties of an ambisonic decoder that can be stored in a .add File
 */
export class ADD {

    revision: number = 0;
    name: string;
    author: string;
    description: string;
    date: string;
    version: number;
    decoder: {
        name: string,
        filters: Filter[],
        matrices: Matrix[],
        output: {
            channels: OutputChannel[],
            summing_matrix: number[][]
        }
    };

    inv_reasons: string[] = [];

    private _set(prop: string, val: any): ADD {
        this[prop] = val;
        return this;
    }

    /**
     * Construct a new ADD
     * @param add 
     */
    constructor(add?: any) {

        let pobj: any = {};

        if (typeof add == 'string' || add instanceof String)
            pobj = JSON.parse(add.toString());
        else if (add instanceof Object)
            pobj = add;



        this.decoder = { name: "", filters: [], matrices: [], output: { channels: [], summing_matrix: [] } };

        if (add) {

            assign_if_valid(this, pobj, 'number', 'revision');
            assign_if_valid(this, pobj, 'string', 'name');
            assign_if_valid(this, pobj, 'string', 'author');
            assign_if_valid(this, pobj, 'string', 'description');
            assign_if_valid(this, pobj, 'string', 'date');
            assign_if_valid(this, pobj, 'number', 'version');

            if (pobj.decoder) {

                if(pobj.decoder.name)
                    this.decoder.name = pobj.decoder.name;

                if (pobj.decoder.filters)
                    this.decoder.filters = pobj.decoder.filters.map(obj => Filter.fromObject(obj));

                if (pobj.decoder.matrices)
                    this.decoder.matrices = pobj.decoder.matrices.map(mat => Matrix.fromObject(mat));

                if(pobj.decoder.output) {

                    if (pobj.decoder.output.channels && pobj.decoder.output.matrix) {

                        this.decoder.output = {
                            channels: pobj.decoder.output.channels.map(channel => OutputChannel.fromObject(channel)),
                            summing_matrix: pobj.decoder.output.summing_matrix || []
                        }
                    }
                }

            }
        }

    }

    export() {

        if (!this.valid())
            throw new Error('Cannot export invalid ADD');

        let export_obj = {

            name: this.name,

            description: this.description,

            author: this.author,

            date: this.date,

            revision: this.revision,

            version: this.version,

            decoder: {

                name: this.decoder.name,

                filters: this.decoder.filters.map(flt => Filter.fromObject(flt)),

                matrices: this.decoder.matrices.map(mat => {
                    return {
                        normalization: mat.normalization,
                        weights: mat.weights,
                        matrix: mat.matrix.map(chs => Array.from(chs))
                    }
                }),

                output: {
                    channels: this.decoder.output.channels.map(chan => OutputChannel.fromObject(chan)),
                    summing_matrix: this.decoder.output.summing_matrix.map(chan => Array.from(chan))
                }
            },

            serialize() {
                return JSON.stringify(export_obj);
            }

        };

        return export_obj;
    }

    setAuthor(author: string): ADD { return this._set('author', author); }
    setName(name: string): ADD { return this._set('name', name); }
    setDescription(desc: string): ADD { return this._set('description', desc); }
    setDate(date: string | Date): ADD { return this._set('date', new Date(date).toISOString()); }
    setVersion(version: number): ADD { return this._set('version', version); }

    createDefaultMetadata() {

        this.author = this.author || 'the dotadd library creators'

        this.description = this.description || 'created with the dotadd.js library'

        this.version = this.version || 0;

        this.decoder.name = this.decoder.name || this.name;

        if (!this.dateValid())
            this.date = new Date(Date.now()).toISOString();
    }

    repair(): void {

        if (this.hasNoOutputs())
            this.createDefaultSummedOutputs();

        if (!this.valid())
            this.createDefaultMetadata();

        if (!this.valid()) {

            if(this.decoder.output.channels.length != this.totalMatrixOutputs()){
                this.decoder.output.channels = [];
                this.decoder.output.summing_matrix = [];
                this.createDefaultSummedOutputs();
            }
        }

    }

    valid(): boolean {

        this.clearInvMessageCache();

        if (!is_valid_string(this.name))
            return this.invalidateWith('Missing or invalid "name" field');

        if (!is_valid_string(this.author))
            return this.invalidateWith('Missing or invalid "author" field');

        if (!is_valid_string(this.description))
            return this.invalidateWith('Missing or invalid "author" field');

        if (this.version && Number.parseInt(this.version.toString()) == NaN)
            return this.invalidateWith('Missing or invalid "version" field');

        if (!this.dateValid())
            return this.invalidateWith('Missing or invalid "date" field');

        if (!this.validateDecodingMatrices())
            return this.invalidateWith('Invalid decoding matrix configuration');

        if (!this.validateOutputs())
            return this.invalidateWith('Invalid output configuration');

        return true;
    }

    addMatrix(mat: Matrix): void {
        this.decoder.matrices.push(mat);
    }

    addFilter(flt: Filter): void {
        this.decoder.filters.push(flt);
    }

    addOutput(out: OutputChannel){
        this.decoder.output.channels.push(out);
    }

    addOutputAndFillMatrix(out: OutputChannel, gain: number): void {

        if(gain == null)
            gain = 1.;

        this.decoder.output.channels.push(out);

        let channel_num = this.decoder.output.channels.length - 1;

        this.decoder.output.summing_matrix[channel_num] 
            = new Array(this.decoder.output.channels.length).fill(0);

        this.decoder.output.summing_matrix[channel_num][channel_num] = gain;

        this.decoder.output.summing_matrix.forEach(ch => {
            while(ch.length != this.decoder.output.channels.length)
                ch.push(0);
        });

    }

    maxAmbisonicOrder(): number {
        return Math.max(...this.decoder.matrices.map(mat => mat.ambisonicOrder()));
    }

    totalMatrixOutputs(): number {
        return this.decoder.matrices.reduce((val, mat) => val + mat.numChannels(), 0);
    }

    maxMatrixOutputCount(): number {
        return Math.max(...this.decoder.matrices.map(mat => mat.numChannels()));
    }

    numOutputs(): number{
        return this.decoder.output.channels.length;
    }

    hasNoOutputs() {
        return this.decoder.output.channels.length == 0
            || this.decoder.output.summing_matrix.length == 0;
    }

    createDefaultOutputs(): void {

        this.decoder.matrices.forEach((mat, midx) => {

            for (let i = 0; i < mat.numChannels(); ++i) {

                this.decoder.output.channels.push(new OutputChannel(`DEFAULT_${midx}_${i}`, 'default'));

                let arr: number[] = new Array(this.totalMatrixOutputs()).fill(0);
                arr[i + ((midx) ? this.decoder.matrices[midx - 1].numChannels() : 0)] = 1.0;

                this.decoder.output.summing_matrix.push(arr);
            }
        });
    }

    createDefaultSummedOutputs(): void {

        for (let i = 0; i < this.maxMatrixOutputCount(); ++i) {
            this.decoder.output.channels.push(new OutputChannel(`DEFAULT_${i}`, 'default'));
            this.decoder.output.summing_matrix[i] = new Array(this.totalMatrixOutputs()).fill(0);
        }

        this.decoder.matrices.forEach((mat, midx) => {
            for (let i = 0; i < mat.numChannels(); ++i)
                this.decoder.output.summing_matrix[i][(i + ((midx) ? this.decoder.matrices[midx - 1].numChannels() : 0))] = 1.0;
        });
    }

    createDefaultOutputMatrix(){

        this.decoder.output.summing_matrix.length = 0;

        for(let i = 0; i < this.numOutputs(); ++i){
            this.decoder.output.summing_matrix.push(new Array(this.numOutputs()).fill(0));
            this.decoder.output.summing_matrix[this.decoder.output.summing_matrix.length - 1]
                                        [this.decoder.output.summing_matrix.length - 1] = 1.;
        }

    }

    refitOutputChannels(){

        if(this.numOutputs() < this.totalMatrixOutputs()){
            while(this.numOutputs() != this.totalMatrixOutputs())
                this.addOutput(new OutputChannel('DEFAULT', 'default'));
        } else if(this.numOutputs() > this.totalMatrixOutputs()){
            while(this.numOutputs() != this.totalMatrixOutputs())
                this.decoder.output.channels.pop();
        }

    }

    refitOutputMatrix(){

        let ol = this.decoder.output.summing_matrix.length;

        if(ol > this.numOutputs()){

            this.decoder.output.summing_matrix.length = this.numOutputs();

            this.decoder.output.summing_matrix
                .map(ch => { 
                    ch.length = this.numOutputs(); 
                    return ch; 
                })

        } else if(ol < this.numOutputs()) {
            
            while(this.decoder.output.summing_matrix.length != this.numOutputs())
                this.decoder.output.summing_matrix.push([]);

            this.decoder.output.summing_matrix.map((ch, i) => {

                let l = ch.length;

                while(ch.length != this.numOutputs())
                    ch.push(0);

                ch[i] = 1;

            });

        }
    }

    invalidateWith(reason: string): boolean {
        this.inv_reasons.push(reason);
        return false;
    }

    clearInvMessageCache(){
        this.inv_reasons.length = 0;
    }

    dateValid(): boolean {
        return !Number.isNaN(Date.parse(this.date));
    }

    validateOutputs(): boolean {

        if (this.hasNoOutputs())
            return this.invalidateWith('No outputs');

        if (!(this.decoder.output.channels.length
            == this.decoder.output.summing_matrix.length))
            return this.invalidateWith('Output matrix dimensions do not match output channel count');

        let inputs = this.decoder.output.summing_matrix[0].length;
        let valid = true;

        let mixer_inputs = this.decoder.output.summing_matrix.forEach(channel => {
            if (channel.length != inputs)
                valid = false;
        });

        if (!valid)
            return this.invalidateWith('Irregular output matrix');

        if (this.totalMatrixOutputs() != inputs)
            return this.invalidateWith('Total Matrix output count does not match output channel count');

        return true;

    }

    validateDecodingMatrices(){

        if(!this.decoder.matrices.length)
            return this.invalidateWith('No decoding matrices');

        if(this.decoder.filters.length){
            if(this.decoder.matrices.length != this.decoder.filters.length)
                return this.invalidateWith("Matrix count does not match Filter count");
        } else {
            if(this.decoder.matrices.length > 1)
                return this.invalidateWith("No filters but more than 1 matrix");
        }

        for(let i in this.decoder.matrices){
            if(!this.decoder.matrices[i].valid())
                return this.invalidateWith('Invalid matrix #' + i);
        }

        return true;
    }   

}