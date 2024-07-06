/*
    Copyright 2024 by its-mr-monday
    All rights reserved
    This file is part of the jsipc library, and is released 
    under the "MIT License Agreement". Please see the LICENSE file that 
    should have been included as part of this package
*/

const io = require('socket.io-client');

class JsIPC {
    /**
     * Create a new JsIPC instance
     * @param {number} [port=5000] - The port number to connect to
     */
    constructor(port = 5000) {
        this.socket = io(`http://localhost:${port}`);
        this.handlers = {};

        this.socket.on('message', async (payload) => {
            const { event, data, response_id } = payload;
            if (this.handlers[event]) {
                try {
                    const result = await this.handlers[event](data);
                    if (response_id) {
                        this.socket.emit(response_id, result);
                    }
                } catch (error) {
                    console.error(`Error in handler for event ${event}:`, error);
                    if (response_id) {
                        this.socket.emit(response_id, { error: error.message });
                    }
                }
            }
        });
    }

    /**
     * Register a handler for a specific event
     * @param {string} event - The event to listen for
     * @param {function} handler - The function to handle the event
     */
    on(event, handler) {
        this.handlers[event] = handler;
    }

    /**
     * Remove a handler for a specific event
     * @param {string} event - The event to stop listening for
     */
    off(event) {
        delete this.handlers[event];
    }

    /**
     * Invoke a remote procedure and wait for its response
     * @param {string} event - The event name of the remote procedure
     * @param {*} data - The data to send with the invocation
     * @returns {Promise<*>} The response from the remote procedure
     */
    async invoke(event, data) {
        return new Promise((resolve, reject) => {
            const response_id = this.generateUUID();
            this.socket.emit('message', { event, data, response_id });

            const responseHandler = (response) => {
                this.socket.off(response_id, responseHandler);
                if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            };

            this.socket.on(response_id, responseHandler);
        });
    }

    /**
     * Generate a random 32-character string of alphabetic characters
     * @returns {string} A unique identifier string
     */
    generateUUID() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Close the Socket.IO connection
     */
    close() {
        this.socket.close();
    }
}

module.exports = JsIPC;