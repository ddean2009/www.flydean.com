---
slug: /java-security-code-line-object-copy
---

# 9. java安全编码指南之:敏感类的拷贝

# 简介

一般来说class中如果包含了私有的或者敏感的数据的时候是不允许被拷贝的。

如果一个class不想被拷贝，我们是不是不提供拷贝的方法就能保证class的安全了呢？

一起来看看吧。

# 一个简单的SensitiveObject

假如我们有下面的一个SensitiveObject，它的作用就是存储一个password，并且提供了一个修改password的方法：

~~~java
public class SensitiveObject1 {
    private char[] password;

    SensitiveObject1(String iniValue){
        this.password = iniValue.toCharArray();
    }

    public final String get() {
        return String.valueOf(password);
    }

    public final void doPasswordChange(){
        for(int i = 0; i < password.length; i++) {
            password[i]= '*' ;}
    }

    public final void printValue(){
        System.out.println(String.valueOf(password));
    }
}
~~~

看上去没什么问题，如果我们希望密码被返回之后就不能够被修改，应该怎么做呢？

# SensitiveObject的限制

为了实现上面的功能，我们可以考虑引入一个是否返回的变量，如果返回过了，就不允许进行密码修改了。

那么我们可以将上面的代码修改成这样：

~~~java
public class SensitiveObject2 {
    private char[] password;
    private boolean returned=false;

    SensitiveObject2(String iniValue){
        this.password = iniValue.toCharArray();
    }

    public final String get()
    {
        if(!returned) {
            returned=true;
            return String.valueOf(password);
        }else {
        throw new IllegalStateException("已经返回过了，无法重复返回");
        }
    }

    public final void doPasswordChange(){
        if(!returned) {
            for (int i = 0; i < password.length; i++) {
                password[i] = '*';
            }
        }
    }
}
~~~

通过加入了returned标签，我们可以控doPasswordChange方法，只能在未返回之前进行密码修改。

我们看下调用代码：

~~~java
        SensitiveObject2 sensitiveObject2= new SensitiveObject2("www.flydean.com");
        sensitiveObject2.doPasswordEncrypt();
        System.out.println(sensitiveObject2.get());
~~~

# 对SensitiveObject的攻击

怎么对上述代码进行攻击呢？

如果我们想在密码返回之后仍然对密码进行修改，怎么做到呢？

如果SensitiveObject2可以拷贝，我们是不是就能够保存一份char[]和boolean的副本了呢？

因为char[]属于引用拷贝，所以在拷贝的副本里面对char[]进行修改完全可以影响到原SensitiveObject2的内容。

但是，虽然clone方法是定义在Object中的，如果子类没有实现Cloneable接口的话，将会抛出CloneNotSupportedException异常。

考虑到SensitiveObject2不是一个final的类，我们可以通过继承SensitiveObject2来实现目的：

~~~java
public class MaliciousSubSensitiveObject extends SensitiveObject2 implements Cloneable{
    MaliciousSubSensitiveObject(String iniValue) {
        super(iniValue);
    }

    public MaliciousSubSensitiveObject clone(){
        MaliciousSubSensitiveObject s = null;
        try {
            s = (MaliciousSubSensitiveObject)super.clone();
        } catch(Exception e) {
            System.out.println("not cloneable");
        }
        return s;
    }

    public static void main(String[] args) {
        MaliciousSubSensitiveObject object1 = new MaliciousSubSensitiveObject("www.flydean.com");
        MaliciousSubSensitiveObject object2 = object1.clone();
        String password1= object1.get();
        System.out.println(password1);
        object2.doPasswordChange();
        object1.printValue();
    }
}
~~~

可以看到，虽然object1先返回了password，但是这个password被clone过的object2进行了修改，最终导致object1中的password值发生了变化。

# 解决办法

怎么解决呢？

一个简单的方法就是将SensitiveObject class定义为final，这样就不能继承，从而避免了上诉问题。

本文的例子：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！





