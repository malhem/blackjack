const player = new Player();
const dealer = new Dealer();
const deck = new Deck();

var canHit = true;
var isDoubleDown = false;
var isSplit = false;
var onSecondHand = false;
var bet = 0;
var insuranceBet = 0;
var overlapCount = 0;

let gameButtons = document.getElementById("gameButtons");
gameButtons.onclick = function(event){
    switch(event.target.id){
        case "hit": hit();
        break;
        case "stay": stay();
        break;
        case "doubleDown": doubleDown();
        break;
        case "split": split();
        break;
    }
}

function start(amount){
    bet = amount;
    player.setBalance(-bet);

    deck.build();
    newGame();
}

async function dealFirstHand(){
    let hideCard = false;
    
    for(let i = 0; i < 2; i++){
        await sleep(750);
        
        let card = deck.pop();
        player.addToSum(card.getValue());
        player.addToAceCount(card.checkAce());
        player.setHand(card, i);
        
        let image = await createImage(card.getImageName());
        if(i === 0) image.style.marginLeft = "0%";
        document.getElementById("player-cards").append(image);

        await sleep(750);

        card = deck.pop();
        if(hideCard){
            dealer.setHiddenCard(card);
        }
        else{
            dealer.addToSum(card.getValue());
            dealer.addToAceCount(card.checkAce());
        }

        image = await createImage(card.getImageName(hideCard));
        if(i === 0) image.style.marginLeft = "0%";
        document.getElementById("dealer-cards").append(image);

        hideCard = true;
    }
    console.log(deck);
    checkFirstHand();
}

function checkFirstHand(){
    let playerSum = player.getSum();
    let playerBalance = player.getBalance();

    if(playerSum === 22){
        let lowerSum = lowerAce(player.getSum(), player.getAceCount(), "player");
        player.setSum(lowerSum)
    }
    else if(playerSum === 21){
        if(dealer.getAceCount() > 0){
            toggleOverlay("insurance", insuranceMsg);
        }
        else showCard();
        
        if(dealer.getSum() < 21){
            endGame(1.5, blackjackMsg);
        }
    }
    else if((playerSum === 9 || playerSum === 10 || playerSum === 11) && playerBalance >= bet){
        if(dealer.getAceCount() > 0){
            toggleOverlay("insurance", insuranceMsg);
        }
        document.getElementById("doubleDown").disabled = false;
    }
    else if(dealer.getAceCount() > 0){
        toggleOverlay("insurance", insuranceMsg);
    }

    let playerHand = player.getHand();
    console.log(playerHand[0].getValue());
    console.log(playerHand[1].getValue());
    if(playerHand[0].getValue() === playerHand[1].getValue() && playerBalance >= bet){
        document.getElementById("split").disabled = false;
    }

    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
}

async function hit(){
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("split").disabled = true;

    if(!canHit) return;
    if(onSecondHand){
        hitSecondHand();
        return;
    }

    let card = deck.pop();
    player.addToSum(card.getValue());
    player.addToAceCount(card.checkAce());
    
    let image = await createImage(card.getImageName());
    document.getElementById("player-cards").append(image);

    if(player.getSum() === 21 && dealer.getSum() < 21 && dealer.getSum() > 16){
        endGame(2, winMsg)
    }
    else if(player.getSum() > 21){
        let playerSum = lowerAce(player.getSum(), player.getAceCount(), "player");
        player.setSum(playerSum);
        console.log(player.getSum());
        if(player.getSum() > 21){
            if(isSplit) playSecondHand();
            else{
                showCard();
                endGame(0, bustMsg);
            }
        }
    }
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
    dealer.setSum(lowerAce(dealer.getSum(), dealer.getAceCount()));

    while(dealer.getSum() < 17){
        await sleep(750);

        let card = deck.pop();
        dealer.addToAceCount(card.checkAce());
        dealer.addToSum(card.getValue());
        dealer.setSum(lowerAce(dealer.getSum(), dealer.getAceCount(), ""));

        let image = await createImage(card.getImageName());
        document.getElementById("dealer-cards").append(image);
    }

    if(onSecondHand){
        checkHands();
        return;
    }

    if(isDoubleDown){
        await sleep(750);
        let image = document.getElementById("player-cards").lastChild;
        image.src = "./cards/" + player.getHiddenCard().getImageName() + ".png";
        return;
    }

    if(dealer.getSum() > 21) endGame(2, dealerBustMsg);
    else if(player.getSum() > dealer.getSum()) endGame(2, winMsg);
    else if(player.getSum() < dealer.getSum()) endGame(0, loseMsg);
    else endGame(1, tieMsg);
}

async function doubleDown(){
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("split").disabled = true;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    canHit = false;
    isDoubleDown = true;
    player.setBalance(-bet);

    player.setHiddenCard(deck.pop());

    let image = await createImage("back");
    document.getElementById("player-cards").append(image);

    await sleep(750);
    await stay();

    player.addToAceCount(player.getHiddenCard().checkAce());
    player.addToSum(player.getHiddenCard().getValue());
    player.setSum(lowerAce(player.getSum(), player.getAceCount(), ""));

    if(dealer.getSum() > 21) endGame(4, winDdMsg);
    else if(player.getSum() > dealer.getSum()) endGame(4, winDdMsg);
    else if(player.getSum() === dealer.getSum()) endGame(2, tieMsg);
    else endGame(0, loseMsg);
}

function split(){
    isSplit = true;

    document.getElementById("split").disabled = true;
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("player-cards").firstChild.remove();
    document.getElementById("player-cards").style.marginRight = "-30%";
    document.getElementById("player-cards").style.marginLeft = "15%";

    player.setBalance(-bet);

    let splitCard = player.getHand()[0];
    let mainCard = player.getHand()[1];

    if(splitCard.getValue() === "A" && mainCard.getValue() === "A"){
        player.setSum(11);
        player.setSum(11, true);
        player.setAceCount(1);
        player.setAceCount(1, true);
    }
    else{
        player.addToSum(-splitCard.getValue());
        player.setAceCount(-splitCard.checkAce());
        player.addToSum(splitCard.getValue(), true);
        player.setAceCount(splitCard.checkAce(), true);
    }

    let image = document.createElement("img");
    image.src = "./cards/" + splitCard.getImageName() + ".png";
    document.getElementById("splitHolder").append(image);
}

function playSecondHand(){
    isSplit = false;
    onSecondHand = true;
    document.querySelectorAll("#player-cards img").forEach(img => img.style.opacity = "0.5");
}

async function hitSecondHand(){
    let card = deck.pop();
    player.addToSum(card.getValue(), true);
    player.addToAceCount(card.checkAce(), true);

    let image = await createImage(card.getImageName());
    document.getElementById("splitHolder").append(image);

    if(player.getSum(true) === 21 && dealer.getSum() < 21 && dealer.getSum() > 16){
        checkHands();
    }
    else if(player.getSum(true) > 21){
        let lowerSplitSum = lowerAce(player.getSum(true), player.getAceCount(true), "playerSplit");
        player.setSum(lowerSplitSum, true);
        
        if(player.getSum(true) > 21){
            if(dealer.getSum() < 17){
                stay();
            }
            else{
                showCard();
                checkHands();
            }
        }
    }
}

function checkHands(){
    let playerSum = player.getSum();
    let playerSplitSum = player.getSum(true);
    let dealerSum = dealer.getSum();

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
    else if(dealerSum === 21){
        if(playerSum === 21){
            if(playerSplitSum === 21) endGame(2, tieBothMsg);
            else endGame(1, tieOneMsg);
        }
        else{
            if(playerSplitSum === 21) endGame(1, tieOneMsg);
            else endGame(0, loseBothMsg);
        }
    }
    else{
        if(playerSum >= dealerSum && playerSum <= 21){
            if(playerSplitSum > dealerSum && playerSplitSum <= 21) endGame(4, winBothMsg);
            else if(playerSplitSum === dealerSum) endGame(3, winTieMsg);
            else if(playerSum === dealerSum) endGame(1, tieOneMsg);
            else endGame(2, winOneMsg);
        }
        else{
            if(playerSplitSum >= dealerSum && playerSplitSum <= 21){
                if(playerSum > dealerSum && playerSum <= 21) endGame(4, winBothMsg);
                else if(playerSum === dealerSum) endGame(3, winTieMsg);
                else if(playerSplitSum === dealerSum) endGame(1, tieOneMsg);
                else endGame(2, winOneMsg);
            }
            else endGame(0, loseBothMsg);
        }
    }
}

async function insurance(bool){
    toggleOverlay("insurance", "")
    insuranceBet = bet / 2;
    
    if(dealer.getHiddenCard().getValue() === 10){
        showCard();
        
        if(bool){
            if(player.getSum() === 21) endGame(1, "Game ends in a tie!" + "\n" + "Payout 1x.");
            else endGame(0, "Dealer has Blackjack! You lose.");
            return;
        }

        player.setBalance(insuranceBet);
        toggleOverlay("result", insBlackJack)

        await sleep(3000);
        toggleOverlay();
        
        if(player.getSum() === 21) endGame(1, "The game ends in a tie!" + "\n" + "Payout 1x.")
        else endGame(0, "Dealer has Blackjack! You lose.")
    }
    else{
        if(bool) return;

        player.setBalance(-insuranceBet);
        toggleOverlay("result", insNoBlackJack);

        await sleep(3000);
        toggleOverlay();
    }
}

async function checkBalance(){
    document.getElementById("hundred").disabled = false;
    document.getElementById("twenty").disabled = false;
    let balance = player.getBalance();
    
    if(balance < 5) return true;
    
    if(balance < 100){
        document.getElementById("hundred").disabled = true;
        if(balance < 20){
            document.getElementById("twenty").disabled = true;
        }
    }

    return false;
}

function buyIn(){
    player.setBalance(100);
    toggleOverlay("bet", "Choose amount to bet:", true)
}

function lowerAce(sum, aceCount, hand){
    while(sum > 21 && aceCount > 0){
        sum -= 10;
        aceCount -= 1;
    }

    if(hand === "player") player.setAceCount(aceCount);
    else if(hand === "playerSplit") player.setAceCount(aceCount, true);
    else dealer.setAceCount(aceCount);
    
    return sum;
}

function showCard(){
    let image = document.getElementById("dealer-cards").lastChild;
    let card = dealer.getHiddenCard();
    image.src = "./cards/" + card.getImageName() + ".png";

    dealer.addToSum(card.getValue());
    dealer.addToAceCount(card.checkAce());
}

async function createImage(cardName){
    let image = document.createElement("img");
    image.src = "./cards/" + cardName + ".png";
    overlapCount++;
    image.style.zIndex = overlapCount;
    image.style.marginLeft = "-30%"

    return image;
}

function toggleOverlay(overlay, message, change = false){
    //If change === true, don't disable visible overlay - change it instead
    if(document.getElementById("overlay").style.display === "flex" && !change){
        document.getElementById("overlay").style.display = "none";
        return;
    }
    
    let buttons = document.getElementById("overlayButtons").children;
    if(overlay === "bet"){
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className === "insBtns" || buttons[i].id === "buyIn"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay === "insurance"){
        let bool;
        player.getBalance() < insuranceBet ? bool = true : bool = false;
        document.getElementById("insuranceBet").disabled = bool;

        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className === "betBtns" || buttons[i].id === "buyIn"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay === "buyIn"){
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].className === "betBtns" || buttons[i].className === "insBtns"){
                buttons[i].hidden = true;
            }
            else{
                buttons[i].hidden = false;
            }
        }
    }
    else if(overlay === "result"){
        for(let i = 0; i < buttons.length; i++){
            buttons[i].hidden = true;
        }
    }

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("message").textContent = message;
}

function newGame(){
    player.setSum(0);
    player.setSum(0, true);
    player.setAceCount(0);
    player.setAceCount(0, true);
    dealer.setSum(0);
    dealer.setAceCount(0);
    canHit = true;
    isDoubleDown = false;
    isSplit = false;
    onSecondHand = false;

    document.getElementById("player-cards").style.marginRight = "-5%";
    document.getElementById("player-cards").style.marginLeft = "0";
    document.querySelectorAll("#dealer-cards img").forEach(img => img.remove());
    document.querySelectorAll("#player-cards img").forEach(img => img.remove());
    document.querySelectorAll("#splitHolder img").forEach(img => img.remove());
    document.getElementById("overlay").style.display = "none";

    dealFirstHand();
}

async function endGame(multiplier, message){
    console.log(player.getSum());
    console.log(player.getSum(true));
    canHit = false;
    player.setBalance(bet * multiplier);
    
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

function sleep(msec){
    return new Promise(resolve => setTimeout(resolve, msec));
}