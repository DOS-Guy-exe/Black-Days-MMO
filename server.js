const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Someone has arrived:', socket.id);

    // Create a new player object
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        id: socket.id
    };

    // Send the current players object to the new player
    socket.emit('currentPlayers', players);

    // Update all other players of the new arrival
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle movement
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A hero has left us:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));