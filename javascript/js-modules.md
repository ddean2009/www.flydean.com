javascript中的模块系统

# 简介

在很久以前，js只是简单的作为浏览器的交互操作而存在，一般都是非常短小的脚本，所以都是独立存在的。

但是随着现代浏览器的发展，特别是nodejs的出现，js可以做的事情变得越来越多也越来越复杂。于是我们就需要模块系统来组织不同用途的脚本，进行逻辑的区分和引用。

今天将会给大家介绍一下js中的模块系统。

# CommonJS和Nodejs

CommonJS是由Mozilla公司在2009年1月份提出来了。没错，就是那个firfox的公司。

最初的名字叫做ServerJS，在2009年8月的时候为了表示这个标准的通用性，改名为CommonJS。

CommonJS最主要的应用就是服务端的nodejs了。浏览器端是不直接支持CommonJS的，如果要在浏览器端使用，则需要进行转换。

CommonJS使用require()来引入模块，使用module.exports来导出模块。

我们看一个CommonJS的例子：

~~~js
require("module"); 
require("../file.js"); 
exports.doStuff = function() {}; 
module.exports = someValue;
~~~

注意，CommonJS是同步加载的。

# AMD异步模块加载

AMD的全称是Asynchronous Module Definition 。它提供了一个异步加载模块的模式。

AMD是RequireJS在推广过程中对模块定义的规范化产出。

异步加载的好处就是可以在需要使用模块的时候再进行加载，从而减少了一次性全部加载的时间，尤其是在浏览器端，可以提升用户的体验。

看下AMD加载模块的定义：

~~~js
 define(id?, dependencies?, factory);
~~~

AMD是通过define来定义和加载依赖模块的。

其中id表示要定义的模块的名字，dependencies表示这个模块的依赖模块，factory是一个函数，用来初始化模块或者对象。

我们看一个例子：

~~~js
   define("alpha", ["require", "exports", "beta"], function (require, exports, beta) {
       exports.verb = function() {
           return beta.verb();
           //Or:
           return require("beta").verb();
       }
   });
~~~

这个例子中，我们定义了一个alpha模块，这个模块需要依赖"require", "exports", "beta"三个模块。

并且在factory中导出了beta模块的verb方法。

define中id和dependencies都不是必须的：

~~~js
//无id
  define(["alpha"], function (alpha) {
       return {
         verb: function(){
           return alpha.verb() + 2;
         }
       };
   });

//无依赖
   define({
     add: function(x, y){
       return x + y;
     }
   });
~~~

甚至我们可以在AMD中使用CommonJS：

~~~js
   define(function (require, exports, module) {
     var a = require('a'),
         b = require('b');

     exports.action = function () {};
   });
~~~

定义完之后，AMD使用require来加载模块：

~~~js
require([dependencies], function(){});
~~~

第一个参数是依赖模块，第二个参数是回调函数，会在前面的依赖模块都加载完毕之后进行调用。加载的模块会以参数形式传入该函数，从而在回调函数内部就可以使用这些模块。

~~~js
require(["module", "../file"], function(module, file) { /* ... */ }); 
~~~

require加载模块是异步加载的，但是后面的回调函数只会在所有的模块都加载完毕之后才运行。

# CMD

CMD是SeaJS在推广过程中对模块定义的规范化产出。它的全称是Common Module Definition。

CMD也是使用define来定义模块的，CMD推崇一个文件作为一个模块：

~~~js
define(id?, deps?, factory)
~~~

看起来和AMD的define很类似，都有id，依赖模块和factory。

这里的factory是一个函数，带有三个参数，function(require, exports, module)

我们可以在factory中通过require来加载需要使用的模块，通过exports来导出对外暴露的模块，module表示的是当前模块。

我们看一个例子：

~~~js
// 定义模块  myModule.js
define(function(require, exports, module) {
  var $ = require('jquery.js')
  $('div').addClass('active');
});

// 加载模块
seajs.use(['myModule.js'], function(my){

});
~~~

所以总结下AMD和CMD的区别就是，AMD前置要加载的依赖模块，在定义模块的时候就要声明其依赖的模块。

而CMD加载完某个依赖模块后并不执行，只是下载而已，只有在用到的时候才使用require进行执行。

# ES modules和现代浏览器

ES6和现代浏览器对模块化的支持是通过import和export来实现的。

首先看下import和export在浏览器中支持的情况：

![](https://img-blog.csdnimg.cn/20201010140525321.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20201010140537636.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

首先我们看下怎么使用export导出要暴露的变量或者方法：

~~~js

export const name = 'square';

export function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, length, length);

  return {
    length: length,
    x: x,
    y: y,
    color: color
  };
}
~~~

基本上，我们可以使用export导出var, let, const变量或者function甚至class。前提是这些变量或者函数处于top-level。

更简单的办法就是将所有要export的放在一行表示：

~~~js
export { name, draw, reportArea, reportPerimeter };
~~~

export实际上有两种方式，named和default。上面的例子中的export是named格式，因为都有自己的名字。

下面看下怎么使用export导出默认的值：

~~~js
// export feature declared earlier as default
export { myFunction as default };

// export individual features as default
export default function () { ... } 
export default class { .. }
~~~

named可以导出多个对象，而default只可以导出一个对象。

导出之后，我们就可以使用import来导入了：

~~~js
import { name, draw, reportArea, reportPerimeter } from './modules/square.js';
~~~

如果导出的时候选择的是default，那么我们在import的时候可以使用任何名字：

~~~js
// file test.js
let k; export default k = 12;

// some other file
import m from './test'; // 因为导出的是default，所以这里我们可以使用import m来引入
console.log(m);        // will log 12
~~~

我们可以在一个module中使用import和export从不同的模块中导入，然后在同一个模块中导出，这样第三方程序只需要导入这一个模块即可。

~~~js
export { default as function1,
         function2 } from 'bar.js';
~~~

上面的export from 等价于：

~~~js
import { default as function1,
         function2 } from 'bar.js';
export { function1, function2 };
~~~

上面的例子中，我们需要分别import function1 function2才能够使用，实际上，我们可以使用下面的方式将所有的import作为Module对象的属性：

~~~js
import * as Module from './modules/module.js';

Module.function1()
Module.function2()
~~~

然后function1，function2就变成了Module的属性，直接使用即可。

# 在HTML中使用module和要注意的问题

怎么在HTML中引入module呢？我们有两种方式，第一种是使用src选项：

~~~html
<script type="module" src="main.js"></script>
~~~

第二种直接把module的内容放到script标签中。

~~~html
<script type="module">
  /* JavaScript module code here */
</script>
~~~

注意，两种script标签的类型都是module。

在使用script来加载module的时候，默认就是defer的，所以不需要显示加上defer属性。

如果你在测试的时候使用file:// 来加载本地文件的话，因为JS模块安全性的要求，很有可能得到一个CORS错误。

最后，import() 还可以作为函数使用，来动态加载模块：

~~~js
squareBtn.addEventListener('click', () => {
  import('./modules/square.js').then((Module) => {
    let square1 = new Module.Square(myCanvas.ctx, myCanvas.listId, 50, 50, 100, 'blue');
    square1.draw();
    square1.reportArea();
    square1.reportPerimeter();
  })
});
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！










