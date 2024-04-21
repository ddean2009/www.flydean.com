---
slug: /49-netty-extensible-enum
---

# 73. netty系列之:我有一个可扩展的Enum你要不要看一下?



# 简介

很多人都用过java中的枚举，枚举是JAVA 1.5中引用的一个新的类型，用来表示可以列举的范围，但是可能很少有人知道java中的enum到底是怎么工作的，enum和Enum有什么关系？Enum可不可以扩展？

一起来看看吧。

# enum和Enum

JAVA1.5中引入了枚举类，我们通常使用enum关键字来定义一个枚举类：

```
public enum StatusEnum {
    START(1,"start"),
    INPROCESS(2,"inprocess"),
    END(3,"end");

    private int code;
    private String desc;

    StatusEnum(int code, String desc){
        this.code=code;
        this.desc=desc;
    }
}
```

上面的枚举类中，我们自定义了构造函数，并且定义了3个枚举对象。

接下来看下怎么来使用这个枚举类：

```
    public static void main(String[] args) {
        StatusEnum start = START;
        System.out.println(start.name());
        System.out.println(start.ordinal());
        System.out.println(start.code);
        System.out.println(start.desc);
    }
```

可以输出code和desc很好理解，因为这是我们自定义的枚举类中的属性，但是name和ordinal是什么呢？他们是哪里来的呢？

这里就要介绍java.lang.Enum类了，它是JAVA中所有enum枚举类的父类,name()和ordinal()方法就是在这个类中定义的：

```
public final int ordinal() {
        return ordinal;
    }

public final String name() {
        return name;
    }
```

其中ordinal表示的是枚举类中枚举的位置，那么就是枚举类中枚举的名字。在上面的例子中，START的两个值分别是1和START。

我们来看下Enum类的定义：

```
public abstract class Enum<E extends Enum<E>>
        implements Comparable<E>, Serializable
```

输入它是一个抽象类，但是编译器是不允许你继承这个类的。如果你强行继承，则会抛错：

```
Classes cannot directly extend 'java.lang.Enum'
```

所以说，强扭的瓜不甜，大家一定要记住。

事实上，不仅仅Enum类本身不能被继承，上面创建的enum类StatusEnum也是不能被继承的。

这会造成一个什么问题呢?

如果这个enum是包含在一个外部jar包中的时候，你就没法对该enum进行扩展，在某些特定的情况下，这样的限制可能会带来一些不便。

还好，netty也意识到了这个问题，接下来，我们看下netty是怎么解决的。

# netty中可扩展的Enum:ConstantPool

netty中的表示常量的类叫做Constant，它有两个属性，分别是ID和name：

```
public interface Constant<T extends Constant<T>> extends Comparable<T> {

    int id();

    String name();
}
```

存储这些Constant的就叫做ConstantPool。ConstantPool中有一个ConcurrentMap用来保存具体的Constant。 我们看一下ConstantPool
的工厂类方法valueOf：

```
public T valueOf(String name) {
        return getOrCreate(checkNonEmpty(name, "name"));
    }
```

valueOf方法传入创建的Constant的名字。然后调用getOrCreate方法来创建新的Constant：

```
    private T getOrCreate(String name) {
        T constant = constants.get(name);
        if (constant == null) {
            final T tempConstant = newConstant(nextId(), name);
            constant = constants.putIfAbsent(name, tempConstant);
            if (constant == null) {
                return tempConstant;
            }
        }

        return constant;
    }
```

可以看到getOrCreate就是向constants Map中创建和获取新创建的constant对象。

# 使用ConstantPool

ConstantPool是一个抽象类，如果我们需要新建一个枚举类池，可以直接继承ConstantPool，然后实现其中的newConstant方法。下面是一个使用的具体例子：

```
public final class Foo extends AbstractConstant<Foo> {
  Foo(int id, String name) {
    super(id, name);
  }
}

public final class MyConstants {

  private static final ConstantPool<Foo> pool = new ConstantPool<Foo>() {
    @Override
    protected Foo newConstant(int id, String name) {
      return new Foo(id, name);
    }
  };

  public static Foo valueOf(String name) {
    return pool.valueOf(name);
  }

  public static final Foo A = valueOf("A");
  public static final Foo B = valueOf("B");
}

private final class YourConstants {
  public static final Foo C = MyConstants.valueOf("C");
  public static final Foo D = MyConstants.valueOf("D");
}
```

在上面的例子中，我们创建的枚举类继承自AbstractConstant，然后自定义了ConstantPool，从pool中可以返回新创建的Foo对象。

实时上，在netty channel中经常使用的ChannelOption就是AbstractConstant的子类，我们简单来看下其中的实现：

```
public class ChannelOption<T> extends AbstractConstant<ChannelOption<T>> {

    private static final ConstantPool<ChannelOption<Object>> pool = new ConstantPool<ChannelOption<Object>>() {
        @Override
        protected ChannelOption<Object> newConstant(int id, String name) {
            return new ChannelOption<Object>(id, name);
        }
    };
    public static <T> ChannelOption<T> valueOf(String name) {
        return (ChannelOption<T>) pool.valueOf(name);
    }
    public static <T> ChannelOption<T> valueOf(Class<?> firstNameComponent, String secondNameComponent) {
        return (ChannelOption<T>) pool.valueOf(firstNameComponent, secondNameComponent);
    }
    public static boolean exists(String name) {
        return pool.exists(name);
    }
    public static <T> ChannelOption<T> newInstance(String name) {
        return (ChannelOption<T>) pool.newInstance(name);
    }
```

可以看到，ChannelOption中定义了ConstantPool，然后通过ConstantPool的valueOf和newInstance方法来创建新的ChannelOption对象。

# 总结

如果你也想要对枚举类进行扩展，不妨使用Constant和ConstantPool试试。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)


