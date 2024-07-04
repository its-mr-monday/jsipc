const io = require('socket.io-client');

class JsIPC {
    constructor(url = 'http://localhost:5000') {
        this.socket = io(url);
        this.handlers = {};

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('message', (data) => {
            const { channel, payload } = data;
            if (this.handlers[channel]) {
                this.handlers[channel](payload);
            }
        });
    }

    on(channel, handler) {
        this.handlers[channel] = handler;
        this.socket.on(channel, handler);
    }

    off(channel, handler) {
        if (this.handlers[channel]) {
            this.handlers[channel] = this.handlers[channel].filter(h => h !== handler);
            if (this.handlers[channel].length === 0) {
                delete this.handlers[channel];
            }
        }
        this.socket.off(channel, handler);
    }

    emit(channel, data) {
        this.socket.emit('message', { channel, payload: data });
    }
}

module.exports = JsIPC;