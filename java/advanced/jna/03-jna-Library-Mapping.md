java高级用法之:在JNA中将本地方法映射到JAVA代码中

[toc]

# 简介

不管是JNI还是JNA，最终调用的都是native的方法，但是对于JAVA程序来说，一定需要一个调用native方法的入口，也就是说我们需要在JAVA方法中定义需要调用的native方法。

对于JNI来说，我们可以使用native关键字来定义本地方法。那么在JNA中有那些在JAVA代码中定义本地方法的方式呢？

# Library Mapping

要想调用本地的native方法，首选需要做的事情就是加载native的lib文件。我们把这个过程叫做Library Mapping，也就是说把native的library 映射到java代码中。

JNA中有两种Library 映射的方法，分别是interface和direct mapping。

先看下interface mapping，假如我们要加载 C library, 如果使用interface mapping的方式，我们需要创建一个interface继承Library:

```
public interface CLibrary extends Library {
    CLibrary INSTANCE = (CLibrary)Native.load("c", CLibrary.class);
}
```

上面代码中Library是一个interface，所有的interface mapping都需要继承这个Library。

然后在interface内部，通过使用Native.load方法来加载要使用的c library。

上面的代码中，load方法传入两个参数，第一个参数是library的name，第二个参数是interfaceClass.

下面的表格展示了Library Name和传入的name之间的映射关系：

OS	| Library Name |	String
---|---|---
Windows	| user32.dll |user32
Linux |	libX11.so |	X11
Mac OS X| libm.dylib |	m
Mac OS X Framework	| /System/Library/Frameworks/Carbon.framework/Carbon	|Carbon
Any Platform |	current process | null

事实上，load还可以接受一个options的Map参数。默认情况下JAVA interface中要调用的方法名称就是native library中定义的方法名称，但是有些情况下我们可能需要在JAVA代码中使用不同的名字，在这种情况下，可以传入第三个参数map，map的key可以是 OPTION_FUNCTION_MAPPER,而它的value则是一个 FunctionMapper ，用来将JAVA中的方法名称映射到native library中。

传入的每一个native library都可以用一个NativeLibrary的实例来表示。这个NativeLibrary的实例也可以通过调用NativeLibrary.getInstance(String)来获得。

另外一种加载native libary的方式就是direct mapping，direct mapping使用的是在static block中调用Native.register方式来加载本地库，如下所示：

```
public class CLibrary {
    static {
        Native.register("c");
    }
}
```

# Function Mapping

当我们加载完native library之后，接下来就是定义需要调用的函数了。实际上就是做一个从JAVA代码到native lib中函数的一个映射，我们将其称为Function Mapping。

和Library Mapping一样，Function Mapping也有两种方式。分别是interface mapping和direct mapping。

在interface mapping中，我们只需要按照native library中的方法名称定义一个一样的方法即可，这个方法不用实现，也不需要像JNI一样使用native来修饰，如下所示：

```
public interface CLibrary extends Library {
    int atol(String s);
}
```

> 注意，上面我们提到了JAVA中的方法名称不一定必须和native library中的方法名称一致，你可以通过给Native.load方法传入一个FunctionMapper来实现。

或者，你可以使用direct mapping的方式，通过给方法添加一个native修饰符：

```

public class HelloWorld {
            
    public static native double cos(double x);
    public static native double sin(double x);
    
    static {
        Native.register(Platform.C_LIBRARY_NAME);
    }

    public static void main(String[] args) {
        System.out.println("cos(0)=" + cos(0));
        System.out.println("sin(0)=" + sin(0));
    }
}
```

对于direct mapping来说，JAVA方法可以映射到native library中的任何static或者对象方法。

虽然direct mapping和我们常用的java JNI有些类似，但是direct mapping存在着一些限制。

大部分情况下，direct mapping和interface mapping具有相同的映射类型，但是不支持Pointer/Structure/String/WString/NativeMapped数组作为函数参数值。

在使用TypeMapper或者NativeMapped的情况下，direct mapping不支持 NIO Buffers 或者基本类型的数组作为返回值。

如果要使用基础类型的包装类，则必须使用自定义的TypeMapper.

对象JAVA中的方法映射来说，该映射最终会创建一个Function对象。

# Invocation Mapping

讲完library mapping和function mapping之后，我们接下来讲解一下Invocation Mapping。

Invocation Mapping代表的是Library中的OPTION_INVOCATION_MAPPER,它对应的值是一个InvocationMapper。

之前我们提到了FunctionMapper，可以实现JAVA中定义的方法名和native lib中的方法名不同，但是不能修改方法调用的状态或者过程。

而InvocationMapper则更进一步， 允许您任意重新配置函数调用，包括更改方法名称以及重新排序、添加或删除参数。 

下面举个例子:

```
   new InvocationMapper() {
       public InvocationHandler getInvocationHandler(NativeLibrary lib, Method m) {
           if (m.getName().equals("stat")) {
               final Function f = lib.getFunction("_xstat");
               return new InvocationHandler() {
                   public Object invoke(Object proxy, Method method, Object[] args) {
                       Object[] newArgs = new Object[args.length+1];
                       System.arraycopy(args, 0, newArgs, 1, args.length);
                       newArgs[0] = Integer.valueOf(3); // _xstat version
                       return f.invoke(newArgs);
                   }
               };
           }
           return null;
       }
   }
```

看上面的调用例子，感觉有点像是反射调用，我们在InvocationMapper中实现了getInvocationHandler方法，根据给定的JAVA代码中的method去查找具体的native lib，然后获取到lib中的function，最后调用function的invoke方法实现方法的最终调用。

在这个过程中，我们可以修改方传入的参数，或者做任何我们想做的事情。

还有一种情况是c语言中的内联函数或者预处理宏，如下所示：

```
// Original C code (macro and inline variations)
   #define allocblock(x) malloc(x * 1024)
   static inline void* allocblock(size_t x) { return malloc(x * 1024); }
```

上面的代码中定义了一个allocblock(x)宏，它实际上等于malloc(x * 1024)，这种情况就可以使用InvocationMapper，将allocblock使用具体的malloc来替换：

```
   // Invocation mapping
   new InvocationMapper() {
       public InvocationHandler getInvocationHandler(NativeLibrary lib, Method m) {
           if (m.getName().equals("allocblock")) {
               final Function f = lib.getFunction("malloc");
               return new InvocationHandler() {
                   public Object invoke(Object proxy, Method method, Object[] args) {
                       args[0] = ((Integer)args[0]).intValue() * 1024;
                       return f.invoke(newArgs);
                   }
               };
           }
           return null;
       }
   }
```

# 防止VM崩溃

JAVA方法和native方法映射肯定会出现一些问题，如果映射方法不对或者参数不匹配的话，很有可能出现memory access errors,并且可能会导致VM崩溃。

通过调用Native.setProtected(true)，可以将VM崩溃转换成为对应的JAVA异常，当然，并不是所有的平台都支持protection,如果平台不支持protection，那么Native.isProtected()会返回false。

> 如果要使用protection,还要同时使用 jsig library，以防止信号和JVM的信号冲突。libjsig.so一般存放在JRE的lib目录下，${java.home}/lib/${os.arch}/libjsig.so, 可以通过将环境变量设置为LD_PRELOAD (或者LD_PRELOAD_64)来使用。

# 性能考虑

上面我们提到了JNA的两种mapping方式，分别是interface mapping和direct mapping。相较而言，direct mapping的效率更高，因为direct mapping调用native方法更加高效。

但是上面我们也提到了direct mapping在使用上有一些限制，所以我们在使用的时候需要进行权衡。

另外，我们需要避免使用基础类型的封装类，因为对于native方法来说，只有基础类型的匹配，如果要使用封装类，则必须使用Type mapping，从而造成性能损失。

# 总结

JNA是调用native方法的利器，如果数量掌握的话，肯定是如虎添翼。












