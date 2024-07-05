# JsIPC

This project is solely used because I hate using js for IPC controls

This is to be used with the following pyton3 server:

[PyIPC](https://github.com/its-mr-monday/pyipc)



## Usage

### JS Process

```js
import JsIPC from '@its-mr-monday/jsipc';

const ipc = new JsIPC();

ipc.on('test', (data) => {
    console.log(data);
});

ipc.emit('test', 'Hello from js');
```

### Python Process

```py
from pyipc.pyipc import PyIPC

ipc = PyIPC()

@ipc.on('test')
def test(data):
    print(data)
    ipc.emit('test', 'Hello from python')

ipc.start()

```

## Installation

Using npm:
```console
    npm i @itsmrmonday/jsipc
```

Using yarn:
```console
    yarn add @itsmrmonday/jsipc
```