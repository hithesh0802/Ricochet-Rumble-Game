let gameBoard =document.getElementById('gameboard');
const playerDisplay= document.querySelector('#player');
const infoDisplay= document.getElementById('info-display');
const width=8;
let v1;let emptyid;
let playerGo= "black";
playerDisplay.textContent= 'black';
let csr1=0;
let csr2=0;
let r1direction='right';
let r2direction='left';
let sr1direction='right';
let sr2direction='left';

let moveHistory={
    black:[],
    white:[]
}
const startPieces=[
    tank,titan,cannon1,semiRicochet1,ricochet1,'','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','',tank,titan,cannon2,semiRicochet2,ricochet2
]

let timerInterval;
let remainingTime = {
    black: 60,
    white: 60
};
let isPaused = false;

function initialise(){
    remainingTime = {
        black: 60,
        white: 60
    };
    playerGo = 'black';
    playerDisplay.textContent= 'black';
    moveHistory={
        black:[],
        white:[]
    }
    updateTimerDisplay();
    clearInterval(timerInterval);
    startTimer();
}

window.onload = function () {
    resetGame(); // Call resetGame when the page loads
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
    createBoard();
    loadMoveHistory();
    addDragAndDropListeners();
    updateMoveHistory();
}

function createBoard(){
    startPieces.forEach((startPiece,i) => {
        const square= document.createElement('div')
        square.classList.add('square')
        square.innerHTML= startPiece
        square.firstChild?.setAttribute('draggable',true);
        square.setAttribute('square-id',i)
        
        const row= Math.floor((63 - i)/8) +1
        if(row%2 === 0)
        square.classList.add(i%2 ===0? 'beige' : 'brown');
        else
        square.classList.add(i%2 ===0? 'brown' : 'beige');

        if(i <=4){
            square.firstChild.firstChild.classList.add('black');
        }

        if(i>= 59){
            square.firstChild.firstChild.classList.add('white');
        }
        gameBoard.append(square)
    })
}

// createBoard();

function addDragAndDropListeners(){
const allSquares= document.querySelectorAll("#gameboard .square");
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('drop', dragDrop)
})
}

// addDragAndDropListeners();
let startPositionId;
let draggedElement;

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
    if((e.target.id === 'ricochet1' && e.target.classList.contains('piece')) || (e.target.id === 'ricochet2' && e.target.classList.contains('piece'))){
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

            console.log(sr1direction);

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
    if(valid){
        const targetId= Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id'));
        const startId= Number(startPositionId);
        const piece= draggedElement.id ;
        console.log(piece,startId,targetId);
    }
    const opponentGo= playerGo === 'white' ? 'black' :'white';
    const takenByOpponent=e.target.firstChild?.classList.contains(opponentGo);
    if(correctGo){
        if (startPositionId === Number(e.target.getAttribute('square-id'))) {
            if (draggedElement.id === 'ricochet1'||draggedElement.id === 'ricochet2' || draggedElement.id === 'semiRicochet1' || draggedElement.id === 'semiRicochet2') {
                // rotateRicochet(draggedElement);
                return;
            }
        }
        //first check here
        if(takenByOpponent && valid){
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            changePlayer();
            recordMove(startPositionId, e.target.getAttribute('square-id'));
            return
        }
        //then check here
        // if(taken && !takenByOpponent){           
        // }
        if(valid && !taken){
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
            
            launch();
            changePlayer();
            recordMove(startPositionId, e.target.getAttribute('square-id'));            
            return
        }
        infoDisplay.textContent="you cannot go here!" ;
        setTimeout(()=> infoDisplay.textContent= "" , 2000);
        return;
    }
}

function startTimer() {
    // Clear any existing timer
    clearInterval(timerInterval);
    // Update the timer display initially
    updateTimerDisplay();

    // Start the countdown
    timerInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime[playerGo]--;
            updateTimerDisplay();

            if (remainingTime[playerGo] <= 0) {
                clearInterval(timerInterval);
                // Handle the end of the timer (e.g., game over)
                handleTimerEnd(playerGo);
            }
        }
    }, 1000); // Update the timer every second (1000 milliseconds)
}

function updateTimerDisplay() {
    const blackTimerDisplay = document.getElementById('black-timer');
    const whiteTimerDisplay = document.getElementById('white-timer');
    blackTimerDisplay.textContent = `Black: ${remainingTime.black}s`;
    whiteTimerDisplay.textContent = `White: ${remainingTime.white}s`;
}

function handleTimerEnd(player) {
    alert(`${player} has run out of time!`);
    endGame();
}

function changePlayer(){
    if(playerGo === "black"){
        playerGo= "white";
        playerDisplay.textContent= "white";
        // reverseIds();
    }else{
        playerGo= "black";
        playerDisplay.textContent='black';
        // revertIds();
    }
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
    updateMoveHistory();
    saveMoveHistory();
}

function loadMoveHistory() {
    const savedHistory = JSON.parse(localStorage.getItem('moveHistory'));
    if (savedHistory) {
        moveHistory = savedHistory;
        updateMoveHistory();
    }
}
// startTimer();
function updateMoveHistory() {
    const blackMoves = document.getElementById('black-moves');
    const whiteMoves = document.getElementById('white-moves');
    blackMoves.innerHTML = `Black Moves: ${moveHistory.black.join(', ')}`;
    whiteMoves.innerHTML = `White Moves: ${moveHistory.white.join(', ')}`;
}

function clearMoveHistory() {
    localStorage.removeItem('moveHistory');
}

// window.onload = function () {
//     loadMoveHistory();
//     createBoard();
//     addDragAndDropListeners();
// }

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
        case 'titan':
        case 'tank':           
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
            
            // Create a temporary container div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bullet;
            const bulletElement = tempDiv.firstElementChild;
            // Append the bullet element to the empty space
            emptyspace.appendChild(bulletElement);

            // Remove the bullet element after 0.5 seconds
            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            // Increment count
            count++;
            id = emptyid; // Update id to the current position
            emptyid = v1 === 'cannon1' ? emptyid + 8 : emptyid - 8;
            // Check the base condition
            if ((v1 === 'cannon1' && emptyid >= 64) || (v1 === 'cannon2' && emptyid <= 0) || count >= maxIterations) {
                clearInterval(intervalId);
            }
        }, 200); 
    }
    appendAndRemoveDiv();  
}

function nocollisionHorizontalahead(id){
    let nextId = playerGo === 'white' ? id + 1 : id - 1;
    let selector = 'div[square-id="' + nextId + '"]';
    let nextDiv = document.querySelector(selector);
    if (nextDiv && nextDiv.querySelector('.piece')) {        
        divertVertical(nextDiv.getAttribute('square-id'),nextDiv.firstChild.id);
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

function divertHorizontal(id1,piece){
    if(piece=== 'titan'){
        endGame();
    }
    else if(piece=== 'ricochet1' || piece==='ricochet2'){
    if((piece==='ricochet1' && r1direction=='right') || (piece==='ricochet2' &&r2direction=='right')){
    let count = 0;
    let maxIterations = 7;
    let id=parseInt(id1,10);
    let emptyid;
    function appendAndRemoveDiv() {
        emptyid= id-1;
        const intervalId = setInterval(() => {
            if (!nocollisionHorizontalahead(id)) {
                clearInterval(intervalId);
                return;
            }    
                var selector = `div[square-id="${emptyid}"]`;
                var emptyspace = document.querySelector(selector);

                if (!emptyspace) {
                    clearInterval(intervalId);
                    return;
                }           
            // Create a temporary container div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bullet;
            const bulletElement = tempDiv.firstElementChild;
            // Append the bullet element to the empty space
            emptyspace.appendChild(bulletElement);

            // Remove the bullet element after 0.5 seconds
            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            // Increment count
            count++;
            id = emptyid;
            emptyid=id-1;
            // Check the base condition
            if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                clearInterval(intervalId);
            }
        }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
    }
    // Call the function
    appendAndRemoveDiv(); 
    }else{
    let count = 0;
    let maxIterations = 7;
    let id=parseInt(id1,10);
    let emptyid;
    function appendAndRemoveDiv() {
        emptyid= id+1;

        const intervalId = setInterval(() => {
            if (!nocollisionHorizontalahead(id)) {
                clearInterval(intervalId);
                return;
            }    
                var selector = `div[square-id="${emptyid}"]`;
                var emptyspace = document.querySelector(selector);

                if (!emptyspace) {
                    clearInterval(intervalId);
                    return;
                }
            
            // Create a temporary container div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bullet;
            const bulletElement = tempDiv.firstElementChild;
            // Append the bullet element to the empty space
            emptyspace.appendChild(bulletElement);

            // Remove the bullet element after 0.5 seconds
            setTimeout(() => {
                if (bulletElement) {
                    emptyspace.removeChild(bulletElement);
                }
            }, 100);  
            // Increment count
            count++;
            id = emptyid; 
            emptyid=id+1;
            // Check the base condition
            if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                clearInterval(intervalId);
            }
        }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
    }
    // Call the function
    appendAndRemoveDiv(); 
    }
    }else if(piece=== 'semiRicochet1' || piece==='semiRicochet2'){
        if((piece==='semiRicochet1' && sr1direction=='left') || (piece==='semiRicochet2' && sr2direction=='left')){
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            let emptyid;
            function appendAndRemoveDiv() {
                emptyid= id-1;
                const intervalId = setInterval(() => {
                    if (!nocollisionHorizontalahead(id)) {
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);
        
                        if (!emptyspace) {
                            clearInterval(intervalId);
                            return;
                        }                    
                    // Create a temporary container div
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = bullet;
                    const bulletElement = tempDiv.firstElementChild;
                    // Append the bullet element to the empty space
                    emptyspace.appendChild(bulletElement);
        
                    // Remove the bullet element after 0.5 seconds
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    // Increment count
                    count++;
                    id = emptyid; 
                    emptyid=id-1;
                    // Check the base condition
                    if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                        clearInterval(intervalId);
                    }
                }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
            }
            // Call the function
            appendAndRemoveDiv(); 
            }else if((piece==='semiRicochet1' && sr1direction=='right') || (piece==='semiRicochet2' && sr2direction=='right')){
            let count = 0;
            let maxIterations = 7;
            let id=parseInt(id1,10);
            let emptyid;
            function appendAndRemoveDiv() {
                emptyid= id+1;
        
                const intervalId = setInterval(() => {
                    if (!nocollisionHorizontalahead(id)) {
                        clearInterval(intervalId);
                        return;
                    }    
                        var selector = `div[square-id="${emptyid}"]`;
                        var emptyspace = document.querySelector(selector);
        
                        if (!emptyspace) {
                            clearInterval(intervalId);
                            return;
                        }
                    
                    // Create a temporary container div
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = bullet;
                    const bulletElement = tempDiv.firstElementChild;
                    // Append the bullet element to the empty space
                    emptyspace.appendChild(bulletElement);
        
                    // Remove the bullet element after 0.5 seconds
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);  
                    // Increment count
                    count++;
                    id = emptyid; 
                    emptyid=id+1;
                    // Check the base condition
                    if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                        clearInterval(intervalId);
                    }
                }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
            }
            // Call the function
            appendAndRemoveDiv(); 
            }
        }
}

function reverseIds(){
    const allSquares= document.querySelectorAll(".square");
    allSquares.forEach((square,i) =>{
        square.setAttribute('square-id',(width* width -1)-i);
    })
}

function revertIds(){
    const allSquares= document.querySelectorAll(".square");
    allSquares.forEach((square,i) =>{
        square.setAttribute('square-id',i);
    })
}

function divertVertical(id1,piece){
    if(piece ==='titan'){
        endGame();
    }else if(piece=== 'ricochet1' || piece==='ricochet2'){
        if((piece==='ricochet1' && r1direction=='right') || (piece==='ricochet1' && r1direction=='left')){
        let count = 0;
        let maxIterations = 7;
        let id=parseInt(id1,10);
        let emptyid;
        function appendAndRemoveDiv() {
            emptyid= id+8;
            const intervalId = setInterval(() => {
                if (!nocollisionHorizontalahead(id)) {
                    clearInterval(intervalId);
                    return;
                }    
                    var selector = `div[square-id="${emptyid}"]`;
                    var emptyspace = document.querySelector(selector);
    
                    if (!emptyspace) {
                        clearInterval(intervalId);
                        return;
                    }           
                // Create a temporary container div
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bullet;
                const bulletElement = tempDiv.firstElementChild;
                // Append the bullet element to the empty space
                emptyspace.appendChild(bulletElement);
    
                // Remove the bullet element after 0.5 seconds
                setTimeout(() => {
                    if (bulletElement) {
                        emptyspace.removeChild(bulletElement);
                    }
                }, 100);  
                // Increment count
                count++;
                id = emptyid;
                emptyid=id+8;
                // Check the base condition
                if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                    clearInterval(intervalId);
                }
            }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
        }
        // Call the function
        appendAndRemoveDiv(); 
        }else if ((piece==='ricochet2' && r2direction=='right') || (piece==='ricochet2' &&r2direction=='left')){
        let count = 0;
        let maxIterations = 7;
        let id=parseInt(id1,10);
        let emptyid;
        function appendAndRemoveDiv() {
            emptyid= id-8;
    
            const intervalId = setInterval(() => {
                if (!nocollisionHorizontalahead(id)) {
                    clearInterval(intervalId);
                    return;
                }    
                    var selector = `div[square-id="${emptyid}"]`;
                    var emptyspace = document.querySelector(selector);
    
                    if (!emptyspace) {
                        clearInterval(intervalId);
                        return;
                    }
                
                // Create a temporary container div
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bullet;
                const bulletElement = tempDiv.firstElementChild;
                // Append the bullet element to the empty space
                emptyspace.appendChild(bulletElement);
    
                // Remove the bullet element after 0.5 seconds
                setTimeout(() => {
                    if (bulletElement) {
                        emptyspace.removeChild(bulletElement);
                    }
                }, 100);  
                // Increment count
                count++;
                id = emptyid; 
                emptyid=id-8;
                // Check the base condition
                if (((emptyid +1)%8 == 0 && (emptyid)%8 ===7) || count >= maxIterations) {
                    clearInterval(intervalId);
                }
            }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
        }
        // Call the function
        appendAndRemoveDiv(); 
        } 
    }else if(piece=== 'semiRicochet1' || piece=== 'semiRicochet2'){
        let count = 0;
        let maxIterations = 7;
        let id=parseInt(id1,10);
        let emptyid;
        function appendAndRemoveDiv() {
            if(playerGo=== 'black')
                emptyid = id + 8;
            else{
                emptyid= id-8;
            }
        
            const intervalId = setInterval(() => {
                if (!nocollisionVerticalahead(id)) {
                    clearInterval(intervalId);
                    return;
                }                    
                var selector = `div[square-id="${emptyid}"]`;
                var emptyspace = document.querySelector(selector);
                if (!emptyspace) {
                    clearInterval(intervalId);
                    return;
                }                
                    // Create a temporary container div
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = bullet;
                    const bulletElement = tempDiv.firstElementChild;
                    // Append the bullet element to the empty space
                    emptyspace.appendChild(bulletElement);
        
                    // Remove the bullet element after 0.5 seconds
                    setTimeout(() => {
                        if (bulletElement) {
                            emptyspace.removeChild(bulletElement);
                        }
                    }, 100);      
                    // Increment count
                    count++;
                    id = emptyid; // Update id to the current position
                    if(playerGo === 'black')emptyid = emptyid + 8;
                    else{
                        emptyid= emptyid-8;
                    }
        
                    // Check the base condition
                    if (emptyid <=0 || emptyid>=63 || count >= maxIterations) {
                        clearInterval(intervalId);
                    }
                }, 200); // Repeat every 1 second (0.5 seconds append + 0.5 seconds remove)
            }    
            // Call the function
            appendAndRemoveDiv(); 
            }
}

function nocollisionVerticalahead(id){
    let nextId = playerGo === 'black' ? id + 8 : id - 8;
    let selector = 'div[square-id="' + nextId + '"]';
    let nextDiv = document.querySelector(selector);
    if (nextDiv && nextDiv.querySelector('.piece')) {
        divertHorizontal(nextDiv.getAttribute('square-id'),nextDiv.firstChild.id);
        return false;
    }
    return true;
}
function endGame(){
    saveMoveHistory();
    if(playerGo==='white')
    infoDisplay.innerHTML += 'Black won!'
    else{
        infoDisplay.innerHTML += 'White won!'
    }
    playAudioClip();
}

function saveMoveHistory() {
    localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
}

function playAudioClip() {
    // Get the audio element
    const audio = document.getElementById('myAudio');
    
    // Play the audio
    audio.play();
    
    // Stop the audio after 0.5 seconds (500 milliseconds)
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reset the audio to the start
    }, 3000);
}
