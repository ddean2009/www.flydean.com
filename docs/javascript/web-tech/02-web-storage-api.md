Web Storage API的介绍和使用

# 简介

Web Storage为浏览器提供了方便的key value存储，是一种比cookie更加方便简洁的存储方式。也是诸多客户端存储方式中非常常见的一种。

一起来看看吧。

# 浏览器的本地存储技术

除了最早的使用cookie来进行本地存储之外，现代浏览器使用Web Storage API来方便的进行key/value的存储。

Web Storage有两种存储方式：

1. sessionStorage: 对于每一个访问源，都会维持一个独立的存储区域。只要浏览器不关闭，这些数据都不会消失。

所以这种存储叫做session存储。

注意，这里的session和服务器端的session的意思是不一样的，这里的sessionStorage只是本地的存储，并不会将数据传输到服务器端。

sessionStorage的存储容量要比cookie大得多，可以达到5MB。

2. localStorage：和sessionStorage类似，也是用来做数据存储的，不同的是localStorage存储的数据不会随着浏览器的关闭而消失。

我可以通过设置过期时间，使用javascript手动删除或者清楚浏览器缓存来清除localStorage。

这两种存储方式是通过Window.sessionStorage 和 Window.localStorage来使用的。事实上我们看下Window的定义：

~~~js
interface Window extends EventTarget, AnimationFrameProvider, GlobalEventHandlers, WindowEventHandlers, WindowLocalStorage, WindowOrWorkerGlobalScope, WindowSessionStorage 
~~~

Window继承了WindowLocalStorage和WindowSessionStorage，所以我们可以直接从Window来获取sessionStorage和localStorage。

对于每一个origin源来说，Window.sessionStorage 和 Window.localStorage 都会创建一个新的Storage对象，用来进行数据的读取。

# Web Storage相关接口

和web storage相关的接口有三个。第一就是刚刚讲到的window。我们可以通过window获取sessionStorage和localStorage。

第二个就是Storage对象，获取到的两个Storage都是Storage对象。

~~~js
interface Storage {

    readonly length: number;

    clear(): void;

    getItem(key: string): string | null;

    key(index: number): string | null;

    removeItem(key: string): void;

    setItem(key: string, value: string): void;
    [name: string]: any;
}
~~~

我们可以看到Storage对象为我们提供了很多有用的方法，对数据进行存取。

第三个就是StorageEvent，当storage发现变化的时候就会触发StorageEvent事件。

# 浏览器兼容性

我们用两张图来看一下这两个storage在不同浏览器的兼容性：

Window.localStorage:

![](https://img-blog.csdnimg.cn/20201001151030903.png)

Window.sessionStorage:

![](https://img-blog.csdnimg.cn/20201001151042292.png)

可以看到，现代浏览器基本上都是支持这两种storage特性的。

如果我们使用的是老式的浏览器，比如Internet Explorer 6 ，7 或者其他没有列出的浏览器，我们就需要进行检测，判断Storage是否被浏览器有效的支持。

我们看下怎么做检测：

~~~js
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}
~~~

其中的type就是localStorage或者sessionStorage，我们通过捕获异常来判断是否存在有效的Storge对象。

看下我们怎么使用：

~~~js
if (storageAvailable('localStorage')) {
  // Yippee! We can use localStorage awesomeness
}
else {
  // Too bad, no localStorage for us
}
~~~

# 隐身模式

大多数现代浏览器都支持一种隐身模式，在这种模式下，将不会存储浏览历史记录和Cookie等数据隐私选项。

所以这和Web Storage是不兼容的。那么怎么解决这个问题呢？

不同的浏览器可能采用不同的解决办法。

比如Safari中，隐身模式下Web Storage虽然是可用的，但是不会存储任何东西。

也有些浏览器会选择在浏览器关闭的时候清空之前的所有存储。

所以，我们在开发的过程中，一定要注意不同浏览器的不同处理方式。

# 使用Web Storage API

对于Storage对象，我们可以像普通对象一样直接访问对象中的属性，也可以使用Storage.getItem() 和 Storage.setItem() 来访问和设置属性。

> 注意Storage对象中的key value都是string类型的，即使你输入的是integer，也会被转换成为String。

下面的例子，都可以设置一个colorSetting属性：

~~~js
localStorage.colorSetting = '#a4509b';
localStorage['colorSetting'] = '#a4509b';
localStorage.setItem('colorSetting', '#a4509b');
~~~

虽然三种方式都可以实现存取的功能，但是我们推荐使用Web Storage API：setItem, getItem, removeItem, key, length等。

除了对Storage中的值进行设置之外，我们还可以触发和监听StorageEvent。

先看一下StorageEvent的定义：

~~~js
interface StorageEvent extends Event {

    readonly key: string | null;

    readonly newValue: string | null;

    readonly oldValue: string | null;

    readonly storageArea: Storage | null;

    readonly url: string;
}
~~~

每当Storage对象发送变化的时候，就出触发StorageEvent事件。

> 注意，如果是sessionStorage的变化，则不会被触发。

如果一个domain中的某个页面发生了Storage的变化，那么这个domain的其他页面都会监听到这个变化。当然，如果是其他domain的话，是监听不到这个StorageEvent的。

我们可以通过window的addEventListener方法，来添加storage事件，如下所示：

~~~js
window.addEventListener('storage', function(e) {  
  document.querySelector('.my-key').textContent = e.key;
  document.querySelector('.my-old').textContent = e.oldValue;
  document.querySelector('.my-new').textContent = e.newValue;
  document.querySelector('.my-url').textContent = e.url;
  document.querySelector('.my-storage').textContent = JSON.stringify(e.storageArea);
});
~~~

上面的例子中，我们从StorageEvent中获取了key，oldValue，newValue，url和Storage对象。

# 总结

上面就是Web Storage和其API的基本使用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







