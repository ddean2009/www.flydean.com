---
slug: /19-dart-decode-encode
---

# 19. 还在为编码解码而烦恼吗?用dart试试



# 简介

在我们日常使用的数据格式中json应该是最为通用的一个。很多时候，我们需要把一个对象转换成为JSON的格式，也可以说需要把对象编码为JSON。

虽然在dart中所有的字符都是以UTF-16来存储的，但是更加通用的格式应该是UTF-8，同样的dart也提供了对UTF-8的编码支持。

所有的这一切，都包含在dart:convert包中。

要想使用convet包，简单的引入即可：

```
import 'dart:convert';
```

# 为JSON编码和解码

首先要注意的是，虽然dart中可以用单引号或者双引号来表示字符串，但是在json中，字符串必须是以双引号来表示的，否则就不是一个真正的json，这点一定要注意，所以，我们需要这样定义JSON :


```
var studentJson = '''
  [
    {"name": "jack"},
    {"age": 18}
  ]
''';
```

而不是这样：

```
var studentJson = '''
  [
    {'name': 'jack'},
    {'age': 18}
  ]
''';
```

如果要让json字符串转换成为对象，则可以使用convert包里面的jsonDecode方法：

```
var studentList = jsonDecode(studentJson);
assert(studentList is List);

var student = studentList[0];
assert(student is Map);
assert(student['name'] == "jack");
```

除了decode之外，还可以将对象encode成为Json字符串：

```
var studentList = [
  {"name": "jack"},
  {"age": 18}
];

var studentString = jsonEncode(studentList);
assert(studentString ==
    '[{"name":"jack"},{"age":18}]');
```

上面对象只是一个简单的对象，可以直接转换成为JSON。如果是复杂对象怎么办呢？

比如对象中嵌套对象，那么嵌入的对象是否也会被转换成为JSON呢？

dart考虑到了这个问题，所以在jsonEncode方法中还有第二个参数，表示如何将不可直接encode的对象转换成为可以encode的对象：

```
String jsonEncode(Object? object,
        {Object? toEncodable(Object? nonEncodable)?}) =>
    json.encode(object, toEncodable: toEncodable);
```

如果第二个参数被忽略了，那么会调用对应对象的.toJson()方法。

# UTF-8编码和解码

先看下UTF-8的解码方法：

```
 String decode(List<int> codeUnits, {bool? allowMalformed})
```

第一个参数是传入一个UTF-8的codeUnits数组，第二个参数表示是否替换Unicode替换字符的字符序列`U+FFFD`。 如果传入false的话，遇到这样的字符就会抛出FormatException。

看一个使用的例子：

```
List<int> utf8Bytes = [119, 119, 119, 46, 102, 108, 121, 100, 101, 97, 110, 46, 99, 111, 109];

  var site = utf8.decode(utf8Bytes);
  assert(site == 'www.flydean.com');
```

相应的，可以使用encode对字符串或者其他对象进行编码：

```
print(utf8.encode('www.flydean.com'));
```

# 总结

以上dart对json和UTF-8的支持。





