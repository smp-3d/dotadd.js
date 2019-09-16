/**
 * The dotadd Filter class. Respresents a single filter band.
 */
export declare class Filter {
    /**
     * Construct a new Filterband. At least high or low must be given to construct a valid filter band object
     * @param high beginning of the high frequency stopbband can be null
     * @param low beginning of the high frequency stopbband can be null or omitted
     */
    constructor(high: number, low?: number);
    isLowpass(): boolean;
    isHighpass(): boolean;
    isBandpass(): boolean;
    static fromObject(obj: any): Filter;
    lo: number;
    hi: number;
}
export declare const Normalisation: Readonly<{
    N3D: string;
    SN3D: string;
}>;
export declare const ACN: {
    order(acn: number): number;
    index(acn: number): number;
    acn(order: number, index: number): void;
};
/**
 * The dotadd Matrix class. Is holds the decoding matrix coefficents and a field
 * which specifies the input band it receives audio from
 */
export declare class Matrix {
    input: number;
    normalisation: string;
    matrix: number[][];
    /**
     * Construct a new Matrix.
     * @param {number} input the input band the matrix will receive signal from
     * @param {number[][]} channels an array of array of coefficents for the output channels of the matrix.
     */
    constructor(input: number, normalisation: string, channels: number[][]);
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
    ambisonicOrder(): number;
    setNormalisation(normalisation: string): void;
    getNormalisation(): string;
    renormalizeTo(normalisation: string): this;
    static fromObject(obj: any): Matrix;
}
export declare class AEDCoord {
    a: number;
    e: number;
    d: number;
    constructor(a: number, e: number, d: number);
    hasDistance(): boolean;
}
export declare class OutputChannel {
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
    static fromObject(obj: any): OutputChannel;
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
            channels: OutputChannel[];
            matrix: number[][];
        };
    };
    private _set;
    private validateProp;
    private assign_if_valid;
    private assign_if_valid_recurse;
    constructor();
    constructor(add?: string);
    export(): {
        name: string;
        description: string;
        author: string;
        date: string;
        revision: number;
        version: number;
        decoder: {
            filter: Filter[];
            matrices: {
                normalisation: string;
                input: number;
                matrix: number[][];
            }[];
            output: {
                channels: OutputChannel[];
                matrix: number[][];
            };
        };
        serialize(): string;
    };
    setAuthor(author: string): ADD;
    setName(name: string): ADD;
    setDescription(desc: string): ADD;
    setDate(date: string | Date): ADD;
    setVersion(version: number): ADD;
    valid(): boolean;
    addMatrix(mat: Matrix): void;
    addFilter(flt: Filter): void;
    addOutput(out: OutputChannel, gain?: number, index?: number): void;
    maxAmbisonicOrder(): number;
    totalMatrixOutputs(): number;
    maxMatrixOutputs(): number;
    createDefaultOutputs(): void;
    createDefaultSummedOutputs(): void;
}
//# sourceMappingURL=dotadd.d.ts.map