ECMAScript 2017(ES8)新特性简介

# 简介

ES8是ECMA协会在2017年6月发行的一个版本，因为是ECMAScript的第八个版本，所以也称为ES8.

今天我们讲解一下ES8的新特性。

ES8引入了2大特性和4个小的特性，我们接下来一一讲解。

# Async函数

我们在ES6中提到了generator，Async函数的操作和generator很类似。

我们看下Async的使用：

~~~js
//Async 函数定义：
async function foo() {}

//Async 函数表达式：
const foo = async function () {};

//Async 方法定义：
let obj = { async foo() {} }

//Async 箭头函数：
const foo = async () => {};
~~~

async函数返回的是一个封装的Promise对象：

~~~js
async function asyncFunc() {
    return 123;
}

asyncFunc()
.then(x => console.log(x));
    // 123
~~~

如果在函数中抛出异常，则会reject Promise:

~~~js
async function asyncFunc() {
    throw new Error('Problem!');
}

asyncFunc()
.catch(err => console.log(err));
    // Error: Problem!
~~~

上面的例子中我们在async函数使用的是同步的代码，如果想要在async中执行异步代码，则可以使用await，注意await只能在async中使用。

await后面接的是一个Promise。如果Promise完成了，那么await被赋值的结果就是Promise的值。

如果Promise被reject了，那么await将会抛出异常。

~~~js
async function asyncFunc() {
    const result = await otherAsyncFunc();
    console.log(result);
}

// Equivalent to:
function asyncFunc() {
    return otherAsyncFunc()
    .then(result => {
        console.log(result);
    });
}
~~~

我们可以顺序处理异步执行的结果：

~~~js
async function asyncFunc() {
    const result1 = await otherAsyncFunc1();
    console.log(result1);
    const result2 = await otherAsyncFunc2();
    console.log(result2);
}

// Equivalent to:
function asyncFunc() {
    return otherAsyncFunc1()
    .then(result1 => {
        console.log(result1);
        return otherAsyncFunc2();
    })
    .then(result2 => {
        console.log(result2);
    });
}
~~~

也可以并行执行异步结果：

~~~js
async function asyncFunc() {
    const [result1, result2] = await Promise.all([
        otherAsyncFunc1(),
        otherAsyncFunc2(),
    ]);
    console.log(result1, result2);
}

// Equivalent to:
function asyncFunc() {
    return Promise.all([
        otherAsyncFunc1(),
        otherAsyncFunc2(),
    ])
    .then([result1, result2] => {
        console.log(result1, result2);
    });
}
~~~

最后看下如何处理异常：

~~~js
async function asyncFunc() {
    try {
        await otherAsyncFunc();
    } catch (err) {
        console.error(err);
    }
}

// Equivalent to:
function asyncFunc() {
    return otherAsyncFunc()
    .catch(err => {
        console.error(err);
    });
}
~~~

需要注意的是，如果async中返回的不是Promise，那么将会被封装成为Promise。如果已经是Promise对象的话，则不会被再次封装：

~~~js
async function asyncFunc() {
    return Promise.resolve(123);
}
asyncFunc()
.then(x => console.log(x)) // 123
~~~

同样的，如果返回一个rejected的Promise对象，则和抛出异常一样的结果：

~~~js
async function asyncFunc() {
    return Promise.reject(new Error('Problem!'));
}
asyncFunc()
.catch(err => console.error(err)); // Error: Problem!
~~~

如果你只是想触发异步方法，但是并不想等待它执行完毕，那么不使用await：

~~~js
async function asyncFunc() {
    const writer = openFile('someFile.txt');
    writer.write('hello'); // don’t wait
    writer.write('world'); // don’t wait
    await writer.close(); // wait for file to close
}
~~~

# 共享内存和原子操作

ES7引入了一个新的构造函数SharedArrayBuffer和命名空间Atomics。

在JS中，除了主线程之外，我们还可以创建worker线程，主线程和worker线程之间的通信是通过postMessage方法来进行的。

但是这样的通信方式并不高效。于是引入了SharedArrayBuffer这样的共享空间，来提升消息传输效率。

~~~js
// main.js

const worker = new Worker('worker.js');

// To be shared
const sharedBuffer = new SharedArrayBuffer( // (A)
    10 * Int32Array.BYTES_PER_ELEMENT); // 10 elements

// Share sharedBuffer with the worker
worker.postMessage({sharedBuffer}); // clone

// Local only
const sharedArray = new Int32Array(sharedBuffer); // (B)
~~~

上面的例子中，我们创建了一个SharedArrayBuffer，并将这个SharedArrayBuffer通过postMessage的方式发给worker。

我们知道postMessage是以拷贝的方式来发送消息的，但是这是正确使用共享的方式。

我看下在worker中怎么接收这个Buffer：

~~~js
// worker.js

self.addEventListener('message', function (event) {
    const {sharedBuffer} = event.data;
    const sharedArray = new Int32Array(sharedBuffer); // (A)

    // ···
});
~~~

在worker中，我们将sharedBuffer使用Int32Array封装起来，作为Array而使用。

那么我们考虑一个问题，在使用sharedBuffer的过程中，会出现什么问题呢？

因为是共享的，所以可以在多个worker线程中同时被使用。如果在同时被使用的时候就会出现多线程共享数据的问题，也就是并发的问题。

为了解决并发的问题，我们回想一下在java中特别有一个concurrent包，里面有一些Atomic的类，可以执行原子性操作。

在ES8中，同样引入了Atomics，用来进行SharedArrayBuffer的原子性操作。同时，使用Atomics还可以禁止重排序。

Atomics实际操作的Typed Array：Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array or Uint32Array。

注意，这些Array都是SharedArrayBuffer的封装Array。并且都是Int的Array（目前只支持Int类型）。

首先看下Atomics怎么解决数组的并发写入和读取的问题：

~~~js
Atomics.load(ta : TypedArray<T>, index) : T
Atomics.store(ta : TypedArray<T>, index, value : T) : T
Atomics.exchange(ta : TypedArray<T>, index, value : T) : T
Atomics.compareExchange(ta : TypedArray<T>, index, expectedValue, replacementValue) : T
~~~

load和store可以将ta作为一个整体来操作。

看下使用例子：

~~~js
// main.js
console.log('notifying...');
Atomics.store(sharedArray, 0, 123);

// worker.js
while (Atomics.load(sharedArray, 0) !== 123) ;
console.log('notified');
~~~

Atomics还提供了wait和notity功能：

~~~js
Atomics.wait(ta: Int32Array, index, value, timeout)
Atomics.wake(ta : Int32Array, index, count)
~~~

当ta[index]的值是value的时候，wait将会使worker等待在ta[index]之上。

而wake，则是将等待在ta[index]上的count个worker唤醒。

Atomics还提供了一系列的操作：

~~~js
Atomics.add(ta : TypedArray<T>, index, value) : T
Atomics.sub(ta : TypedArray<T>, index, value) : T
Atomics.and(ta : TypedArray<T>, index, value) : T
Atomics.or(ta : TypedArray<T>, index, value) : T
Atomics.xor(ta : TypedArray<T>, index, value) : T
~~~

它相当于：

~~~js
ta[index] += value;
~~~

Atomic有一个很棒的作用就是构建lock。我们将会在后面的文章中介绍。

# Object的新方法

Object提供了两个遍历的新方法entries和values。

~~~js
Object.entries(value : any) : Array<[string,any]>
~~~

entries返回的是一个数组，里面存储的是key-value对：

~~~js
> Object.entries({ one: 1, two: 2 })
[ [ 'one', 1 ], [ 'two', 2 ] ]
~~~

entries给了我们一个遍历Object的方法：

~~~js
let obj = { one: 1, two: 2 };
for (let [k,v] of Object.entries(obj)) {
    console.log(`${JSON.stringify(k)}: ${JSON.stringify(v)}`);
}
// Output:
// "one": 1
// "two": 2
~~~

我们可以使用entries来创建Map：

~~~js
let map = new Map(Object.entries({
    one: 1,
    two: 2,
}));
console.log(JSON.stringify([...map]));
    // [["one",1],["two",2]]
~~~

同样的，Object还提供了values方法：

~~~js
Object.values(value : any) : Array<any>
~~~

返回的是一个数组，数组中存放的是Object的value。

除此之外，Object还有一个getOwnPropertyDescriptors新方法。

这个方法返回的是Obj中的属性的描述。所谓属性的描述就是指这个属性是否可写，是否可以数之类：

~~~js
const obj = {
    [Symbol('foo')]: 123,
    get bar() { return 'abc' },
};
console.log(Object.getOwnPropertyDescriptors(obj));

// Output:
// { [Symbol('foo')]:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
~~~

key是Obj中的key，value就是PropertyDescriptors。

虽然在ES6中，Obj已经引入了一个Object.assign()方法用来拷贝properties，但是这个assign只能拷贝具有默认属性值的属性。对于那些具有非默认属性值的属性getters, setters, non-writable properties来说，Object.assign是不能拷贝的。这个时候就需要使用getOwnPropertyDescriptors方法了。

~~~js
const source = {
    set foo(value) {
        console.log(value);
    }
};
console.log(Object.getOwnPropertyDescriptor(source, 'foo'));
// { get: undefined,
//   set: [Function: foo],
//   enumerable: true,
//   configurable: true }

const target1 = {};
Object.assign(target1, source);
console.log(Object.getOwnPropertyDescriptor(target1, 'foo'));
// { value: undefined,
//   writable: true,
//   enumerable: true,
//   configurable: true }
~~~

可以看到obj就有一个foo属性，它是一个setter。所以使用assign是不能进行拷贝的。

我们看下怎么使用defineProperties和getOwnPropertyDescriptors来进行拷贝：

~~~js
const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
console.log(Object.getOwnPropertyDescriptor(target2, 'foo'));
// { get: undefined,
//   set: [Function: foo],
//   enumerable: true,
//   configurable: true }
~~~

除了拷贝属性之外，我们还可以拷贝对象：

~~~js
const clone = Object.create(Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj));
~~~


# String的新方法

String添加了两个新的方法padStart和padEnd。

pad就是填充的意思，我们可以从前面填充也可以从后面填充。我们看下pad的用法：

~~~js
String.prototype.padStart(maxLength, fillString=' ') 
String.prototype.padEnd(maxLength, fillString=' ') 
~~~

看下具体的使用：

~~~js
> 'x'.padStart(5, 'ab')
'ababx'
> 'x'.padEnd(5, 'ab')
'xabab'
~~~

# 逗号可以添加到函数的参数列表后面了

在ES8之前，函数的最后一个参数是不允许添加逗号的，但是在ES8中，一切都变得可能。

~~~js
function foo(
    param1,
    param2,
) {}
~~~

我们可以在函数的定义中添加逗号。也可以在函数的调用中添加逗号：

~~~js
foo(
    'abc',
    'def',
);
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
















