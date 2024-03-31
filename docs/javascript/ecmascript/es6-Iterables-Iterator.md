---
slug: /es6-Iterables-Iterator
---

# 8. ES6中的新特性:Iterables和iterators

# 简介

为了方便集合数据的遍历，在ES6中引入了一个iteration的概念。为我们提供了更加方便的数据遍历的手段。

一起来学习一下吧。

# 什么是iteration

iteration也称为遍历，就是像数据库的游标一样，一步一步的遍历集合或者对象的数据。

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

Iterable是一个接口，通过这个接口，我们可以连接数据提供者和数据消费者。

Iterable对象叫做数据提供者。对于数据消费者来说，除了可以调用next方法来获取数据之外，还可以使用for-of 或者 ...扩展运算符来进行遍历。

for-of的例子：

~~~js
  for (const x of ['a', 'b', 'c']) {
      console.log(x);
  }
~~~

...扩展运算符的例子：

~~~js
 const arr = [...new Set(['a', 'b', 'c'])];
~~~

# Iterable对象

ES6中，可以被称为Iterable对象的有下面几种：

* Arrays
* Strings
* Maps
* Sets
* DOM

先看一个Arrays的情况，假如我们有一个Arrays,可以通过Symbol.iterator这个key来获取到Iterator:

~~~js

> const arr = ['a', 'b', 'c'];
> const iter = arr[Symbol.iterator]();
> iter.next()
{ value: 'a', done: false }
> iter.next()
{ value: 'b', done: false }
> iter.next()
{ value: 'c', done: false }
> iter.next()
{ value: undefined, done: true }
~~~

更加简单的办法就是使用for-of:

~~~js
for (const x of ['a', 'b']) {
    console.log(x);
}
// Output:
// 'a'
// 'b'
~~~

看一个遍历String的情况，String的遍历是通过Unicode code points来区分的：

~~~js
for (const x of 'a\uD83D\uDC0A') {
    console.log(x);
}
// Output:
// 'a'
// '\uD83D\uDC0A' (crocodile emoji)
~~~

上面的例子中，基础类型的String在遍历的时候，会自动转换成为String对象。

Maps是通过遍历entries来实现的：

~~~js
const map = new Map().set('a', 1).set('b', 2);
for (const pair of map) {
    console.log(pair);
}
// Output:
// ['a', 1]
// ['b', 2]
~~~

还记得之前提到的WeakMaps吗？

WeakMap,WeakSet和Map于Set的区别在于，WeakMap的key只能是Object对象，不能是基本类型。

为什么会有WeakMap呢？

对于JS中的Map来说，通常需要维护两个数组，第一个数组中存储key，第二个数组中存储value。每次添加和删除item的时候，都需要同时操作两个数组。

这种实现有两个缺点，第一个缺点是每次查找的时候都需要遍历key的数组，然后找到对应的index，再通过index来从第二个数组中查找value。

第二个缺点就是key和value是强绑定的，即使key不再被使用了，也不会被垃圾回收。

所以引入了WeakMap的概念，在WeakMap中，key和value没有这样的强绑定关系，key如果不再被使用的话，可以被垃圾回收器回收。

因为引用关系是weak的，所以weakMap不支持key的遍历，如果你想遍历key的话，请使用Map。

看下Set的遍历：

~~~js
const set = new Set().add('a').add('b');
for (const x of set) {
    console.log(x);
}
// Output:
// 'a'
// 'b'
~~~

我们还可以遍历arguments对象：

~~~js
function printArgs() {
    for (const x of arguments) {
        console.log(x);
    }
}
printArgs('a', 'b');

// Output:
// 'a'
// 'b'
~~~

对于大部分DOM来说，也是可以遍历的：

~~~js
for (const node of document.querySelectorAll('div')) {
    ···
}
~~~

# 普通对象不是可遍历的

简单对象就是通过字面量创建出来的对象，这些对象虽然也有key-value的内容，但是是不可遍历的。

为什么呢？

因为可遍历对象比如Array，Map，Set也是普通对象的一种特例。如果普通对象可以遍历了，那么会导致可以遍历对象的一些遍历中的冲突。

~~~js
for (const x of {}) { // TypeError
    console.log(x);
}
~~~

虽然不能直接遍历普通对象，但是我们可以通过使用objectEntries方法来遍历普通对象。

先看下objectEntries的实现：

~~~js
function objectEntries(obj) {
    let iter = Reflect.ownKeys(obj)[Symbol.iterator]();

    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            let { done, value: key } = iter.next();
            if (done) {
                return { done: true };
            }
            return { value: [key, obj[key]] };
        }
    };
}
~~~

我们通过Reflect.ownKeys()反射拿到对象中的iterator.然后通过这个iterator来进行普通对象的遍历。

看下具体的使用：

~~~js

const obj = { first: 'Jane', last: 'Doe' };

for (const [key,value] of objectEntries(obj)) {
    console.log(`${key}: ${value}`);
}

// Output:
// first: Jane
// last: Doe
~~~

# 自定义iterables

除了ES6中默认的iterables之外，我们还可以自定义iterables。

因为iterables是一个接口，我们只需要实现它就可以了。我们看一个iterables的例子：

~~~js
function iterateOver(...args) {
    let index = 0;
    const iterable = {
        [Symbol.iterator]() {
            const iterator = {
                next() {
                    if (index < args.length) {
                        return { value: args[index++] };
                    } else {
                        return { done: true };
                    }
                }
            };
            return iterator;
        }
    }
    return iterable;
}
~~~

iterateOver方法会返回一个iterable对象。在这个对象中，我们实现了Symbol.iterator为key的方法。这个方法返回一个iterator，在iterator中，我们实现了next方法。

上面的方法使用起来是下面的效果：

~~~js
// Using `iterateOver()`:
for (const x of iterateOver('fee', 'fi', 'fo', 'fum')) {
    console.log(x);
}

// Output:
// fee
// fi
// fo
// fum
~~~

上面的例子中，如果Symbol.iterator返回的对象是iterable本身，那么iterable也是一个iterator。

~~~js
function iterateOver(...args) {
    let index = 0;
    const iterable = {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (index < args.length) {
                return { value: args[index++] };
            } else {
                return { done: true };
            }
        },
    };
    return iterable;
}
~~~

这样做的好处就是，我们可以使用for-of同时遍历iterables和iterators，如下所示：

~~~js
const arr = ['a', 'b'];
const iterator = arr[Symbol.iterator]();

for (const x of iterator) {
    console.log(x); // a
    break;
}

// Continue with same iterator:
for (const x of iterator) {
    console.log(x); // b
}
~~~

# 关闭iterators

如果我们需要遍历的过程中，从iterators中返回该怎么处理呢？

通过实现return方法，我们可以在程序中断的时候（break，return，throw）调用iterators的return。

~~~js
function createIterable() {
    let done = false;
    const iterable = {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (!done) {
                done = true;
                return { done: false, value: 'a' };
            } else {
                return { done: true, value: undefined };
            }
        },
        return() {
            console.log('return() was called!');
        },
    };
    return iterable;
}
for (const x of createIterable()) {
    console.log(x);
    break;
}
// Output:
// a
// return() was called!
~~~

上面例子中，我们通过break来中断遍历，最终导致return方法的调用。

> 注意，return方法必须要返回一个对象，{ done: true, value: x }

# 总结

上面就是ES6中引入的Iterables和iterators的一些概念。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







