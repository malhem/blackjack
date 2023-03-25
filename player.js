class Player {
    constructor(){
        this.hand = [];
        this.balance = 100;
        this.sum = 0;
        this.splitSum = 0;
        this.aceCount = 0;
        this.splitAceCount = 0;
        this.hiddenCard;
    }

    setHand(card){
        this.hand.push(card);
    }

    getHand(){
        return this.hand;
    }

    setBalance(amount){
        if(this.balance + amount < 0) return false;
        
        this.balance += amount;
        document.getElementById("balance").textContent = this.balance + "$";
        return true;
    }

    getBalance(){
        return this.balance;
    }

    addToSum(num, split = false){
        if(split) this.splitSum += num;
        else this.sum += num;

        document.getElementById("player-sum").textContent = this.sum;
    }

    setSum(num, split = false){
        if(split) this.splitSum = num;
        else this.sum = num;

        document.getElementById("player-sum").textContent = this.sum;
    }

    getSum(split = false){
        if(split) return this.splitSum;
        return this.sum;
    }

    addToAceCount(num, split = false){
        if(split) this.splitAceCount += num;
        else this.aceCount += num;
    }

    setAceCount(num, split = false){
        if(split) this.splitAceCount = num;
        else this.aceCount = num;
    }

    getAceCount(split = false){
        if(split) return this.splitAceCount;
        return this.aceCount;
    }

    setHiddenCard(card){
        this.hiddenCard = card;
    }

    getHiddenCard(){
        return this.hiddenCard;
    }

}