---
slug: /jna-type-mapping-details
---

# 5. java高级用法之:JNA类型映射应该注意的问题



# 简介

JNA提供JAVA类型和native类型的映射关系，但是这一种映射关系只是一个大概的映射，我们在实际的应用中还有很多需要注意的事项，本文将会为大家详细讲解在使用类型映射中可能会出现的问题。一起来看看吧。

# String

首先是String的映射，JAVA中的String实际上对应的是两种native类型：const char* 和 const wchar_t*。默认情况下String会被转换成为char* 。

> char是ANSI类型的数据类型，而wchar_t是Unicode字符的数据类型,也叫做宽字符。

 如果JAVA的unicode characters要转换成为char数组，那么需要进行一些编码操作，如果设置了jna.encoding，那么就会使用设置好的编码方式来进行编码。默认情况下编码方式是 "UTF8".

 如果是WString,那么Unicode values可以直接拷贝到WString中，而不需要进行任何编码。

 先看一个简单的例子:

```
 char* returnStringArgument(char *arg) {
  return arg;
}

wchar_t* returnWStringArgument(wchar_t *arg) {
  return arg;
}

```

上面的native代码可以映射为：

```
String returnStringArgument(String s);
WString returnWStringArgument(WString s);
```

再来看一个不同的例子，假如native方法的定义是这样的：

```
int getString(char* buffer, int bufsize);

int getUnicodeString(wchar_t* buffer, int bufsize);
```

我们定义了两个方法，方法的参数分别是char* 和wchar_t*。

接下来看一下怎么在JAVA中定义方法的映射：

```
// Mapping A:
int getString(byte[] buf, int bufsize);
// Mapping B:
int getUnicodeString(char[] buf, int bufsize);
```

下面是具体的使用：

```
byte[] buf = new byte[256];
int len = getString(buf, buf.length);
String normalCString = Native.toString(buf);
String embeddedNULs = new String(buf, 0, len);
```

可能有同学会问了，既然JAVA中的String可以转换成为char*，为什么这里需要使用byte数组呢？

这是因为getString方法需要对传入的char数组中的内容进行修改，但是因为String是不可变的，所以这里是不能直接使用String的，我们需要使用byte数组。

接着我们使用Native.toString(byte[]) 将byte数组转换成为JAVA字符串。

再看一个返回值的情况：

```
// Example A: Returns a C string directly
const char* getString();
// Example B: Returns a wide character C string directly
const wchar_t* getString();
```

一般情况下，如果是native方法直接返回string,我们可以使用String进行映射：

```
// Mapping A
String getString();
// Mapping B
WString getString();
```

如果native code为String分配了内存空间，那么我们最好使用JNA中的Pointer作为返回值，这样我们可以在未来某些时候，释放所占用的空间,如下所示：

```
Pointer getString();
```

# Buffers，Memory,数组和Pointer

什么时候需要用到Buffers和Memory呢?

一般情况下如果是基础数据的数组作为参数传到函数中的话，可以在JAVA中直接使用基础类的数组来替代。但是如果native方法在方法返回之后，还需要访问数组的话（保存了指向数组的指针），这种情况下使用基础类的数组就不太合适了，这种情况下，我们需要用到ByteBuffers或者Memory。

我们知道JAVA中的数组是带有长度的，但是对于native方法来说，返回的数组实际上是一个指向数组的指针，我们并不能知道返回数组的长度，所以如果native方法返回的是数组指针的话，JAVA代码中用数组来进行映射就是不合适的。这种情况下，需要用到Pointer.

Pointer表示的是一个指针，先看一下Pointer的例子，首先是native代码：

```
void* returnPointerArgument(void *arg) {
  return arg;
}

void* returnPointerArrayElement(void* args[], int which) {
  return args[which];
}
```

接下来是JAVA的映射：

```
Pointer returnPointerArgument(Pointer p);

Pointer returnPointerArrayElement(Pointer[] args, int which);
```

除了基本的Pointer之外，你还可以自定义带类型的Pointer，也就是PointerType. 只需要继承PointerType即可，如下所示：

```
public static class TestPointerType extends PointerType {
            public TestPointerType() { }
            public TestPointerType(Pointer p) { super(p); }
        }
TestPointerType returnPointerArrayElement(TestPointerType[] args, int which);
```


再看一下字符串数组：

```
char* returnStringArrayElement(char* args[], int which) {
  return args[which];
}

wchar_t* returnWideStringArrayElement(wchar_t* args[], int which) {
  return args[which];
}
```

对应的JAVA映射如下：

```
String returnStringArrayElement(String[] args, int which);

WString returnWideStringArrayElement(WString[] args, int which);
```

对应Buffer来说，JAVA NIO中提供了很多类型的buffer，比如ByteBuffer,ShortBuffer,IntBuffer,LongBuffer,FloatBuffer和DoubleBuffer等。这里以ByteBuffer为例，来看一下具体的使用.

首先看下native代码：

```
int32_t fillInt8Buffer(int8_t *buf, int len, char value) {
  int i;

  for (i=0;i < len;i++) {
    buf[i] = value;
  }
  return len;
}
```

这里将buff进行填充，很明显后续还需要使用到这个buffer，所以这里使用数组是不合适的，我们可以选择使用ByteBuffer：

```
int fillInt8Buffer(ByteBuffer buf, int len, byte value);
```

然后看下具体怎么使用：

```
TestLibrary lib = Native.load("testlib", TestLibrary.class);

        ByteBuffer buf  = ByteBuffer.allocate(1024).order(ByteOrder.nativeOrder());
        final byte MAGIC = (byte)0xED;
        lib.fillInt8Buffer(buf, 1024, MAGIC);
        for (int i=0;i < buf.capacity();i++) {
            assertEquals("Bad value at index " + i, MAGIC, buf.get(i));
        }
```

# 可变参数

对于native和JAVA本身来说，都是支持可变参数的，我们举个例子，在native方法中：

```
int32_t addVarArgs(const char *fmt, ...) {
  va_list ap;
  int32_t sum = 0;
  va_start(ap, fmt);

  while (*fmt) {
    switch (*fmt++) {
    case 'd':
      sum += va_arg(ap, int32_t);
      break;
    case 'l':
      sum += (int) va_arg(ap, int64_t);
      break;
    case 's': // short (promoted to 'int' when passed through '...') 
    case 'c': // byte/char (promoted to 'int' when passed through '...')
      sum += (int) va_arg(ap, int);
      break;
    case 'f': // float (promoted to ‘double’ when passed through ‘...’)
    case 'g': // double
      sum += (int) va_arg(ap, double);
      break;
    default:
      break;
    }
  }
  va_end(ap);
  return sum;
}
```

对应的JAVA方法映射如下：

```
public int addVarArgs(String fmt, Number... args);
```

相应的调用代码如下：

```
int arg1 = 1;
int arg2 = 2;
assertEquals("32-bit integer varargs not added correctly", arg1 + arg2,
                     lib.addVarArgs("dd", arg1, arg2));
```

# 总结

本文介绍了在使用JNA方法映射中应该注意的一些细节和具体的使用问题。

本文的代码：[https://github.com/ddean2009/learn-java-base-9-to-20.git](https://github.com/ddean2009/learn-java-base-9-to-20.git)















