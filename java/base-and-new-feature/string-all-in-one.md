一文弄懂String的所有小秘密

# 简介

String是java中非常常用的一个对象类型。可以说java中使用最多的就是String了。那么String到底有哪些秘密呢？接下来本文将会一一讲解。

# String是不可变的

String是不可变的，官方的说法叫做immutable或者constant。

String的底层其实是一个Char的数组。

~~~java
private final char value[];
~~~

所有的String字面量比如"abc"都是String的实现。

考虑下面的赋值操作：

~~~java
String a="abc";
String b="abc";
~~~

对于java虚拟机来说，"abc"是字符串字面量，在JDK 7之后，这个字符串字面量是存储在java heap中的。而在JDK 7之前是有个专门的方法区来存储的。

有了“abc”，然后我们将“abc” 赋值给a和b。

![](https://img-blog.csdnimg.cn/20200424224127726.png)

可以看到这里a和b只是java heap中字符串的引用。

再看看下面的代码发生了什么：

~~~java
String c= new String("abc");
~~~

首先在java heap中创建了“abc”，然后调用String的构造函数：

~~~java
    public String(String original) {
        this.value = original.value;
        this.hash = original.hash;
    }
~~~

在构造函数中，String将底层的字符串数组赋值给value。

因为Array的赋值只是引用的赋值，所以上述new操作并不会产生新的字符串字面值。

但是new操作新创建了一个String对象，并将其赋值给了c。

String的不可变性还在于，String的所有操作都会产生新的字符串字面量。原来的字符串是永远不会变化的。

字符串不变的好处就在于，它是线程安全的。任何线程都可以很安全的读取字符串。

# 传值还是传引用

一直以来，java开发者都有这样的问题，java到底是传值还是传引用呢？

我想，这个问题可以从两方面来考虑。

首先对于基础类型int，long，double来说，对他们的赋值是值的拷贝。而对于对象来说，赋值操作是引用。

另一方面，在方法调用的参数中，全部都是传值操作。

~~~java
public static void main(String[] args) {
	String x = new String("ab");
	change(x);
	System.out.println(x);
}
 
public static void change(String x) {
	x = "cd";
}
~~~

我们看上面的例子，上面的例子输出ab。因为x是对“ab”的引用，但是在change方法中，因为是传值调用，所以会创建一个新的x，其值是“ab”的引用地址。当x被重新赋值之后，改变的只是拷贝之后的x值。而本身的x值是不变的。

# substring() 导致的内存泄露

第一次看到这个话题，大家可能会很惊讶，substring方法居然会导致内存泄露？这个话题要从JDK 6开始讲起。

我们先看下JDK 6的实现：

~~~java
String(int offset, int count, char value[]) {
	this.value = value;
	this.offset = offset;
	this.count = count;
}
 
public String substring(int beginIndex, int endIndex) {
	//check boundary
	return  new String(offset + beginIndex, endIndex - beginIndex, value);
}
~~~

可以看到，JDK 6的substring方法底层还是引用的原始的字符串数组。唯一的区别就是offset和count不同。

我们考虑一下下面的应用：

~~~java
String string = "abcdef";
String subString = string.substring(1, 3);
string = null;
~~~

虽然最后我们将String赋值为null，但是subString仍然引用了最初的string。将不会被垃圾回收。

在JDK 7之后，String的实现发送了变化：

~~~java
public String(char value[], int offset, int count) {
	//check boundary
	this.value = Arrays.copyOfRange(value, offset, offset + count);
}
 
public String substring(int beginIndex, int endIndex) {
	//check boundary
	int subLen = endIndex - beginIndex;
	return new String(value, beginIndex, subLen);
}
~~~

Arrays.copyOfRange将会拷贝一份新的数组，而不是使用之前的数组。从而不会发生上面的内存泄露的问题。

# 总结

虽然String是我们经常使用的对象，但是里面的原理还是值得我们了解的。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)











