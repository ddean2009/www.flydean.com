ECMAScript 2020(ES11)新特性简介

# 简介

ES11是ECMA协会在2020年6月发行的一个版本，因为是ECMAScript的第十一个版本，所以也称为ES11.

今天我们讲解一下ES11的新特性。

ES11引入了9个新特性，我们接下来一一讲解。

# 动态imports

在ES11之前，我们可以使用下面的方式进行模块的导入：

```
import * as TestModule from "./test-module.js";

```

但是上面的导入方式会有一些问题，首先是效率的问题，所有的module都需要在首次加载的时候导入，会导致程序效率的降低。另外上面的模块名字是写死的，不可以在程序运行的时候进行动态修改。

也就是说上面的模块导入方式，不能对模块进行动态导入，或者按需导入，在使用上有诸多的不便。

为了解决这个问题，ES11引入了新的import() 方法，使用这个方法，你可以对模块进行动态导入，并且通过设置模块名为变量的形式，可以对模块名进行动态修改，非常的神奇。我们看一个具体的使用例子：

```
const baseModulePath = "./baseModules";
const btnImportModule = document.getElementById("btnImportModule");
let userList = [];

btnImportModule.addEventListener("click", async e => {
  const userModule = await import(`${baseModulePath}/users.js`);
  
  userList = userModule.getUsers();
});

```

上面代码中我们定义了一个基本的Module路径，通过点击页面上的按钮，可以动态的加载一个users.js模块，然后调用该模块的getUsers()方法，获得userList列表。

# import.meta

除了动态引入模块之外，import还提供了一个元属性meta,它包含了当前引入的模块的信息，目前他里面有一个url属性，代表模块被引用的URL。如果想使用URL信息，那么可以在代码中使用import.meta.url。

# export加强

import是在ECMAScript 2015中引入的，主要被用来做模块的引入，import可以引入整个模块，也可以引入部分模块。如下所示：

```
import {something} from "./test-module.js";
import * from "./test-module.js";

```

和import对应的就是export，同样可以export所有或者部分，如下所示：

```
export {something} from "./test-module.js";
export * from "./test-module.js";

```

通常情况来说，上面讲的import和export已经够用了，但是对于导出模块需要重命名的情况，我们不能直接导出，而是必须先在import的时候进行重命名，然后再使用export将重命名的模块导出：

```
import * as myModule from "./test-module.js";
export {myModule};
```

如果使用export的增强，则不需要使用import，直接使用export导出即可：

```
export * as {myModule} from "./test-module.js";
```

# BigInt

ES11引入了新的数据类型BigInt，在这之前，javascript中表示数字的对象是Number，它可以表示64-bit的浮点类型数字。当然它也可以代表整数，但是整数表示的最大值是2^53,也可以用Number.MAX_SAFE_INTEGER来表示。

一般来说Number已经够用了，但是如果在某些情况下需要对64-bit的整数进行存储或者运算，或者要表示的范围超过了64-bit的话，Number就不够用了。

怎么办呢？如果只是存储的话，可以存储为字符串，但是第二种字符串就不适用了。于是引入了BigInt来解决这个问题。要表示BigInt，只需要在数字的后面加上n即可。

```
const bigInt = 112233445566778899n;

```

或者使用构造函数来构造bigInt：

```
const bigInt = BigInt("112233445566778899");

```

可以使用typeof来查看bigInt的类型。要注意的是虽然Number和BigInt都代表的是数字，但是两者是不能混用的，你不能将一个Number和一个BigInt相加。这会报TypeError异常。

如果非要进行操作，那么可以使用BigInt构造函数将Number转换成为BigInt之后再进行。

# matchAll()

正则表达式的匹配是一个非常常见的操作，通常我们使用regExp.exec来进行正则的匹配，举个正则匹配的例子如下：

```
const regExp = /yyds(\d+)/g;
const text = 'yyds1 is a very good yyds2';
let matches;

while ((matches = regExp.exec(text)) !== null) {
  console.log(matches);
}
```

上面的代码运行结果如下：

```
["yyds1","1"]
["yyds2","2"]

```

我们得到了所有匹配的值。不过需要使用一个循环来进行遍历，使用起来有诸多的不便，为了简单起见，ES11引入了matchAll()方法。这个方法可以简单的返回一个遍历器，通过遍历这个遍历器，就可以得到所有的匹配的值，如下所示：

```
const regExp = /yyds(\d+)/g;
const text = 'yyds1 is a very good yyds2';
let matches = [...text.matchAll(regExp)];

for (const match of matches) {
  console.log(match);
}
```

# globalThis

对于javascript来说，不同的环境对应的全局对象的获取方式也是不同的，对于浏览器来说通常使用的是window，但是在web worker中使用的是self，而在nodejs中使用的是global。

为了解决在不同环境中的全局对象不同的问题，ES11引入了globalThis，通过这个全局对象，程序员就不用再去区分到底是在哪个环境下了，只需要使用globalThis即可。

# Promise.allSettled() 

自从Promise引入之后，有两个方法可以对Promise进行组合，分别是Promise.all() 和Promise.race()， 他们分别表示返回所有的Promise和返回最快的那个。

对于Promise.all()来说，它会等待所有的Promise都运行完毕之后返回，如果其中有一个Promise被rejected，那么整个Promise.all()都会被rejected。在这种情况下，如果有一个Promise被rejected，其他的Promise的结果也都获取不了。

为了解决这个问题，ES11引入了Promise.allSettled() 方法，这个方法会等待所有的Promise结束，不管他们是否被rejected,所以可以使用下面的代码获得所有的结果，而不管其中是否有Promise出现问题。

```
const promises = [promise1("/do1"), promise2("/do2")];
const allResults = await Promise.allSettled(promises);
const errors = results
  .filter(p => p.status === 'rejected')
  .map(p => p.reason);
```

# ??操作符

??操作符是一个判断是否为空然后赋值的操作，如果没有这个操作符，我们通常使用||来简单的进行这个操作，如下所示：

```
const yourAge = someBody.age || 18
```

上面的代码意思是如果someBody.age 是空，那么就将yourAge设置成为18。

但是上面代码有个问题，如果someBody.age=0 的话，上述逻辑也成立。使用？？操作符可以解决这个问题。

```
const yourAge = someBody.age ？？ 18
```

# ?.操作符

我们有时候在获取某个对象的属性的时候，需要进行对象的null判断，否则从null对象中取出属性就会报错，但是通常的?:操作符使用起来太复杂了，如果有多个对象和属性连写的情况下更是如此，如果使用?.操作符就会简单很多：

```
const age = school?.class?.student?.age;
```

如上所示，这个一个非常复杂的连写操作，但是使用?.就变得很简单。

同样?.还可以用在对象的方法上：

```
const age = student.getAge?.();

```

上面代码表示，如果student的getAge方法存在，则调用，否则返回undefined。

# 总结

事实上所有的现代浏览器基本上都支持ES11了，IE除外。大家可以尽情尝试ES11的新特征。


