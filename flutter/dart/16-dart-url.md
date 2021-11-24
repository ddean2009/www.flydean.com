dart系列之:在dart中使用URI 

[toc]

# 简介

如果我们要访问一个网站，需要知道这个网站的地址，网站的地址一般被称为URL，他的全称是Uniform Resource Locator。那么什么是URI呢？

URI的全程是Uniform Resource Identifier,也叫做统一资源标志符。

URI用来对资源进行标记，而URL是对网络上的资源进行标记，所以URL是URI的子集。

了解了URI和URL之间的关系之后，我们来看看dart语言对URI的支持。

# dart中的URI

dart中为URI创建了一个专门的类叫做Uri：

```
abstract class Uri 
```
Uri是一个抽象类，他定义了一些对URI的基本操作。它有三个实现类，分别是_Uri,_DataUri和_SimpleUri。

接下来，我们一起来看看，dart中的Uri都可以做什么吧。

# encode和decode

为什么要对encode URI？

一般来说URI中可以包含一些特殊字符，像是空格或者中文等等。这些字符在传输中可能不被对方所认识。所以我们需要对Uri进行编码。

但是对于URI中的一些特殊但是有意义的字符,比如： /, :, &, #， 这些是不用被转义的。

所以我们需要一种能够统一编码和解码的方法。

在dart中，这种方法叫做encodeFull() 和 decodeFull():

```
var uri = 'http://www.flydean.com/doc?title=dart uri';

var encoded = Uri.encodeFull(uri);
assert(encoded ==
    'http://www.flydean.com/doc?title=dart%20uri');

var decoded = Uri.decodeFull(encoded);
assert(uri == decoded);
```

如果要编码所有的字符，包括那些有意义的字符：/, :, &, #， 那么可以使用encodeComponent() 和 decodeComponent():

```
var uri = 'http://www.flydean.com/doc?title=dart uri';

var encoded = Uri.encodeComponent(uri);
assert(encoded ==
    'http%3A%2F%2www.flydean.com%2Fdoc%3Ftitle%3Ddart%20uri');

var decoded = Uri.decodeComponent(encoded);
assert(uri == decoded);
```

# 解析URI

URI是由scheme,host,path,fragment这些部分组成的。我们可以通过Uri中的这些属性来对Uri进行分解：

```
var uri =
    Uri.parse('http://www.flydean.com/doc#dart');

assert(uri.scheme == 'http');
assert(uri.host == 'www.flydean.com');
assert(uri.path == '/doc');
assert(uri.fragment == 'dart');
assert(uri.origin == 'http://www.flydean.com');
```

那么怎么构造Uri呢？我们可以使用Uri的构造函数：

```
var uri = Uri(
    scheme: 'http',
    host: 'www.flydean.com',
    path: '/doc',
    fragment: 'dart');
assert(
    uri.toString() == 'http://www.flydean.com/doc#dart');
```

# 总结

dart为我们提供了非常简单的Uri的使用工具。





