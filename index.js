/*
    Copyright 2024 by its-mr-monday
    All rights reserved
    This file is part of the jsipc library, and is released 
    under the "MIT License Agreement". Please see the LICENSE file that 
    should have been included as part of this package
*/

const io = require('socket.io-client');

/**
 * JsIPC class for inter-process communication using Socket.IO
 */
class JsIPC {
    /**
     * Create a new JsIPC instance
     * @param {number} [port=5000] - The port number to connect to
     */
    constructor(port = 5000) {
        let url = `http://localhost:${port}`;
        this.socket = io(url);
        this.handlers = {};
        this.roomHandlers = {};

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('message', (payload) => {
            const channel = payload['channel'];
            const data = payload['data'];
            let room = payload['room'] || null;
            if (room && this.roomHandlers[room] && this.roomHandlers[room][channel]) {
                this.roomHandlers[room][channel](data);
            } else if (this.handlers[channel]) {
                this.handlers[channel](data);
            }
        });
    }

    /**
     * Close the Socket.IO connection
     */
    close() {
        this.socket.close();
    }
    
    /**
     * Alias for close() method
     */
    dispose() {
        this.close();
    }

    /**
     * Register a handler for a specific channel
     * @param {string} channel - The channel to listen on
     * @param {function} handler - The function to handle incoming messages
     */
    on(channel, handler) {
        this.handlers[channel] = handler;
    }

    /**
     * Register a handler for a specific room and channel
     * @param {string} room - The room to join
     * @param {string} channel - The channel to listen on within the room
     * @param {function} handler - The function to handle incoming messages
     */
    onRoom(room, channel, handler) {
        if (!this.roomHandlers[room]) {
            this.roomHandlers[room] = {};
        }
        this.roomHandlers[room][channel] = handler;
    }

    /**
     * Remove a handler for a specific channel
     * @param {string} channel - The channel to stop listening on
     */
    off(channel) {
        delete this.handlers[channel];
    }

    /**
     * Remove a handler for a specific room and channel
     * @param {string} room - The room to leave
     * @param {string} channel - The channel to stop listening on within the room
     */
    offRoom(room, channel) {
        if (this.roomHandlers[room]) {
            delete this.roomHandlers[room][channel];
            if (Object.keys(this.roomHandlers[room]).length === 0) {
                delete this.roomHandlers[room];
            }
        }
    }

    /**
     * Emit a message on a specific channel, optionally to a specific room
     * @param {string} channel - The channel to emit on
     * @param {*} data - The data to emit
     * @param {string} [room=null] - The room to emit to (if any)
     */
    emit(channel, data, room = null) {
        const payload = { channel, data };
        if (room !== null) {
            payload.room = room;
        }
        this.socket.emit('message', payload);
    }

    /**
     * Join a specific room
     * @param {string} room - The room to join
     */
    joinRoom(room) {
        this.socket.emit('join', { room });
    }

    /**
     * Leave a specific room
     * @param {string} room - The room to leave
     */
    leaveRoom(room) {
        this.socket.emit('leave', { room });
    }
}

module.exports = JsIPC;