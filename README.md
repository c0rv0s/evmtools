# evmtools

A collection of useful evm related utilities bundled into a web server with a React front end.

## Optimize Structs

Finds the best ordering for struct arguments to save gas.

## Encode Data

Encodes a function call with params or an event signature or custom solidity error.

## Usage

```bash
./start.sh
```

Or manually:

In client/:

```bash
yarn
yarn build
```

In flask_server/:

```bash
pip install -r requirements.txt
export FLASK_APP=server.py
pm2 start server.py
```

In ts_server/:

```bash
yarn
yarn build
```

With pm2 installed:

```bash
pm2 start dist/index.js
```
