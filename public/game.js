const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let speed = 5;

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
});

socket.on('newPlayer', (newPlayer) => {
    players[newPlayer.id] = newPlayer;
});

socket.on('playerMoved', (playerInfo) => {
    players[playerInfo.id] = playerInfo;
});

socket.on('playerDisconnected', (playerId) => {
    delete players[playerId];
});

// Input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function update() {
    if (!players[socket.id]) return;

    let moved = false;
    const p = players[socket.id];

    if (keys['ArrowUp'] || keys['w']) { p.y -= speed; moved = true; }
    if (keys['ArrowDown'] || keys['s']) { p.y += speed; moved = true; }
    if (keys['ArrowLeft'] || keys['a']) { p.x -= speed; moved = true; }
    if (keys['ArrowRight'] || keys['d']) { p.x += speed; moved = true; }

    if (moved) {
        socket.emit('playerMovement', { x: p.x, y: p.y });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = '#222';
    for(let i=0; i<canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
    }

    // Draw players
    Object.values(players).forEach(player => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 30, 30);
        
        // Label current player
        if (player.id === socket.id) {
            ctx.strokeStyle = "white";
            ctx.strokeRect(player.x, player.y, 30, 30);
        }
    });

    update();
    requestAnimationFrame(draw);
}

draw();
