/**
 * Maximum supported file revision for this library
 */
const DOTADD_MAX_REVSION = 0;

class ADD {

    /**
     * Construct a new Ambisonic Decoder Description. Can be constructed from an Object or a String. 
     * A null parameter constructs an invalid empty ADD.
     * @param {String|Object} add The ADD either as raw String or as Object. 
     */
    constructor(add) {

        if (!(add)) {
            this.revision = DOTADD_MAX_REVSION;
            return;
        }

        if (add instanceof String)
            add = JSON.parse(add);

        Object.assign(this, add);

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

        return true;
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
     * 
     */
    isRevisionSupported(){
        return this.revision <= ADD.maxRevision();
    }

    /**
     * Export the ADD to a serializable javascript Object.
     */
    export(){

        this.prop = "string";

        if(!this.valid())
            throw new Error("Add in invalid state: " + this.invalid_reason);

        let exported = {
            name: this.name,
            author: this.author || "dotadd.js library",
            description: this.description || "created with the dotadd.js library",
            date: this.date || new Date(Date.now()).toISOString(),
            version: this.version || 1,
        }

        exported.toString = () => {
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

module.exports = ADD;