java安全编码指南之:异常处理

# 简介

异常是java程序员无法避免的一个话题，我们会有JVM自己的异常也有应用程序的异常，对于不同的异常，我们的处理原则是不是一样的呢？

一起来看看吧。

# 异常简介

先上个图，看一下常见的几个异常类型。

![](https://img-blog.csdnimg.cn/20200728105438266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

所有的异常都来自于Throwable。Throwable有两个子类，Error和Exception。

Error通常表示的是严重错误，这些错误是不建议被catch的。

> 注意这里有一个例外，比如ThreadDeath也是继承自Error，但是它表示的是线程的死亡，虽然不是严重的异常，但是因为应用程序通常不会对这种异常进行catch，所以也归类到Error中。

Exception表示的是应用程序希望catch住的异常。

在Exception中有一个很特别的异常叫做RuntimeException。RuntimeException叫做运行时异常，是不需要被显示catch住的，所以也叫做unchecked Exception。而其他非RuntimeException的Exception则需要显示try catch,所以也叫做checked Exception。

# 不要忽略checked exceptions

我们知道checked exceptions是一定要被捕获的异常，我们在捕获异常之后通常有两种处理方式。

第一种就是按照业务逻辑处理异常，第二种就是本身并不处理异常，但是将异常再次抛出，由上层代码来处理。

如果捕获了，但是不处理，那么就是忽略checked exceptions。

接下来我们来考虑一下java中线程的中断异常。

java中有三个非常相似的方法interrupt，interrupted和isInterrupted。

isInterrupted()只会判断是否被中断，而不会清除中断状态。

interrupted()是一个类方法，调用isInterrupted(true)判断的是当前线程是否被中断。并且会清除中断状态。

前面两个是判断是否中断的方法，而interrupt（）就是真正触发中断的方法。

它的工作要点有下面4点：

1. 如果当前线程实例在调用Object类的wait（），wait（long）或wait（long，int）方法或join（），join（long），join（long，int）方法，或者在该实例中调用了Thread.sleep（long）或Thread.sleep（long，int）方法，并且正在阻塞状态中时，则其中断状态将被清除，并将收到InterruptedException。

2. 如果此线程在InterruptibleChannel上的I / O操作中处于被阻塞状态，则该channel将被关闭，该线程的中断状态将被设置为true，并且该线程将收到java.nio.channels.ClosedByInterruptException异常。

3. 如果此线程在java.nio.channels.Selector中处于被被阻塞状态，则将设置该线程的中断状态为true，并且它将立即从select操作中返回。

4. 如果上面的情况都不成立，则设置中断状态为true。

看下面的例子：

~~~java
    public void wrongInterrupted(){
        try{
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
~~~

上面代码中我们捕获了一个InterruptedException，但是我们仅仅是打印出了异常信息，并没有做任何操作。这样程序的表现和没有发送一异常一样，很明显是有问题的。

根据上面的介绍，我们知道，interrupted()方法会清除中断状态，所以，如果我们自身处理不了异常的情况下，需要重新调用Thread.currentThread().interrupt()重新抛出中断，由上层代码负责处理，如下所示。

~~~java
    public void correctInterrupted(){
        try{
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
~~~

# 不要在异常中暴露敏感信息

遇到异常的时候，通常我们需要进行一定程度的日志输出，从而来定位异常。但是我们在做日志输出的时候，一定要注意不要暴露敏感信息。

下表可以看到异常信息可能会暴露的敏感信息：

![](https://img-blog.csdnimg.cn/20200728150808660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

除了敏感信息之外，我们还要做好日志信息的安全保护。

# 在处理捕获的异常时，需要恢复对象的初始状态

如果我们在处理异常的时候，修改了对象中某些字段的状态，在捕获异常的时候需要怎么处理呢？

~~~java
    private int age=30;

    public void wrongRestore(){
        try{
            age=20;
            throw new IllegalStateException("custom exception!");
        }catch (IllegalStateException e){
            System.out.println("we do nothing");
        }
    }
~~~

上面的例子中，我们将age重置为20，然后抛出了异常。虽然抛出了异常，但是我们并没有重置age，最后导致age最终被修改了。

整个restore的逻辑没有处理完毕，但是我们部分修改了对象的数据，这是很危险的。

实际上，我们需要一个重置：

~~~java
    public void rightRestore(){
        try{
            age=20;
            throw new IllegalStateException("custom exception!");
        }catch (IllegalStateException e){
            System.out.println("we do nothing");
            age=30;
        }
    }
~~~

# 不要手动完成finally block

我们在使用try-finally和try-catch-finally语句时，一定不要在finally block中使用return, break, continue或者throw语句。

为什么呢？

根据Java Language Specification（JLS）的说明，finally block一定会被执行，不管try语句中是否抛出异常。

在try-finally和try-catch-finally语句中，如果try语句中抛出了异常R，然后finally block被执行，这时候有两种情况：

* 如果finally block正常执行，那么try语句被终止的原因是异常R。
* 如果在finally block中抛出了异常S，那么try语句被终止的原因将会变成S。

我们举个例子：

~~~java
public class FinallyUsage {

    public boolean wrongFinally(){
        try{
            throw new IllegalStateException("my exception!");
        }finally {
            System.out.println("Code comes to here!");
            return true;
        }
    }

    public boolean rightFinally(){
        try{
            throw new IllegalStateException("my exception!");
        }finally {
            System.out.println("Code comes to here!");
        }
    }

    public static void main(String[] args) {
        FinallyUsage finallyUsage=new FinallyUsage();
        finallyUsage.wrongFinally();
        finallyUsage.rightFinally();
    }
}
~~~

上面的例子中，我们定义了两个方法，一个方法中我们在finally中直接return,另一方法中，我们让finally正常执行完毕。

最终，我们可以看到wrongFinally将异常隐藏了，而rightFinally保留了try的异常。

同样的，如果我们在finally block中抛出了异常，我们一定要记得对其进行捕获，否则将会隐藏try block中的异常信息。

# 不要捕获NullPointerException和它的父类异常

通常来说NullPointerException表示程序代码有逻辑错误，是需要程序员来进行代码逻辑修改，从而进行修复的。

比如说加上一个null check。

不捕获NullPointerException的原因有三个。

1. 使用null check的开销要远远小于异常捕获的开销。
2. 如果在try block中有多个可能抛出NullPointerException的语句，我们很难定位到具体的错误语句。
3. 最后，如果发生了NullPointerException，程序基本上不可能正常运行或者恢复，所以我们需要提前进行null check的判断。

同样的，程序也不要对NullPointerException的父类RuntimeException, Exception, or Throwable进行捕捉。

# 不要throw RuntimeException, Exception, or Throwable

我们抛出异常主要是为了能够找到准确的处理异常的方法，如果直接抛出RuntimeException, Exception, 或者 Throwable就会导致程序无法准确处理特定的异常。

通常来说我们需要自定义RuntimeException, Exception, 或者 Throwable的子类，通过具体的子类来区分具体的异常类型。

# 不要抛出未声明的checked Exception

一般来说checked Exception是需要显示catch住，或者在调用方法上使用throws做申明的。

但是我们可以通过某些手段来绕过这种限制，从而在使用checked Exception的时候不需要遵守上述规则。

当然这样做是需要避免的。我们看一个例子：

~~~java
    private static Throwable throwable;

    private ThrowException() throws Throwable {
        throw throwable;
    }

    public static synchronized void undeclaredThrow(Throwable throwable) {

        ThrowException.throwable = throwable;
        try {
                ThrowException.class.newInstance();
            } catch (InstantiationException e) {
            } catch (IllegalAccessException e) {
        } finally {
            ThrowException.throwable = null;
        }
    }
~~~

上面的例子中，我们定义了一个ThrowException的private构造函数，这个构造函数会throw一个throwable,这个throwable是从方法传入的。

在undeclaredThrow方法中，我们调用了ThrowException.class.newInstance()实例化一个ThrowException实例，因为需要调用构造函数，所以会抛出传入的throwable。

因为Exception是throwable的子类，如果我们在调用的时候传入一个checked Exception，很明显，我们的代码并没有对其进行捕获：

~~~java
    public static void main(String[] args) {
        ThrowException.undeclaredThrow(
                new Exception("Any checked exception"));
    }
~~~

怎么解决这个问题呢？换个思路，我们可以使用Constructor.newInstance()来替代class.newInstance()。

~~~java
try {
        Constructor constructor =
                    ThrowException.class.getConstructor(new Class<?>[0]);
            constructor.newInstance();
        } catch (InstantiationException e) {
        } catch (InvocationTargetException e) {
            System.out.println("catch exception!");
        } catch (NoSuchMethodException e) {
        } catch (IllegalAccessException e) {
        } finally {
            ThrowException.throwable = null;
        }
~~~

上面的例子，我们使用Constructor的newInstance方法来创建对象的实例。和class.newInstance不同的是，这个方法会抛出InvocationTargetException异常，并且把所有的异常都封装进去。

所以，这次我们获得了一个checked Exception。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


