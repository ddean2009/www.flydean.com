---
slug: /java-serialization
---

# 7. java对象序列化的秘密

# 简介

你知道序列化可以使用代理吗？你知道序列化的安全性吗？每个java程序员都听说过序列化，要存储对象需要序列化，要在网络上传输对象要序列化，看起来很简单的序列化其实里面还隐藏着很多小秘密，今天本文将会为大家一一揭秘。

# 什么是序列化

序列化就是将java对象按照一定的顺序组织起来，用于在网络上传输或者写入存储中。而反序列化就是从网络中或者存储中读取存储的对象，将其转换成为真正的java对象。

所以序列化的目的就是为了传输对象，对于一些复杂的对象，我们可以使用第三方的优秀框架，比如Thrift，Protocol Buffer等，使用起来非常的方便。

JDK本身也提供了序列化的功能。要让一个对象可序列化，则可以实现java.io.Serializable接口。

java.io.Serializable是从JDK1.1开始就有的接口，它实际上是一个marker interface，因为java.io.Serializable并没有需要实现的接口。继承java.io.Serializable就表明这个class对象是可以被序列化的。

~~~java
@Data
@AllArgsConstructor
public class CustUser implements java.io.Serializable{
    private static final long serialVersionUID = -178469307574906636L;
    private String name;
    private String address;
}
~~~

上面我们定义了一个CustUser可序列化对象。这个对象有两个属性：name和address。

接下看下怎么序列化和反序列化：

~~~java
public void testCusUser() throws IOException, ClassNotFoundException {
        CustUser custUserA=new CustUser("jack","www.flydean.com");
        CustUser custUserB=new CustUser("mark","www.flydean.com");

        try(FileOutputStream fileOutputStream = new FileOutputStream("target/custUser.ser")){
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
            objectOutputStream.writeObject(custUserA);
            objectOutputStream.writeObject(custUserB);
        }
        
        try(FileInputStream fileInputStream = new FileInputStream("target/custUser.ser")){
            ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
            CustUser custUser1 = (CustUser) objectInputStream.readObject();
            CustUser custUser2 = (CustUser) objectInputStream.readObject();
            log.info("{}",custUser1);
            log.info("{}",custUser2);
        }
    }
~~~

上面的例子中，我们实例化了两个CustUser对象，并使用objectOutputStream将对象写入文件中，最后使用ObjectInputStream从文件中读取对象。

上面是最基本的使用。需要注意的是CustUser class中有一个serialVersionUID字段。

serialVersionUID是序列化对象的唯一标记，如果class中定义的serialVersionUID和序列化存储中的serialVersionUID一致，则表明这两个对象是一个对象，我们可以将存储的对象反序列化。

如果我们没有显示的定义serialVersionUID，则JVM会自动根据class中的字段，方法等信息生成。很多时候我在看代码的时候，发现很多人都将serialVersionUID设置为1L，这样做是不对的，因为他们没有理解serialVersionUID的真正含义。

# 重构序列化对象

假如我们有一个序列化的对象正在使用了，但是突然我们发现这个对象好像少了一个字段，要把他加上去，可不可以加呢？加上去之后原序列化过的对象能不能转换成这个新的对象呢？

答案是肯定的，前提是两个版本的serialVersionUID必须一样。新加的字段在反序列化之后是空值。

# 序列化不是加密

有很多同学在使用序列化的过程中可能会这样想，序列化已经将对象变成了二进制文件，是不是说该对象已经被加密了呢？

这其实是序列化的一个误区，序列化并不是加密，因为即使你序列化了，还是能从序列化之后的数据中知道你的类的结构。比如在RMI远程调用的环境中，即使是class中的private字段也是可以从stream流中解析出来的。

如果我们想在序列化的时候对某些字段进行加密操作该怎么办呢？

这时候可以考虑在序列化对象中添加writeObject和readObject方法：

~~~java
private String name;
    private String address;
    private int age;

    private void writeObject(ObjectOutputStream stream)
            throws IOException
    {
        //给age加密
        age = age + 2;
        log.info("age is {}", age);
        stream.defaultWriteObject();
    }

    private void readObject(ObjectInputStream stream)
            throws IOException, ClassNotFoundException
    {
        stream.defaultReadObject();
        log.info("age is {}", age);
        //给age解密
        age = age - 2;
    }
~~~

上面的例子中，我们为CustUser添加了一个age对象,并在writeObject中对age进行了加密（加2），在readObject中对age进行了解密（减2）。

注意，writeObject和readObject都是private void的方法。他们的调用是通过反射来实现的。

# 使用真正的加密

上面的例子， 我们只是对age字段进行了加密，如果我们想对整个对象进行加密有没有什么好的处理办法呢？

JDK为我们提供了javax.crypto.SealedObject 和java.security.SignedObject来作为对序列化对象的封装。从而将整个序列化对象进行了加密。

还是举个例子：

~~~java
public void testCusUserSealed() throws IOException, ClassNotFoundException, NoSuchPaddingException, NoSuchAlgorithmException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException, InvalidKeyException {
        CustUser custUserA=new CustUser("jack","www.flydean.com");
        Cipher enCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        Cipher deCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKey secretKey = new SecretKeySpec("saltkey111111111".getBytes(), "AES");
        IvParameterSpec iv = new IvParameterSpec("vectorKey1111111".getBytes());
        enCipher.init(Cipher.ENCRYPT_MODE, secretKey, iv);
        deCipher.init(Cipher.DECRYPT_MODE,secretKey,iv);
        SealedObject sealedObject= new SealedObject(custUserA, enCipher);

        try(FileOutputStream fileOutputStream = new FileOutputStream("target/custUser.ser")){
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
            objectOutputStream.writeObject(sealedObject);
        }

        try(FileInputStream fileInputStream = new FileInputStream("target/custUser.ser")){
            ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
            SealedObject custUser1 = (SealedObject) objectInputStream.readObject();
            CustUser custUserV2= (CustUser) custUser1.getObject(deCipher);
            log.info("{}",custUserV2);
        }
    }
~~~

上面的例子中，我们构建了一个SealedObject对象和相应的加密解密算法。

SealedObject就像是一个代理，我们写入和读取的都是这个代理的加密对象。从而保证了在数据传输过程中的安全性。

# 使用代理

上面的SealedObject实际上就是一种代理，考虑这样一种情况，如果class中的字段比较多，而这些字段都可以从其中的某一个字段中自动生成，那么我们其实并不需要序列化所有的字段，我们只把那一个字段序列化就可以了，其他的字段可以从该字段衍生得到。

在这个案例中，我们就需要用到序列化对象的代理功能。

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

# Serializable和Externalizable的区别

最后我们讲下Externalizable和Serializable的区别。Externalizable继承自Serializable，它需要实现两个方法：

~~~java
 void writeExternal(ObjectOutput out) throws IOException;
 void readExternal(ObjectInput in) throws IOException, ClassNotFoundException;
~~~

什么时候需要用到writeExternal和readExternal呢？

使用Serializable，Java会自动为类的对象和字段进行对象序列化，可能会占用更多空间。而Externalizable则完全需要我们自己来控制如何写/读，比较麻烦，但是如果考虑性能的话，则可以使用Externalizable。

另外Serializable进行反序列化不需要执行构造函数。而Externalizable需要执行构造函数构造出对象，然后调用readExternal方法来填充对象。所以Externalizable的对象需要一个无参的构造函数。

# 总结

本文详细分析了序列化对象在多种情况下的使用，并讲解了Serializable和Externalizable的区别，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





