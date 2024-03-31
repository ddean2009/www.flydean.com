在java程序中使用protobuf

[toc]

# 简介

Protocol Buffer是google出品的一种对象序列化的方式，它的体积小传输快，深得大家的喜爱。protobuf是一种平台无关和语言无关的协议，通过protobuf的定义文件，可以轻松的将其转换成多种语言的实现，非常方便。

今天将会给大家介绍一下，protobuf的基本使用和同java结合的具体案例。

# 为什么使用protobuf

我们知道数据在网络传输中是以二进制进行的，一般我们使用字节byte来表示， 一个byte是8bits，如果要在网络上中传输对象，一般需要将对象序列化，序列化的目的就是将对象转换成byte数组在网络中传输，当接收方接收到byte数组之后，再对byte数组进行反序列化，最终转换成java中的对象。

那么将java对象序列化可能会有如下几种方法：

1. 使用JDK自带的对象序列化，但是JDK自带的序列化本身存在一些问题，并且这种序列化手段只适合在java程序之间进行传输，如果是非java程序，比如PHP或者GO，那么序列化就不通用了。

2. 你还可以自定义序列化协议，这种方式的灵活程度比较高，但是不够通用，并且实现起来也比较复杂，很可能出现意想不到的问题。

3. 将数据转换成为XML或者JSON进行传输。XML和JSON的好处在于他们都有可以区分对象的起始符号，通过判断这些符号的位置就可以读取到完整的对象。但是不管是XML还是JSON的缺点都是转换成的数据比较大。在反序列化的时候对资源的消耗也比较多。

所以我们需要一种新的序列化的方法，这就是protobuf，它是一种灵活、高效、自动化的解决方案。

通过编写一个.proto的数据结构定义文件，然后调用protobuf的编译器，就会生成对应的类，该类以高效的二进制格式实现protobuf数据的自动编码和解析。 生成的类为定义文件中的数据字段提供了getter和setter方法，并提供了读写的处理细节。 重要的是，protobuf可以向前兼容，也就是说老的二进制代码也可以使用最新的协议进行读取。

# 定义.proto文件

.proto文件中定义的是你将要序列化的消息对象。我们来一个最基本的student.proto文件，这个文件定义了student这个对象中最基本的属性。

先看一个比较简单的.proto文件：

```
syntax = "proto3";

package com.flydean;

option java_multiple_files = true;
option java_package = "com.flydean.tutorial.protos";
option java_outer_classname = "StudentListProtos";

message Student {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
  }

  message PhoneNumber {
    optional string number = 1;
    optional PhoneType type = 2;
  }

  repeated PhoneNumber phones = 4;
}

message StudentList {
  repeated Student student = 1;
}
```

第一行定义的是protobuf中使用的syntax协议，默认情况下是proto2，因为目前最新的协议是proto3，所以这里我们使用proto3作为例子。

然后我们定义了所在的package，这个package是指编译的时候生成文件的包。这是一个命名空间，虽然我们在后面定义了java_package，但是为了和非java语言中的协议相冲突，所以定义package还是非常有必要的。

然后是三个专门给java程序使用的option。java_multiple_files, java_package， 和 java_outer_classname.

其中java_multiple_files指编译过后java文件的个数，如果是true，那么将会一个java对象一个类，如果是false，那么定义的java对象将会被包含在同一个文件中。

 java_package指定生成的类应该使用的Java包名称。 如果没有明确的指定，则会使用之前定义的package的值。

java_outer_classname选项定义将表示此文件的包装类的类名。 如果没有给java_outer_classname赋值，它将通过将文件名转换为大写驼峰来生成。 例如，默认情况下，“student.proto”将使用"Student"作为包装类名称。 

接下来的部分是消息的定义，对于简单类型来说可以使用bool, int32, float, double， 和 string来定义字段的类型。

上例中我们还使用了复杂的组合属性，和嵌套类型。还定义了一个枚举类。

上面我们为每个属性值分配了ID，这个ID是二进制编码中使用的唯一“标签”。因为在protobuf中标记数字1-15比16以上的标记数字占用的字节空间要更少，因此作为一种优化，通常将1-15这些标记用于常用或重复的元素，而将标记16和更高的标记用于不太常用的可选元素。 

然后再来看看字段的修饰符，有三个修饰符分别是optional，repeated和required。

optional表示该字段是可选的，可以设置也可以不设置，如果没有设置，则会使使用默认值，对于简单类型来说，我们可以自定义默认值，如果不自定义，就会使用系统的默认值。对于系统的默认值来说，数字为0，字符串为空字符串，布尔值为false。

repeated表示该字段是可以重复的，这种重复实际上就是一种数组的结构。

required表示该字段是必须的，如果该字段没有值，那么该字段将会被认为是没有初始化，尝试构建未初始化的消息将抛出 RuntimeException，解析未初始化的消息将抛出 IOException。

> 注意，在Proto3中不支持required字段。

# 编译协议文件

定义好proto文件之后，就可以使用protoc命令对其进行编译了。

protoc是protobuf提供的编译器，一般情况下，可以从github的release库中直接下载即可。如果你不想直接下载，或者官方提供的库中并没有你需要的版本，则可以使用源代码直接进行编译。

protoc的使用的命令如下：

```
protoc --experimental_allow_proto3_optional -I=$SRC_DIR --java_out=$DST_DIR $SRC_DIR/student.proto
```

如果编译proto3,则需要添加--experimental_allow_proto3_optional选项。

我们运行一下上面的代码。会发现在com.flydean.tutorial.protos包里面生成了5个文件。分别是：

```
Student.java              
StudentList.java          
StudentListOrBuilder.java 
StudentListProtos.java    
StudentOrBuilder.java
```

其中StudentListOrBuilder和StudentOrBuilder是两个接口，Student和StudentList是这两个类的实现。

# 详解生成的文件

在proto文件中，我们主要定义了两个类Student和StudentList, 他们中定义了一个内部类Builder，以Student为例，看下这个两个类的定义：

```
public final class Student extends
    com.google.protobuf.GeneratedMessageV3 implements
    StudentOrBuilder

  public static final class Builder extends
      com.google.protobuf.GeneratedMessageV3.Builder<Builder> implements
      com.flydean.tutorial.protos.StudentOrBuilder

```

可以看到他们实现的接口都是一样的，表示他们可能提供了相同的功能。实际上Builder是对消息的一个封装器，所有对Student的操作都可以由Builder来完成。

对于Student中的字段来说，Student类只有这些字段的get方法，而Builder中同时有get和set方法。

对于Student来说，对于字段的方法有：

```
// required string name = 1;
public boolean hasName();
public String getName();

// required int32 id = 2;
public boolean hasId();
public int getId();

// optional string email = 3;
public boolean hasEmail();
public String getEmail();

// repeated .tutorial.Person.PhoneNumber phones = 4;
public List<PhoneNumber> getPhonesList();
public int getPhonesCount();
public PhoneNumber getPhones(int index);

```

对于Builder来说，每个属性多了两个方法：

```
// required string name = 1;
public boolean hasName();
public java.lang.String getName();
public Builder setName(String value);
public Builder clearName();

// required int32 id = 2;
public boolean hasId();
public int getId();
public Builder setId(int value);
public Builder clearId();

// optional string email = 3;
public boolean hasEmail();
public String getEmail();
public Builder setEmail(String value);
public Builder clearEmail();

// repeated .tutorial.Person.PhoneNumber phones = 4;
public List<PhoneNumber> getPhonesList();
public int getPhonesCount();
public PhoneNumber getPhones(int index);
public Builder setPhones(int index, PhoneNumber value);
public Builder addPhones(PhoneNumber value);
public Builder addAllPhones(Iterable<PhoneNumber> value);
public Builder clearPhones();

```

多出的两个方法是set和clear方法。clear是清空字段的内容，让其变回初始状态。

我们还定义了一个枚举类PhoneType：

```
  public enum PhoneType
      implements com.google.protobuf.ProtocolMessageEnum
```

这个类的实现和普通的枚举类没太大区别。

# Builders 和 Messages

如上一节所示，Message对应的类只有get和has方法，所以它是不可以变的，消息对象一旦被构造，就不能被修改。要构建消息，必须首先构建一个构建器，将要设置的任何字段设置为你选择的值，然后调用构建器的 build()方法。 

每次调用Builder的方法都会返回一个新的Builder，当然这个返回的Builder和原来的Builder是同一个，返回Builder只是为了方便进行代码的连写。

下面的代码是如何创建一个Student实例：

```
        Student xiaoming =
                Student.newBuilder()
                        .setId(1234)
                        .setName("小明")
                        .setEmail("flydean@163.com")
                        .addPhones(
                                Student.PhoneNumber.newBuilder()
                                        .setNumber("010-1234567")
                                        .setType(Student.PhoneType.HOME))
                        .build();
```

Student中提供了一些常用的方法，如isInitialized()检测是否所有必须的字段都设置完毕。toString()将对象转换成为字符串。使用它的Builder还可以调用clear()用来清除已设置的状态，mergeFrom(Message other)用来对对象进行合并。

# 序列化和反序列化

生成的对象中提供了序列化和反序列化方法，我们只需要在需要的时候对其进行调用即可：

* byte[] toByteArray();: 序列化消息并返回一个包含其原始字节的字节数组。
* static Person parseFrom(byte[] data);: 从给定的字节数组中解析一条消息。
* void writeTo(OutputStream output);: 序列化消息并将其写入 OutputStream.
* static Person parseFrom(InputStream input);: 从一个消息中读取并解析消息 InputStream. 

通过使用上面的方法，可以很方便的将对象进行序列化和反序列化。

# 协议扩展

我们在定义好proto之后，假如后续还希望对其进行修改，那么我们希望新的协议对历史数据是兼容的。那么我们需要考虑下面几点：

1. 不能更改现有字段的ID编号。
2. 不能添加和删除任何必填字段。
3. 可以 删除可选或重复的字段。
4. 可以 添加新的可选字段或重复字段，但您必须使用新的ID编号。

# 总结

好了，protocol buf的基本用法就介绍到这里，下一篇文章我们会更加详细的介绍proto协议的具体内容，敬请期待。

本文的例子可以参考：[learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

















