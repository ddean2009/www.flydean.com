java中的内部类内部接口详解

# 简介

一般来说，我们创建类和接口的时候都是一个类一个文件，一个接口一个文件，但有时候为了方便或者某些特殊的原因，java并不介意在一个文件中写多个类和多个接口，这就有了我们今天要讲的内部类和内部接口。

# 内部类

先讲内部类，内部类就是在类中定义的类。类中的类可以看做是类的一个属性，一个属性可以是static也可以是非static的。而内部类也可以定义在类的方法中，再加上匿名类，总共有5种内部类。

## 静态内部类

我们在class内部定义一个static的class，如下所示：

~~~java
@Slf4j
public class StaticInnerClass {

    static class Inner {
        void print() {
            log.info("Inner class is: " + this);
        }
    }

    public static void main(String[] args) {
        StaticInnerClass.Inner inner = new StaticInnerClass.Inner();
        inner.print();
    }
}
~~~

因为static变量可以直接根据类名来存取，所以我们使用new StaticInnerClass.Inner()来实例化内部类。

## 非静态内部类

class中定义的类也可以是非静态的，如下所示：

~~~java
@Slf4j
public class InnerClass {

     class Inner {
        void print() {
            log.info("Inner class is: " + this);
        }
    }

    public static void main(String[] args) {
        InnerClass.Inner inner = new InnerClass().new Inner();
        inner.print();
    }
}
~~~

要访问到类的变量，需要实例化外部内，然后再实例化内部类：new InnerClass().new Inner()。

注意这里我们需要使用到两个new。

## 静态方法内部类

我们可以在静态方法中定义一个类，这个类其实就相当于方法中的变量，这个变量当然不能是static的。我们看下面的例子：

~~~java
@Slf4j
public class StaticMethodInnerClass {

    private static String x = "static x";

    public static void print() {
        class MyInner {
            public void printOuter() {
                log.info("x is " + x);
            }
        }
        MyInner i = new MyInner();
        i.printOuter();
    }

    public static void main(String[] args) {
        StaticMethodInnerClass.print();
    }
}
~~~

方法中的类，我们是无法在外部实例化的。

## 非静态方法的内部类

同样的非静态方法也可以定义内部类：

~~~java
@Slf4j
public class MethodInnerClass {

    private  String x = "non static x";

    public  void print() {
        class MyInner {
            public void printOuter() {
                log.info("x is " + x);
            }
        }
        MyInner i = new MyInner();
        i.printOuter();
    }

    public static void main(String[] args) {
        new MethodInnerClass().print();
    }
}
~~~

注意，这里需要先实例化外部类才可以继续调用。

## 匿名类

最后一个，匿名类，直接在需要的时候实例化的类。匿名类我们遇到了很多次了，比如在构建SortedSet的时候，可以传入自定义的Comparator，我们可以用匿名类来实现，也可以直接使用lambda表达式。

~~~java
public class AnonymousClass {

    public static void main(String[] args) {
        SortedSet sortedSet1 = new ConcurrentSkipListSet(new Comparator(){
            @Override
            public int compare(Object o1, Object o2) {
                return 0;
            }
        });

        SortedSet sortedSet2 = new ConcurrentSkipListSet((o1, o2) -> 0);
    }
}
~~~

# 内部接口

Inner Interface是指在接口中定义的接口。最常见的就是Map中的Entry了：

~~~java
public interface Map<K, V> {
    interface Entry<K, V> {
        K getKey();
    }
~~~

这里的内部接口一定是static的，因为接口是不能实例化的，所以为了访问到接口中的接口，必须定义为static。如果不指定，则默认就是static。

我们看一个该内部接口的实现：

~~~java
public class MapImpl implements Map.Entry{
    @Override
    public Object getKey() {
        return 0;
    }

    @Override
    public Object getValue() {
        return null;
    }

    @Override
    public Object setValue(Object value) {
        return null;
    }
}
~~~

# 总结

本文讲解了5个内部类的实现和一个内部接口的应用。大家只要把内部的类或者接口看成一个变量，就可以很好的理解上面的内容了。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)


