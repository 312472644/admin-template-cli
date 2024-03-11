class A {
  constructor() {
    console.log('A');
  }
}

class B extends A {
  constructor() {
    super();
    console.log('B');
  }
}

async function asyncFn() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000);
  });
}

await asyncFn();

const map = new Map();
console.log('map', map);

const b = new B();
console.log(b);
