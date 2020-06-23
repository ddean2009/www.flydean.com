Java函数式编程和Lambda表达式

## 什么是函数式编程

相信大家都使用过面向对象的编程语言，面向对象编程是对数据进
行抽象，而函数式编程是对行为进行抽象。函数式编程让程序员能够写出更加容易阅读的代码。那什么时候函数式编程呢？ 

函数式编程是一种编程的方法论，主要是将行为编写成一个个的函数。

什么是函数？ 

函数就是对输入的值进行处理，返回另外的值。

> 更多内容请访问[www.flydean.com](www.flydean.com)

## Lambda表达式

在Java 8 中引入的Labmda表达式是函数式编程的一种实现。

什么是Lambda表达式呢？我们举个例子

下面的代码如果使用Java 7 的话应该这样写：

~~~java
  //sort using java 7
   private void sortUsingJava7(List<String> names){   
      Collections.sort(names, new Comparator<String>() {
         @Override
         public int compare(String s1, String s2) {
            return s1.compareTo(s2);
         }
      });
   }
~~~

代码里面需要实现一个匿名类，看起来是不是很复杂？ 下面我们用java 8 的lambda表达式将其改写：

~~~java
   //sort using java 8
   private void sortUsingJava8(List<String> names){
      Collections.sort(names, (s1, s2) -> s1.compareTo(s2));
   }
}
~~~

其中(s1, s2) -> s1.compareTo(s2) 是Comparator的compare方法的实现。

这里我们使用了Lambda表达式替换了Comparator的匿名类。为什么可以这样做？什么样的匿名类才能被Lambda表达式替换呢？ 这里我们引入一个概念，叫做函数式接口。

Lambda表达式需要一个函数式接口作为其对应类型，而它的方法体就是函数接口的实现。每一个该接口类型的Lambda表达式都会被匹配到该接口的抽象方法。


## @FunctionalInterface函数式接口

所谓函数是接口是指包括如下特征的接口：

* 接口有且仅有一个抽象方法
* 接口允许定义静态方法
* 接口允许定义默认方法
* 接口允许java.lang.Object中的public方法

我们看一下上面的Comparator的实现：

~~~java
@FunctionalInterface
public interface Comparator<T> {
 
    int compare(T o1, T o2);

    boolean equals(Object obj);

    default Comparator<T> reversed() {
        return Collections.reverseOrder(this);
    }

    default Comparator<T> thenComparing(Comparator<? super T> other) {
        Objects.requireNonNull(other);
        return (Comparator<T> & Serializable) (c1, c2) -> {
            int res = compare(c1, c2);
            return (res != 0) ? res : other.compare(c1, c2);
        };
    }

    default <U> Comparator<T> thenComparing(
            Function<? super T, ? extends U> keyExtractor,
            Comparator<? super U> keyComparator)
    {
        return thenComparing(comparing(keyExtractor, keyComparator));
    }

    default <U extends Comparable<? super U>> Comparator<T> thenComparing(
            Function<? super T, ? extends U> keyExtractor)
    {
        return thenComparing(comparing(keyExtractor));
    }

    default Comparator<T> thenComparingInt(ToIntFunction<? super T> keyExtractor) {
        return thenComparing(comparingInt(keyExtractor));
    }

    default Comparator<T> thenComparingLong(ToLongFunction<? super T> keyExtractor) {
        return thenComparing(comparingLong(keyExtractor));
    }

    default Comparator<T> thenComparingDouble(ToDoubleFunction<? super T> keyExtractor) {
        return thenComparing(comparingDouble(keyExtractor));
    }

   
    public static <T extends Comparable<? super T>> Comparator<T> reverseOrder() {
        return Collections.reverseOrder();
    }

    @SuppressWarnings("unchecked")
    public static <T extends Comparable<? super T>> Comparator<T> naturalOrder() {
        return (Comparator<T>) Comparators.NaturalOrderComparator.INSTANCE;
    }

    public static <T> Comparator<T> nullsFirst(Comparator<? super T> comparator) {
        return new Comparators.NullComparator<>(true, comparator);
    }

   
    public static <T> Comparator<T> nullsLast(Comparator<? super T> comparator) {
...
    }

   
    public static <T, U> Comparator<T> comparing(
            Function<? super T, ? extends U> keyExtractor,
            Comparator<? super U> keyComparator)
    {
...
    }

    public static <T, U extends Comparable<? super U>> Comparator<T> comparing(
            Function<? super T, ? extends U> keyExtractor)
    {
...
    }

    public static <T> Comparator<T> comparingInt(ToIntFunction<? super T> keyExtractor) {
...
    }

    public static <T> Comparator<T> comparingLong(ToLongFunction<? super T> keyExtractor) {
...
    }


    public static<T> Comparator<T> comparingDouble(ToDoubleFunction<? super T> keyExtractor) {
...
    }
}
~~~

我们可以看到Comparator接口里面有static方法，有default方法，有一个来自Object的boolean equals(Object obj);有一个需要实现的抽象方法int compare(T o1, T o2)

default方法是java 8添加的最新的关键词，表示实现这个接口的类如果不自己实现这个方法，那么就用接口自己的吧，其作用主要是向下兼容。

JDK自带了一些有用的函数式接口：

* java.lang.Runnable,

* java.awt.event.ActionListener,

* java.util.Comparator,

* java.util.concurrent.Callable

* java.util.function包下的接口，如Consumer、Predicate、Supplier等

## Lambda表达式的格式

一般来说Lambda的表达式是这样的格式：

parameter -> expression body

查看下面的代码：

~~~java
    public static void main(String[] args) {
        Runnable noArguments = () -> System.out.println("Hello World");
        ActionListener oneArgument = event -> System.out.println("button clicked");
        Runnable multiStatement = () -> {
            System.out.print("Hello");
            System.out.println(" World");
        };
        BinaryOperator<Long> add = (x, y) -> x + y;
        BinaryOperator<Long> addExplicit = (Long x, Long y) -> x + y;
    }
~~~

上面是我们经常在Lambda中使用的几种格式。

* 不包含参数的格式
  
  Runnable noArguments = () -> System.out.println("Hello World");

* 只包含一个参数，并可以省略括号

  ActionListener oneArgument = event -> System.out.println("button clicked");

* Lambda的主体是一段代码块

  Runnable multiStatement = () -> {
            System.out.print("Hello");
            System.out.println(" World");
        };

* 多个参数

  BinaryOperator<Long> add = (x, y) -> x + y;

* 显式指定参数的类型

  BinaryOperator<Long> addExplicit = (Long x, Long y) -> x + y;
  
所有Lambda 表达式中的参数类型都是由编译器推断得出的。如果编译器无法推断你的参数类型，则需要手动指定。

## 方法引用

在第一个例子中我们讲到了如下的Lambda表达式：
~~~java
Collections.sort(names, (s1, s2) -> s1.compareTo(s2));
~~~

其中(s1, s2) -> s1.compareTo(s2) 表示的是两个字符串的比较，调用了String类的compareTo方法。为了更简洁的表示业务逻辑，可以使用方法引用来替换Lambda表达式。

~~~java
Collections.sort(names, String::compareTo);
~~~

这样比原来的代码更短，而且更加简洁。

有三种方法可以被引用：

* 静态方法

~~~java
filter(users, u -> UserUtil.convertUser(u) );
~~~

调用外部类的静态方法，可以被转换成为：

~~~java
filter(users, UserUtil::convertUser);
~~~


* 实例方法

~~~java
filter(users, u -> u.convertUser() );
~~~

调用容器中类的实例方法，可以被转换成为：

~~~java
filter(users, User::convertUser);
~~~


* 使用new的构造函数方法如：(TreeSet::new)

~~~java
List list = getList(()->new ArrayList());
~~~

可以被转换成为：

~~~java
List list = getList(ArrayList::new);
~~~

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)













