var dealerSum = 0;
var dealerAceCount = 0;

var playerSum = 0;
var playerBalance = 100;
var playerAceCount = 0;

var deck;
var hiddenCard;
var canHit = true;
var bet = 0;
var insuranceBet = 0;

function start(amount){
    clear();
    canHit = true;
    bet = amount;
    playerBalance -= bet;

    document.getElementById("bet").style.display = "none";
    document.getElementById("resultScreen").style.display = "none";
    document.getElementById("balance").innerHTML = playerBalance + "$";

    buildDeck();
    shuffle();
    dealFirstHand();
    console.log(deck);
}

function buildDeck(){
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }
    }
}

function shuffle(){
    for(let i = 0; i < deck.length; i++){
        let rand = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[rand];
        deck[rand] = temp;
    }
}


async function dealFirstHand(){
    let hideCard = false;
    
    for(let i = 0; i < 2; i++){
        await sleep(750);
        
        let card = deck.pop();
        playerSum += getValue(card);
        playerAceCount += checkAce(card);
        let image = document.createElement("img");
        image.src = "./cards/" + card + ".png";
        document.getElementById("player-cards").append(image);

        await sleep(750);

        card = deck.pop();
        if(hideCard){
            hiddenCard = card;
            card = "back";
        }
        else{
            dealerSum += getValue(card);
            dealerAceCount += checkAce(card);
        }

        image = document.createElement("img");
        image.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(image);

        hideCard = true;
    }

    updateSum();
    checkFirstHand()
}

function checkFirstHand(){
    if(playerSum == 22){
        playerSum = lowerAce(playerSum, playerAceCount, "player");
    }
    else if(playerSum == 21){
        if(dealerAceCount > 0){
            document.getElementById("insurance").style.display = "block";
        }
        else showCard();
        if(dealerSum < 21){
            endGame(1.5, "Blackjack! You win." + "\n" + "Payout 1.5x.");
        }
    }
    else if(dealerAceCount > 0){
        document.getElementById("insurance").style.display = "block";
    }

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
}

function hit(){
    if(!canHit) return;

    let card = deck.pop();
    playerSum += getValue(card);
    playerAceCount += checkAce(card);
    
    let image = document.createElement("img");
    image.src = "./cards/" + card + ".png";
    document.getElementById("player-cards").append(image);

    if(playerSum == 21 && dealerSum < 21 && dealerSum > 16){
        endGame(2, "You win!" + "\n" + "Payout 2x.")
    }
    else if(playerSum > 21){
        playerSum = lowerAce(playerSum, playerAceCount, "player");
        if(playerSum > 21){
            showCard();
            endGame(0, "Bust! You lose.");
        }
    }
    updateSum();
}

async function stay(){
    canHit = false;
    showCard();

    while(dealerSum < 17){
        await sleep(1000);

        card = deck.pop();
        dealerAceCount += checkAce(card);
        dealerSum += getValue(card);
        dealerSum = lowerAce(dealerSum, dealerAceCount, "");

        let image = document.createElement("img");
        image.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(image);
        updateSum();
    }

    if(dealerSum > 21) endGame(2, "Dealer went bust. You win!" + "\n" + "Payout 2x.");
    else if(playerSum > dealerSum) endGame(2, "You win!" + "\n" + "Payout 2x.");
    else if(playerSum < dealerSum) endGame(0, "You lose!");
    else endGame(1, "Game ends in a tie!" + "\n" + "Payout 1x.");
}

async function endGame(multiplier, text){
    updateSum();
    playerBalance += bet * multiplier;
    document.getElementById("balance").innerHTML = playerBalance + "$";
    
    await sleep(1000);
    document.getElementById("resultScreen").style.display = "flex";
    document.getElementById("result").innerText = text;

    await sleep(3000);
    let lowBalance = await checkBalance();
    if(lowBalance){
        document.getElementById("resultScreen").style.display = "flex";
        document.getElementById("result").innerText = "Balance is too low";
        document.getElementById("buyIn").hidden = false;
        return;
    }

    document.getElementById("resultScreen").style.display = "none";
    document.getElementById("bet").style.display = "block";
}

async function checkBalance(){
    document.getElementById("hundred").disabled = false;
    document.getElementById("twenty").disabled = false;
    
    if(playerBalance < 5) return true;
    
    if(playerBalance < 100){
        document.getElementById("hundred").disabled = true;
        if(playerBalance < 20){
            document.getElementById("twenty").disabled = true;
        }
    }

    return false;
}

function buyIn(){
    playerBalance = 100;
    document.getElementById("balance").innerHTML = playerBalance + "$";
    document.getElementById("resultScreen").style.display = "none";
    document.getElementById("buyIn").hidden = true;
    document.getElementById("bet").style.display = "block";
}

function lowerAce(sum, aceCount, hand){
    while(sum > 21 && aceCount > 0){
        sum -= 10;
        aceCount -= 1;
    }
    hand == "player" ? playerAceCount = aceCount : dealerAceCount = aceCount;

    return sum;
}

function clear(){
    playerSum = 0;
    dealerSum = 0;
    dealerAceCount = 0;
    playerAceCount = 0;
    updateSum();

    document.querySelectorAll("#dealer-cards img").forEach(img => img.remove());
    document.querySelectorAll("#player-cards img").forEach(img => img.remove());
}

function showCard(){
    let image = document.getElementById("dealer-cards").lastChild;
    image.src = "./cards/" + hiddenCard + ".png";

    dealerSum += getValue(hiddenCard);
    dealerAceCount += checkAce(hiddenCard);
    updateSum();
}

function updateSum(){
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("player-sum").innerText = playerSum;
}


function sleep(msec){
    return new Promise(resolve => setTimeout(resolve, msec));
}

async function insurance(bool){
    document.getElementById("insurance").style.display = "none";
    insuranceBet = bet / 2;
    
    if(getValue(hiddenCard) == 10){
        showCard();
        
        if(bool){
            if(playerSum == 21) endGame(1, "Game ends in a tie!" + "\n" + "Payout 1x.");
            else endGame(0, "Dealer has Blackjack! You lose.");
            return;
        }

        playerBalance += insuranceBet;
        document.getElementById("balance").innerHTML = playerBalance + "$";
        document.getElementById("resultScreen").style.display = "flex";
        document.getElementById("result").innerText = "Dealer has Blackjack. You won the insurance bet." + "\n" + "Payout 2x insurance bet.";

        await sleep(3000);
        document.getElementById("resultScreen").style.display = "none";
        
        if(playerSum == 21) endGame(1, "The game ends in a tie!" + "\n" + "Payout 1x.")
        else endGame(0, "Dealer has Blackjack! You lose.")
    }
    else{
        if(bool) return;

        playerBalance -= insuranceBet;
        document.getElementById("balance").innerHTML = playerBalance + "$";
        document.getElementById("resultScreen").style.display = "flex";
        document.getElementById("result").innerText = "Dealer does not have Blackjack. You lost the insurance bet.";

        await sleep(3000);
        document.getElementById("resultScreen").style.display = "none";
    }
}

function getValue(card){
    let data = String(card).split("-");
    if(isNaN(data[0])){
        if(data[0] == "A") return 11;
        return 10;
    }

    return parseInt(data[0]);
}

function checkAce(card){
    if(card[0] == "A") return 1;
    return 0;
}