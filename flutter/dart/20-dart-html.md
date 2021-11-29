dart系列之:HTML的专属领域,除了javascript之外,dart也可以

[toc]

# 简介

虽然dart可以同时用作客户端和服务器端，但是基本上dart还是用做flutter开发的基本语言而使用的。除了andorid和ios之外，web就是最常见和通用的平台了,dart也提供了对HTML的原生支持，这个支持就是dart:html包。

dart:html提供了对DOM对象的各种有用的操作和对HTML5 API的支持。这样我们可以直接使用dart来操作HTML。

除了DOM之外，dart:html还可以对css进行操作,使用dart:html也非常简单：

```
import 'dart:html';
```

# DOM操作

对于DOM操作来说，首先是需要找到这个元素。

dart提供了querySelector() 和 querySelectorAll()方法，可以根据ID, class, tag, name或者这些元素的集合来进行查找。

同样都是query方法，两者的不同在于，querySelector只返回找到的第一个元素，而querySelectorAll返回找到的所有元素。

所以querySelector返回的是一个Element,而querySelectorAll返回的是一个集合List<Element>。

```
Element idElement = querySelector('#someId')!;

Element classElement = querySelector('.some-class')!;

List<Element> divElements = querySelectorAll('div');

List<Element> textInputElements = querySelectorAll( 'input[type="text"]',);

List<Element> specialElement = querySelectorAll('#someId div.class');
```

上面就是我们查找DOM中元素的操作。找到之后，就可以对这些元素进行操作了。

dart使用Element来表示DOM中的元素。对于每个Element来说，都拥有classes, hidden, id, style, 和 title 这些属性。

如果Element中并没有要设置的属性，则可以使用attributes,如下：

```
elem.attributes['someAttribute'] = 'someValue';
```

当然对应某些特殊的Element，会有Element对应的子类与之绑定。

比如对于一个a标签来说，如下所示：

```
<a id="name" href="/name/detail">详情</a>
```

a标签对应的是dart中的AnchorElement元素。

如果要改变a标签的href值，可以这样：

```
var anchor = querySelector('#name') as AnchorElement;
anchor.href = 'http://www.flydean.com';
```

还可以添加、替换或者删除对应的节点：

```
querySelector('#id')!.nodes.add(elem);
querySelector('#id')!.replaceWith(elem);
querySelector('#id')?.remove();
```

> 上面我们使用了一个特殊的运算符，感叹号，表示的是将一个可为空的类型转换成为不为空的类型。

# CSS操作

CSS实际上就是element中的class，当我们获取到element之后，就可以调用他的classes字段，然后对CSS进行处理。

elem.classes返回的是一个list,我们可以向其添加或者删除对应的class。

```
var name = querySelector('#id')!;
name.classes.add('redline');
```

有class当然是最好了，class也是我们推荐的写法。但是有时候还是需要直接在element中添加style,如下所示：

```
name.style
  ..fontWeight = 'bold'
  ..fontSize = '3em';
```

# 处理事件

和DOM的交互就是各种事件,向element中添加event,可以使用element.onEvent.listen(function).

比如我们可以添加click事件：

```
querySelector('#id')!.onClick.listen((e) {
  // do something
});
```

下面是常用的一些event：

```
    change
    blur
    keyDown
    keyUp
    mouseDown
    mouseUp
```

# 总结

以上就是Dart对html的支持。






