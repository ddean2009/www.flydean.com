java安全编码指南之:基础篇

# 简介

作为一个程序员，只是写出好用的代码是不够的，我们还需要考虑到程序的安全性。在这个不能跟陌生人说话世界，扶老奶奶过马路都是一件很困难的事情。那么对于程序员来说，尤其是对于开发那种对外可以公开访问的网站的程序员，要承受的压力会大很多。

任何人都可以访问我们的系统，也就意味着如果我们的系统不够健壮，或者有些漏洞，恶意攻击者就会破门而入，将我们辛辛苦苦写的程序蹂躏的体无完肤。

所以，安全很重要，今天本文将会探讨一下java中的安全编码指南。

# java平台本身的安全性

作为一个强类型语言，java平台本身已经尽可能的考虑到了安全性的，为我们屏蔽了大多数安全性的细节。

比如可以为不同级别权限的代码提供受限的执行环境。 java程序是类型安全的，并且在运行时提供了自动内存管理和数组边界检查，Java会尽可能的及早发现程序中的问题，从而使Java程序具有很高的抵抗堆栈破坏的能力。

尽管Java安全体系结构在许多情况下可以帮助保护用户和系统免受恶意代码或行为不当的攻击，但它无法防御可信任代码中发生的错误。也就说如果是用户本身代码的漏洞，java安全体系是无法进行判断的。

这些错误可能会绕过java本身的安全体系结构。在严重的情况下，可能会执行本地程序或禁用Java安全性。从而会被用来从计算机和Intranet窃取机密数据，滥用系统资源，阻止计算机的有用操作，协助进一步的攻击以及许多其他恶意活动。

所以，最大的安全在程序员本身，不管外部机制如何强大，如果核心的程序员出了问题，那么一切都将归于虚无。

接下来，我们看下java程序员应该遵循一些什么行为准则，来保证程序的安全性呢？

# 安全第一,不要写聪明的代码

我们可能会在很多教科书甚至是JDK的源代码中，看到很多让人惊叹的代码写法，如果你真的真的明白你在做什么，那么这样写没什么问题。但是很多情况下我们并不是很了解这样写的原理，甚至不知道这样写会出现什么样的问题。

并且现代系统是一个多人协作的过程，如果你写了这样的聪明代码，很有可能别人看不懂，最后导致未知的系统问题。

给大家举个例子：

~~~shell
:(){:|:&};:
~~~

上面是一个shell下面的fork炸弹，如果你在shell下面运行上面的代码，几秒之后系统就会宕机或者运行出错。

怎么分析上面的代码呢？我们把代码展开：

~~~shell
:()
{
    :|:&
};
:
~~~

还是不明白？ 我们把:替换成函数名：

~~~shell
fork()
{
    fork|fork&
};
fork
~~~

上面的代码就是无限的fork进程，通过几何级数的增长，最后导致程序崩溃。

java设计的很多大神把他们跳跃般的思想写到了JDK源代码里面，大神们的思想经过了千锤百炼，并且JDK是Java的核心，里面的代码再优化也不为过。

但是现在硬件技术的发展，代码级别的优化可能作用已经比较少了。为了避免出现不可知的安全问题，还是建议大家编写一眼就能看出逻辑的代码。虽然可能不是那么快，但是安全性有了保证。除非你真的知道你在做什么。

# 在代码设计之初就考虑安全性

安全性应该是一个在编写代码过程中非常重要的标准，我们在设计代码的时候就应该考虑到相关的安全性问题，否则后面重构起来会非常费事。

举个例子：

~~~java
        public final class SensitiveClass {

            private final Behavior behavior;

            // Hide constructor.
            private SensitiveClass(Behavior behavior) {
                this.behavior = behavior;
            }

            // Guarded construction.
            public static SensitiveClass newSensitiveClass(Behavior behavior) {
                // ... validate any arguments ...

                // ... perform security checks ...

                return new SensitiveClass(behavior);
            }
        }
~~~

上面的例子中我们使用了final关键字来防止我们的某些关键类被继承扩展。因为没有扩展性，所以安全性判断会更加容易。

同时，java提供了SecurityManager和一系列的Permission类，通过合理的配置，我们可以有效的控制java程序的访问权限。

# 避免重复的代码

和重复代码相关的一个关键词就是重构。为什么会出现重复代码呢？

很简单，最开始我们在实现一个功能的时候写了一段代码逻辑。结果后面还有一个方法要使用这段代码逻辑。然后我们为了图方便，就把代码逻辑拷贝过去了。

看起来问题好像解决了。但是一旦这段业务逻辑要修改，那可就是非常麻烦的一件事情。因为我们需要找到程序中所有出现这段代码的地方，然后一个一个的修改。

为什么不把这段代码提取出来，做成一个单独的方法来供其他的方法调用呢？这样即使后面需要修改，也只用修改一处地方即可。

在现实的工作中，我们经常会遇到这种问题，尤其是那种年久失修的代码，大家都不敢修改，因为牵一发而动全身。往往是修改了这边忘记了那边，最后导致bug重重。

# 限制权限

JDK专门提供了一个SecurityManager类，来显示的对安全性进行控制，我们看下SecurityManager是怎么使用的：

~~~java
SecurityManager security = System.getSecurityManager();
    if (security != null) {
      security.checkXXX(argument, ...);
   }
~~~

SecurityManager提供了一系列的check方法，来对权限进行控制。

权限分为以下类别：文件、套接字、网络、安全性、运行时、属性、AWT、反射和可序列化。管理各种权限类别的类是 ：
　　java.io.FilePermission、
　　java.net.SocketPermission、
　　java.net.NetPermission、
　　java.security.SecurityPermission、
　　java.lang.RuntimePermission、
　　java.util.PropertyPermission、
　　java.awt.AWTPermission、
　　java.lang.reflect.ReflectPermission
　　java.io.SerializablePermission

JDK本身已经使用了很多这些权限控制的代码。比如说我们最常用的File：

~~~java
    public boolean canRead() {
        SecurityManager security = System.getSecurityManager();
        if (security != null) {
            security.checkRead(path);
        }
        if (isInvalid()) {
            return false;
        }
        return fs.checkAccess(this, FileSystem.ACCESS_READ);
    }
~~~

上面是File类的canRead方法，我们会首先去判断是否配置了SecurityManager，如果配置了，则去检查是否可以read。

如果我们在写代码中，遇到文件、套接字、网络、安全性、运行时、属性、AWT、反射和可序列化相关的操作时，也可以考虑使用SecurityManager来进行细粒度的权限控制。

# 构建可信边界

什么是可信边界呢？边界主要起拦截作用，边界里边的我们可以信任，边界外边的我们就不能信任了。

对于不能信任的外边界请求，我们需要进行足够的安全访问控制。

比如说web客户端来访问web服务器。web客户端是在全球各地的，各种环境都有，并且是不可控的，所以web客户端访问web服务器端的请求需要进行额外的安全控制。

而web服务器访问业务服务器又是不同的，因为web服务器是我们自己控制的，所以安全程度相对较高，我们需要针对不同的可信边界做不同的控制。


# 封装

封装（Encapsulation）是指一种将抽象性函式接口的实现细节部份包装、隐藏起来的方法。

封装可以被认为是一个保护屏障，防止该类的代码和数据被外部类定义的代码随机访问。通过对接口进行访问控制，可以严格的包含类中的数据和方法。

并且封装可以减少耦合，并且隐藏实现细节。

# 写文档

最后一项也是非常非常重要的一项就是写文档。为什么接别人的老项目那么痛苦，为什么读源代码那么困难。根本的原因就是没有写文档。

如果不写文档，可能你自己写的代码过一段时间之后也不知道为什么当时这样写了。

所以，写文档很重要。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)










