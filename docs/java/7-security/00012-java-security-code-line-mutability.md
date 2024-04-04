---
slug: /java-security-code-line-mutability
---

# 12. java安全编码指南之:Mutability可变性

# 简介

mutable（可变）和immutable（不可变）对象是我们在java程序编写的过程中经常会使用到的。

可变类型对象就是说，对象在创建之后，其内部的数据可能会被修改。所以它的安全性没有保证。

而不可变类型对象就是说，对象一旦创建之后，其内部的数据就不能够被修改，我们可以完全相信这个对象。

虽然mutable对象安全性不够，但是因为其可以被修改，所以会有效的减少对该对象的拷贝。

而immutable对象因为不可改变，所以尝试对该对象的修改都会导致对象的拷贝，从而生成新的对象。

我们最常使用的String就是一个immutable对象。

那么可变性在java的安全编码中的最佳实践是怎么样的呢？ 一起来看看吧。

# 可变对象和不可变对象

知道了可变对象和不可变对象的不同之处之后，我们看一下怎么才能判断这个对象是可变对象还是不可变对象呢？

首先，最简单的一点就是，不可变对象创建之后就不能够被修改，所以不可变对象里面基本上没有setXXX之类的方法，而可变对象提供了setXXX这些可以修改内部变量状态的方法。

看一个例子java.util.Date是一个可变对象，而java.time.LocalTime是不可变对象。

看下他们的方法定义有什么区别呢？

![](https://img-blog.csdnimg.cn/20200716175742739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

首先是Date,我们可以看到在其中定义了很多setXXX方法。

![](https://img-blog.csdnimg.cn/20200716175759787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

而在LocalTime中，我们基本上看不到setXXX方法。

同时不可变对象的字段基本上都是final的，防止被二次修改。

第二，不可变对象一般来说是不可继承的，在java中就是以final关键字做限定的：

~~~java
public class Date
public final class LocalTime
~~~

第三，不可变对象一般会隐藏构造函数，而是使用类似工厂模式的方法来创建对象，这样为实例的创建提供了更多的机动性。


# 创建mutable对象的拷贝

那么如果我们想使用mutable对象，又不想被别人修改怎么办呢？

简单的办法就是拷贝一份要使用的对象：

~~~java
public class CopyOutput {
            private final java.util.Date date;
            ...
            public java.util.Date getDate() {
                return (java.util.Date)date.clone();
            }
        }
~~~

这里大家还要注意深拷贝和浅拷贝的问题。

# 为mutable类创建copy方法

既然要为mutable对象创建拷贝，那么相应的mutable类也需要提供一个copy方法来协助拷贝。

这里需要考虑一个深拷贝和浅拷贝的问题。

# 不要相信equals

我们知道在HashMap中怎么去查找一个key呢？先去找这个key的hash值，然后去判断key.equals方法是否相等，考虑下面这种情况：

~~~java
private final Map<Window,Extra> extras = new HashMap<>();

        public void op(Window window) {
            Extra extra = extras.get(window);
        }
~~~

op方法接收一个Window对象，然后将其当成key从HashMap中取出对应的value。

如果，这个时候，我们有一个类A继承了Window，并且hash值和equals都和另外一个Window对象B相同，那么使用A这个key可以获取到B这个key存储的数据！

怎么解决这个问题呢？

Java中有一个特别的HashMap：IdentityHashMap，这个Map的key和value比较是用==而不是equals方法，所以可以有效的避免上面出现的问题。

~~~java
private final Map<Window,Extra> extras = new IdentityHashMap<>();

        public void op(Window window) {
            Extra extra = extras.get(window);
        }
~~~

如果没有这样的Map可用，那么可以使用不可变对象作为key或者使用Window的私有变量，从而恶意攻击者无法获得这个变量。

~~~java
public class Window {
            /* pp */ 
            class PrivateKey {
                Window getWindow() {
                    return Window.this;
                }
            }
            final PrivateKey privateKey = new PrivateKey();

            private final Map<Window.PrivateKey,Extra> extras =
                 new WeakHashMap<>();
            ...
        }

        public class WindowOps {
            public void op(Window window) {
                // Window.equals may be overridden,
                // but safe as we don't use it.
                Extra extra = extras.get(window.privateKey);
                ...
            }
        }
~~~

# 不要直接暴露可修改的属性

如果一个可变类中的某个属性确实需要暴露被外部使用，那么一定要将这个属性定义为private，并且使用wrapper方法将其包装起来。

如果直接暴露出去，那么基本上就没有权限控制可言，任何程序只要能够拿到你这个对象，就可以对属性进行修改。考虑下下面的应用方式，我们在修改state的方法中加入了一个参数校验和权限控制。

~~~java
public final class WrappedState {
            // private immutable object
            private String state;

            // wrapper method
            public String getState() {
                return state;
            }

            // wrapper method
            public void setState(final String newState) {
                this.state = requireValidation(newState);
            }

            private static String requireValidation(final String state) {
                if (...) {
                    throw new IllegalArgumentException("...");
                }
                return state;
            }
        }
~~~

# public static fields应该被置位final

同样的，如果你是一个类变量，当然不希望这个变量会被任何人修改，那么需要将其置位final。

~~~java
public class Files {
            public static final String separator = "/";
            public static final String pathSeparator = ":";
        }
~~~

# public static final field 应该是不可变的

如果类变量是public static final的，那么这个变量一定要是不可变的。

有人会问了，都定义成了final了，是不是就已经不可变了？

其实不然，比如我们定义了一个final的List，虽然这个list不能变化，但是list里面的值是可以变化的。我们需要将可变变量修改为不可变变量，如下所示：

~~~java
import static java.util.Arrays.asList;
        import static java.util.Collections.unmodifiableList;
        ...
        public static final List<String> names = unmodifiableList(asList(
            "Fred", "Jim", "Sheila"
        ));
~~~

如果使用JDK9中引入的of()或者ofEntries()方法，可以直接创建不可修改的集合：

~~~java
public static final List
<String> names =
 List.of("Fred", "Jim", "Sheila");
~~~

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)







