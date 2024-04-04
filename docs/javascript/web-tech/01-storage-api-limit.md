Storage API简介和存储限制与逐出策略

# 简介

对于现代浏览器来说，为了提升效率和处理更加复杂的客户端操作，通常都需要将数据存储在客户端，也就是本地磁盘上。那么这个存储有没有什么限制？如果数据存满了之后，如何进行数据的淘汰和置换？

一起来看看吧。

# 常用的客户端存储方式

客户的存储方式都有哪些呢？

我们看一下比较常用的几种方式：

* IndexedDB
* asm.js caching
* Cache API
* Cookies
* web storage

当然还有其他的客户端存储类型，比如AppCache（已经被废弃），File System API（非标准的API）等。

# data storage的类型

通常来说，data storage有两种方式，一种是永久性的，这种情况下通常数据会存储比较长的时间，除非用户选择清除（比如清除浏览器缓存），否则数据将会永久保存。

一种是临时存储，这种情况下，数据会存储有限的时间。数据存储的容量是有限的，在有限的数据容量空间，我们需要一些特定的数据逐出算法来保证有效的数据不会被覆盖。

# 逐出策略

在使用临时存储模式时，我们通常使用的逐出策略是LRU。

当到达存储的限额的时候，将会查找所有当前未使用的origin,然后根据最后访问时间对他们进行排序。然后删除最近最少使用的origin信息。

# Storage API

为了统一和规范这些客户端的操作API，于是引入了Storage API，通过Storage API我们可以查看可用存储空间大小，已使用的空间大小，甚至可以控制在用户数据清除的时候是否需要提醒用户。

> 注意Storage API只适用于HTTPS的情况，并且只是部分浏览器支持。

为了对不同源的数据进行管理，引入了storage units（也叫做box）的概念，对于每一个源来说，都有一个storage units（Box）。

![](https://img-blog.csdnimg.cn/20201004232652967.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

不同的storage units里面可以存储不同类型的数据。

上图中Origin 1中既有Web Storage，也有IndexedDB的存储，因为并没有达到Storage的最大值，所以还留有一定的空余空间。

Origin 2中还没有开始存储任何数据，所以都是空的。

Origin 3中被indexedDB存满了，没有任何空余空间。

为了方便管理box有两种模式，一种叫best-effort，一种叫persistent。

best-effort模式是指浏览器会尽最大努力去保留数据，但是当存储空间用完的时候，浏览器并不会提醒用户可能对存储空间的清理操作。

persistent模式将会尽可能长时间的保存用户的数据，如果同时有best-effort和persistent模式的话，当存储空间不足的时候，将会首先清除best-effort box。如果一定要清除persistent box，将会通知相应的用户。

Storage API指的就是StorageManager，它有三个非常重要的方法estimate，persist和persisted，我们看下他们的浏览器兼容性：

![](https://img-blog.csdnimg.cn/20201005090319501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

基本上，现代浏览器都支持StorageManager和它的三个方法。

下面我们分别来看一下他们的使用。

StorageManager是一个接口，用来管理存储的权限和评估可用的空间。我们可以通过navigator.storage 或者WorkerNavigator.storage 来获取到StorageManager。

我们看一下StorageManger的定义：

~~~js
interface StorageManager {
    estimate(): Promise<StorageEstimate>;
    persist(): Promise<boolean>;
    persisted(): Promise<boolean>;
}
~~~

## estimate

estimate方法返回一个Promise，Promise中包含一个StorageEstimate对象，表示空间的使用情况和限额。

~~~js
navigator.storage.estimate().then(estimate => {
  // estimate.quota is the estimated quota
  // estimate.usage is the estimated number of bytes used
});
~~~

我们使用estimate来查看是否有住够的空间进行应用数据的存储：

~~~js
function retrieveNextChunk(nextChunkInfo) {
  return navigator.storage.estimate().then(info => {
    if (info.quota - info.usage > nextChunkInfo.size) {
      return fetch(nextChunkInfo.url);
    } else {
      throw new Error("insufficient space to store next chunk");
    }
  }).then( /* … */ );
}
~~~

上面是一个estimate的使用。

## persist

persist方法返回一个Promise，true表示user agent已被授权，并且box mode= persistent模式。

我们看一下persist 的使用：

~~~js
if (navigator.storage && navigator.storage.persist)
  navigator.storage.persist().then(function(persistent) {
    if (persistent)
      console.log("Storage will not be cleared except by explicit user action");
    else
      console.log("Storage may be cleared by the UA under storage pressure.");
  });
~~~

## persisted 

persisted方法返回一个Promise，true表示box mode= persistent模式。

我们看一个persisted的例子：

~~~js
if (navigator.storage && navigator.storage.persist) 
  navigator.storage.persisted().then(function(persistent) {
    if (persistent)
      console.log("Storage will not be cleared except by explicit user action");
    else
      console.log("Storage may be cleared by the UA under storage pressure.");
  });
~~~

## 综合使用

之前讲到了，如果是persistent模式，数据的清理需要通知用户，下面我们看一下这个判断该怎么写：

~~~js
Promise.all([
  navigator.storage.persisted(),
  navigator.permissions.query({name: "persistent-storage"})
]).then(([persisted, permission]) => {
  if (!persisted && permission.status == "granted") {
    navigator.storage.persist().then( /* … */ );
  } else if (!persisted && permission.status == "prompt") {
    showPersistentStorageExplanation();
  }
});
~~~

上面的例子，我们还使用到了Permissions API。通过Permissions API，我们来判断用户所拥有的权限。

Permissions API还是一个比较新的API，只有在Chrome 44和Firefox 43之后才支持。

我们可以通过navigator.permissions来获取到Permissions API。

可以通过Permissions.query()来判断是否具有相应的权限。

Permissions.query将会返回一个PermissionStatus对象，这个对象代表了三个状态：granted，prompt和denied。

我们看一个判断权限的应用：

~~~js
function handlePermission() {
  navigator.permissions.query({name:'geolocation'}).then(function(result) {
    if (result.state == 'granted') {
      report(result.state);
      geoBtn.style.display = 'none';
    } else if (result.state == 'prompt') {
      report(result.state);
      geoBtn.style.display = 'none';
      navigator.geolocation.getCurrentPosition(revealPosition,positionDenied,geoSettings);
    } else if (result.state == 'denied') {
      report(result.state);
      geoBtn.style.display = 'inline';
    }
    result.onchange = function() {
      report(result.state);
    }
  });
}

function report(state) {
  console.log('Permission ' + state);
}

handlePermission();
~~~

除了Query，我们还可以使用revoke来取消授权。

~~~js
function revokePermission() {
  navigator.permissions.revoke({name:'geolocation'}).then(function(result) {
    report(result.state);
  });
~~~

# 总结

Storage API是为了统一客户端存储标准所制定的API。还在不断的完善之中。感兴趣的朋友可以多多关注它的进展。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







