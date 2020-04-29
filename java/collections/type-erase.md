java中的类型擦除(type erasure)

# 简介

泛型是java从JDK 5开始引入的新特性，泛型的引入可以让我们在代码编译的时候就强制检查传入的类型，从而提升了程序的健壮度。

泛型可以用在类和接口上，在集合类中非常常见。本文将会讲解泛型导致的类型擦除。

# 举个例子

我们先举一个最简单的例子：

~~~java
@Slf4j
public class TypeErase {

    public static void main(String[] args) {
        ArrayList<String> stringArrayList = new ArrayList<String>();
        stringArrayList.add("a");
        stringArrayList.add("b");
        action(stringArrayList);
    }

    public static void action(ArrayList<Object> al){
        for(Object o: al)
            log.info("{}",o);
    }
}
~~~

上面的例子中，我们定义了一个ArrayList，其中指定的类型是String。

然后调用了action方法，action方法需要传入一个ArrayList，但是这个list的类型是Object。

乍看之下好像没有问题，因为String是Object的子类，是可以进行转换的。

但是实际上代码编译出错：

~~~java
Error:(18, 16) java: 不兼容的类型: java.util.ArrayList<java.lang.String>无法转换为java.util.ArrayList<java.lang.Object>
~~~

# 原因

上面例子的原因就是类型擦除（type erasure)。java中的泛型是在编译时做检测的。而编译后生成的二进制文件中并不保存类型相关的信息。

上面的例子中，编译之后不管是ArrayList&lt;String> 还是ArrayList&lt;Object> 都会变成ArrayList。其中的类型Object/String对JVM是不可见的。

但是在编译的过程中，编译器发现了两者的类型不同，然后抛出了错误。

# 解决办法

要解决上面的问题，我们可以使用下面的办法：

~~~java
    public static void actionTwo(ArrayList<?> al){
        for(Object o: al)
            log.info("{}",o);
    }
~~~

通过使用通配符？，可以匹配任何类型，从而通过编译。

但是要注意这里actionTwo方法中，因为我们不知道传入的类型到底是什么，所以我们不能在actionTwo中添加任何元素。

# 总结

从上面的例子我们可以看出，ArrayList&lt;String>并不是ArrayList&lt;Object>的子类。如果一定要找出父子关系，那么ArrayList&lt;String>是Collection&lt;String>的子类。

但是Object[] objArray是String[] strArr的父类。因为对Array来说，其具体的类型是已知的。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



