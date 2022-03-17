java高级用法之:调用本地方法的利器JNA 

[toc]

# 简介

JAVA是可以调用本地方法的，官方提供的调用方式叫做JNI，全称叫做java native interface。要想使用JNI，我们需要在JAVA代码中定义native方法，然后通过javah命令创建C语言的头文件，接着使用C或者C++语言来实现这个头文件中的方法，编译源代码，最后将编译后的文件引入到JAVA的classpath中，运行即可。

虽然JAVA官方提供了调用原生方法的方式，但是好像这种方法有点繁琐，使用起来没有那么的方便。

那么有没有更加简洁的调用本地方法的形式吗？答案是肯定的，这就是今天要讲的JNA。

# JNA初探

JNA的全称是Java Native Access,它为我们提供了一种更加简单的方式来访问本地的共享库资源，如果你使用JNA，那么你只需要编写相应的java代码即可，不需要编写JNI或者本地代码,非常的方便。

本质上JNA使用的是一个小的JNI library stub,从而能够动态调用本地方法。

JNA就是一个jar包，目前最新的版本是5.10.0，我们可以像下面这样引用它：

```
<dependency>
            <groupId>net.java.dev.jna</groupId>
            <artifactId>jna</artifactId>
            <version>5.10.0</version>
        </dependency>
```

JNA是一个jar包，它里面除了包含有基本的JAVA class文件之外，还有很多和平台相关的文件，这些平台相关的文件夹下面都是libjnidispatch*的库文件。

<img src="https://img-blog.csdnimg.cn/884d316db24a444fb9e8ea34d608e5a8.png" style="zoom:50%"/>

可以看到不同的平台对应着不同的动态库。

JNA的本质就是将大多数native的方法封装到jar包中的动态库中，并且提供了一系列的机制来自动加载这个动态库。

接下来我们看一个具体使用JNA的例子：

```
public class JNAUsage {

    public interface CLibrary extends Library {
        CLibrary INSTANCE = (CLibrary)
                Native.load((Platform.isWindows() ? "msvcrt" : "c"),
                        CLibrary.class);

        void printf(String format, Object... args);
    }

    public static void main(String[] args) {
        CLibrary.INSTANCE.printf("Hello, World\n");
        for (int i=0;i < args.length;i++) {
            CLibrary.INSTANCE.printf("Argument %d: %s\n", i, args[i]);
        }
    }
}
```

这个例子中，我们想要加载系统的c lib，从而使用c lib中的printf方法。

具体做法就是创建一个CLibrary interface，这个interface继承自Library，然后使用Native.load方法来加载c lib，最后在这个interface中定义要使用的lib中的方法即可。

那么JNA到底是怎么加载native lib的呢？我们一起来看看。

# JNA加载native lib的流程

在讲解JNA加载native lib之前，我们先回顾一下JNI是怎么加载native lib的呢？

在JNI中，我们首先在java代码中定义要调用的native方法，然后使用javah命令，创建C的头文件，然后再使用C或者C++来对这个头文件进行实现。

接下来最重要的一步就是将生成的动态链接库添加到JAVA的classpath中，从而在JAVA调用native方法的时候，能够加载到对应的库文件。

对于上面的JNA的例子来说，直接运行可以得到下面的结果：

```
Hello, World
```

我们可以向程序添加JVM参数：-Djna.debug_load=true,从而让程序能够输出一些调试信息，再次运行结果如下所示：

```
12月 24, 2021 9:16:05 下午 com.sun.jna.Native extractFromResourcePath
信息: Looking in classpath from jdk.internal.loader.ClassLoaders$AppClassLoader@251a69d7 for /com/sun/jna/darwin-aarch64/libjnidispatch.jnilib
12月 24, 2021 9:16:05 下午 com.sun.jna.Native extractFromResourcePath
信息: Found library resource at jar:file:/Users/flydean/.m2/repository/net/java/dev/jna/jna/5.10.0/jna-5.10.0.jar!/com/sun/jna/darwin-aarch64/libjnidispatch.jnilib
12月 24, 2021 9:16:05 下午 com.sun.jna.Native extractFromResourcePath
信息: Extracting library to /Users/flydean/Library/Caches/JNA/temp/jna17752159487359796115.tmp
12月 24, 2021 9:16:05 下午 com.sun.jna.NativeLibrary loadLibrary
信息: Looking for library 'c'
12月 24, 2021 9:16:05 下午 com.sun.jna.NativeLibrary loadLibrary
信息: Adding paths from jna.library.path: null
12月 24, 2021 9:16:05 下午 com.sun.jna.NativeLibrary loadLibrary
信息: Trying libc.dylib
12月 24, 2021 9:16:05 下午 com.sun.jna.NativeLibrary loadLibrary
信息: Found library 'c' at libc.dylib
Hello, World
```

仔细观察上面的输出结果，我们可以大概了解JNA的工作流程。JNA的工作流程可以分为两部分，第一部分是Library Loading，第二部分是Native Library Loading。

两个部分分别对应的类是com.sun.jna.Native和com.sun.jna.NativeLibrary。

第一部分的Library Loading意思是将jnidispatch这个共享的lib文件加载到System中，加载的顺序是这样的：

1. jna.boot.library.path.
2. 使用System.loadLibrary(java.lang.String)从系统的library path中查找。如果不想从系统libary path中查找，则可以设置jna.nosys=true。
3. 如果从上述路径中没有找到，则会调用loadNativeDispatchLibrary将jna.jar中的jnidispatch解压到本地，然后进行加载。如果不想从classpath中查找，则可以设置jna.noclasspath=true。 如果不想从jna.jar文件中解压，则可以设置jna.nounpack=true。
4. 如果你的系统对于从jar文件中解压文件有安全方面的限制，比如SELinux,那么你需要手动将jnidispatch安装在一个可以访问的地址，然后使用1或者2的方式来设置加载方式和路径。

当jnidispatch被加载之后，会设置系统变量 jna.loaded=true，表示jna的lib已经加载完毕。

> 默认情况下我们加载的lib文件名字叫jnidispatch，你也可以通过设置jna.boot.library.name来对他进行修改。 

我们看一下loadNativeDispatchLibrary的核心代码：

```
String libName = "/com/sun/jna/" + Platform.RESOURCE_PREFIX + "/" + mappedName;
            File lib = extractFromResourcePath(libName, Native.class.getClassLoader());
            if (lib == null) {
                if (lib == null) {
                    throw new UnsatisfiedLinkError("Could not find JNA native support");
                }
            }

            LOG.log(DEBUG_JNA_LOAD_LEVEL, "Trying {0}", lib.getAbsolutePath());
            System.setProperty("jnidispatch.path", lib.getAbsolutePath());
            System.load(lib.getAbsolutePath());
            jnidispatchPath = lib.getAbsolutePath();
```

首先是查找stub lib文件:/com/sun/jna/darwin-aarch64/libjnidispatch.jnilib, 默认情况下这个lib文件是在jna.jar包中的，所以需要调用extractFromResourcePath方法将jar包中的lib文件拷贝到临时文件中，然后调用System.load方法将其加载。


第二部分就是调用com.sun.jna.NativeLibrary中的loadLibrary方法来加载JAVA代码中要加载的lib。

在loadLibrary的时候有一些搜索路径的规则如下：

1. jna.library.path，用户自定义的jna lib的路径，优先从用户自定义的路径中开始查找。
2. jna.platform.library.path, 和platform相关的lib路径。
3. 如果是在OSX操作系统上，则会去搜索 ~/Library/Frameworks, /Library/Frameworks, 和 /System/Library/Frameworks ，去查询对应的Frameworks。
4. 最后会去查找Context class loader classpath(classpath或者resource path)，具体的格式是${os-prefix}/LIBRARY_FILENAME。如果内容是在jar包中，则会将文件解压缩至 jna.tmpdir,然后进行加载。

所有的搜索逻辑都放在NativeLibrary的方法loadLibrary中实现的,方法体太长了，这里就不一一列举了，感兴趣的朋友可以自行去探索。

# 本地方法中的结构体参数

如果本地方法传入的参数是基本类型的话，在JNA中定义该native方法就用基本类型即可。

但是有时候，本地方法本身的参数是一个结构体类型，这种情况下我们该如何进行处理呢？

以Windows中的kernel32 library为例，这个lib中有一个GetSystemTime方法，传入的是一个time结构体。

我们通过继承Structure来定义参数的结构体：

```
@FieldOrder({ "wYear", "wMonth", "wDayOfWeek", "wDay", "wHour", "wMinute", "wSecond", "wMilliseconds" })
public static class SYSTEMTIME extends Structure {
    public short wYear;
    public short wMonth;
    public short wDayOfWeek;
    public short wDay;
    public short wHour;
    public short wMinute;
    public short wSecond;
    public short wMilliseconds;
}
```

然后定义一个Kernel32的interface:

```
public interface Kernel32 extends StdCallLibrary { 
Kernel32 INSTANCE = (Kernel32)
    Native.load("kernel32", Kernel32.class);
Kernel32 SYNC_INSTANCE = (Kernel32)
    Native.synchronizedLibrary(INSTANCE);

void GetSystemTime(SYSTEMTIME result);
}
```

最后这样调用：

```
Kernel32 lib = Kernel32.INSTANCE;
SYSTEMTIME time = new SYSTEMTIME();
lib.GetSystemTime(time);

System.out.println("Today's integer value is " + time.wDay);
```

# 总结

以上就是JNA的基本使用，有关JNA根据深入的使用，敬请期待后续的文章。

本文的代码：[https://github.com/ddean2009/learn-java-base-9-to-20.git](https://github.com/ddean2009/learn-java-base-9-to-20.git)





















