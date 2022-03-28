java高级用法之:在JNA中使用类型映射

[toc]

# 简介

JNA中有很多种映射，library的映射，函数的映射还有函数参数和返回值的映射，libary和函数的映射比较简单，我们在之前的文章中已经讲解过了，对于类型映射来说，因为JAVA中的类型种类比较多，所以这里我们将JNA的类型映射提取出来单独讲解。

# 类型映射的本质

我们之前提到在JNA中有两种方法来映射JAVA中的方法和native libary中的方法，一种方法叫做interface mapping，一种方式叫做direct mapping。

但是我们有没有考虑过这两种映射的本质是什么呢？

比如native有一个方法，我们是如何将JAVA代码中的方法参数传递给native方法，并且将native方法的返回值转换成JAVA中函数的返回类型呢？

答案就是序列化。

因为本质上一切的交互都是二进制的交互。JAVA类型和native类型进行转换，最简单的情况就是JAVA类型和native类型底层的数据长度保持一致，这样在进行数据转换的时候就会更加简单。

我们看下JAVA类型和native类型的映射和长度关系：

C Type	|Native类型的含义|	Java Type
---|---|---
char	|8-bit整型|	byte
wchar_t	|和平台相关	|char
short	|16-bit整型	|short
int	|32-bit整型	|int
int	|boolean flag	|boolean
enum|枚举类型|	int (usually)
long long, __int64|	64-bit整型|	long
float|	32-bit浮点数	|float
double|	64-bit浮点数	|double
pointer (e.g. void*)	|平台相关	|Buffer Pointer
pointer (e.g. void*), array|平台相关|<P>[] (原始类型数组)

上面的JAVA类型都是JDK自带的类型（Pointer除外）。

除了JAVA自带的类型映射，JNA内部也定义了一些数据类型，可以跟native的类型进行映射：

C Type	|Native类型的含义|	Java Type
---|---|---
long|	和平台相关(32- or 64-bit integer)|	NativeLong
const char*	|字符串 (native encoding or jna.encoding)|	String
const wchar_t*|	字符串 (unicode)|	WString
char**|	字符串数组	|String[]
wchar_t**|	字符串数组(unicode)	|WString[]
void**|	pointers数组	|Pointer[]
struct* struct|	结构体指针和结构体	|Structure
union	|结构体	|Union
struct[]|	结构体数组	|Structure[]
void (*FP)()|	函数指针 (Java or native)	|Callback
pointer (<T> *)	|指针	|PointerType
other|	整数类型	|IntegerType
other|	自定义映射类型	|NativeMapped

# TypeMapper

除了定义好的映射关系之外，大家也可以使用TypeMapper来对参数类型进行自定义转换，先来看下TypeMapper的定义：

```
public interface TypeMapper {

    FromNativeConverter getFromNativeConverter(Class<?> javaType);

    ToNativeConverter getToNativeConverter(Class<?> javaType);
}

```

TypeMapper是一个interface，它定义了两个converter方法，分别是getFromNativeConverter和getToNativeConverter。

如果要使用TypeMapper则需要实现它而这两个方法即可。我们看一下官方的W32APITypeMapper是怎么实现的：

```
 TypeConverter stringConverter = new TypeConverter() {
                @Override
                public Object toNative(Object value, ToNativeContext context) {
                    if (value == null)
                        return null;
                    if (value instanceof String[]) {
                        return new StringArray((String[])value, true);
                    }
                    return new WString(value.toString());
                }
                @Override
                public Object fromNative(Object value, FromNativeContext context) {
                    if (value == null)
                        return null;
                    return value.toString();
                }
                @Override
                public Class<?> nativeType() {
                    return WString.class;
                }
            };
            addTypeConverter(String.class, stringConverter);
            addToNativeConverter(String[].class, stringConverter);
```

首先定义一个TypeConverter，在TypeConverter中实现了toNative，fromNative和nativeType三个方法。在这个例子中，native type是WString，而JAVA type是String。而这个TypeConverter就是最终要使用的FromNativeConverter和ToNativeConverter。

有了typeMapper，应该怎么使用呢？最简单的方法就是将其添加到Native.load的第三个参数中，如下所示：

```
 TestLibrary lib = Native.load("testlib", TestLibrary.class, Collections.singletonMap(Library.OPTION_TYPE_MAPPER, mapper));
```

# NativeMapped

TypeMapper需要在调用Native.load方法的时候传入，从而提供JAVA类型和native类型的转换关系。TypeMapper可以看做是类型转换关系的外部维护者。

可能很多朋友已经想到了，既然能在JAVA类型外部维护转换关系，那么可不可以在JAVA类型本身对这个转换关系进行维护呢？答案是肯定的，我们只需要在要实现转换类型关系的JAVA类型实现NativeMapped接口即可。

先来看下NativeMapped接口的定义：

```
public interface NativeMapped {

    Object fromNative(Object nativeValue, FromNativeContext context);

    Object toNative();

    Class<?> nativeType();
}
```

可以看到NativeMapped中定义要实现的方法基本上和FromNativeConverter、ToNativeConverter中定义的方法一致。

下面举一个具体的例子来说明一下NativeMapped到底应该怎么使用。首先我们定义一个enum类实现NativeMapped接口：

```
    public enum TestEnum implements NativeMapped {
        VALUE1, VALUE2;

        @Override
        public Object fromNative(Object nativeValue, FromNativeContext context) {
            return values()[(Integer) nativeValue];
        }

        @Override
        public Object toNative() {
            return ordinal();
        }

        @Override
        public Class<?> nativeType() {
            return Integer.class;
        }
    }
```

这个类实现了从Integer到TestEnum枚举的转换。

要想使用该TestEnum类的话，需要定义一个interface：

```

    public static interface EnumerationTestLibrary extends Library {
        TestEnum returnInt32Argument(TestEnum arg);
    }
```

具体调用逻辑如下：

```
EnumerationTestLibrary lib = Native.load("testlib", EnumerationTestLibrary.class);
assertEquals("Enumeration improperly converted", TestEnum.VALUE1, lib.returnInt32Argument(TestEnum.VALUE1));
assertEquals("Enumeration improperly converted", TestEnum.VALUE2, lib.returnInt32Argument(TestEnum.VALUE2));
```

可以看到，因为NativeMapped中已经包含了类型转换的信息，所以不需要再指定TypeMapper了。

> 注意，这里用到了testlib，这个testlib是从JNA的native模块中编译出来的，如果你是MAC环境的话可以拷贝JNA代码，运行ant native即可得到，编译完成之后，将这个libtestlib.dylib拷贝到你项目中的resources目录下面darwin-aarch64或者darwin-x86即可。

有不会的同学，可以联系我。

# 总结

本文讲解了JNA中的类型映射规则和自定义类型映射的方法。


本文的代码：[https://github.com/ddean2009/learn-java-base-9-to-20.git](https://github.com/ddean2009/learn-java-base-9-to-20.git)




