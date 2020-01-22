import * as mpWrapper from '../src/wrapper';

const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

function onLoad() {
  function wrapThen1(original) {
    return function wrappedThen() {
      console.log('inside user wrapped1');
      return original.apply(this, arguments);
    };
  }

  function wrapThen2(original) {
    return function wrappedThen() {
      console.log('inside user wrapped2');
      return original.apply(this, arguments);
    };
  }

  const wrapper1 = mpWrapper.wrap(Promise.prototype, 'then', wrapThen1);
  const wrapper2 = mpWrapper.wrap(Promise.prototype, 'then', wrapThen2);

  getData(url1).then((data) => {
    console.log('info from package.json', data.description, data.version);
    console.log('UNWRAPPING');
    // unwrap only wrapper2
    wrapper2.unwrap();
    // unwrap all
    // mpWrapper.unwrap(Promise.prototype, 'then');
    getData(url1).then((data) => {
      console.log('info after unwrap', data.description, data.version);
    });
  });

}

window.addEventListener('load', onLoad);

const getData = (url) => {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.send();
    req.onload = function () {
      let json;
      try {
        json = JSON.parse(req.responseText);
      } catch (e) {
        reject(e);
      }
      resolve(json);
    };
  });
};
