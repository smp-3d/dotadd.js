/**
 * Maximum supported file revision for this library
 */
const DOTADD_MAX_REVSION = 0;

class Filter {

    constructor(high_freq, low_freq){
        this.hi = high_freq;
        this.lo = low_freq;
    }

    isLowpass(){
        return this.lo == undefined && this.hi != undefined;
    }

    isHighpass(){
        return this.hi == undefined && this.lo != undefined;
    }

    isBandpass(){
        return this.hi != undefined && this.lo != undefined;
    }

    static fromObject(obj){
        return new Filter(obj.hi, obj.lo);
    }
}

/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field 
 * which specifies the input band it receives audio from
 */
class Matrix {

    /**
     * Construct a new Matrix. 
     * @param {Number} input the input band the matrix will receive signal from
     * @param {Array<Array<Number>>} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(input, channels){

        this.input = input;

        if(channels && channels.length){

            let csize = channels[0].length;

            for(let channel of channels){
                if(channel.length != csize)
                    throw new Error("channel size mismatch");
            }

            this.matrix = channels;
        }

    }

    /**
     * Set the input band the Matrix will receive signal from
     * @param {Number} input 
     */
    setInput(input){
        this.input = input;
    }

    /**
     * @returns {Number} the input channel this Matrix will receive signal from
     */
    getInput(){
        return this.input;
    }

    /**
     * @returns {Number} the input number of coeffs for each channel
     */
    numCoeffs(){
        if(this.matrix)
            return this.matrix[0].length;
        else return 0;
    }

    /**
     * @returns the number of channels in the matrix
     */
    numChannels(){
        if(this.matrix)
            return this.matrix.length;
        else return 0;
    }

    /**
     * set the coefficents for a channels in the Matrix
     * @param {Number} chan the channel number to set
     * @param {Array<Number>} coeffs an array of coefficents
     */
    setCoeffsForChannel(chan, coeffs){

        if(!(this.matrix))
            this.matrix = [];

        this.matrix[chan] = coeffs;

    }

    /**
     * get the coefficents for a channel in the Matrix
     * @param {Number} chan the channel number
     * @returns {Array<Number>} an array of coefficents
     */
    getCoeffsForChannel(chan){

        if(!(this.matrix))
            return;

        return this.matrix[chan];
    }

    static fromObject(obj){
        return new Matrix(obj.input, obj.matrix);
    }

}

class AEDCoord {
    constructor(a, e, d){
        this.a = a;
        this.e = e;
        this.d = d;
    }

    hasDistance(){
        return this.d != undefined;
    }
}

class Receive {

    /**
     * Constructs a new Receive. 
     * @param {Number|Receive} mat_or_receive 
     * @param {Number} ch 
     * @param {Number} gain 
     */
    constructor(mat_or_receive, ch, gain){

        if(mat_or_receive == undefined)
            return;
            

        if(mat_or_receive instanceof Object){
            this.matrix = mat_or_receive.matrix;
            this.channel = mat_or_receive.channel;
            this.gain = mat_or_receive.gain;
        } else {
            this.matrix = mat_or_receive;
            this.channel = ch;
            this.gain = gain;
        }
    }

    /**
     * Create a default Receive for the given Matrix and Channel.
     * @param {Number} matrix the Matrix to create a Receive for
     * @param {Number} channel the channel in the Matrix to create a Receive for
     */
    static getDefaultReceive(matrix, channel){
        return new Receive(matrix, channel, 1.0);
    }

    static fromObject(obj){
        let out = new Receive();
        Object.assign(out, obj);
        return out;
    }
}

class Output {

    constructor(name, coord_or_receive, ...receives) {

        if(name == undefined)
            return;

        if (coord_or_receive instanceof Receive) 
            receives.unshift(coord_or_receive);
        else if(coord_or_receive instanceof AEDCoord)
            this.coord = coord_or_receive;
        else {
            console.log("hello");
            if (coord_or_receive.a != undefined && coord_or_receive.e != undefined)
                this.coord = coord_or_receive;
            else if (coord_or_receive.matrix != undefined
                && coord_or_receive.channel != undefined
                && coord_or_receive.gain != undefined)
                receives.unshift(new Receive(coord_or_receive));
            else throw new Error("Illegal second argument");
        }

        this.name = name,
        this.receive = receives;
    }

    addReceive(receive){
        this.receive.push(new Receive(receive));
    }

    static fromObject(obj){
        let out = new Output();
        Object.assign(out, obj);
        return out;
    }
}

Output.AEDCoord = AEDCoord;
Output.Receive = Receive;

class ADD {

    /**
     * Construct a new Ambisonic Decoder Description. Can be constructed from an Object or a String. 
     * A null parameter constructs an invalid empty ADD.
     * @param {String|Object} add The ADD either as raw String or as Object. 
     */
    constructor(add) {

        if (!(add)) {
            this.revision = DOTADD_MAX_REVSION;
            this.decoder = {};
            return;
        }

        if (typeof add == "string")
            add = JSON.parse(add);
        
        Object.assign(this, add);

        if(add.decoder){

            this.decoder = {};

            if(add.decoder.filter){
                this.decoder.filter = add.decoder.filter.map(f => Filter.fromObject(f));
            } 

            if(add.decoder.output){
                this.decoder.output = add.decoder.output.map(outp => {
                    outp.receive = outp.receive.map(recv => Receive.fromObject(recv));
                    return Output.fromObject(outp);
                });
            }

            if(add.decoder.matrices){
                this.decoder.matrices = add.decoder.matrices.map(mat => Matrix.fromObject(mat));
            }
        }

        if (!this.valid()) throw new Error("invalid ADD: " + this.invalid_reason);
    }

    /**
     * Check if the ADD is valid.
     * @returns true if the AmbisonicDecoderDescription is valid
     */
    valid(){

        if(!this.name){
            this.invalid_reason = "Missing Metadata";
            return false;
        }

        if(!this.decoder){
            this.invalid_reason = "Missing decoder property"
            return false;
        }

        if(!this.decoder.output || this.decoder.output.length < 1){
            this.invalid_reason = "No Outputs";
            return false;
        }

        return true;
    }

    /**
     * @returns {{filter: Array<Filter>, matrices: Array<Matrix>, output: Array<Output>}} the decoder
     */
    getDecoder(){
        return this.decoder;
    }

    addFilter(f){
        if(!(this.decoder.filter))
            this.decoder.filter = [];

        this.decoder.filter.push(Filter.fromObject(f));
    }

    
    /**
     * add a new Matrix to the ADD
     * @param {Matrix} mat the Matrix to add.
     */
    addMatrix(mat){

        if(!(this.decoder.matrices))
            this.decoder.matrices = [];

        if(!(mat.input))
            mat.setInput(0);

        this.decoder.matrices.push(mat); 
        
    }

    /**
     * set the "version" field (optional, default = 1)
     * @param {Number} v version
     */
    setVersion(v){
        this.version = Math.floor(v);
        return this;
    }

    /**
     * set the creation date (optional)
     * @param {Date|String} date 
     */
    setDate(date){
        this.date = new Date(date).toISOString();
        return this;
    }

    /**
     * set the "name" field (required)
     * @param {String} name 
     */
    setName(name){
        this.name = name;
        return this;
    }

    /**
     * set the "description" field (optional)
     * @param {String} desc 
     */
    setDescription(desc){
        this.description = desc;
        return this;
    }

    /**
     * set the "author" field (optional)
     * @param {String} author 
     */
    setAuthor(author){
        this.author = author;
        return this;
    }

    /**
     * Create a set of outputs for the decoder matrices. 
     * @param {Boolean} sum if true all correspoding outputs for each matrix will be summed to a single output.
     */
    createDefaultOutputs(sum){

        if (!(this.decoder.output))
            this.decoder.output = [];


        for (let mat in this.decoder.matrices) {

            for (let ch = 0; ch < this.decoder.matrices[mat].numChannels(); ++ch) {

                if(sum){
                    if(this.decoder.output[ch]){
                        this.decoder.output[ch].addReceive(Receive.getDefaultReceive(Number.parseInt(mat), ch));
                    } else {

                        this.decoder.output.push(ADD.Output.fromObject({
                            name: `DEFAULT_${ch}`,
                            receive: [ ADD.Output.Receive.getDefaultReceive(Number.parseInt(mat), ch) ]
                        }));
                    }
                } else {

                    let new_output = new ADD.Output(`DEFAULT_${Number.parseInt(mat)}_${ch}`,
                        ADD.Output.Receive.getDefaultReceive(Number.parseInt(mat), ch));

                    this.decoder.output.push(new_output);
                }

            }
        }
        
    }

    /**
     * Check if the imported files revision is supported by this library version.
     * @returns {Boolean} true if this library supports the file revision
     */
    isRevisionSupported(){
        return this.revision <= ADD.maxRevision();
    }

    /**
     * Export the ADD to a serializable javascript Object. You can use the exported Objects .serialize() Method to serialize the Object.
     * @param {Object} options optional options object.
     * @param {Boolean} options.sumMatrixOutputs if true default outputs will be summed from corresponding matrix channels.
     * @param {Boolean} options.rebuildOutputs if true, the current output routing will be discarded and rebuild by the ADD.createDefaultOutputs() method
     * @returns {Object} A javscript object that is serializable to a valid .add file (with JSON.stringify() for example)
     */
    export(options){

        if(!options)
            options = {};

        this.prop = "string";

        if(options.rebuildOutputs)
            this.decoder.output = null;

        if(!this.decoder.output)
            this.createDefaultOutputs(options.sumMatrixOutputs);

        if(!this.valid())
            throw new Error("Add in invalid state: " + this.invalid_reason);

        let exported = {
            revision: this.revision,
            name: this.name,
            author: this.author || "dotadd.js library",
            description: this.description || "created with the dotadd.js library",
            date: this.date || new Date(Date.now()).toISOString(),
            version: this.version || 1,
            decoder: {
                filter: this.decoder.filter || {},
                matrices: this.decoder.matrices,
                output: this.decoder.output
            }
        }

        exported.serialize = () => {
            return JSON.stringify(exported);
        }

        return exported;
    }

    /**
     * 
     */
    static maxRevision(){
        return DOTADD_MAX_REVSION;
    }
}

ADD.Matrix = Matrix;
ADD.Output = Output;

module.exports = ADD;