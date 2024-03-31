---
slug: /21-dart-http
---

# 21. 浏览器中的舞者,用dart发送HTTP请求



# 简介

dart:html包为dart提供了构建浏览器客户端的一些必须的组件，之前我们提到了HTML和DOM的操作，除了这些之外，我们在浏览器端另一个常用的操作就是使用XMLHttpRequest去做异步HTTP资源的请求，也就是AJAX请求。

dart同样提供了类似JS中XMLHttpRequest的封装，其对应的类叫做HttpRequest，一起来看看在dart中怎么使用HttpRequest吧。

# 发送GET请求

虽然现代的web APP被各种框架所封装，但是归根结底他还是一个AJAX的富客户端应用。我们通过各种异步的HTTP请求向服务器端请求数据，然后展示在页面上。一般来说数据的交互格式是JSON，当然也可以有其他的数据交互格式。

AJAX中最常用的方式就是向服务器端发送get请求，对应的HttpRequest有一个getString方法：

```
  static Future<String> getString(String url,
      {bool? withCredentials, void onProgress(ProgressEvent e)?}) {
    return request(url,
            withCredentials: withCredentials, onProgress: onProgress)
        .then((HttpRequest xhr) => xhr.responseText!);
  }
```

注意，getString方法是一个类方法，所以直接使用HttpRequest类来调用：

```
var name = Uri.encodeQueryComponent('John');
        var id = Uri.encodeQueryComponent('42');
        HttpRequest.getString('users.json?name=$name&id=$id')
          .then((String resp) {
            // Do something with the response.
        });
```
因为getString返回的是一个Future，所以可以直接在getString后面接then语句，来获取返回的值。

当然，你也可以在async方法中使用await来获取返回值。

```
Future<void> main() async {
  String pageHtml = await HttpRequest.getString(url);
  // Do something with pageHtml...
}
```

或者使用try catch来捕获异常：

```
try {
  var data = await HttpRequest.getString(jsonUri);
  // Process data...
} catch (e) {
  // Handle exception...
}
```

# 发送post请求

GET是从服务器拉取数据，相应的POST就是通用的向服务器中提交数据的方法。在HttpRequest中，对应的方法是postFormData：

```
static Future<HttpRequest> postFormData(String url, Map<String, String> data,
      {bool? withCredentials,
      String? responseType,
      Map<String, String>? requestHeaders,
      void onProgress(ProgressEvent e)?}) {
    var parts = [];
    data.forEach((key, value) {
      parts.add('${Uri.encodeQueryComponent(key)}='
          '${Uri.encodeQueryComponent(value)}');
    });
    var formData = parts.join('&');

    if (requestHeaders == null) {
      requestHeaders = <String, String>{};
    }
    requestHeaders.putIfAbsent('Content-Type',
        () => 'application/x-www-form-urlencoded; charset=UTF-8');

    return request(url,
        method: 'POST',
        withCredentials: withCredentials,
        responseType: responseType,
        requestHeaders: requestHeaders,
        sendData: formData,
        onProgress: onProgress);
  }
```

从方法的实现上可以看到，默认情况下使用的Content-Type: application/x-www-form-urlencoded; charset=UTF-8, 也就是说默认是以form表单提交的形式进行的。

在这种情况下，对于承载数据的data来说，会首先进行Uri.encodeQueryComponent进行编码，然后再使用&进行连接。

下面是使用的例子：

```
var data = { 'firstName' : 'John', 'lastName' : 'Doe' };
        HttpRequest.postFormData('/send', data).then((HttpRequest resp) {
          // Do something with the response.
       });
```

> 注意，postFormData中返回的是一个HttpRequest，虽然它叫做Request，但是实际上可以包含response的内容。所以直接使用他获取返回内容即可。

# 更加通用的操作

上面我们讲解了get和form的post，从代码可以看到，他们底层实际上都调用的是request方法。request是一个更加通用的HTTP请求方法。可以支持`POST`, `PUT`, `DELETE`等HTTP操作。下面是request的方法定义：

```
  static Future<HttpRequest> request(String url,
      {String? method,
      bool? withCredentials,
      String? responseType,
      String? mimeType,
      Map<String, String>? requestHeaders,
      sendData,
      void onProgress(ProgressEvent e)?})
```

其中sendData可以是[ByteBuffer],[Blob], [Document], [String], 或者 [FormData] 等格式。

responseType表示的是HttpRequest.responseType,是返回对象的格式，默认情况下是String，也可以是'arraybuffer', 'blob', 'document', 'json', 或者 'text'。

下面是一个是直接使用request的例子：

```
        var myForm = querySelector('form#myForm');
        var data = new FormData(myForm);
        HttpRequest.request('/submit', method: 'POST', sendData: data)
          .then((HttpRequest resp) {
            // Do something with the response.
        });
```

# 总结

使用HttpRequest可以直接模拟浏览器中的Ajax操作，非常方便。



