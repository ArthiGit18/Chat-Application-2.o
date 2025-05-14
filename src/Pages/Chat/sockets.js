import io from 'socket.io-client';

const socket = io('https://chatapplication-2o-backend-production.up.railway.app', {
    transports: ['websocket'],
    upgrade: false
});

export default socket;
