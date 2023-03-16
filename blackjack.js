var dealerSum = 0;
var dealerAceCount = 0;
var dealerHiddenCard;

var playerSum = 0;
var playerSplitSum = 0;
var playerAceCount = 0;
var playerSplitAceCount = 0;
var playerBalance = 100;
var playerHiddenCard;
var playerHand = [];

var canHit = true;
var isDoubleDown = false;
var isSplit = false;
var onSecondHand = false;
var bet = 0;
var insuranceBet = 0;
var deck;

function start(amount){
    reset();
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
        playerHand[i] = card;
        
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
    if(playerHand[0].split("-")[0] == playerHand[1].split("-")[0]){
        document.getElementById("split").disabled = false;
    }

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
    document.getElementById("split").addEventListener("click", split);
    updateSum();
}

function split(){
    isSplit = true;

    document.getElementById("split").disabled = true;
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("player-cards").firstChild.remove();
    document.getElementById("player-cards").style.marginRight = "-15%";
    document.getElementById("player-cards").style.marginLeft = "15%";

    playerBalance -= bet;
    document.getElementById("balance").innerHTML = playerBalance + "$";

    let splitCard = playerHand[0];
    playerSum -= getValue(splitCard);
    playerAceCount -= checkAce(splitCard);
    playerSplitSum += getValue(splitCard);
    playerSplitAceCount += checkAce(splitCard);
    updateSum();
    
    let image = document.createElement("img");
    image.src = "./cards/" + splitCard + ".png";
    document.getElementById("splitHolder").append(image);
}

function toggleOverlay(overlay, message, change = false){
    //If change == true, don't disable visible overlay - change it instead
    if(document.getElementById("overlay").style.display == "flex" && !change){
        document.getElementById("overlay").style.display = "none";
        return;
    }
    
    let buttons = document.getElementById("overlayButtons").children;
    if(overlay == "bet"){
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
        for(let i = 0; i < buttons.length; i++){
            buttons[i].hidden = true;
        }
    }

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("message").innerText = message;
}

function hit(){
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("split").disabled = true;

    if(!canHit) return;
    if(onSecondHand){
        hitSecondHand();
        return;
    }

    let card = deck.pop();
    playerSum += getValue(card);
    playerAceCount += checkAce(card);
    
    let image = document.createElement("img");
    image.src = "./cards/" + card + ".png";
    document.getElementById("player-cards").append(image);

    if(playerSum == 21 && dealerSum < 21 && dealerSum > 16){
        endGame(2, winMsg)
    }
    else if(playerSum > 21){
        playerSum = lowerAce(playerSum, playerAceCount, "player");
        if(playerSum > 21){
            if(isSplit) playSecondHand();
            else{
                showCard();
                endGame(0, bustMsg);
            }
        }
    }
    updateSum();
}

function checkHands(){
    if(dealerSum > 21){
        if(playerSum <= 21){
            if(playerSplitSum <= 21) endGame(4, winBothMsg);
            else endGame(2, winOneMsg);
        }
        else{
            if(playerSplitSum <= 21) endGame(2, winOneMsg);
            else endGame(0, loseBothMsg);
        }
    }
    else if(dealerSum == 21){
        if(playerSum == 21){
            if(playerSplitSum == 21) endGame(2, tieBothMsg);
            else endGame(1, tieOneMsg);
        }
        else{
            if(playerSplitSum == 21) endGame(1, tieOneMsg);
            else endGame(0, loseBothMsg);
        }
    }
    else{
        if(playerSum > dealerSum && playerSum <= 21){
            if(playerSplitSum > dealerSum && playerSplitSum <= 21) endGame(4, winBothMsg);
            else if(playerSplitSum == dealerSum) endGame(3, winTieMsg);
            else endGame(2, winOneMsg);
        }
        else{
            if(playerSplitSum > dealerSum && playerSplitSum <= 21){
                if(playerSum > dealerSum && playerSum <= 21) endGame(4, winBothMsg);
                else if(playerSum == dealerSum) endGame(3, winTieMsg);
                else endGame(2, winOneMsg);
            }
            else endGame(0, loseBothMsg);
        }
    }
}

function hitSecondHand(){
    let card = deck.pop();
    playerSplitSum += getValue(card);
    playerSplitAceCount += checkAce(card);

    let image = document.createElement("img");
    image.src = "./cards/" + card + ".png";
    document.getElementById("splitHolder").append(image);

    if(playerSplitSum == 21 && dealerSum < 21 && dealerSum > 16){
        checkHands();
    }
    else if(playerSplitSum > 21){
        playerSplitSum = lowerAce(playerSplitSum, playerSplitAceCount, "playerSplit")

        if(dealerSum < 17){
            stay();
        }
        else if(playerSplitSum > 21){
            showCard();
            checkHands();
        }
    }
    updateSum();
}

async function stay(){
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("split").disabled = true;

    if(isSplit){
        playSecondHand();
        return;
    }

    canHit = false;
    showCard();

    dealerSum = lowerAce(dealerSum, dealerAceCount);
    updateSum();
    while(dealerSum < 17){
        await sleep(750);

        let card = deck.pop();
        dealerAceCount += checkAce(card);
        dealerSum += getValue(card);
        dealerSum = lowerAce(dealerSum, dealerAceCount, "");

        let image = document.createElement("img");
        image.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(image);
        updateSum();
    }

    if(onSecondHand){
        checkHands();
        return;
    }

    if(isDoubleDown){
        await sleep(750);
        let image = document.getElementById("player-cards").lastChild;
        image.src = "./cards/" + playerHiddenCard + ".png";
        return;
    }

    if(dealerSum > 21) endGame(2, dealerBustMsg);
    else if(playerSum > dealerSum) endGame(2, winMsg);
    else if(playerSum < dealerSum) endGame(0, loseMsg);
    else endGame(1, tieMsg);
}

function playSecondHand(){
    isSplit = false;
    onSecondHand = true;
    document.querySelectorAll("#player-cards img").forEach(img => img.style.opacity = "0.5");
    updateSum();
}

async function doubleDown(){
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("split").disabled = true;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

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
    toggleOverlay("result", message, true);

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
    //hand == "player" ? playerAceCount = aceCount : dealerAceCount = aceCount;

    if(hand == "player") playerAceCount = aceCount;
    else if(hand == "playerSplit") playerSplitAceCount = aceCount;
    else dealerAceCount = aceCount
    
    return sum;
}

function reset(){
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
    
    playerSum = 0;
    playerSplitSum = 0;
    playerAceCount = 0;
    playerSplitAceCount = 0;
    dealerSum = 0;
    dealerAceCount = 0;
    canHit = true;
    isDoubleDown = false;
    isSplit = false;
    onSecondHand = false;
    updateSum();

    document.getElementById("player-cards").style.marginRight = "0";
    document.getElementById("player-cards").style.marginLeft = "0";
    document.querySelectorAll("#dealer-cards img").forEach(img => img.remove());
    document.querySelectorAll("#player-cards img").forEach(img => img.remove());
    document.querySelectorAll("#splitHolder img").forEach(img => img.remove());
}

function showCard(){
    let image = document.getElementById("dealer-cards").lastChild;
    image.src = "./cards/" + dealerHiddenCard + ".png";

    dealerSum += getValue(dealerHiddenCard);
    dealerAceCount += checkAce(dealerHiddenCard);
    updateSum();
}

function updateSum(){
    var text;
    if(onSecondHand || isSplit) text = playerSplitSum + " & " + playerSum;
    else text = playerSum;

    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("player-sum").innerText = text;
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