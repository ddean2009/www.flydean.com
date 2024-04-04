---
slug: /base-shallow-copy-deep-copy
---

# 3. java深入理解浅拷贝和深拷贝

# 简介

拷贝对象是java中经常会遇到的问题。java中存在两种类型，基础类型和引用类型。

java的赋值都是传值的，对于基础类型来说，会拷贝具体的内容，但是对于引用对象来说，存储的这个值只是指向实际对象的地址，拷贝也只会拷贝引用地址。

因为引用对象的存在，所以经常会出现和预期不一样的情况。

本文将会深入的探讨一下在拷贝对象中会出现的浅拷贝和深拷贝的情况。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

# 拷贝接口

java中所有的对象都是继承自java.lang.Object。Object对象中提供了一个clone方法，来供我们对java对象进行拷贝。

~~~java
    protected native Object clone() throws CloneNotSupportedException;
~~~

这个clone方法是native的，所以不需要我们来实现，但是注意clone方法还是protected，这意味着clone方法只能在java.lang包或者其子类可见。

如果我们想要在一个程序中调用某个对象的clone方法则是不可以的。因为clone方法是定义在Object中的，该对象并没有对外可见的clone方法。

JDK的建议是让我们去实现接口Cloneable，实现了这个接口就表示这个对象可以调用Object的clone方法。

注意，即使你实现了Cloneable接口，还是无法在外部程序中调用该对象的clone方法：

~~~java
public interface Cloneable {
}
~~~

因为Cloneable是空的，明没有强制要你去实现clone方法。

这是JDK在设计上的问题，导致clone方法并不像预期那么好用。

首先clone只是对象的拷贝，它只是简单的拷贝对象，而不会去执行对象的构造函数。

其次clone会导致浅拷贝的问题。

# 使用clone导致的浅拷贝

我们举个clone产生的浅拷贝的例子，我们定义一个对象中的对象，然后尝试拷贝：

~~~java
@Data
public class Address implements Cloneable{
    private String name;

    //不是好的方式
    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();

    }
}
~~~

~~~java
@Data
public class CustUser implements Cloneable{
    private String firstName;
    private String lastName;
    private Address address;
    private String[] cars;

    @Override
    public Object clone() throws CloneNotSupportedException{
            return super.clone();
    }
}
~~~

上面的例子中，我们定义了CustUser和Address。

~~~java
 public void testShallowCopy() throws CloneNotSupportedException {
        Address address= new Address();
        address.setName("北京天安门");
        CustUser custUser = new CustUser();
        custUser.setAddress(address);
        custUser.setLastName("李");
        custUser.setFirstName("雷");
        String[] cars = new String[]{"别克","路虎"};
        custUser.setCars(cars);

        CustUser custUserCopy=(CustUser) custUser.clone();
        custUserCopy.setFirstName("梅梅");
        custUserCopy.setLastName("韩");
        custUserCopy.getAddress().setName("北京颐和园");
        custUserCopy.getCars()[0]="奥迪";

        log.info("{}",custUser);
        log.info("{}",custUserCopy);
    }
~~~

浅拷贝我们只调用了CustUser的clone方法。看下输出结果：

~~~java
CustUser(firstName=雷, lastName=李, address=Address(name=北京颐和园), cars=[奥迪, 路虎])

CustUser(firstName=梅梅, lastName=韩, address=Address(name=北京颐和园), cars=[奥迪, 路虎])
~~~

我们可以看到拷贝之后的Address变化会影响到被拷贝的对象。

上面的例子我们还要关注两个点：第一点String是不可变的。不管是拷贝还是赋值，String都是不可变的。

第二点，上面的例子中我们定义了一个数组，可以看到如果只是调用clone的话，数组也是浅拷贝。

# 使用clone的深拷贝

要使用深拷贝，只需要修改CustUser的构造函数就可以了：

~~~java
//不是很好的使用方式
    @Override
    public Object clone() throws CloneNotSupportedException{
        CustUserDeep custUserDeep=(CustUserDeep)super.clone();
        custUserDeep.address=(Address)address.clone();
        custUserDeep.cars=cars.clone();
            return custUserDeep;
    }
~~~

在重写的clone方法中，我们分别调用了CustUser,Address和数组的clone方法来进行拷贝。

再运行一次上面的测试代码：

~~~java
CustUserDeep(firstName=雷, lastName=李, address=Address(name=北京天安门), cars=[别克, 路虎])

CustUserDeep(firstName=梅梅, lastName=韩, address=Address(name=北京颐和园), cars=[奥迪, 路虎])
~~~

可以看到address和cars是不同的，这表示我们的深拷贝是成功的。

# 不要overridden clone

上面的例子我们是通过overridden Object的clone方法来实现的。

但是最佳实践是不要overridden clone。那我们怎么做呢？

使用构造函数来构建新的对象：

~~~java
    //好的方式
    Address(Address address){
        this.name=address.name;
    }
~~~

~~~java
//很好的方式
    CustUserDeep(CustUserDeep custUserDeep){
    this.firstName=custUserDeep.firstName;
    this.lastName=custUserDeep.lastName;
    this.cars=custUserDeep.getCars().clone();
    this.address=new Address(custUserDeep.getAddress());
    }
~~~

据说数组直接用clone来拷贝会更快，也可以使用下面的方式来拷贝数组：

~~~java
this.cars= Arrays.copyOf(custUserDeep.getCars(),custUserDeep.getCars().length);
~~~

# 总结

本文讲解了浅拷贝和深拷贝的应用，并对clone方法做了深入的探讨。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)











