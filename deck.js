class Deck {
    constructor(){
        this.deck;
        this.build();
    }

    build(){
        const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const types = ["C", "D", "H", "S"];
        this.deck = [];

        for (let i = 0; i < types.length; i++) {
            for (let j = 0; j < values.length; j++) {
                const card = new Card(values[j], types[i]);
                this.deck.push(card);
            }
        }
        
        this.shuffle();
    }

    shuffle(){
        for(let i = 0; i < this.deck.length; i++){
            let rand = Math.floor(Math.random() * this.deck.length);
            let temp = this.deck[i];
            this.deck[i] = this.deck[rand];
            this.deck[rand] = temp;
        }
    }

    pop(){
        return this.deck.pop();
    }
}