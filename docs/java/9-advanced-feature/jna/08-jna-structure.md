---
slug: /jna-structure
---

# 8. java高级用法之:JNA中的Structure



# 简介

前面我们讲到了JNA中JAVA代码和native代码的映射，虽然可以通过TypeMapper来将JAVA中的类型和native中的类型进行映射，但是native中的数据类型都是基础类型，如果native中的数据类型是复杂的struct类型该如何进行映射呢？

不用怕，JNA提供了Structure类，来帮助我们进行这些映射处理。

# native中的struct

什么时候会用到struct呢？一般情况下，当我们需要自定义一个数据类的时候，一般情况下，在JAVA中需要定义一个class(在JDK17中，可以使用更加简单的record来进行替换)，但是为一个数据结构定义class显然有些臃肿，所以在native语言中，有一些更简单的数据结构叫做struct。

我们先看一个struct的定义:

```
typedef struct _Point {
  int x, y;
} Point;
```

上面的代码中，我们定义了一个Pointer的struct数据类下，在其中定义了int的x和y值表示Point的横纵坐标。

struct的使用有两种情况，一种是值传递，一种是引用传递。先来看下这两种情况在native方法中是怎么使用的：

引用传递：

```
Point* translate(Point* pt, int dx, int dy);
```

值传递：

```
Point translate(Point pt, int dx, int dy);
```

# Structure 

那么对于native方法中的struct数据类型的使用方式，应该如何进行映射呢? JNA为我们提供了Structure类。

默认情况下如果Structure是作为参数或者返回值，那么映射的是struct*,如果表示的是Structure中的一个字段，那么映射的是struct。

当然你也可以强制使用Structure.ByReference 或者 Structure.ByValue 来表示是传递引用还是传值。

我们看下上面的native的例子中，如果使用JNA的Structure来进行映射应该怎么实现：

指针映射：

```
class Point extends Structure { public int x, y; }
Point translate(Point pt, int x, int y);
...
Point pt = new Point();
Point result = translate(pt, 100, 100);
```

传值映射：

```
class Point extends Structure {
    public static class ByValue extends Point implements Structure.ByValue { }
    public int x, y;
}
Point.ByValue translate(Point.ByValue pt, int x, int y);
...
Point.ByValue pt = new Point.ByValue();
Point result = translate(pt, 100, 100);
```

Structure内部提供了两个interface,分别是ByValue和ByReference:

```
public abstract class Structure {

    public interface ByValue { }

    public interface ByReference { }
```

要使用的话，需要继承对应的interface。

# 特殊类型的Structure

除了上面我们提到的传值或者传引用的struct，还有其他更加复杂的struct用法。

## 结构体数组作为参数

首先来看一下结构体数组作为参数的情况：

```
void get_devices(struct Device[], int size);
```

对应结构体数组，可以直接使用JNA中对应的Structure数组来进行映射：

```
int size = ...
Device[] devices = new Device[size];
lib.get_devices(devices, devices.length);
```

## 结构体数组作为返回值

如果native方法返回的是一个指向结构体的指针，其本质上是一个结构体数组，我们应该怎么处理呢？

先看一下native方法的定义：

```
struct Display* get_displays(int* pcount);
void free_displays(struct Display* displays);
```

get_displays方法返回的是一个指向结构体数组的指针，pcount是结构体的个数。

对应的JAVA代码如下：

```
Display get_displays(IntByReference pcount);
void free_displays(Display[] displays);
```

对于第一个方法来说，我们只返回了一个Display，但是可以通过Structure.toArray(int) 方法将其转换成为结构体数组。传入到第二个方法中，具体的调用方式如下：

```
IntByReference pcount = new IntByReference();
Display d = lib.get_displays(pcount);
Display[] displays = (Display[])d.toArray(pcount.getValue());
...
lib.free_displays(displays);
```

## 结构体中的结构体

结构体中也可以嵌入结构体，先看下native方法的定义：

```
typedef struct _Point {
  int x, y;
} Point;

typedef struct _Line {
  Point start;
  Point end;
} Line;
```

对应的JAVA代码如下：

```
class Point extends Structure {
  public int x, y;
}

class Line extends Structure {
  public Point start;
  public Point end;
}
```

如果是下面的结构体中的指向结构体的指针：

```
typedef struct _Line2 {
  Point* p1;
  Point* p2;
} Line2;
```

那么对应的代码如下：

```
class Point extends Structure {
    public static class ByReference extends Point implements Structure.ByReference { }
    public int x, y;
}
class Line2 extends Structure {
  public Point.ByReference p1;
  public Point.ByReference p2;
}
```

或者直接使用Pointer作为Structure的属性值：

```
class Line2 extends Structure {
  public Pointer p1;
  public Pointer p2;
}

Line2 line2;
Point p1, p2;
...
line2.p1 = p1.getPointer();
line2.p2 = p2.getPointer();
```

## 结构体中的数组

如果结构体中带有固定大小的数组：

```
typedef struct _Buffer {
  char buf1[32];
  char buf2[1024];
} Buffer;
```

那么我们在JAVA中需要指定数据的大小：

```
class Buffer extends Structure {
  public byte[] buf1 = new byte[32];
  public byte[] buf2 = new byte[1024];
}
```

如果结构体中是动态大小的数组:

```
typedef struct _Header {
  int flags;
  int buf_length;
  char buffer[1];
} Header;
```

那么我们需要在JAVA的结构体中定义一个构造函数，传入bufferSize的大小,并分配对应的内存空间：

```
class Header extends Structure {
  public int flags;
  public int buf_length;
  public byte[] buffer;
  public Header(int bufferSize) {
    buffer = new byte[bufferSize];
    buf_length = buffer.length;
    allocateMemory();
  }
}
```

## 结构体中的可变字段

默认情况下结构体中的内容和native memory的内容是一致的。JNA会在函数调用之前将Structure的内容写入到native memory中，并且在函数调用之后，将 native memory中的内容回写到Structure中。

默认情况下是将结构体中的所有字段都进行写入和写出。但是在某些情况下，我们希望某些字段不进行自动更新。这个时候就可以使用volatile关键字，如下所示：

```
class Data extends com.sun.jna.Structure {
  public volatile int refCount;
  public int value;
}
...
Data data = new Data();
```

当然，你也可以强制使用Structure.writeField(String)来将字段信息写入内存中,或者使用Structure.read() 来更新整个结构体的信息或者使用data.readField("refCount")来更新具体字段信息。

## 结构体中的只读字段

如果不想从JAVA代码中对Structure的内容进行修改，则可以将对应的字段标记为final。在这种情况下，虽然JAVA代码不能直接对其进行修改，但是仍然可以调用read方法从native memory中读取对应的内容并覆盖Structure中对应的值。

来看下JAVA中如何使用final字段：

```
class ReadOnly extends com.sun.jna.Structure {
  public final int refCount;
  {
    // 初始化
    refCount = -1;
    // 从内存中读取数据
    read();
  }
}
```

> 注意所有的字段的初始化都应该在构造函数或者静态方法块中进行。

# 总结

结构体是native方法中经常会使用到的一种数据类型，JNA中对其进行映射的方法是我们要掌握的。













