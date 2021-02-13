深入理解java的泛型

# 简介

泛型是JDK 5引入的概念，泛型的引入主要是为了保证java中类型的安全性，有点像C++中的模板。

但是Java为了保证向下兼容性，它的泛型全部都是在编译期间实现的。编译器执行类型检查和类型推断，然后生成普通的非泛型的字节码。这种就叫做类型擦除。编译器在编译的过程中执行类型检查来保证类型安全，但是在随后的字节码生成之前将其擦除。

这样就会带来让人困惑的结果。本文将会详细讲解泛型在java中的使用，以避免进入误区。

# 泛型和协变

有关协变和逆变的详细说明可以参考:

[深入理解协变和逆变](http://www.flydean.com/scala-covariance-contravariant/)

这里我再总结一下，协变和逆变只有在类型声明中的类型参数里才有意义，对参数化的方法没有意义，因为该标记影响的是子类继承行为，而方法没有子类。

当然java中没有显示的表示参数类型是协变还是逆变。

协变意思是如果有两个类 A&lt;T> 和 A&lt;C>, 其中C是T的子类，那么我们可以用A&lt;C>来替代A&lt;T>。

逆变就是相反的关系。

Java中数组就是协变的，比如Integer是Number的子类，那么Integer[]也是 Number[]的子类，我们可以在需要 Number[] 的时候传入 Integer[]。

接下来我们考虑泛型的情况，List&lt;Number> 是不是 List&lt;Integer>的父类呢？很遗憾，并不是。

我们得出这样一个结论：泛型不是协变的。

为什么呢？我们举个例子：

~~~java
List<Integer> integerList = new ArrayList<>();
        List<Number> numberList = integerList; // compile error
        numberList.add(new Float(1.111));
~~~

假如integerList可以赋值给numberList，那么numberList可以添加任意Number类型，比如Float，这样就违背了泛型的初衷，向Integer list中添加了Float。所以上面的操作是不被允许的。

刚刚我们讲到Array是协变的，如果在Array中带入泛型，则会发生编译错误。比如new List&lt;String>[10]是不合法的，但是 new List&lt;?>[10]是可以的。因为在泛型中?表示的是未知类型。

~~~java

List<?>[] list1 = new List<?>[10];

List<String>[] list2 = new List<String>[10]; //compile error
~~~

# 泛型在使用中会遇到的问题

因为类型擦除的原因，List&lt;String>和List&lt;Integer>在运行是都会被当做成为List。所以我们在使用泛型时候的一些操作会遇到问题。

假如我们有一个泛型的类，类中有一个方法，方法的参数是泛型，我们想在这个方法中对泛型参数进行一个拷贝操作。

~~~java
public class CustUser<T> {

    public void useT(T param){
        T copy = new T(param);  // compile error
    }
}
~~~

上面操作会编译失败，因为我们并不知道T是什么，也不知道T到底有没有相应的构造函数。

直接clone T是没有办法了，如果我们想copy一个Set，set中的类型是未定义的该怎么做呢？

~~~java
    public void useTSet(Set<?> set){
        Set<?> copy1 = new HashSet<?>(set);  // compile error
        Set<?> copy2 = new HashSet<>(set);
        Set<?> copy3 = new HashSet<Object>(set);  
    }
~~~

可以看到?是不能直接用于实例化的。但是我们可以用下面的两种方式代替。

再看看Array的使用：

~~~java
    public void useArray(){
         T[] typeArray1= new T[20];  //compile error
        T[] typeArray2=(T[]) new Object[20];
        T[] typeArray3 = (T[]) Array.newInstance(String.class, 20);
    }
~~~
同样的，T是不能直接用于实例化的，但是我们可以用下面两种方式代替。

# 类型擦除要注意的事项

因为类型擦除的原因，我们在接口实现中，实现同一个接口的两个不同类型是无意义的：

~~~java
public class someClass implements Comparable<Number>, Comparable<String> { ... } // no
~~~

因为在编译过后的字节码看来，两个Comparable是一样的。

同样的，我们使用T来做类型强制转换也是没有意义的：

~~~java
public <T> T cast(T t, Object o) { return (T) o; }
~~~

因为编译器并不知道这个强制转换是对还是错。

# 总结

本文讨论了泛型在java中使用中可能会存在的问题，希望大家能够喜欢。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！













