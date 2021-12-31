dart系列之:如丝滑般柔顺,操作文件和目录

[toc]

# 简介

文件操作是IO中非常常见的一种操作，那么对应dart语言来说，操作文件是不是很简单呢？实际上dart提供了两种读取文件的方式，一种是一次性全部读取，一种是将文件读取为流。

一次性读取的缺点是需要将文件内容一次性全部载入到内存中，如果遇到文件比较大的情况，就会比较尴尬。所以还需要流式读取文件的方式。一起来看看dart中这两种文件的读取方式吧。

# File

事实上dart中有很多地方都有File这个类，这里我们要讲解的File类是dart:io包中的。

# 读取整个文件

File代表一个整体的文件,他有三个构造函数，分别是：

```
factory File(String path) 

factory File.fromUri(Uri uri)

factory File.fromRawPath(Uint8List rawPath)
```

其中最常用的就是第一个构造函数。

我们可以这样来构造一个文件：

```
var file = File('file.txt');
```

有了文件之后，就可以调用File中的各种读取方法。

文件读取本身有两种形式，一种是文本，一种是二进制。

如果是文本文件，File提供了readAsString的方法，将整个文件读取为字符串。

```
  Future<String> readAsString({Encoding encoding: utf8});
```

我们可以这样使用：

```
 var stringContents = await file.readAsString();
```

另外，我们还可以一行一行的对文件进行读取：

```
Future<List<String>> readAsLines({Encoding encoding: utf8});
```

结果返回的是一个List，list中表示文件每行的内容。

```
 var lines = await file.readAsLines();
```

上面两个方法是异步的方法，File还提供了两个同步的方法：

```
String readAsStringSync({Encoding encoding: utf8});

List<String> readAsLinesSync({Encoding encoding: utf8});
```

如果文件是二进制，那么可以使用readAsBytes或者同步的方法readAsBytesSync:

```
Future<Uint8List> readAsBytes();

Uint8List readAsBytesSync();
```

dart中表示二进制有一个专门的类型叫做Uint8List,他实际上表示的是一个int的List。

还是刚刚的文件，我们看下怎么以二进制的形式进行读取：

```
var file = File('file.txt');
var contents = await file.readAsBytes();
```

# 以流的形式读取文件

上面我们讲到的读取方式，都是一次性读取整个文件，缺点就是如果文件太大的话，可能造成内存空间的压力。

所以File为我们提供了另外一种读取文件的方法，流的形式来读取文件.

相应的定义方法如下：

```
  Stream<List<int>> openRead([int? start, int? end]);
```

我们看一个基本的使用：

```
import 'dart:io';
import 'dart:convert';

Future<void> main() async {
  var file = File('file.txt');
  Stream<List<int>> inputStream = file.openRead();

  var lines = utf8.decoder
      .bind(inputStream)
      .transform(const LineSplitter());
  try {
    await for (final line in lines) {
      print('Got ${line.length} characters from stream');
    }
    print('file is now closed');
  } catch (e) {
    print(e);
  }
}
```

# 随机访问

一般情况下文件是顺序访问的，但是有时候我们需要跳过某些前面的数据，直接跳转到目标地址，则需要对文件进行随机访问。

dart提供了open和openSync两个方法来进行随机文件读写：

```
  Future<RandomAccessFile> open({FileMode mode: FileMode.read});
  RandomAccessFile openSync({FileMode mode: FileMode.read});
```

RandomAccessFile提供了对文件的随机读写方法。非常好用。

# 文件的写入

写入和文件读取一样，可以一次性写入或者获得一个写入句柄，然后再写入。

一次性写入的方法有四种，分别对应字符串和二进制：

```
 Future<File> writeAsBytes(List<int> bytes,
      {FileMode mode: FileMode.write, bool flush: false});

void writeAsBytesSync(List<int> bytes,
      {FileMode mode: FileMode.write, bool flush: false});

Future<File> writeAsString(String contents,
      {FileMode mode: FileMode.write,
      Encoding encoding: utf8,
      bool flush: false});

void writeAsStringSync(String contents,
      {FileMode mode: FileMode.write,
      Encoding encoding: utf8,
      bool flush: false});
```

句柄形式可以调用openWrite方法，返回一个IOSink对象，然后通过这个对象进行写入：

```
IOSink openWrite({FileMode mode: FileMode.write, Encoding encoding: utf8});
```

```
var logFile = File('log.txt');
var sink = logFile.openWrite();
sink.write('FILE ACCESSED ${DateTime.now()}\n');
await sink.flush();
await sink.close();
```

默认情况下写入是会覆盖整个文件的，但是可以通过下面的方式来更改写入模式：

```
var sink = logFile.openWrite(mode: FileMode.append);
```

# 处理异常

虽然dart中所有的异常都是运行时异常，但是和java一样，要想手动处理文件读写中的异常，则可以使用try,catch:

```
Future<void> main() async {
  var config = File('config.txt');
  try {
    var contents = await config.readAsString();
    print(contents);
  } catch (e) {
    print(e);
  }
}
```

# 总结

以上就是dart中的文件操作了。









