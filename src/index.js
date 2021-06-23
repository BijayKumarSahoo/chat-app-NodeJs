//-----------------------------------------------SERVER--------------------------------------------------//

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const { addUser,removeUser,getUsersInRoom,getUser } = require('./utils/users');

const app = express();
//This is automatically created by express but here it is a refactoring to use socket
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
console.log(publicDirectoryPath);

app.use(express.static(publicDirectoryPath));

//Listens to the event 
// let count = 0;
// io.on('connection', (socket) => {
//     console.log("Welcome to the socket server");

//     socket.emit('countUpdated', count);

//     //Listen to the client generated event
//     socket.on('incrementCount', () => {
//         count++;
//         //Emits event to a specific client
//         // socket.emit('countUpdated', count);
//         //Emits event to all the client connected to the server
//         io.emit('countUpdated', count);
//     })
// });

io.on('connection', (socket) => {
    console.log("New Websocket connnection established!")
    
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options});
        if(error) {
            return callback(error);
        }
        socket.join(user.room);

        //Sending a event to the specific client
        socket.emit('message', generateMessage("System", `Welcome to chat app! ${user.username}`));
        //Sending an event to all the clients except the new client who just connected
        socket.broadcast.to(user.room).emit('message', generateMessage("System", `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room, 
            users: getUsersInRoom(user.room)
        });
        callback();
    })

    
    //handle to event from client
    socket.on('sendMessage', (msg, callback) => {
        //Check profanity
        const filter = new Filter(); 
        if(filter.isProfane(msg)) {
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);
        //Send the message to all the users in the same room
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, msg));
        callback();//call the acknowledgement
    });

    //Get geo-location
    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id);
        // socket.broadcast.emit('message', `I am located at latitude ${latitude} and longitude ${longitude}`);
        socket.broadcast.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${latitude},${longitude}`));
        callback('Location shared!');
    })

    //Sending an event when a user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage("System", `${user.username} has left the chat`));
            io.to(user.room).emit('roomData', {
                room: user.room, 
                users: getUsersInRoom(user.room)
            });
        }
    })
});

server.listen(port, () => {
    console.log('Server is up and running in ', port);
})