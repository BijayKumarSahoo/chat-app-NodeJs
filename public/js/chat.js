//----------------------------------------CLIENT------------------------------------------//

const socket = io();

//Listen to the sever generated event
// socket.on('countUpdated', (count) => {
//     console.log("Client side count updated! ", count);    
// });

//Emit an event to the server
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('incrementCount');
// });

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $geoLocationButton = document.querySelector('#geoLocation');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#msg-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    const $messages = document.querySelector('#messages')
    const newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight


    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


//Get the roomData for sidebar
socket.on('roomData', (data) => {
    const html = Mustache.render(sidebarTemplate, {...data});
    document.querySelector('#sidebar').innerHTML = html
})

//Render normal msg dynamically
socket.on('message', (msg) => {
    // console.log(msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        text: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

//Render location msg dynamically
socket.on('locationMessage', (msg) => {
    // console.log(locationUrl);
    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        locationUrl: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm:s a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

//Listen when the form is submitted
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //Disable
    $messageFormButton.setAttribute('disabled', 'disabled');
    const msg = $messageFormInput.value;
    
    //Send event with the msg to the server
    socket.emit('sendMessage', msg, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error) {
            return console.log(error); //listener's response 
        }
        console.log("The message was delivered") //Acknowledge message received by the receiver
    });
});

$geoLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        alert("Your browser doesn't support Geolocation");
    }
    //Disable
    $geoLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (msg) => {
            //Enable
            $geoLocationButton.removeAttribute('disabled');
            console.log(msg);
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});