export declare class Filter {
    constructor(high: number, low: number);
    isLowpass(): boolean;
    isHighpass(): boolean;
    isBandpass(): boolean;
    static fromObject(obj: any): Filter;
    lo: number;
    hi: number;
}
/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
 * which specifies the input band it receives audio from
 */
export declare class Matrix {
    input: number;
    matrix: number[][];
    /**
     * Construct a new Matrix.
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(input: number, channels: number[][]);
    /**
     * Set the input band the Matrix will receive signal from
     * @param {Number} input
     */
    setInput(input: number): void;
    /**
     * @returns {Number} the input channel this Matrix will receive signal from
     */
    getInput(): number;
    /**
     * @returns {Number} the input number of coeffs for each channel
     */
    numCoeffs(): number;
    /**
     * @returns the number of channels in the matrix
     */
    numChannels(): number;
    /**
     * set the coefficents for a channels in the Matrix
     * @param {Number} chan the channel number to set
     * @param {Array<Number>} coeffs an array of coefficents
     */
    setCoeffsForChannel(chan: number, coeffs: number[]): void;
    /**
 * get the coefficents for a channel in the Matrix
 * @param {number} chan the channel number
 * @returns {number[]} an array of coefficents
 */
    getCoeffsForChannel(chan: number): number[];
    static fromObject(obj: any): Matrix;
}
export declare class AEDCoord {
    a: number;
    e: number;
    d: number;
    constructor(a: number, e: number, d: number);
    hasDistance(): boolean;
}
export declare class Output {
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
    constructor(name: string, type: string, options?: {
        description?: string;
        coords?: AEDCoord;
    });
}
export declare class ADD {
    revision: number;
    name: string;
    author: string;
    description: string;
    date: string;
    version: number;
    decoder: {
        filter: Filter[];
        matrices: Matrix[];
        output: {
            channels: Output[];
            matrix: number[][];
        };
    };
    private validateProp;
    private assign_if_valid;
    private assign_if_valid_recurse;
    constructor();
    constructor(add?: string);
}
//# sourceMappingURL=dotadd.d.ts.map