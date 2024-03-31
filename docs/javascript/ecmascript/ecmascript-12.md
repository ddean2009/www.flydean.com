---
slug: /ecmascript-12
---

# 3. ECMAScript 2021(ES12)新特性简介

# 简介

ES12是ECMA协会在2021年6月发行的一个版本，因为是ECMAScript的第十二个版本，所以也称为ES12.

ES12发行到现在已经有一个月了，那么ES12有些什么新特性和不一样的地方呢？一起来看看吧。


基本上ES12引入了replaceAll方法用于对String进行操作，Promise.any用于对Promise进行组合操作，AggregateError用于表示多个错误的集合，新的逻辑操作符??=, &&=, ||=，弱引用WeakRef，FinalizationRegistry用于垃圾回收的注册，一个数字的分隔符1_000，更加精准的数组sort方法Array.prototype.sort。

下面本文将会一一进行讲解。

# replaceAll 

熟悉java的朋友应该都知道，java中有两个进行字符串替换的方法，分别是replace和replaceAll，他们的区别在于replace是替换字符串，而replaceAll是进行正则表达式匹配。

但是在javascript中两者的涵义有所不同，在JS中replace是替换第一个出现的字符串，而replaceAll就是字面上的意思替换所有的字符串，我们举个例子：

```
const string="flydean is a good fly"
console.log(string.replace("fly", "butterfly"));

```
上面的值返回：

```
butterflydean is a good fly

```

如果改用replaceAll:

```
const string="flydean is a good fly"
console.log(string.replaceAll("fly", "butterfly"));
butterflydean is a good butterfly

```

# 私有方法

自从JS有了类的概念之后，就可以在类中定义方法，并通过实例化之后的类进行调用，如下所示：

```
class Student {
  getAge() {
    console.log("永远18岁")
  }
}

student= new Student();
student.getAge();

```

上面代码运行结果：

```
"永远18岁"
```

但是如果我们不希望getAge()方法直接暴露给外部使用，也就是说希望getAge()是一个私有方法，那么只需要在方法前面加上#即可。

```
class Student {
  #getAge() {
    console.log("永远18岁")
  }
}

student= new Student();
student.getAge();

```

同样运行，那么会得到下面的错误提示：

```
Error: student.getAge is not a function
```

怎么处理呢？我们知道私有方法是可以在方法内部调用的，那么只需要创建一个公有方法，然后在这个公有方法中调用私有方法即可，如下所示：

```
class Student {
  #getAge() {
    console.log("永远18岁")
  }
  
  getPublicAge(){
    this.#getAge();
  }
 
}

student= new Student();
student.getPublicAge();
```

我们可以得到同样的结果。

# 私有属性

上面讲到了私有方法，那么对于私有属性是怎处理的呢？

通常，对于属性，我们可以以get修饰符来进行修饰，然后就可以直接通过属性名来访问了：

```
class Student {
  get Age() {
    return 18;
  }
 
}

student= new Student();
console.log(student.Age);

```

结果我们会得到18这个输出。

同样，可以在属性名前面加上#，让其变成私有变量，如下所示：

```
class Student {
  get #Age() {
    return 18;
  }
 
}

student= new Student();
console.log(student.Age);

```

上面代码将会输出undefined。

要想访问上述的私有属性，则可以用公有属性去调用私有属性方法：

```
class Student {
  get #Age() {
    return 18;
  }
   get publicAge() {
    return this.#Age
  }
}

student= new Student();
console.log(student.publicAge);
```

非常好用。

# Promise.any() 和 AggregateError

promise.any可以返回任意一个提前resolve的结果，在现实的应用中，这种情况是非常常见的，我们来模拟一个例子：

```
const prom1 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise one"),
    Math.floor(Math.random() * 100)
  );
});
const prom2 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise two"),
    Math.floor(Math.random() * 100)
  );
});
const prom3 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise three"),
    Math.floor(Math.random() * 100)
  );
});

(async function() {
  const result = await Promise.any([prom1, prom2, prom3]);
  console.log(result); 
})();

```

上述代码可以随机输出promise one，promise two，promise three。

如果将上述代码改成所有的都reject，那么会抛出AggregateError：

```
const prom1 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise one rejected"),
    Math.floor(Math.random() * 100)
  );
});
const prom2 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise two rejected"),
    Math.floor(Math.random() * 100)
  );
});
const prom3 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise three rejected"),
    Math.floor(Math.random() * 100)
  );
});

try{
(async function() {
  const result = await Promise.any([prom1, prom2, prom3]);
  console.log(result); 
})();
} catch(error) {
  console.log(error.errors);
}


```

报的错如下：

```
Uncaught (in promise) AggregateError: No Promise in Promise.any was resolved

```

> 注意，必须是所有的promise都被reject之后才会抛出AggregateError，如果有部分成功，那么将会返回成功的结果。

# 数字分隔符

这个新特性是为了方便程序员看代码而出现的，如果数字比较大，那么看起来就不是那么一目了然，比如下面的长数字：

```
const number= 123456789；

```

一眼看不出这个数字的体量到底是多大，所以ES12提供了数字分隔符_。

分隔符不仅可以分割十进制，也可以分割二净值或者十六净值的数据，非常好用。

```
const number = 1_000_000_000_000;
const binary = 0b1010_0101_1111_1101;
const hex = 0xAF_BF_C3;

```

上面例子分别代表了十进制，二进制和十六进制的数据，非常直观好用。

# 新的逻辑操作符

我们知道&& 和 || 是被来进行逻辑操作的运算符。

比如：

```
1 && 2 
1 || 2 

```

等操作，ES12提供了&& 和||的二元操作符，如下：

```
var x = 1;
var y = 2;
x &&= y;
x ||= y;

```

另外还提供了??的二元操作符，如：

```
var x;
var y = 2;
x ??= y;

```
上面代码的意思是，判断x是不是空，如果是空那么将y的值赋给x。

# 总结

ES12的几个新特性还是挺实用的，大家可以尝试一下。


