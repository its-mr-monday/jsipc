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
     * JsIPC class for inter-process communication using Socket.IO.
     * 
     * @param {number} port - The port on which the server will run.
     * @param {boolean} logger - Flag to enable or disable logging.
     */
    constructor(port = 5000, logger = false) {
        this.socket = io(`http://localhost:${port}`);
        this.handlers = {};
        this.pendingResponses = {};
        this.logger = logger;

        this.socket.on('connect', () => {
            if (this.logger) console.log('Connected to PyIPC server');
        });

        this.socket.on('disconnect', () => {
            if (this.logger) console.log('Disconnected from PyIPC server');
        });

        this.socket.on('message', (payload) => {
            if (this.logger) console.log('Received message:', payload);
            const { event, data, response_id } = payload;
            if (response_id && this.pendingResponses[response_id]) {
                const { resolve, reject } = this.pendingResponses[response_id];
                delete this.pendingResponses[response_id];
                resolve(data);
            } else if (this.handlers[event]) {
                try {
                    const handler = this.handlers[event];
                    const result = handler.length === 0 ? handler() : handler(data);
                    if (response_id) {
                        if (this.logger) console.log(`Sending response for event: ${event}`);
                        this.socket.emit('message', { event, data: result, response_id });
                    }
                } catch (error) {
                    if (this.logger) console.error(`Error in handler for event ${event}:`, error);
                    if (response_id) {
                        this.socket.emit('message', { event, error: error.message, response_id });
                    }
                }
            } else {
                if (this.logger) console.warn(`No handler found for event: ${event}`);
            }
        });
    }

    /**
     * Register an event handler.
     * 
     * @param {string} event - The name of the event to handle.
     * @param {function} handler - The function to handle the event.
     */
    on(event, handler) {
        this.handlers[event] = handler;
        if (this.logger) console.log(`Registered handler for event: ${event}`);
    }

    /**
     * Remove an event handler.
     * 
     * @param {string} event - The name of the event to remove the handler for.
     * @returns {boolean} - True if a handler was removed, false if no handler was found for the event.
     */
    off(event) {
        if (this.handlers.hasOwnProperty(event)) {
            delete this.handlers[event];
            if (this.logger) console.log(`Removed handler for event: ${event}`);
            return true;
        }
        if (this.logger) console.warn(`No handler found to remove for event: ${event}`);
        return false;
    }

    /**
     * Invoke a remote procedure and wait for its response.
     * 
     * @param {string} event - The name of the event to invoke.
     * @param {any} [data={}] - The data to send with the event. Defaults to an empty object.
     * @param {number} [timeout=15000] - Maximum time to wait for a response, in milliseconds.
     * @returns {Promise<any>} - A promise that resolves with the response data.
     */
    invoke(event, data = {}, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const response_id = this.generateUUID();
            if (this.logger) console.log(`Invoking remote procedure '${event}':`, { event, data, response_id });
            this.socket.emit('message', { event, data, response_id });

            this.pendingResponses[response_id] = { resolve, reject };

            setTimeout(() => {
                if (this.pendingResponses[response_id]) {
                    delete this.pendingResponses[response_id];
                    const error = new Error(`Timeout waiting for response to event '${event}'`);
                    if (this.logger) console.error(error);
                    reject(error);
                }
            }, timeout);
        });
    }

    /**
     * Close the Socket.IO connection.
     */
    close() {
        this.socket.close();
        if (this.logger) console.log('JsIPC connection closed');
    }

    /**
     * Generate a unique identifier for response tracking.
     * 
     * @returns {string} - A unique identifier.
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

module.exports = JsIPC;