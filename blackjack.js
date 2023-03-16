var dealerSum = 0;
var dealerAceCount = 0;

var playerSum = 0;
var playerBalance = 100;
var playerAceCount = 0;

var deck;
var dealerHiddenCard;
var playerHiddenCard;
var canHit = true;
var isDoubleDown = false;
var bet = 0;
var insuranceBet = 0;

var insuranceMsg = "The dealer shows an Ace." + "\n" + "You are now allowed to place an insurance bet amounting to half of your original bet if you believe the dealer has Blackjack.";
var insBlackJack = "Dealer has Blackjack. You won the insurance bet." + "\n" + "Payout 2x insurance bet.";
var insNoBlackJack = "Dealer does not have Blackjack. You lost the insurance bet.";
var dealerBustMsg = "Dealer went bust. You win!" + "\n" + "Payout 2x.";
var winMsg = "You win!" + "\n" + "Payout 2x.";
var winDdMsg = "You win!" + "\n" + "Payout 4x original bet.";
var loseMsg = "You lose!";
var tieMsg = "Game ends in a tie!" + "\n" + "Bet is returned";

function start(amount){
    clear();
    canHit = true;
    bet = amount;
    playerBalance -= bet;

    document.getElementById("overlay").style.display = "none";
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
            dealerHiddenCard = card;
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
    checkFirstHand()
}

function checkFirstHand(){
    if(playerSum == 22){
        playerSum = lowerAce(playerSum, playerAceCount, "player");
    }
    else if(playerSum == 21){
        if(dealerAceCount > 0){
            toggleOverlay("insurance", insuranceMsg);
        }
        else showCard();
        
        if(dealerSum < 21){
            endGame(1.5, "Blackjack! You win." + "\n" + "Payout 1.5x.");
        }
    }
    else if(playerSum == 9 || playerSum == 10 || playerSum == 11){
        if(dealerAceCount > 0){
            toggleOverlay("insurance", insuranceMsg);
        }
        document.getElementById("doubleDown").disabled = false;
    }
    else if(dealerAceCount > 0){
        toggleOverlay("insurance", insuranceMsg);
    }

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("doubleDown").addEventListener("click", doubleDown);
    updateSum();
}

function toggleOverlay(overlay, message, change = false){
    //If change == true, don't disable visible overlay - change it instead
    if(document.getElementById("overlay").style.display == "flex" && !change){
        document.getElementById("overlay").style.display = "none";
        return;
    }

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("message").innerText = message;
    
    if(overlay == "bet"){
        let buttons = document.getElementById("buttons").children;
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className == "insBtns" || buttons[i].id == "buyIn"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay == "insurance"){
        let buttons = document.getElementById("buttons").children;
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className == "betBtns" || buttons[i].id == "buyIn"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay == "buyIn"){
        let buttons = document.getElementById("buttons").children;
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className == "betBtns" || buttons[i].className == "insBtns"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay == "result"){
        let buttons = document.getElementById("buttons").children;
        for(let i = 0; i < buttons.length; i++){
            buttons[i].hidden = true;
        }
    }
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

    dealerSum = lowerAce(dealerSum, dealerAceCount);
    while(dealerSum < 17){
        updateSum();
        await sleep(750);

        let card = deck.pop();
        dealerAceCount += checkAce(card);
        dealerSum += getValue(card);
        dealerSum = lowerAce(dealerSum, dealerAceCount, "");

        let image = document.createElement("img");
        image.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(image);
    }

    updateSum();
    await sleep(750);
    if(isDoubleDown){
        let image = document.getElementById("player-cards").lastChild;
        image.src = "./cards/" + playerHiddenCard + ".png";
    
        return;
    }

    if(dealerSum > 21) endGame(2, dealerBustMsg);
    else if(playerSum > dealerSum) endGame(2, winMsg);
    else if(playerSum < dealerSum) endGame(0, loseMsg);
    else endGame(1, tieMsg);
}

async function doubleDown(){
    canHit = false;
    isDoubleDown = true;
    playerBalance -= bet;
    document.getElementById("balance").innerHTML = playerBalance + "$";

    playerHiddenCard = deck.pop();

    let image = document.createElement("img");
    image.src = "./cards/back.png";
    document.getElementById("player-cards").append(image);

    await sleep(750);
    await stay();

    playerAceCount += checkAce(playerHiddenCard);
    playerSum += getValue(playerHiddenCard);
    playerSum = lowerAce(playerSum, playerAceCount, "");

    if(dealerSum > 21) endGame(4, winDdMsg);
    else if(playerSum > dealerSum) endGame(4, winDdMsg);
    else if(playerSum == dealerSum) endGame(2, tieMsg);
    else endGame(0, loseMsg);
}

async function endGame(multiplier, message){
    canHit = false;
    updateSum();
    playerBalance += bet * multiplier;
    document.getElementById("balance").innerHTML = playerBalance + "$";
    
    await sleep(1000);
    toggleOverlay("result", message)

    await sleep(3000);
    let lowBalance = await checkBalance();
    if(lowBalance){
        toggleOverlay("buyIn", "Balance is too low", true)
        return;
    }

    toggleOverlay("bet", "Choose amount to bet:", true);
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
    toggleOverlay("bet", "Choose amount to bet:", true)
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
    image.src = "./cards/" + dealerHiddenCard + ".png";

    dealerSum += getValue(dealerHiddenCard);
    dealerAceCount += checkAce(dealerHiddenCard);
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
    toggleOverlay("insurance", "")
    insuranceBet = bet / 2;
    
    if(getValue(dealerHiddenCard) == 10){
        showCard();
        
        if(bool){
            if(playerSum == 21) endGame(1, "Game ends in a tie!" + "\n" + "Payout 1x.");
            else endGame(0, "Dealer has Blackjack! You lose.");
            return;
        }

        playerBalance += insuranceBet;
        document.getElementById("balance").innerHTML = playerBalance + "$";
        toggleOverlay("result", insBlackJack)

        await sleep(3000);
        toggleOverlay();
        
        if(playerSum == 21) endGame(1, "The game ends in a tie!" + "\n" + "Payout 1x.")
        else endGame(0, "Dealer has Blackjack! You lose.")
    }
    else{
        if(bool) return;

        playerBalance -= insuranceBet;
        document.getElementById("balance").innerHTML = playerBalance + "$";
        toggleOverlay("result", insNoBlackJack);

        await sleep(3000);
        toggleOverlay();
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