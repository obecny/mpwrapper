const shimmer = require('shimmer');
const mpWrapper = require('../build/src/index');

function theOriginal(a, b) {
  console.log('the original', a, b);
}

const obj = {
  theOriginal,
};

const mpWrapper1 = mpWrapper.wrap(obj, 'theOriginal', (orig) => {
  return function mpWrapper() {
    console.log('mpWrapper start1');
    return orig.apply(this, arguments);
  };
});

shimmer.wrap(obj, 'theOriginal', (orig) => {
  return function shimmerWrapper() {
    console.log('shimmerWrapper start');
    return orig.apply(this, arguments);
  };
});


const mpWrapper2 = mpWrapper.wrap(obj, 'theOriginal', (orig) => {
  return function mpWrapper() {
    console.log('mpWrapper start2');
    return orig.apply(this, arguments);
  };
});

obj.theOriginal(1, 2);

console.log('\nnow unwrap and call again:');
mpWrapper1.unwrap();
mpWrapper2.unwrap();
obj.theOriginal(3, 4);