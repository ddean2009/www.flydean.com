Spring MVC 中的http Caching

Cache 是HTTP协议中的一个非常重要的功能，使用Cache可以大大提高应用程序的性能，减少数据的网络传输。

通常来说我们会对静态资源比如：图片，CSS，JS文件等做缓存。同样的我们可以使用HTTP Cache配合Spring MVC来做动态资源的缓存。 

那么什么时候使用动态资源的缓存呢？ 

只有当这个资源不经常更新或者你确切的知道该资源什么时候更新的时候就可以使用HTTP Cache了。

HTTP Cache是通过请求头来实现的，主要有三种方式：过期时间，最后更新时间和Etag。

其中过期时间是客户端验证，最后更新时间和Etag是服务器端验证。

## 过期时间

过期时间又有两种方式，分别是Cache-Control和Expires头。

在Cache-Control中，我们可以设置它的maxAge，超出该时间后，该资源才会被再次请求。如下所示：

~~~java
@GetMapping("/{id}")
ResponseEntity<Product> getProduct(@PathVariable long id) {
   // …
   CacheControl cacheControl = CacheControl.maxAge(30, TimeUnit.MINUTES);
   return ResponseEntity.ok()
           .cacheControl(cacheControl)
           .body(product);
}
~~~

我们也可以在Head中设置Expires属性。Expires的时间需要是标准时间格式，如下：

~~~java
Sun, 06 Nov 1994 08:49:37 GMT  ; RFC 822, updated by RFC 1123
Sunday, 06-Nov-94 08:49:37 GMT ; RFC 850, obsoleted by RFC 1036
Sun Nov  6 08:49:37 1994       ; ANSI C's asctime() format
~~~

如果要在java中使用，参考如下的例子：

~~~java
@GetMapping("/forecast")
ResponseEntity<Forecast> getTodaysForecast() {
   // ...
   ZonedDateTime expiresDate = ZonedDateTime.now().with(LocalTime.MAX);
   String expires = expiresDate.format(DateTimeFormatter.RFC_1123_DATE_TIME);
   return ResponseEntity.ok()
           .header(HttpHeaders.EXPIRES, expires)
           .body(weatherForecast);
}
~~~

如果Cache-Control和Expires同时出现，则会优先使用 Cache-Control。

## Last-Modified

它的验证逻辑是这样的，客户端会根据上次请求得到的Last-Modified设置它的If-Modified-Since，服务器端接收到了这个属性之后可以跟之前的进行比较，如果相同则可以返回一个空的body。如下所示：

~~~java
@GetMapping("/{id}")
ResponseEntity<Product> getProduct(@PathVariable long id, WebRequest request) {
   Product product = repository.find(id);
   long modificationDate = product.getModificationDate()
           .toInstant().toEpochMilli();
 
   if (request.checkNotModified(modificationDate)) {
       return null;
   }
 
   return ResponseEntity.ok()
           .lastModified(modificationDate)
           .body(product);
}
~~~

## ETag

Last-Modified的时间只能精确到秒，如果还需要更细粒度的话，就需要用到ETag了。

ETag可以看成当前时刻某个资源的唯一标记，你可以取该资源的hash值作为ETag。

下面是它的一种实现：

~~~java
@GetMapping("/{id}")
ResponseEntity<Product> getProduct(@PathVariable long id, WebRequest request) {
   Product product = repository.find(id);
   String modificationDate = product.getModificationDate().toString();
   String eTag = DigestUtils.md5DigestAsHex(modificationDate.getBytes());
 
   if (request.checkNotModified(eTag)) {
       return null;
   }
 
   return ResponseEntity.ok()
           .eTag(eTag)
           .body(product);
}
~~~

## Spring ETag filter

Spring提供了一个ShallowEtagHeaderFilter来根据返回的内容自动为你生成Etag。

~~~java
@Bean
public FilterRegistrationBean filterRegistrationBean () {
   ShallowEtagHeaderFilter eTagFilter = new ShallowEtagHeaderFilter();
   FilterRegistrationBean registration = new FilterRegistrationBean();
   registration.setFilter(eTagFilter);
   registration.addUrlPatterns("/*");
   return registration;
}
~~~

请注意， ETag计算可能会影响性能。


