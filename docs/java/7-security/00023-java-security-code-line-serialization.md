---
slug: /java-security-code-line-serialization
---

# 23. java安全编码指南之:序列化Serialization

# 简介

序列化是java中一个非常常用又会被人忽视的功能，我们将对象写入文件需要序列化，同时，对象如果想要在网络上传输也需要进行序列化。

序列化的目的就是保证对象可以正确的传输，那么我们在序列化的过程中需要注意些什么问题呢？

一起来看看吧。

# 序列化简介

如果一个对象要想实现序列化，只需要实现Serializable接口即可。

奇怪的是Serializable是一个不需要任何实现的接口。如果我们implements Serializable但是不重写任何方法，那么将会使用JDK自带的序列化格式。

但是如果class发送变化，比如增加了字段，那么默认的序列化格式就满足不了我们的需求了，这时候我们需要考虑使用自己的序列化方式。

如果类中的字段不想被序列化，那么可以使用transient关键字。

同样的，static表示的是类变量，也不需要被序列化。

# 注意serialVersionUID

serialVersionUID 表示的是对象的序列ID，如果我们不指定的话，是JVM自动生成的。在反序列化的过程中，JVM会首先判断serialVersionUID 是否一致，如果不一致，那么JVM会认为这不是同一个对象。

如果我们的实例在后期需要被修改的话，注意一定不要使用默认的serialVersionUID，否则后期class发送变化之后，serialVersionUID也会同样的发生变化，最终导致和之前的序列化版本不兼容。

# writeObject和readObject

如果要自己实现序列化，那么可以重写writeObject和readObject两个方法。

注意，这两个方法是private的，并且是non-static的：

~~~java
private void writeObject(final ObjectOutputStream stream)
    throws IOException {
  stream.defaultWriteObject();
}
 
private void readObject(final ObjectInputStream stream)
    throws IOException, ClassNotFoundException {
  stream.defaultReadObject();
}
~~~

如果不是private和non-static的，那么JVM就不能够发现这两个方法，就不会使用他们来做自定义序列化。

# readResolve和writeReplace

如果class中的字段比较多，而这些字段都可以从其中的某一个字段中自动生成，那么我们其实并不需要序列化所有的字段，我们只把那一个字段序列化就可以了，其他的字段可以从该字段衍生得到。

readResolve和writeReplace就是序列化对象的代理功能。

首先，序列化对象需要实现writeReplace方法，表示替换成真正想要写入的对象：

~~~java
public class CustUserV3 implements java.io.Serializable{

    private String name;
    private String address;

    private Object writeReplace()
            throws java.io.ObjectStreamException
    {
        log.info("writeReplace {}",this);
        return new CustUserV3Proxy(this);
    }
}
~~~

然后在Proxy对象中，需要实现readResolve方法，用于从系列化过的数据中重构序列化对象。如下所示：

~~~java
public class CustUserV3Proxy implements java.io.Serializable{

    private String data;

    public CustUserV3Proxy(CustUserV3 custUserV3){
        data =custUserV3.getName()+ "," + custUserV3.getAddress();
    }

    private Object readResolve()
            throws java.io.ObjectStreamException
    {
        String[] pieces = data.split(",");
        CustUserV3 result = new CustUserV3(pieces[0], pieces[1]);
        log.info("readResolve {}",result);
        return result;
    }
}
~~~

我们看下怎么使用：

~~~java
public void testCusUserV3() throws IOException, ClassNotFoundException {
        CustUserV3 custUserA=new CustUserV3("jack","www.flydean.com");

        try(FileOutputStream fileOutputStream = new FileOutputStream("target/custUser.ser")){
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
            objectOutputStream.writeObject(custUserA);
        }

        try(FileInputStream fileInputStream = new FileInputStream("target/custUser.ser")){
            ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
            CustUserV3 custUser1 = (CustUserV3) objectInputStream.readObject();
            log.info("{}",custUser1);
        }
    }
~~~

注意，我们写入和读出的都是CustUserV3对象。

# 不要序列化内部类

所谓内部类就是未显式或隐式声明为静态的嵌套类，为什么我们不要序列化内部类呢？

* 序列化在非静态上下文中声明的内部类，该内部类包含对封闭类实例的隐式非瞬态引用，从而导致对其关联的外部类实例的序列化。

* Java编译器对内部类的实现在不同的编译器之间可能有所不同。从而导致不同版本的兼容性问题。

* 因为Externalizable的对象需要一个无参的构造函数。但是内部类的构造函数是和外部类的实例相关联的，所以它们无法实现Externalizable。

所以下面的做法是正确的：

~~~java
public class OuterSer implements Serializable {
  private int rank;
  class InnerSer {
    protected String name;
  }
}
~~~

如果你真的想序列化内部类，那么把内部类置为static吧。

# 如果类中有自定义变量，那么不要使用默认的序列化

如果是Serializable的序列化，在反序列化的时候是不会执行构造函数的。所以，如果我们在构造函数或者其他的方法中对类中的变量有一定的约束范围的话，反序列化的过程中也必须要加上这些约束，否则就会导致恶意的字段范围。

我们举几个例子：

~~~java
public class SingletonObject implements Serializable {
    private static final SingletonObject INSTANCE = new SingletonObject ();
    public static SingletonObject getInstance() {
        return INSTANCE;
    }
    private SingletonObject() {
    }

    public static Object deepCopy(Object obj) {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            new ObjectOutputStream(bos).writeObject(obj);
            ByteArrayInputStream bin =
                    new ByteArrayInputStream(bos.toByteArray());
            return new ObjectInputStream(bin).readObject();
        } catch (Exception e) {
            throw new IllegalArgumentException(e);
        }
    }

    public static void main(String[] args) {
        SingletonObject singletonObject= (SingletonObject) deepCopy(SingletonObject.getInstance());
        System.out.println(singletonObject == SingletonObject.getInstance());
    }
}
~~~

上面是一个singleton对象的例子，我们在其中定义了一个deepCopy的方法，通过序列化来对对象进行拷贝，但是拷贝出来的是一个新的对象，尽管我们定义的是singleton对象，最后运行的结果还是false，这就意味着我们的系统生成了一个不一样的对象。

怎么解决这个问题呢？

加上一个readResolve方法就可以了：

~~~java
    protected final Object readResolve() throws NotSerializableException {
        return INSTANCE;
    }
~~~

在这个readResolve方法中，我们返回了INSTANCE，以确保其是同一个对象。

还有一种情况是类中字段是有范围的。

~~~java
public class FieldRangeObject implements Serializable {

    private int age;

    public FieldRangeObject(int age){
        if(age < 0 || age > 100){
            throw new IllegalArgumentException("age范围不对");
        }
        this.age=age;
    }
}
~~~

上面的类在反序列化中会有什么问题呢？

因为上面的类在反序列化的过程中，并没有对age字段进行校验，所以，恶意代码可能会生成超出范围的age数据，当反序列化之后就溢出了。

怎么处理呢？

很简单，我们在readObject方法中进行范围的判断即可：

~~~java
    private  void readObject(java.io.ObjectInputStream s)
            throws IOException, ClassNotFoundException {
        ObjectInputStream.GetField fields = s.readFields();
        int age = fields.get("age", 0);
        if (age > 100 || age < 0) {
            throw new InvalidObjectException("age范围不对!");
        }
        this.age = age;
    }
~~~

# 不要在readObject中调用可重写的方法

为什么呢？readObject实际上是反序列化的构造函数，在readObject方法没有结束之前，对象是没有构建完成，或者说是部分构建完成。如果readObject调用了可重写的方法，那么恶意代码就可以在方法的重写中获取到还未完全实例化的对象，可能造成问题。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！





