const https = require('https');
// const mpWrapper = require('mpwrapper');
const mpWrapper = require('../build/src/index');
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
