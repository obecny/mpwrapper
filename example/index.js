import * as mpWrapper from '../src/wrapper';
// import * as mpWrapper from 'mpwrapper';
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

getData(() => {
  wrapper1.unwrap();
  getData(() => {
    wrapper2.unwrap();
    getData(() => {
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
