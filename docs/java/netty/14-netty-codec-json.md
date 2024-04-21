---
slug: /14-3-netty-codec-json
---

# 29. netty系列之:netty中的核心解码器json



# 简介

程序和程序之间的数据传输方式有很多，可以通过二进制协议来传输，比较流行的像是thrift协议或者google的protobuf。这些二进制协议可以实现数据的有效传输，并且通过二进制的形式可以节省数据的体积，在某些速度和效率优先的情况下是非常有效的。并且如果不同的编程语言之间的相互调用，也可以通过这种二进制的协议来实现。

虽然二进制更加快速和有效，但是对于程序员来说不是很友好，因为一个人很难直接读取二进制文件，虽然也存在一些一些文本的数据传输方式，比如XML，但是XML的繁琐的标签导致了XML在使用中有诸多的不便。于是一种通用的文本文件传输格式json诞生了。

能读到这篇文章的朋友肯定对json不陌生了，当然还有一些更加简洁的文件格式，比如YAML,感兴趣的朋友可以更深入的了解一下。

这里我们想要讲的是netty对json的解码。

# java中对json的支持

在java中我们json的使用通常是将一个对象转换成为json进行数据传输，或者将接收到json进行解析，将其转换成为对象。

可惜的是在JDK中并没有提供给一个好用的JSON工具，所以我们一般需要借助第三方的JSON包来实现Object和JSON之间的转换工作。

通常使用的有google的GSON，阿里的FastJSON和jackson等。

这里我们使用google的GSON来进行介绍。

这里我们主要讲解的是java中对象和json的互相转换，所以GSON中其他更加强大的功能这里就不介绍了。

首先我们创建一个JAVA对象，我们定义一个Student类，如下所示：

```
    static class Student {
        String name;
        String phone;
        Integer age;

        public Student(String name, String phone, Integer age) {
            this.name = name;
            this.phone = phone;
            this.age = age;
        }
    }
```

这个类中，我们为Student定义了几个不同的属性和一个构造函数。接下来我们看下如何使用GSON来对这个对象进行JSON的转换：

```
        Student obj = new Student("tina","188888888",18);
        Gson gson = new Gson();
        String json = gson.toJson(obj);
        System.out.println(json);
        Student obj2 = gson.fromJson(json, Student.class);
        System.out.println(obj2);
```

GSON使用起来非常简单，我们构建好Gson对象之后，直接调用它的toJson方法即可将对象转换成为json字符串。

然后调用json的fromJson方法就可以将json字符串转换成为对象。

上面的代码输出如下：

```
{"name":"tina","phone":"188888888","age":18}
com.flydean.JsonTest$Student@4534b60d
```

# netty对json的解码

netty为json提供了一个解码器叫做JsonObjectDecoder,先来看下JsonObjectDecoder的定义：

```
public class JsonObjectDecoder extends ByteToMessageDecoder
```

和前面讲解的base64,byte数组不同的是，JsonObjectDecoder继承的是ByteToMessageDecoder而不是MessageToMessageDecoder。

这说明JsonObjectDecoder是直接从ByteBuf转换成为Json Object对象。

我们知道JDK中并没有JSON这个对象，所有的对象都是从第三方包中引入的，netty并没有引入新的对象，所以netty中从Json中解析出来的对象还是一个ByteBuf对象，在这个ByteBuf中包含了一个Json对象。

JsonObjectDecoder的解析逻辑是怎么样的呢？

首先来看下JsonObjectDecoder中定义的4个state：

```
    private static final int ST_CORRUPTED = -1;
    private static final int ST_INIT = 0;
    private static final int ST_DECODING_NORMAL = 1;
    private static final int ST_DECODING_ARRAY_STREAM = 2;
```

ST_INIT表示的是decode的初始状态，ST_CORRUPTED表示的是decode中出现的异常状态。

ST_DECODING_NORMAL代表的是一个普通的json，如下所示：

```
{
	"source": "web",
	"type": "product_info",
	"time": 1641967014440,
	"data": {
		"id": 30000084318055,
		"staging": false
	},
	"dataId": "123456"
}
```

ST_DECODING_ARRAY_STREAM代表的是一个数组，对于数组来说，数组也是一个对象，所以数组也可以用json表示,下面就是一个常见的json数组：

```
[ "Google", "Runoob", "Taobao" ]
```

JsonObjectDecoder的解码逻辑比较简单，它主要是读取ByteBuf中的数据，通过判断读取的数据和json中特有的大括号，中括号，逗号等分隔符来分割和解析json对象。

要注意的是，JsonObjectDecoder要解码的ByteBuf中的消息应该是UTF-8编码格式的，为什么需要UTF-8格式呢？

这是因为json中那些特有的分隔符，即使在UTF-8中也是用一个byte来存储的，这样我们在读取数据的过程中，可以通过读取的byte值和json的分隔符进行比较，从而来确定json中不同对象的界限。

如果换成其他的编码方式，json中的分隔符可能会用多个byte来表示，这样对我们的解析就提高了难度，因为我们需要知道什么时候是分隔符的开始，什么时候是分隔符的结束。

它的核心解码逻辑如下，首先从ByteBuf中读取一个byte：

```
byte c = in.getByte(idx);
```

然后通过调用`decodeByte(c, in, idx);` 来判断当前的位置是开括号，还是闭括号，是在一个对象的字符串中，还是一个新的对象字符串。

首先需要对当前的state做一个判断，state判断调用的是initDecoding方法：

```
    private void initDecoding(byte openingBrace) {
        openBraces = 1;
        if (openingBrace == '[' && streamArrayElements) {
            state = ST_DECODING_ARRAY_STREAM;
        } else {
            state = ST_DECODING_NORMAL;
        }
    }
```

接着就是对当前的state和自定义的4个状态进行比较，如果是普通的json对象，并且对象已经是闭括号状态，说明该对象已经读取完成，可以将其进行转换并输出了：

```
 if (state == ST_DECODING_NORMAL) {
                decodeByte(c, in, idx);
                if (openBraces == 0) {
                    ByteBuf json = extractObject(ctx, in, in.readerIndex(), idx + 1 - in.readerIndex());
                    if (json != null) {
                        out.add(json);
                    }
    ...
```

如果state表示目前是一个数组对象，数组对象中可能包含多个对象，这些对象是通过逗号来区分的。逗号之间还可能会有空格，所以需要对这些数据进行特殊判断和处理，如下所示：

```
else if (state == ST_DECODING_ARRAY_STREAM) {
                decodeByte(c, in, idx);

                if (!insideString && (openBraces == 1 && c == ',' || openBraces == 0 && c == ']')) {
                    for (int i = in.readerIndex(); Character.isWhitespace(in.getByte(i)); i++) {
                        in.skipBytes(1);
                    }
                    int idxNoSpaces = idx - 1;
                    while (idxNoSpaces >= in.readerIndex() && Character.isWhitespace(in.getByte(idxNoSpaces))) {
                        idxNoSpaces--;
                    }
                    ByteBuf json = extractObject(ctx, in, in.readerIndex(), idxNoSpaces + 1 - in.readerIndex());
                    if (json != null) {
                        out.add(json);
                    }
    ....
```

最后将解析出来的json对象放入byteBuf的out list中，整个解析到此结束。

# 总结

以上就是netty中json核心解码器JsonObjectDecoder的使用，它的本质是通过判断json对象中的分割符来分割多个json字符串，然后将分割后的json字符串存入ByteBuf中输出。

看到这里，大家可能会疑惑了，decoder不是和encoder一起出现的吗？为什么netty中只有JsonObjectDecoder,而没有JsonObjectEncoder呢？

事实上，这里的Json对象就是一个包含Json字符的字符串，这个字符串被写入到ByteBuf中，所以这里并不需要特殊的encoder。



















