JDK14的新特性:instanceof模式匹配

JDK14在2020年的3月正式发布了。可惜的是正式特性只包含了最新的Switch表达式，而Records,patterns,text blocks仍然是预览特性。

本文要讲的就是JDK14的一个预览特性instanceof的pattern matching。 也就是说在instanceof中可以使用模式匹配了。

> 更多内容请访问[www.flydean.com](www.flydean.com)

怎么理解呢？

我们先举个历史版本中使用instanceof的例子。

假如我们是动物园的管理员，动物园里面有Girraffe和Hippo两种动物。

~~~java
@Data
public class Girraffe {
    private String name;
}
~~~

~~~java
@Data
public class Hippo {
    private String name;
}
~~~

为了简单起见，上面两种动物我们都之定义一个name属性。

接下来我们要对两种动物进行管理，传入一个动物，判断一下这个动物是不是上面两种动物之一，按照传统的办法，我们应该这样做：

~~~java
    public void testZooOld(Object animal){
        if(animal instanceof Girraffe){
            Girraffe girraffe = (Girraffe) animal;
            log.info("girraffe name is {}",girraffe.getName());
        }else if(animal instanceof Hippo){
            Hippo hippo = (Hippo) animal;
            log.info("hippo name is {}",hippo.getName());
        }
        throw new IllegalArgumentException("对不起，该动物不是地球上的生物！");
    }
~~~

上面的代码中， 如果instanceof确认成功，我们还需要将对象进行转换，才能调用相应对象中的方法。

有了JDK 14，一切都变得容易了，我们看下最新的JDK 14的模式匹配怎么做：

~~~java
    public void testZooNew(Object animal){
        if(animal instanceof Girraffe girraffe){
            log.info("name is {}",girraffe.getName());
        }else if(animal instanceof Hippo hippo){
            log.info("name is {}",hippo.getName());
        }
        throw new IllegalArgumentException("对不起，该动物不是地球上的生物！");
    }
~~~

注意instanceof的用法，通过instanceof的模式匹配，就不需要二次转换了。直接使用就可以了。并且模式匹配的对象还被限定了作用域范围，会更加安全。

> 注意，如果你使用的最新版的IntelliJ IDEA 2020.1版本的话，语言编译版本一定要选择14(Preview),因为这个功能是preview的。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 
> 更多内容请访问 [www.flydean.com](www.flydean.com)
