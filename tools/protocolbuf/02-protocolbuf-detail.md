protocol buffer没那么难,不信你看这篇

[toc]

# 简介

上一篇文章我们对google的protobuf已经有了一个基本的认识，并且能够使用相应的工具生成对应的代码了。但是对于.proto文件的格式和具体支持的类型还不是很清楚。今天本文将会带大家一探究竟。

> 注意，本文介绍的协议是proto3版本的。

# 定义一个消息

protobuf中的主体被称为是message，可以将其看做是我们在程序中定义的类。我们可以在.proto文件中定义这个message对象，并且为其添加属性，如下所示：

```
syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}

```

上例的第一行指定了.proto文件的协议类型，这里使用的是proto3，也是最新版的协议，如果不指定，默认情况下是proto2。

## 类型定义

这里我们为SearchRequest对象，定义了三个属性，其类型分别是String和int32。

String和int32都是简单类型，protobuf支持的简单类型如下：

protobuf类型 | 说明 | 对应的java类型
---------|----------|---------
 double | 双精度浮点类型 | double
 float | 浮点类型 | float
 int32 | 整型数字,最好不表示负数 | int
 int64 | 整型数字，最好不表示负数 | long
 uint32 | 无符号整数 | int
 uint64 | 无符号整数 | long
 sint32 | 带符号整数 | int
 sint64 | 带符号整数 | long
 fixed32 | 四个字节的整数 | int
 fixed64 | 8个字节的整数 | long
 sfixed32 |4个字节的带符号整数 | int
 sfixed64| 8个字节的带符号整数 | long
 bool|布尔类型|boolean
 string|字符串|String
 bytes|字节|ByteString

 当然protobuf还支持复杂的组合类型和枚举类型。

枚举类型在protobuf中用enum来表示，我们来看一个枚举类型的定义：

```
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0;
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}

```

上面我们定义了一个枚举类型Corpus，枚举类型中定义的枚举值是从0开始的，0也是枚举类型的默认值。

在枚举中，还可以定义具有相同value的枚举类型，但是这样需要加上allow_alias=true的选项，如下所示：

```
message MyMessage1 {
  enum EnumAllowingAlias {
    option allow_alias = true;
    UNKNOWN = 0;
    STARTED = 1;
    RUNNING = 1;
  }
}
message MyMessage2 {
  enum EnumNotAllowingAlias {
    UNKNOWN = 0;
    STARTED = 1;
    // RUNNING = 1;  // Uncommenting this line will cause a compile error inside Google and a warning message outside.
  }
}
```

在枚举类型中，如果我们后续对某些枚举类型进行了删除，那么被删除的值可能会被后续的用户使用，这样就会造成潜在的代码隐患，为了解决这个问题，枚举提供了一个reserved的关键词，被这个关键词声明的枚举类型，就不会被后续使用，如下所示：

```
enum Foo {
  reserved 2, 15, 9 to 11, 40 to max;
  reserved "FOO", "BAR";
}
```

reserved关键字也可以用在message的字段中，表示后续不要使用到这些字段，如下：

```
message Foo {
  reserved 2, 15, 9 to 11;
  reserved "foo", "bar";
}
```

## 字段的值

我们可以看到，每个message的字段都分配了一个值，每个字段的值在message中都是唯一的，这些值是用来定位在二进制消息格式中的字段位置。所以一旦定义之后，不要随意修改。

要注意的是值1-15在二进制中使用的1个字节来表示的，值16-2047需要使用2个字节来表示，所以通常将1-15使用在最常见的字段和可能重复的字段，这样可以节约编码后的空间。

最小的值是1，最大的值是2的29次方-1，或者536,870,911。这中间从19000-19999是保留数字，不能使用。

当消息被编译之后，各个字段将会被转成为对应的类型，并且各个字段类型将会被赋予不同的初始值。

strings的默认值是空字符串，bytes的默认值是空bytes，bools的默认值是false，数字类型的默认值是0，枚举类型的默认值是枚举的第一个元素。

## 字段描述符

每个消息的字段都可以有两种描述符，第一种叫做singular，表示message中可以有0个或者1个这个字段，这是proto3中默认的定义方式。

第二种叫做repeated，表示这个字段在message中是可以重复的，也就是说它代表的是一个集合。

## 添加注释

在proto中的注释和C++的风格类似，可以使用： // 或者 /* ... */ 的风格来注释，如下所示：

```
/* 这是一个注释. */

message SearchRequest {
  string query = 1;
  int32 page_number = 2;  // 页面的number
  int32 result_per_page = 3;  // 每页的结果
}

```

# 嵌套类型

在一个message中还可以嵌入一个message，如下所示：

```
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}

```

在上例中，我们在SearchResponse定义了一个Result类型，在java中，实际上可以将其看做是嵌套类。

如果希望在message的定义类之外使用这个内部的message，则可以通过`_Parent_._Type_来`定义：

```
message SomeOtherMessage {
  SearchResponse.Result result = 1;
}

```

嵌套类型可以任意嵌套，如下所示：

```
message Outer {                  // Level 0
  message MiddleAA {  // Level 1
    message Inner {   // Level 2
      int64 ival = 1;
      bool  booly = 2;
    }
  }
  message MiddleBB {  // Level 1
    message Inner {   // Level 2
      int32 ival = 1;
      bool  booly = 2;
    }
  }
}
```

# Map

如果想要在proto中定义map，可以这样写：

```
map<key_type, value_type> map_field = N;

```

这里的value_type可以是除map之外的任意类型。注意map不能是repeated。

map中的数据的顺序是不定的，我们不能依赖存入的map顺序来判断其取出的顺序。

# 总结

以上就是proto3中定义声明文件该注意的事项了，大家在使用protobuf的时候要多加注意。











