export class Filter {

    constructor(high: number, low: number)
    {
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

    static fromObject(obj: any) {
        return new Filter(obj.hi, obj.lo);
    }

    lo: number;
    hi: number;
}


/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field 
 * which specifies the input band it receives audio from
 */
export class Matrix {

    input: number;
    matrix: number[][];

    /**
     * Construct a new Matrix. 
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(input: number, channels: number[][]) {

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
    setInput(input: number) {
        this.input = input;
    }

    /**
     * @returns {Number} the input channel this Matrix will receive signal from
     */
    getInput(): number {
        return this.input;
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

    static fromObject(obj: any): Matrix {
        return new Matrix(obj.input, obj.matrix);
    }
}


export class AEDCoord {

    a: number;
    e: number;
    d: number;

    constructor(a: number, e: number, d: number) {
        this.a = a;
        this.e = e;
        this.d = d;
    }

    hasDistance(): boolean {
        return this.d != null;
    }
}

export class Output {

    /**
     * name of the output
     */
    name: string;

    /**
     * short description for the output
     */
    description: string;

    /**
     * type of output, e.g. 'spk', 'sub', 'stereo-submix'
     */
    type: string;

    /**
     * 
     */
    coords: AEDCoord;

    constructor(name: string, type: string, options?: {description?: string, coords?:AEDCoord}){

        this.name = name;
        this.type = type;

        if(options){
            this.description = options.description;
            this.coords = options.coords;
        }
    }
}

export class ADD {


    revision: number;
    name: string;
    author: string;
    description: string;
    date: string;
    version: number;
    decoder: {
        filter: Filter[],
        matrices: Matrix[],
        output: {
            channels: Output[],
            matrix: number[][]
        }
    };

    private assignIfExists(from: Object, type: string, ...prop: string[]){
        let to = this;
        this.assignIfExistsRecurse(to, from, type, prop);

    }

    private assignIfExistsRecurse(me: Object, from: Object, type: string, props: string[]){
        if(props.length === 1){
            if(from.hasOwnProperty(props[0]) && typeof from[props[0]] == type)
                me[props[0]] == from[props[0]];

        } else {

            let nextp = props.shift();

            if(from.hasOwnProperty(nextp) && typeof from[nextp] == 'object'){

                if(!me.hasOwnProperty(nextp))
                    me[nextp] = {};

                this.assignIfExistsRecurse(me[nextp], from[nextp], type, props);

            }
        }
    }


    constructor();
    constructor(add?: string);
    constructor(add?: any){

        let pobj = {};

        if(!(add))
            return;
        else if(typeof add == 'string' || add instanceof String)
            pobj = JSON.parse(add.toString());
        else if (add instanceof Object)
            pobj = add;

        this.assignIfExists(pobj, 'number', 'revision');
        this.assignIfExists(pobj, 'string', 'name');
        this.assignIfExists(pobj, 'string', 'author');
        this.assignIfExists(pobj, 'string', 'description');
        this.assignIfExists(pobj, 'string', 'date');
        this.assignIfExists(pobj, 'number', 'version');
        this.assignIfExists(pobj, 'object', 'decoder', 'filter');
    }

}