class Card {
    constructor(value, type){
        this.value = value;
        this.type = type;
    }

    getValue(){
        if(isNaN(this.value)){
            if(this.value == "A") return 11;
            return 10;
        }
        return parseInt(this.value);
    }

    getType(){
        return this.type;
    }

    getImageName(back = false){
        if(back) return "back";
        return this.value + "-" + this.type;
    }

    checkAce(){
        return this.value == "A" ? 1 : 0
    }
}