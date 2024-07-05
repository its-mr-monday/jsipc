const io = require('socket.io-client');

class JsIPC {
    constructor(port = 5000) {
        let url = `http://localhost:${port}`;
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

    close() {
        this.socket.close();
    }
    
    dispose() {
        this.socket.close();
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