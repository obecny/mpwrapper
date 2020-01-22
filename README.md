# mpwrapper - Monkey Patch Wrapper
[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

Monkey Patch Wrapper that support multiple wrapping and unwrapping.

## Installation

```bash
npm install --save mpwrapper
```

## Usage in node.js

```js
const https = require('https');
const mpWrapper = require('mpwrapper');
const wrapper1 = mpWrapper.wrap(https, 'get', (original) => {
  return function () {
    console.log('before request 1');
    const result = original.apply(this, arguments);
    console.log('after request 1');
    return result;
  };
});

const wrapper2 = mpWrapper.wrap(https, 'get', (original) => {
  return function () {
    console.log('before request 2');
    const result = original.apply(this, arguments);
    console.log('after request 2');
    return result;
  };
});

function getData(callback) {
  const url = 'https://raw.githubusercontent.com/obecny/mpwrapper/master/package.json';
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      const info = JSON.parse(data);
      console.log(`${info.name} - ${info.version}`);
      callback();
    });
  });
}

getData(()=> {
  wrapper1.unwrap();
  getData(()=> {
    wrapper2.unwrap();
    getData(()=> {
      console.log('done');
    });
  });
});

// before request 1
// before request 2
// after request 2
// after request 1
// mpwrapper - 0.1.0
// before request 2
// after request 2
// mpwrapper - 0.1.0
// mpwrapper - 0.1.0
// done
```

## Usage in browser

```js
import * as mpWrapper from 'mpwrapper';
const wrapper1 = mpWrapper.wrap(XMLHttpRequest.prototype, 'open', (original) => {
  return function () {
    console.log('before request 1');
    const result = original.apply(this, arguments);
    console.log('after request 1');
    return result;
  };
});

const wrapper2 = mpWrapper.wrap(XMLHttpRequest.prototype, 'open', (original) => {
  return function () {
    console.log('before request 2');
    const result = original.apply(this, arguments);
    console.log('after request 2');
    return result;
  };
});

function getData(callback) {
  const url = 'https://raw.githubusercontent.com/obecny/mpwrapper/master/package.json';
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.send();
  req.onload = function () {
    const info = JSON.parse(req.responseText);
    console.log(`${info.name} - ${info.version}`);
    callback();
  };
}

getData(()=> {
  wrapper1.unwrap();
  getData(()=> {
    wrapper2.unwrap();
    getData(()=> {
      console.log('done');
    });
  });
});

// before request 1
// before request 2
// after request 2
// after request 1
// mpwrapper - 0.1.0
// before request 2
// after request 2
// mpwrapper - 0.1.0
// mpwrapper - 0.1.0
// done
```

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[license-url]: https://github.com/obecny/mpwrapper/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/mpwrapper
[npm-img]: https://badge.fury.io/js/mpwrapper.svg