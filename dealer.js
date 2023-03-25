class Dealer {
    constructor(){
        this.sum = 0;
        this.aceCount = 0;
        this.hiddenCard;
    }

    addToSum(num){
        this.sum += num;
        document.getElementById("dealer-sum").textContent = this.sum;
    }

    setSum(num){
        this.sum = num;
        document.getElementById("dealer-sum").textContent = this.sum;
    }

    getSum(){
        return this.sum;
    }

    addToAceCount(num){
        this.aceCount += num;
    }

    setAceCount(num){
        this.aceCount = num;
    }

    getAceCount(){
        return this.aceCount;
    }

    setHiddenCard(card){
        this.hiddenCard = card;
    }

    getHiddenCard(){
        return this.hiddenCard;
    }
}