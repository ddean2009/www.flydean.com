---
slug: /es9-async-iteration
---

# 11. ES9的新特性:异步遍历Async iteration



# 简介

在ES6中，引入了同步iteration的概念，随着ES8中的Async操作符的引用，是不是可以在一异步操作中进行遍历操作呢？

今天要给大家讲一讲ES9中的异步遍历的新特性Async iteration。

# 异步遍历

在讲解异步遍历之前，我们先回想一下ES6中的同步遍历。

根据ES6的定义，iteration主要由三部分组成：

1. Iterable

先看下Iterable的定义：

~~~js
interface Iterable {
    [Symbol.iterator]() : Iterator;
}
~~~

Iterable表示这个对象里面有可遍历的数据，并且需要实现一个可以生成Iterator的工厂方法。

2. Iterator

~~~js
interface Iterator {
    next() : IteratorResult;
}
~~~

可以从Iterable中构建Iterator。Iterator是一个类似游标的概念，可以通过next访问到IteratorResult。

3. IteratorResult

IteratorResult是每次调用next方法得到的数据。

~~~js
interface IteratorResult {
    value: any;
    done: boolean;
}
~~~

IteratorResult中除了有一个value值表示要获取到的数据之外，还有一个done，表示是否遍历完成。

下面是一个遍历数组的例子：

~~~js
> const iterable = ['a', 'b'];
> const iterator = iterable[Symbol.iterator]();
> iterator.next()
{ value: 'a', done: false }
> iterator.next()
{ value: 'b', done: false }
> iterator.next()
{ value: undefined, done: true }
~~~

但是上的例子遍历的是同步数据，如果我们获取的是异步数据，比如从http端下载下来的文件，我们想要一行一行的对文件进行遍历。因为读取一行数据是异步操作，那么这就涉及到了异步数据的遍历。

加入异步读取文件的方法是readLinesFromFile，那么同步的遍历方法，对异步来说就不再适用了：

~~~js
//不再适用
for (const line of readLinesFromFile(fileName)) {
    console.log(line);
}
~~~

也许你会想，我们是不是可以把异步读取一行的操作封装在Promise中，然后用同步的方式去遍历呢？

想法很好，不过这种情况下，异步操作是否执行完毕是无法检测到的。所以方法并不可行。

于是ES9引入了异步遍历的概念：

1. 可以通过Symbol.asyncIterator来获取到异步iterables中的iterator。

2. 异步iterator的next()方法返回Promises对象，其中包含IteratorResults。

所以，我们看下异步遍历的API定义：

~~~js
interface AsyncIterable {
    [Symbol.asyncIterator]() : AsyncIterator;
}
interface AsyncIterator {
    next() : Promise<IteratorResult>;
}
interface IteratorResult {
    value: any;
    done: boolean;
}
~~~

我们看一个异步遍历的应用：

~~~js
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();
asyncIterator.next()
.then(iterResult1 => {
    console.log(iterResult1); // { value: 'a', done: false }
    return asyncIterator.next();
})
.then(iterResult2 => {
    console.log(iterResult2); // { value: 'b', done: false }
    return asyncIterator.next();
})
.then(iterResult3 => {
    console.log(iterResult3); // { value: undefined, done: true }
});
~~~

其中createAsyncIterable将会把一个同步的iterable转换成一个异步的iterable，我们将会在下面一小节中看一下到底怎么生成的。

这里我们主要关注一下asyncIterator的遍历操作。

因为ES8中引入了Async操作符，我们也可以把上面的代码，使用Async函数重写：

~~~js
async function f() {
    const asyncIterable = createAsyncIterable(['a', 'b']);
    const asyncIterator = asyncIterable[Symbol.asyncIterator]();
    console.log(await asyncIterator.next());
        // { value: 'a', done: false }
    console.log(await asyncIterator.next());
        // { value: 'b', done: false }
    console.log(await asyncIterator.next());
        // { value: undefined, done: true }
}
~~~

# 异步iterable的遍历

使用for-of可以遍历同步iterable,使用 for-await-of 可以遍历异步iterable。

~~~js
async function f() {
    for await (const x of createAsyncIterable(['a', 'b'])) {
        console.log(x);
    }
}
// Output:
// a
// b
~~~

注意,await需要放在async函数中才行。

如果我们的异步遍历中出现异常，则可以在 for-await-of 中使用try catch来捕获这个异常：

~~~js
function createRejectingIterable() {
    return {
        [Symbol.asyncIterator]() {
            return this;
        },
        next() {
            return Promise.reject(new Error('Problem!'));
        },
    };
}
(async function () { 
    try {
        for await (const x of createRejectingIterable()) {
            console.log(x);
        }
    } catch (e) {
        console.error(e);
            // Error: Problem!
    }
})(); 
~~~

同步的iterable返回的是同步的iterators，next方法返回的是{value, done}。

如果使用 for-await-of 则会将同步的iterators转换成为异步的iterators。然后返回的值被转换成为了Promise。

如果同步的next本身返回的value就是Promise对象，则异步的返回值还是同样的promise。

也就是说会把：`Iterable<Promise<T>>` 转换成为 `AsyncIterable<T>` ,如下面的例子所示：

~~~js
async function main() {
    const syncIterable = [
        Promise.resolve('a'),
        Promise.resolve('b'),
    ];
    for await (const x of syncIterable) {
        console.log(x);
    }
}
main();

// Output:
// a
// b
~~~

上面的例子将同步的Promise转换成异步的Promise。

~~~js
async function main() {
    for await (const x of ['a', 'b']) {
        console.log(x);
    }
}
main();

// Output:
// c
// d
~~~

上面的例子将同步的常量转换成为Promise。 可以看到两者的结果是一样的。

# 异步iterable的生成

回到上面的例子，我们使用createAsyncIterable(syncIterable)将syncIterable转换成了AsyncIterable。

我们看下这个方法是怎么实现的：

~~~js
async function* createAsyncIterable(syncIterable) {
    for (const elem of syncIterable) {
        yield elem;
    }
}
~~~

上面的代码中，我们在一个普通的generator function前面加上async，表示的是异步的generator。

对于普通的generator来说，每次调用next方法的时候，都会返回一个object {value,done} ，这个object对象是对yield值的封装。

对于一个异步的generator来说，每次调用next方法的时候，都会返回一个包含object {value,done} 的promise对象。这个object对象是对yield值的封装。

因为返回的是Promise对象，所以我们不需要等待异步执行的结果完成，就可以再次调用next方法。

我们可以通过一个Promise.all来同时执行所有的异步Promise操作：

~~~js
const asyncGenObj = createAsyncIterable(['a', 'b']);
const [{value:v1},{value:v2}] = await Promise.all([
    asyncGenObj.next(), asyncGenObj.next()
]);
console.log(v1, v2); // a b
~~~

在createAsyncIterable中，我们是从同步的Iterable中创建异步的Iterable。 

接下来我们看下如何从异步的Iterable中创建异步的Iterable。

从上一节我们知道，可以使用for-await-of 来读取异步Iterable的数据，于是我们可以这样用：

~~~js
async function* prefixLines(asyncIterable) {
    for await (const line of asyncIterable) {
        yield '> ' + line;
    }
}
~~~

在generator一文中，我们讲到了在generator中调用generator。也就是在一个生产器中通过使用yield*来调用另外一个生成器。

同样的，如果是在异步生成器中，我们可以做同样的事情：

~~~js
async function* gen1() {
    yield 'a';
    yield 'b';
    return 2;
}
async function* gen2() {
    const result = yield* gen1(); 
        // result === 2
}

(async function () {
    for await (const x of gen2()) {
        console.log(x);
    }
})();
// Output:
// a
// b
~~~

如果在异步生成器中抛出异常，这个异常也会被封装在Promise中：

~~~js
async function* asyncGenerator() {
    throw new Error('Problem!');
}
asyncGenerator().next()
.catch(err => console.log(err)); // Error: Problem!
~~~

# 异步方法和异步生成器

异步方法是使用async function 声明的方法，它会返回一个Promise对象。

function中的return或throw异常会作为返回的Promise中的value。

~~~js
(async function () {
    return 'hello';
})()
.then(x => console.log(x)); // hello

(async function () {
    throw new Error('Problem!');
})()
.catch(x => console.error(x)); // Error: Problem!
~~~

异步生成器是使用 async function * 申明的方法。它会返回一个异步的iterable。

通过调用iterable的next方法，将会返回一个Promise。异步生成器中yield 的值会用来填充Promise的值。如果在生成器中抛出了异常，同样会被Promise捕获到。

~~~js
async function* gen() {
    yield 'hello';
}
const genObj = gen();
genObj.next().then(x => console.log(x));
    // { value: 'hello', done: false }
~~~


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
























