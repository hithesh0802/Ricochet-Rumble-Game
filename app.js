let gameBoard =document.getElementById('gameboard');
const playerDisplay= document.querySelector('#player');
const infoDisplay= document.getElementById('info-display');
const width=8;
let playerGo= "black";
let hi;
let isBotMode=false;
if(!isBotMode)
    hi='Blue'
else
    hi='Bot';
playerDisplay.textContent= `${hi}`;
let r1direction='right';
let r2direction='left';
let r2deflect='bottom';
let r1deflect='top';
let sr1direction='right';
let sr2direction='left';
let playAgainstBot = false;
let currentPlayer = 'black'; // 'white' or 'bot/black'
let gameActive = true; // Flag to control the game loop
const pieces = {
    tank1: tank1,
    titan1: titan1,
    ricochet1: ricochet1,
    semiRicochet1: semiRicochet1,
    cannon1: cannon1,
    cannon2: cannon2,
    titan2: titan2,
    tank2: tank2,
    ricochet2: ricochet2,
    semiRicochet2: semiRicochet2
};

    function startGame(mode) {
        if(mode==='bot'){
            isBotMode=true;
        }else{
            isBotMode=false;
        }
        document.getElementById('game-mode-selection').style.display = 'none';
        document.getElementById('game-container').style.display='block';
        resetGame();
        gameLoop();
    }

    function gameLoop() {
        if (currentPlayer === 'white') {
            waitForPlayerInput();
        } else if (isBotMode) {
            handleBotTurn();
        }
    }

    function waitForPlayerInput() {
        const squares = document.querySelectorAll('#game-board .square');
        squares.forEach(square => {
            if (square.firstChild && square.firstChild.classList.contains('white')) {
                square.firstChild.setAttribute('draggable', true);
                square.addEventListener('dragstart', dragStart);
                square.addEventListener('dragover', dragOver);
                square.addEventListener('drop', dragDrop);               
            }
        });
    }

    function handleBotTurn() {
        setTimeout(() => {
            botMove();
            currentPlayer = 'white';
            gameLoop();
        }, 1000);
    }

    function isGameOver() {
        return false;
    }

    function getAllValidMoves(){
        let validstack = [];
        let randomint = Number(Math.floor((Math.random()) * 4));
        let list={
            0: 'tank1',
            1: 'titan1',
            2:'ricochet1',
            3:'semiRicochet1',
            4:'cannon1'
        };
        let namepiece=list[randomint];
        let ranpiece = pieces[namepiece];
        if(randomint === 4){
            const cannon = document.getElementById(namepiece);
            let canid = Number(cannon.parentElement.getAttribute('square-id'));
            let checkids = [canid - 1, canid + 1];
            checkids.forEach(id => {
                if(id >= 0 && id <= 7){
                    let adjacent = document.querySelector(`[square-id='${id}']`);
                    if(!(adjacent.firstChild))
                        validstack.push({ start: canid, end: id, piece: namepiece });
                }
            })
            return validstack;
        } else {
            const piece = document.getElementById(namepiece);
            let pieceid = Number(piece.parentElement?.getAttribute('square-id'));
            let checkids = [pieceid - 1, pieceid + 1, pieceid + 8, pieceid + 9, pieceid + 7, pieceid - 8, pieceid - 7, pieceid - 9];
            checkids.forEach(id => {
                if(id >= 0 && id <= 63 && (id>pieceid? (id%8 > pieceid%8): (id<pieceid ?(id%8 < pieceid%8):true ))){
                    let adjacent = document.querySelector(`[square-id='${id}']`);
                    if(!(adjacent.firstChild))
                        validstack.push({ start: pieceid, end: id, piece: namepiece });
                }
            })
            return validstack;
        }
    }

    function botMove() {
        const validMoves = getAllValidMoves(); 
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        const selectedMove = validMoves[randomIndex];
        const startSquare = document.querySelector(`[square-id='${selectedMove.start}']`);
        const endSquare = document.querySelector(`[square-id='${selectedMove.end}']`);

        const tempDiv = document.createElement('div');
        let pieceElement = getPieceByName(selectedMove.piece);
        tempDiv.innerHTML = pieceElement;
        pieceElement = tempDiv.firstChild.querySelector('svg').cloneNode(true);
        endSquare.innerHTML = tempDiv.innerHTML;
        startSquare.removeChild(startSquare.firstChild);

        endSquare.firstChild?.setAttribute('draggable', 'true');

        const childElement = endSquare.firstChild?.firstChild;
        if (childElement) {
            childElement.classList.remove('black', 'white');
            childElement.classList.add('black' ); 
        }
        const pieceSvg = endSquare.firstChild.querySelector('svg');
        pieceSvg.addEventListener('dragstart', dragStart);
        pieceSvg.addEventListener('dragover', dragOver);
        pieceSvg.addEventListener('drop', dragDrop);

        launch();
        changePlayer();
        movePiece(Number(selectedMove.start), Number(selectedMove.end), selectedMove.piece);
        recordMove(Number(selectedMove.start), Number(selectedMove.end));
        console.log(sr1direction,sr2direction);
        undoStack.push({ start: selectedMove.start, end: selectedMove.end, piece: selectedMove.piece });
        redoStack = [];
    }
;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
function handleTouchStart(e) {
    draggedElement = e.target.closest('.piece');
    if (draggedElement) {
        startPositionId = draggedElement.parentElement.getAttribute('square-id');
    }
}

function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (targetElement) {
        const mockEvent = {
            target: targetElement,
            stopPropagation: () => {}, 
            preventDefault: () => {}, 
        };
        handleClick(mockEvent);
    }
}

function handleClick(e) {
    const piece = e.target.closest('.piece');
    if (piece) {
        draggedElement = piece;
        startPositionId = piece.parentElement.getAttribute('square-id');
    } else if (draggedElement) {
        dragDrop(e);
    }
}

function getPieceByName(name) {
    return pieces[name]; 
}

let moveHistory={
    black:[],
    white:[]
}
let undoStack = [];
let redoStack = [];
let randomizedPieces=null;

let timerInterval;
let remainingTime = {
    black: 100,
    white: 100
};
let isPaused = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initialise(){
    remainingTime = {
        black: 100,
        white: 100
    };
    playerGo = 'black';
    let hi;
    if(!isBotMode)
        hi='Blue'
    else
        hi='Bot';
    playerDisplay.textContent= `${hi}`;
    moveHistory={
        black:[],
        white:[]
    }
    undoStack = [];
    redoStack = [];
    updateTimerDisplay();
    clearInterval(timerInterval);
    startTimer();
}

window.onload = function () {
    resetGame(); 
};

function resetGame(){
    initialise();
    clearMoveHistory();
    const board = document.getElementById('gameboard');
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    playerGo='black';
    isPaused = false;

    if (!randomizedPieces) {
        createRandomizedBoard();
        createBoard();
    } else {
        createBoard();
    }
    loadMoveHistory();
    addDragAndDropListeners();
    updateMoveHistory();
}

function createRandomizedBoard() {
    const blackPieces = [cannon1, ricochet1, tank1, titan1, semiRicochet1];
    const whitePieces = [cannon2, ricochet2, tank2, titan2, semiRicochet2];
    const blackStartZone = [0, 1, 2, 3, 4];
    const whiteStartZone = [63, 60, 61, 62, 59];

    shuffle(blackPieces);
    shuffle(whitePieces);

    randomizedPieces = new Array(64).fill('');

    blackStartZone.forEach((pos, index) => {
        randomizedPieces[pos] = blackPieces[index];
    });

    whiteStartZone.forEach((pos, index) => {
        randomizedPieces[pos] = whitePieces[index];
    });

}

function createBoard() {
    randomizedPieces.forEach((piece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        if (piece) {
            square.innerHTML = piece;
            square.firstChild?.setAttribute('draggable', true);
            if (i <= 4) {
                square.firstChild.firstChild.classList.add('black');
            } else if (i >= 59) {
                square.firstChild.firstChild.classList.add('white');
            }
        }
        square.setAttribute('square-id', i);

        const row = Math.floor((63 - i) / 8) + 1;
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        } else {
            square.classList.add(i % 2 === 0 ? 'brown' : 'beige');
        }

        gameBoard.append(square);
    });
}

function addDragAndDropListeners(){
const allSquares= document.querySelectorAll("#gameboard .square");
allSquares.forEach(square => {
    if (isMobile) {
        square.addEventListener('touchstart', handleTouchStart, false);
        square.addEventListener('touchend', handleTouchEnd, false);
    } else {
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', dragDrop);
    }
})
}

let startPositionId;
let draggedElement;

function resetClickState() {
    startPositionId = null;
    draggedElement = null;
}

function dragStart(e){
    startPositionId= Number(e.target.parentNode.getAttribute('square-id'));
    draggedElement= e.target;
}

function dragOver(e){
    e.preventDefault();
}

function dragDrop(e){
    e.stopPropagation();
    const correctGo= draggedElement.firstChild.classList.contains(playerGo)
    let taken= e.target.classList.contains('piece');
    
    if((draggedElement.id === 'ricochet1' && (e.target.id ==='tank1'|| e.target.id==='tank2' || e.target.id==='semiRicochet1' || e.target.id ==='semiRicochet2' || e.target.id==='ricochet2')) || (draggedElement.id === 'ricochet2' && (e.target.id ==='tank1'|| e.target.id ==='tank2' || e.target.id==='semiRicochet1' || e.target.id ==='semiRicochet2' || e.target.id==='ricochet1'))){
        //swap ricochet1 with any other piece
        const targetId= Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id'));
        const startId= Number(startPositionId);
        const piece= draggedElement.id ;
        console.log(targetId,startId,piece);
        const startSquare = draggedElement.parentElement;
        const endSquare = e.target.parentElement;

        // Create temporary storage for pieces
        const tempPiece = startSquare.innerHTML;
        startSquare.innerHTML = endSquare.innerHTML;
        endSquare.innerHTML = tempPiece;

        // Make swapped pieces draggable
        startSquare.firstChild.setAttribute('draggable', 'true');
        endSquare.firstChild.setAttribute('draggable', 'true');

        // Update classes for the swapped pieces
        startSquare.firstChild.classList.remove('black', 'white');
        startSquare.firstChild.classList.add(playerGo === 'black' ? 'black' : 'white');

        endSquare.firstChild.classList.remove('black', 'white');
        endSquare.firstChild.classList.add(playerGo === 'black' ? 'white' : 'black');

        launch();
        changePlayer();
        movePiece(Number(startId),Number(targetId) ,piece);
        recordMove(Number(startId),Number(targetId));
        console.log('{ start:'+ startId+', end:'+ targetId+', piece:'+ piece +'}')  ; 
        undoStack.push({ start: startId, end: targetId, piece: piece });
        redoStack = [];  
        updateMoveHistory();
        return;
    }
    else if((e.target.id === 'ricochet1' && e.target.classList.contains('piece')) || (e.target.id === 'ricochet2' && e.target.classList.contains('piece'))){
        taken=false;
        if(e.target.id==='ricochet1'){
            if (r1direction==='left')
                r1direction= 'right';
            else
                r1direction='left';
        }else if(e.target.id==='ricochet2'){
            if (r2direction==='left')
                r2direction= 'right';
            else
                r2direction='left';
        }
    }
    else if((e.target.id === 'semiRicochet1' && e.target.classList.contains('piece')) ||(e.target.id === 'semiRicochet2' && e.target.classList.contains('piece'))){
        taken=false;
        if(e.target.id==='semiRicochet1'){
            if (sr1direction==='right')
                sr1direction= 'left';
            else if(sr1direction==='left'){
                sr1direction='center1';
            }else if(sr1direction === 'center1'){
                sr1direction='center2';
            }else if(sr1direction === 'center2'){
                sr1direction='right';
            }

        }else if(e.target.id==='semiRicochet2'){
            if (sr2direction==='left')
                sr2direction= 'right';
            else if(sr2direction==='center1'){
                sr2direction='center2';
            }else if(sr2direction === 'right'){
                sr2direction='center1';
            }else if(sr2direction === 'center2'){
                sr2direction='left';
            }
        }
    }
    const valid= checkIfValid(e.target);
    const opponentGo= playerGo === 'white' ? 'black' :'white';
    const takenByOpponent=e.target.firstChild?.classList.contains(opponentGo);
    if(correctGo){
        if (startPositionId === Number(e.target.getAttribute('square-id'))) {
            if (draggedElement.id === 'ricochet1'||draggedElement.id === 'ricochet2' || draggedElement.id === 'semiRicochet1' || draggedElement.id === 'semiRicochet2') {
                return;
            }
        }
        //first check here
        if(takenByOpponent && valid){
            if (isBotMode && currentPlayer === 'black') {
                setTimeout(() => handleBotTurn(), 1000);
                return;
            }
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            changePlayer();
            recordMove(startPositionId, e.target.getAttribute('square-id'));
            return
        }
        
        if(valid && !taken){
            
            if (isBotMode && currentPlayer === 'black') {
                setTimeout(() => handleBotTurn(), 1000);
                return;
            }
            if(e.target.id != 'ricochet1' && e.target.id != 'ricochet2' && e.target.id !='semiRicochet1' && e.target.id !='semiRicochet2')
            e.target.append(draggedElement);
            else{
                if(e.target.id === 'ricochet1' || e.target.id==='ricochet2'){
                const currentRotation = e.target.style.transform || 'rotate(0deg)';
                const currentAngle = parseInt(currentRotation.replace('rotate(', '').replace('deg)', ''));
                const newAngle = currentAngle + 90;
                e.target.style.transform = `rotate(${newAngle}deg)`;
                }
                else {
                    const currentRotation = e.target.style.transform || 'rotate(0deg)';
                    const currentAngle = parseInt(currentRotation.replace('rotate(', '').replace('deg)', ''));
                    const newAngle = currentAngle + 90;
                    e.target.style.transform = `rotate(${newAngle}deg)`;
                }
            }
            
            const targetId= Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id'));
            const startId= Number(startPositionId);
            const piece= draggedElement.id ;
            launch();
            changePlayer();
            if(isBotMode && currentPlayer==='white'){
                handleBotTurn();
            }
            movePiece(Number(startPositionId),Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id')),draggedElement.id)
            recordMove(startPositionId, e.target.getAttribute('square-id'));
            console.log('{ start:'+ startId+', end:'+ targetId+', piece:'+ piece +'}')  ; 
            undoStack.push({ start: startId, end: targetId, piece: piece });
            redoStack = [];         
            return
        }
        infoDisplay.textContent="you cannot go here!" ;
        playwrongclip();
        setTimeout(()=> infoDisplay.textContent= "" , 2000);
        return;
    }
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime[playerGo]--;
            updateTimerDisplay();
            if (remainingTime[playerGo] <= 0) {
                clearInterval(timerInterval);
                handleTimerEnd(playerGo);
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const blackTimerDisplay = document.getElementById('black-timer');
    const whiteTimerDisplay = document.getElementById('white-timer');
    blackTimerDisplay.textContent = `Blue: ${remainingTime.black}s`;
    whiteTimerDisplay.textContent = `Yellow: ${remainingTime.white}s`;
}

function handleTimerEnd(player) {
    // alert(`${player} has run out of time!`);
    let pwon = player==='white'?'black':'white';
    endGame(pwon);
}

function changePlayer(){
    playerGo = playerGo === 'black' ? 'white' : 'black';
    let hi;
    if(playerGo==='black'){
        if(!isBotMode)
            hi='Blue';
        else
            hi='Bot';
    }else{
        hi='Yellow';
    }
    playerDisplay.textContent = hi;
    startTimer();
}

function pauseGame() {
    isPaused = true;
}

function resumeGame() {
    isPaused = false;
}

function recordMove(start, end) {
    let mover= playerGo==='white'?'black':'white';
    moveHistory[mover].push(`Moved from ${start} to ${end}`);
    const startSquare = document.querySelector(`[square-id='${start}']`);
    const endSquare = document.querySelector(`[square-id='${end}']`);
    const piece = startSquare.querySelector('.piece');
    updateMoveHistory();
    saveMoveHistory();
    return { piece, startSquare: start, endSquare: end };
}

function loadMoveHistory() {
    const savedHistory = JSON.parse(localStorage.getItem('moveHistory'));
    if (savedHistory) {
        moveHistory = savedHistory;
        updateMoveHistory();
    }
}
function updateMoveHistory() {
    const blackMoves = document.getElementById('black-moves');
    const whiteMoves = document.getElementById('white-moves');
    blackMoves.innerHTML = `Black Moves: ${moveHistory.black.join(', ')}`;
    whiteMoves.innerHTML = `White Moves: ${moveHistory.white.join(', ')}`;
}

function clearMoveHistory() {
    localStorage.removeItem('moveHistory');
}

function undo() {
    if (undoStack.length === 0) return;

    const lastMove = undoStack.pop();
    const startSquare = document.querySelector(`[square-id='${lastMove.start}']`);
    const endSquare = document.querySelector(`[square-id='${lastMove.end}']`);

    if (!startSquare || !endSquare) {
        console.error('Square elements not found for undo.');
        return;
    }
    
    const tempDiv = document.createElement('div');
    let pieceElement =  getPieceByName(lastMove.piece);
    tempDiv.innerHTML = pieceElement;
    pieceElement=tempDiv.firstChild.querySelector('svg').cloneNode(true);
    startSquare.innerHTML= tempDiv.innerHTML;
    endSquare.removeChild(endSquare.firstChild);

    startSquare.firstChild?.setAttribute('draggable', 'true');
    
    const childElement = startSquare.firstChild?.firstChild;
    if (childElement) {
        childElement.classList.remove('black', 'white');
        childElement.classList.add(playerGo === 'black' ? 'white' : 'black'); 
    }
    const pieceSvg= startSquare.firstChild.querySelector('svg');
    pieceSvg.addEventListener('dragstart', dragStart);
    pieceSvg.addEventListener('dragover', dragOver);
    pieceSvg.addEventListener('drop', dragDrop);
    redoStack.push(lastMove);
    changePlayer();
    updateMoveHistory();
}

// function redo() {

//     const temp = undoStack.pop();
//     const lastMove= temp;
//     undoStack.push(temp);
//     redoStack.push(temp);
//     const startSquare = document.querySelector(`[square-id='${lastMove.start}']`);
//     const endSquare = document.querySelector(`[square-id='${lastMove.end}']`);

//     if (redoStack.length === 0) {
//         infoDisplay.textContent = "No moves to redo!";
//         setTimeout(() => infoDisplay.textContent = "", 2000);
//         return;
//     }
//     // Clear start square
//     startSquare.innerHTML = '';
    
//     // Create a temporary div to hold the piece
//     const tempDiv = document.createElement('div');
//     let pieceElement = getPieceByName(lastMove.piece);  // Get the piece as a string
//     tempDiv.innerHTML = pieceElement;
//     pieceElement = tempDiv.firstChild.querySelector('svg').cloneNode(true);

//     // Move the piece from the start square to the end square
//     endSquare.innerHTML = tempDiv.innerHTML;

//     if (startSquare.firstChild) {
//         startSquare.removeChild(startSquare.firstChild);
//     } else {
//         console.error('No piece found in startSquare to remove.');
//     }

//     endSquare.firstChild?.setAttribute('draggable', 'true');

//     const childElement = endSquare.firstChild?.firstChild;
//     if (childElement) {
//         childElement.classList.remove('black', 'white');
//         childElement.classList.add(playerGo === 'black' ? 'white' : 'black');
//     }

//     const pieceSvg = endSquare.firstChild.querySelector('svg');
//     pieceSvg.addEventListener('dragstart', dragStart);
//     pieceSvg.addEventListener('dragover', dragOver);
//     pieceSvg.addEventListener('drop', dragDrop);

//     console.log('hi');
//     undoStack.push(lastMove);
//     changePlayer();
//     updateMoveHistory();
// }

function replay() {
    const allMoves = [...undoStack];
    resetGame(); 
    let moveIndex = 0;
    pauseGame();
    function playNextMove() {
        if (moveIndex >= allMoves.length) return;

        const move = allMoves[moveIndex];
        console.log(allMoves);
        const startSquare = document.querySelector(`[square-id='${move.start}']`);
        const endSquare = document.querySelector(`[square-id='${move.end}']`);
        console.log(startSquare,endSquare);
        if (!startSquare || !endSquare) {
            console.error('Square elements not found for replay.');
            return;
        }

        const pieceElement = startSquare.firstChild;
        if (!pieceElement) {
            console.error('Piece element not found in startSquare.');
            return;
        }

        endSquare.appendChild(pieceElement);
        endSquare.firstChild?.setAttribute('draggable', 'true');

        const childElement = endSquare.firstChild?.firstChild;
        if (childElement) {
            childElement.classList.remove('black', 'white');
            childElement.classList.add(playerGo === 'black' ? 'black' : 'white');
        }

        const pieceSvg = endSquare.firstChild.querySelector('svg');
        pieceSvg.addEventListener('dragstart', dragStart);
        pieceSvg.addEventListener('dragover', dragOver);
        pieceSvg.addEventListener('drop', dragDrop);

        launch();
        changePlayer();
        updateMoveHistory();

        moveIndex++;
        setTimeout(playNextMove, 2500); 
    }

    playNextMove();
}

function movePiece(startId, endId, piece) {
    const move = {
        start: startId,
        end: endId,
        piece: piece
    };
    redoStack.length = 0; 
}

function checkIfValid(target){
    const targetId= Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId= Number(startPositionId);
    const piece= draggedElement.id ;
    if (startId === targetId) {
        return true;
    }
    if(target.childNodes.length >0){
        return false;
    }
    
    switch(piece){
        case 'cannon2':
        case 'cannon1':
            if(startId===0 ){
                if(targetId===startId +1){
                    return true;
                }
            }
            if(startId===7 ){
                if(targetId===startId -1){
                    return true;
                }
            }
            if(startId===56 ){
                if(targetId===startId +1){
                    return true;
                }
            }
            if(startId===63 ){
                if(targetId===startId -1){
                    return true;
                }
            }
            if(startId>0 &&startId <7){
                if(targetId ===startId+1 || targetId === startId-1){
                    return true;
                }
            }
            if(startId>56 &&startId <63){
                if(targetId ===startId+1 || targetId === startId-1){
                    return true;
                }
            }
            return false;               
        case 'titan1':
        case 'titan2':
        case 'tank1':
        case 'tank2':           
            if(startId ===0){
                if(targetId === startId+width || targetId=== startId+width+1 || targetId===startId+1){
                    return true;
                }
            }
            if(startId ===7){
                if(targetId === startId+width || targetId=== startId+width-1 || targetId===startId-1){
                    return true;
                }
            }
            if(startId ===56){
                if(targetId === startId-width || targetId=== startId-width+1 || targetId===startId+1){
                    return true;
                }
            }
            if(startId ===63){
                if(targetId === startId-width || targetId=== startId-width-1 || targetId===startId-1){
                    return true;
                }
            }
            if(startId <7 && startId >0){
                if(targetId === startId +1 || targetId === startId -1 || targetId === startId + width || targetId === startId + width +1 || targetId=== startId+ width-1){
                    return true;
                }
            }
            if(startId >56 && startId <63){
                if(targetId === startId +1 || targetId === startId -1 || targetId === startId - width || targetId === startId - width +1 || targetId=== startId- width-1){
                    return true;
                }
            }
            if(startId% 8 === 0 && startId !==0 && startId !== 56){
                if(targetId === startId +1 || targetId === startId - width || targetId === startId - width +1 || targetId=== startId+ width+1|| targetId=== startId+width){
                    return true;
                }
            }
            if(startId% 8 === 7 && startId !==7 && startId !== 63){
                if(targetId === startId -1 || targetId === startId - width || targetId === startId - width -1 || targetId=== startId+ width-1|| targetId=== startId+width){
                    return true;
                }
            }
            if(startId > 7 && startId< 56 && (startId%8 < 7 && startId%8 >0)){
                if(targetId === startId- 1 || targetId===startId +1 || targetId===startId+width || targetId===startId+width+1 || targetId===startId+width-1 || targetId===startId-width+1 || targetId===startId-width-1 || targetId===startId-width){
                    return true;
                }
            }
            return false;
        case 'semiRicochet1':
        case 'semiRicochet2':
        case 'ricochet1':
        case 'ricochet2':
            if(startId ===0){
                if(targetId === startId+width || targetId=== startId+width+1 || targetId===startId+1){
                    return true;
                }
            }
            if(startId ===7){
                if(targetId === startId+width || targetId=== startId+width-1 || targetId===startId-1){
                    return true;
                }
            }
            if(startId ===56){
                if(targetId === startId-width || targetId=== startId-width+1 || targetId===startId+1){
                    return true;
                }
            }
            if(startId ===63){
                if(targetId === startId-width || targetId=== startId-width-1 || targetId===startId-1){
                    return true;
                }
            }
            if(startId <7 && startId >0){
                if(targetId === startId +1 || targetId === startId -1 || targetId === startId + width || targetId === startId + width +1 || targetId=== startId+ width-1){
                    return true;
                }
            }
            if(startId >56 && startId <63){
                if(targetId === startId +1 || targetId === startId -1 || targetId === startId - width || targetId === startId - width +1 || targetId=== startId- width-1){
                    return true;
                }
            }
            if(startId% 8 === 0 && startId !==0 && startId !== 56){
                if(targetId === startId +1 || targetId === startId - width || targetId === startId - width +1 || targetId=== startId+ width+1|| targetId=== startId+width){
                    return true;
                }
            }
            if(startId% 8 === 7 && startId !==7 && startId !== 63){
                if(targetId === startId -1 || targetId === startId - width || targetId === startId - width -1 || targetId=== startId+ width-1|| targetId=== startId+width){
                    return true;
                }
            }
            if(startId > 7 && startId< 56 && (startId%8 < 7 && startId%8 >0)){
                if(targetId === startId- 1 || targetId===startId +1 || targetId===startId+width || targetId===startId+width+1 || targetId===startId+width-1 || targetId===startId-width+1 || targetId===startId-width-1 || targetId===startId-width){
                    return true;
                }
            }
            return false;
    }
}

function launch(){
    const audio = document.getElementById('shoot');
    audio.play();           
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; 
    }, 400);

    let v1 = playerGo === 'black' ? 'cannon1' : 'cannon2';
    const gun = document.getElementById(v1);
    var parentDiv = gun.parentElement;
    let id = parseInt(parentDiv.getAttribute('square-id'), 10);
    let count = 0;
    let maxIterations = 7;

    function appendAndRemoveDiv() {
        let emptyid = v1 === 'cannon1' ? id + 8 : id - 8;
        const intervalId = setInterval(() => {
            if (!nocollisionahead(id, v1)) {
                clearInterval(intervalId);
                return;
            }
            var selector = 'div[square-id="' + emptyid + '"]';
            var emptyspace = document.querySelector(selector);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rotbullet;
            const bulletElement = tempDiv.firstElementChild;
            emptyspace.appendChild(bulletElement);
            if(v1==='cannon2'){
                let bull= document.getElementById('bullet');
                bull.style.transform= 'rotate(315deg)';
            }
            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            count++;
            id = emptyid; // Update id to the current position
            emptyid = v1 === 'cannon1' ? emptyid + 8 : emptyid - 8;
            if ((v1 === 'cannon1' && emptyid >= 64) || (v1 === 'cannon2' && emptyid <= 0) || count >= maxIterations) {
                clearInterval(intervalId);
            }
        }, 200); 
    }
    appendAndRemoveDiv();  
}

function nocollisionHorizontalahead(id,mode,bulldir){
    let nextId = mode === 'right' ? id + 1 : id - 1;
    let selector = 'div[square-id="' + nextId + '"]';
    let nextDiv = document.querySelector(selector);
    if (nextDiv && nextDiv.querySelector('.piece')) {        
        divertVertical(nextDiv.getAttribute('square-id'),nextDiv.firstChild.id,bulldir);
        return false;
    }
    return true;
}

function nocollisionahead(id, direction) {
    let nextId = direction === 'cannon1' ? id + 8 : id - 8;
    let selector = 'div[square-id="' + nextId + '"]';
    let nextDiv = document.querySelector(selector);
    if (nextDiv && nextDiv.querySelector('.piece')) {
        divertHorizontal(nextDiv.getAttribute('square-id'),nextDiv.firstChild.id);
        return false;
    }
    return true;
}

function nocollisionVerticalahead(id,bulldir,verdir){
    let nextId = bulldir === 'down' ? id + 8 : id - 8;
    let selector = 'div[square-id="' + nextId + '"]';
    let nextDiv = document.querySelector(selector);
    if (nextDiv && nextDiv.querySelector('.piece')) {
        divertHorizontal(nextDiv.getAttribute('square-id'),nextDiv.firstChild.id,verdir);
        return false;
    }
    return true;
}

function divertHorizontal(id1,piece,verdir){
    if(piece=== 'titan1'){
        endGame('White');
    }else if(piece==='titan2'){
        endGame('Black');
    }
    else if(piece=== 'ricochet1' || piece==='ricochet2'){
        let selector = 'div[square-id="' + id1 + '"]';
        let nextDiv = document.querySelector(selector);
        let diverter= nextDiv.firstChild.firstChild?.classList.contains((playerGo==='black'?'white':'black'));
        console.log(nextDiv.firstChild?.firstChild)
        console.log(diverter);
        console.log(r1direction,r2direction);
    if((((piece==='ricochet1' && r1direction=='right' && !diverter) || (piece==='ricochet2' &&r2direction=='right')) && !diverter) || (diverter && ((piece==='ricochet1' && r1direction=='left') || (piece==='ricochet2' && r2direction=='left' && diverter)) )){
    let count = 0;
    let maxIterations = 7;
    let id=parseInt(id1,10);
    if((parseInt(id1,10))%8 ===1){
        return;
    }
    let emptyid;
    function appendAndRemoveDiv() {
        emptyid= id-1;
        const intervalId = setInterval(() => {
            
            if (!nocollisionHorizontalahead(id,'left','left')) {
                clearInterval(intervalId);
                return;
            }
                var selector = `div[square-id="${emptyid}"]`;
                var emptyspace = document.querySelector(selector);

                if (!emptyspace) {
                    clearInterval(intervalId);
                    return;
                }           
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rotbullet;
            const bulletElement = tempDiv.firstElementChild;
            
            emptyspace.appendChild(bulletElement);
            let bull= document.getElementById('bullet');
            bull.style.transform= 'rotate(225deg)';

            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            count++;
            id = emptyid;
            emptyid=id-1;
            console.log((emptyid +1)%8 === 0,count >= maxIterations,emptyid,(emptyid+3)%8===1);
            if (emptyid<0 || (emptyid+2)%8 === 0 || count >= maxIterations || ((emptyid+2)%8===1 && (emptyid+1)%8 ===0)) {
                clearInterval(intervalId);
            }
        }, 200); 
    }
    appendAndRemoveDiv(); 
    }else{
    let count = 0;
    let maxIterations = 7;
    let id=parseInt(id1,10);
    if((parseInt(id1,10))%8 ===7){
        return
    }
    let emptyid;
    function appendAndRemoveDiv() {
        emptyid= id+1;

        const intervalId = setInterval(() => {
            if (!nocollisionHorizontalahead(id,'right','right')) {
                clearInterval(intervalId);
                return;
            }
              
                var selector = `div[square-id="${emptyid}"]`;
                var emptyspace = document.querySelector(selector);

                if (!emptyspace) {
                    clearInterval(intervalId);
                    return;
                }
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rotbullet;
            const bulletElement = tempDiv.firstElementChild;
            emptyspace.appendChild(bulletElement);
            let bull= document.getElementById('bullet');
            bull.style.transform= 'rotate(45deg)';
            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            
            count++;
            id = emptyid; 
            emptyid=id+1;
            console.log((emptyid +1)%8 === 0,count >= maxIterations,emptyid,(emptyid+1)%8===7);
            if (emptyid>62|| ((emptyid +1)%8 == 0 && (emptyid)%8 ===7)   || (count >= maxIterations)) {
                clearInterval(intervalId);
            }
        }, 200); 
    }
    appendAndRemoveDiv(); 
    }
    }else if(piece=== 'semiRicochet1' || piece==='semiRicochet2'){
        console.log(sr1direction,sr2direction);
        let selector = 'div[square-id="' + id1 + '"]';
        let nextDiv = document.querySelector(selector);
        console.log(playerGo);
        let diverter= nextDiv.firstChild.firstChild.classList.contains((playerGo==='black'?'white':'black'));
        console.log(nextDiv.firstChild?.firstChild)
        console.log(diverter);
        if((piece==='semiRicochet1' && sr1direction=='center1' && diverter) || (piece==='semiRicochet2' && sr2direction=='center2' && diverter)  || (piece==='semiRicochet1' && sr1direction==='left' && !diverter) || (piece==='semiRicochet2' && sr2direction=='left' && !diverter)){
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            if(id%8 ===1){
                return
            }
            let emptyid;
            function appendAndRemoveDiv() {
                emptyid= id-1;
                const intervalId = setInterval(() => {
                    console.log(count,"count");
                    if (!nocollisionHorizontalahead(id,'left','left')) {
                        console.log('blast?');
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);
        
                        if (!emptyspace) {
                            console.log('no empty');
                            clearInterval(intervalId);
                            return;
                        }                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = rotbullet;
                    const bulletElement = tempDiv.firstElementChild;
                    emptyspace.appendChild(bulletElement);
                    let bull= document.getElementById('bullet');
                    bull.style.transform= 'rotate(225deg)';
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    count++;
                    id = emptyid; 
                    emptyid=id-1;
                    console.log((emptyid +2)%8 === 0,count >= maxIterations,emptyid,(emptyid+2)%8===1);
                    if (emptyid<0 || (emptyid+2)%8 === 0 || count >= maxIterations || ((emptyid+2)%8===1 && (emptyid+1)%8 ===0)) {
                        clearInterval(intervalId);
                        return
                    }
                }, 200); 
            }
            appendAndRemoveDiv(); 
            }else if((((piece==='semiRicochet1' && sr1direction=='center2') || (piece==='semiRicochet2' && sr2direction=='center1')) && diverter) || ((piece==='semiRicochet1' && sr1direction==='right') || (piece==='semiRicochet2' && sr2direction==='right')) && !diverter ) {
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            let emptyid;
            if((parseInt(id1,10))%8 ===7){
                return
            }
            function appendAndRemoveDiv() {
                emptyid= id+1;
        
                const intervalId = setInterval(() => {
                    if (!nocollisionHorizontalahead(id,'right','right')) {
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);
        
                        if (!emptyspace) {
                            clearInterval(intervalId);
                            return;
                        }
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = rotbullet;
                    const bulletElement = tempDiv.firstElementChild;
                    emptyspace.appendChild(bulletElement);
                    let bull= document.getElementById('bullet');
                    bull.style.transform= 'rotate(45deg)';
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    count++;
                    id = emptyid; 
                    emptyid=id+1;
                    console.log((emptyid +1)%8 === 0,count >= maxIterations,emptyid,(emptyid+1)%8===7);
                    if (emptyid>62|| ((emptyid +1)%8 == 0 && (emptyid)%8 ===7)   || (count >= maxIterations)) {
                        clearInterval(intervalId);
                    }
                }, 200); 
            }            
            appendAndRemoveDiv(); 
            }else{
                destroyPiece(id1);
            }}
}

function destroyPiece(id1){
    let selector = 'div[square-id="' + id1 + '"]';
    let nextDiv = document.querySelector(selector);
    nextDiv.removeChild(nextDiv.firstChild);
    playDestroy();
}

function playDestroy(){
    const audio = document.getElementById('destroySR');   
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; 
    }, 2000);
}

function playwrongclip(){
    const audio = document.getElementById('wrong');   
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; 
    }, 1000);
}
console.log(r1direction,r2direction,'rdir');
console.log(sr1direction,sr2direction,'srdir');
function divertVertical(id1,piece,bulldir){
    if(piece ==='titan1'){
        endGame('White');
    }else if(piece ==='titan2'){
        endGame('Black');
    }else if(piece=== 'ricochet1' || piece==='ricochet2'){
        if((piece==='ricochet1' && r1direction=='right' && bulldir==='right') || (piece==='ricochet1' && r1direction=='left' && bulldir==='left') || (piece==='ricochet2' && r2direction==='left' && bulldir==='right') || (piece==='ricochet2' && r2direction==='right' && bulldir==='left')){
        let count = 0;
        let maxIterations = 7;
        let id=parseInt(id1,10);
        let emptyid;
        function appendAndRemoveDiv() {
            emptyid= id+8;
            const intervalId = setInterval(() => {
                if (!nocollisionVerticalahead(id,'down','')) {
                    clearInterval(intervalId);
                    return;
                }    
                    var selector = `div[square-id="${emptyid}"]`;
                    var emptyspace = document.querySelector(selector);   
                    if (!emptyspace) {
                        clearInterval(intervalId);
                        return;
                    }           
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rotbullet;
                const bulletElement = tempDiv.firstElementChild;
                emptyspace.appendChild(bulletElement);
                let bull= document.getElementById('bullet');
                bull.style.transform= 'rotate(135deg)';

                setTimeout(() => {
                    if (bulletElement) {
                        emptyspace.removeChild(bulletElement);
                    }
                }, 100);  
                count++;
                id = emptyid;
                emptyid=id+8;
                if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                    clearInterval(intervalId);
                }
            }, 200); 
        }
        appendAndRemoveDiv(); 
        }else if ((piece==='ricochet1' && r1direction=='right' && bulldir==='left') || (piece==='ricochet1' && r1direction=='left' && bulldir==='right') || (piece==='ricochet2' && r2direction==='left' && bulldir==='left') || (piece==='ricochet2' && r2direction==='right' && bulldir==='right')){
        let count = 0;
        let maxIterations = 7;
        let id=parseInt(id1,10);
        let emptyid;
        function appendAndRemoveDiv() {
            emptyid= id-8;
    
            const intervalId = setInterval(() => {
                if (!nocollisionVerticalahead(id,'up')) {
                    clearInterval(intervalId);
                    return;
                }    
                    var selector = `div[square-id="${emptyid}"]`;
                    var emptyspace = document.querySelector(selector);
    
                    if (!emptyspace) {
                        clearInterval(intervalId);
                        return;
                    }
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rotbullet;
                const bulletElement = tempDiv.firstElementChild;
                emptyspace.appendChild(bulletElement);
                let bull= document.getElementById('bullet');
                bull.style.transform= 'rotate(315deg)';
                setTimeout(() => {
                    if (bulletElement) {
                        emptyspace.removeChild(bulletElement);
                    }
                }, 100);  
                count++;
                id = emptyid; 
                emptyid=id-8;
                if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                    clearInterval(intervalId);
                }
            }, 200); 
        }
        appendAndRemoveDiv(); 
        } 
    }else if(piece=== 'semiRicochet1' || piece=== 'semiRicochet2'){
        if((piece==='semiRicochet1' && sr1direction=='right' && bulldir==='left') || (piece==='semiRicochet1' && sr1direction=='left' && bulldir==='right') || (piece==='semiRicochet2' && sr2direction==='center2' && bulldir==='right') || (piece==='semiRicochet2' && sr2direction==='center1' && bulldir==='left')){
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            let emptyid;
            function appendAndRemoveDiv() {
                emptyid= id+8;
                const intervalId = setInterval(() => {
                    if (!nocollisionVerticalahead(id,'down')) {
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);   
                        if (!emptyspace) {
                            clearInterval(intervalId);
                            return;
                        }          
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = rotbullet;
                    const bulletElement = tempDiv.firstElementChild;
                    emptyspace.appendChild(bulletElement);
                    let bull= document.getElementById('bullet');
                    bull.style.transform= 'rotate(135deg)';
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    count++;
                    id = emptyid;
                    emptyid=id+8;
                    if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                        clearInterval(intervalId);
                    }
                }, 200); 
            }
            appendAndRemoveDiv(); 
            }else if ((piece==='semiRicochet1' && sr1direction=='center1' && bulldir==='left') || (piece==='semiRicochet1' && sr1direction=='center2' && bulldir==='right') || (piece==='semiRicochet2' && sr2direction==='left' && bulldir==='right') || (piece==='semiRicochet2' && sr2direction==='right' && bulldir==='left')){
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            let emptyid;
            function appendAndRemoveDiv() {
                emptyid= id-8;
        
                const intervalId = setInterval(() => {
                    if (!nocollisionVerticalahead(id,'up')) {
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);
        
                        if (!emptyspace) {
                            clearInterval(intervalId);
                            return;
                        }
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = rotbullet;
                    const bulletElement = tempDiv.firstElementChild;
                    emptyspace.appendChild(bulletElement);
                    let bull= document.getElementById('bullet');
                    bull.style.transform= 'rotate(315deg)';
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    
                    count++;
                    id = emptyid; 
                    emptyid=id-8;
                    
                    if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                        clearInterval(intervalId);
                    }
                }, 200); 
            }
            appendAndRemoveDiv(); 
            }else{
                destroyPiece(id1);
            } 
        }
}


function endGame(playerwon){
    saveMoveHistory();
    isPaused=true;
    pauseGame();
    let hi;
    if(playerwon==='black'){
        hi='Yellow'
    }else{
        if(!isBotMode)
        hi='Blue'
        else
        hi='Bot';
    }
    let playerDisplay=document.getElementById('player-display');
    playerDisplay.innerHTML='';
    infoDisplay.innerHTML += `${hi} won!`;
    playAudioClip();
}

function saveMoveHistory() {
    localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
}

function playAudioClip() {
    const audio = document.getElementById('myAudio');
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; 
    }, 3000);
}
