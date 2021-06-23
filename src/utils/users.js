const users = [];

//addUser
const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Check if user name and room is entered
    if(!username || !room) {
        return {
            error: "username and Room required"
        }
    }

    //Check if user name already taken
    const existingUser = users.filter(user => {
        return user.username === username && user.room === room;
    });

    if(existingUser.length > 0) {
        return {
            error: "User name is already taken!"
        };
    }

    //Store the user
    const user = {
        id,
        username,
        room
    }

    users.push(user);
    return {user};
};

//Remvoe a user by Id
const removeUser = id => {
    const index = users.findIndex(user => user.id === id);

    if(index != -1) {
        return users.splice(index, 1)[0];
    }
    return {
        error: "User not found!"
    };
}

//Get a user by Id
const getUser = id => {
    return users.find(user => user.id === id);
};

//Get all users in a room
const getUsersInRoom = room => {
    return users.filter(user => user.room === room.trim().toLowerCase());
};

// addUser({
//     id: 1, 
//     username: 'bijay', 
//     room: 'test1'
// });

// addUser({
//     id: 2, 
//     username: 'kumar', 
//     room: 'test1'
// });

// addUser({
//     id: 3, 
//     username: 'sahoo', 
//     room: 'test2'
// });

// console.log(users);
// removeUser(2);
// console.log(users);
// console.log(getUser(1));
// console.log('all users in a room');
// console.log(getUserInRoom('tesT2  '));

module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}