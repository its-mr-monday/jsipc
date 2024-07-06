# JsIPC

This project is solely used because I hate using js for IPC controls

This is to be used with the following pyton3 server:

[PyIPC](https://github.com/its-mr-monday/pyipc)

## Installation

Using npm:
```console
    npm i @itsmrmonday/jsipc
```

Using yarn:
```console
    yarn add @itsmrmonday/jsipc
```

# JsIPC Documentation

JsIPC is a JavaScript class for inter-process communication using Socket.IO. It provides an easy-to-use interface for connecting to a server, handling events, and invoking remote procedures.

## Import

```javascript
//For ES6 (React, Angular, etc)
import JsIPC from '@itsmrmonday/jsipc';

//For ES5 (Node, Electron, etc)
const JsIPC = require('@itsmrmonday/jsipc');
```

## Class: JsIPC

### Constructor

```javascript
new JsIPC(port = 5000)
```

Creates a new JsIPC instance.

- `port`: The port number to connect to (default is 5000)

### Methods

#### on(event, handler)

Registers a handler for a specific event.

```javascript
ipc.on('greet', (data) => {
    return `Hello, ${data.name}!`;
});
```

#### off(event)

Removes a handler for a specific event.

```javascript
ipc.off('greet');
```

#### async invoke(event, data)

Invokes a remote procedure and waits for its response.

```javascript
const result = await ipc.invoke('greet', { name: 'Bob' });
console.log(result);  // Outputs: Hello, Bob!
```

#### close()

Closes the Socket.IO connection.

```javascript
ipc.close();
```

## Full Example

```javascript
import JsIPC from '@itsmrmonday/jsipc';

async function main() {
    const ipc = new JsIPC(5000);

    ipc.on('greet', (data) => {
        return `Hello, ${data.name}!`;
    });

    try {
        const result = await ipc.invoke('greet', { name: 'Bob' });
        console.log(result);  // Outputs: Hello, Bob!
    } catch (error) {
        console.error('Error:', error);
    } finally {
        ipc.close();
    }
}

main();
```

This example sets up a JsIPC client, registers a 'greet' handler, invokes a remote 'greet' procedure, and then closes the connection.

## Interoperability with PyIPC

JsIPC is designed to work seamlessly with PyIPC. You can use JsIPC to connect to a PyIPC server running in a Python process, enabling powerful inter-process communication scenarios between JavaScript and Python applications.