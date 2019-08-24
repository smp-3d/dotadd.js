const DOTADD_MAX_REVSION = 0;


class DotAdd {

    /**
     * 
     * @param {String|Object} dotadd_f The dotadd file either as raw String or as Object. 
     */
    constructor(dotadd_f){

        if(dotadd_f instanceof String)
            dotadd_f = JSON.parse(dotadd_f);

        Object.assign(this, dotadd_f);

        if(!this.valid()) throw new Error("invalid .add file: " + this.invalid_reason);
    }

    /**
     * @returns true if the file is valid
     */
    valid(){

        if(!this.name || !this.description || !this.author){
            this.invalid_reason = "Missing Data";
            return false;
        }

        this.invalid_reason = "nooo";
        return false;
    }

    /**
     * 
     */
    isRevisionSupported(){
        return this.revision <= maxRevision();
    }

    /**
     * 
     */
    static maxRevision(){
        return DOTADD_MAX_REVSION;
    }
}

module.exports = DotAdd;