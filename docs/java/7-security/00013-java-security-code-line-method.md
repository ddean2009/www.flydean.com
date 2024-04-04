---
slug: /java-security-code-line-method
---

# 13. java安全编码指南之:方法编写指南

# 简介

java程序的逻辑是由一个个的方法组成的，而在编写方法的过程中，我们也需要遵守一定的安全规则，比如方法的参数进行校验，不要在assert中添加业务逻辑，不要使用废弃或者过期的方法，做安全检查的方法一定要设置为private等。

今天我们再来深入的探讨一下，java方法的编写过程中还有哪些要注意的地方。

# 不要在构造函数中调用可以被重写的方法

一般来说在构造函数中只能调用static，final或者private的方法。为什么呢？

如果父类在执行构造函数的时候调用了一个可以被重写的方法，那么在该方法中可能会使用到未初始化的数据，从而导致运行时异常或者意外结束。

另外，还可能到方法获取到未初始化完毕的实例，从而导致数据不一致性。

举个例子，我们定义了一个Person的父类：

~~~java
public class Person {

    public void printValue(){
        System.out.println("this is person!");
    }

    public Person(){
        printValue();
    }
}
~~~

然后定义了一个Boy的子类，但是在Boy子类中，重新了父类的printValue方法。

~~~java
public class Boy extends Person{

    public void printValue(){
        System.out.println("this is Boy!");
    }

    public Boy(){
        super();
    }

    public static void main(String[] args) {
        Person persion= new Person();
        Boy boy= new Boy();
    }
}
~~~

输出结果：

~~~java
this is person!
this is Boy!
~~~

可以看到Boy调用了自己重写过的printValue方法。

> 注意，这里并不是说会产生语法错误，而是这样会导致业务逻辑看起来非常混乱。

怎么解决呢？简单办法就是将Person中的printValue置位final即可。

# 不要在clone()方法中调用可重写的方法

同样的，我们在定义clone方法的时候也不要调用可重写的方法，否则也会产生意想不到的变化。

还是上面的例子，这次我们添加了clone方法到Person类：

~~~java
    public Object clone() throws CloneNotSupportedException {
        Person person= (Person)super.clone();
        person.printValue();
        return person;
    }
~~~

接下来我们添加clone方法到Boy类：

~~~java
    public Object clone() throws CloneNotSupportedException {
        Boy clone = (Boy) super.clone();
        clone.printValue();
        return clone;
    }
~~~

因为在clone方法中调用了可重写的方法，从而让系统逻辑变得混乱。不推荐这样使用。

# 重写equals()方法

考虑一下父类和子类的情况，如果在父类中我们定义了一个equals方法，这个方法是根据父类中的字段来进行比较判断，最终决定两个对象是否相等。

如果子类添加了一些新的字段，如果不重写equals方法，而是使用父类的equals方法，那么就会遗漏子类中新添加的字段，最终导致equals返回意想不到的结果。

所以一般来说，子类需要重写equals方法。

如果重新equals方法，需要满足下面几个特性：

1. reflexive反射性

对于一个Object a来说，a.equals(a)必须成立。

2. symmetric对称性

对于一个Object a和Object b来说，如果a.equals(b)==true，那么b.equals(a)==true一定成立。

3. transitive传递性

对于Object a,b,c来说，如果a.equals(b)==true,b.equals(c)==true,那么a.equals(c)==true一定成立。

4. consistent一致性

对于Object a，b来说，如果a和b没有发生任何变化，那么a.equals(b)的结果也不能变。

5. 对于非空的引用a，a.equals(null) 一定要等于false

具体代码的例子，这里就不写了，大家可以自行练习一下。

# hashCode和equals

hashCode是Object中定义的一个native方法：

~~~java
    @HotSpotIntrinsicCandidate
    public native int hashCode();
~~~

根据Oracle的建议，如果两个对象的equals方法返回的结果是true，那么这两个对象的hashCode一定要返回同样的int值。

为什么呢？

我们看下下面的一个例子：

~~~java
public class Girl {

    private final int age;

    public Girl(int age) {
        this.age = age;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof Girl)) {
            return false;
        }
        Girl cc = (Girl)o;
        return cc.age == age;
    }

    public static void main(String[] args) {

        HashMap<Girl,Integer> hashMap= new HashMap<>();
        hashMap.put(new Girl(20), 20);
        System.out.println(hashMap.get(new Girl(20)));
    }
}
~~~

上面的Girl中，我们定义了equals方法，但是并没有重写hashCode，最后返回的结果是null。

因为我们new了两次Girl这个对象，最后导致native方法中两个不同对象的hashCode是不一样的。

我们可以给Girl类中添加一个hashCode方法：

~~~java
    public int hashCode() {
        return age;
    }
~~~

这样就可以返回正确的值。

# compareTo方法的实现

我们在实现可比较类的时候，通常需要实现Comparable接口。Comparable接口定义了一个compareTo方法，用来进行两个对象的比较。

我们在实现compareTo方法的时候，要注意保证比较的通用规则，也就是说，如果x.compareTo(y) > 0 && y.compareTo(z) > 0 那么表示 x.compareTo(z) > 0.

所以，我们不能使用compareTo来实现特殊的逻辑。

最近看了一个日本的电影，叫做dubo默示录，里面有一集就是石头，剪刀，布来判断输赢。

当然，石头，剪刀，布不满足我们的通用compareTo方法，所以不能将逻辑定义在compareTo方法中。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！



