java高级用法之:JNA中的Function

[toc]

# 简介

在JNA中，为了和native的function进行映射，我们可以有两种mapping方式，第一种是interface mapping，第二种是direct mapping。虽然两种方式不同，但是在具体的方法映射中，我们都需要在JAVA中定义一个和native方法进行映射的方法。

而这个JAVA中的映射在JNA中就是一个function。通过或者function对象，我们可以实现一些非常强大的功能，一起看看吧。

# function的定义

先来看下JNA中Function的定义：

```
public class Function extends Pointer
```

可以看到Function实际上是一个Pointer，指向的是native function的指针。

那么怎么得到一个Function的实例呢？

我们知道JNA的流程是先进行Library的映射，然后再对Library中的Function进行映射。所以很自然的我们应该可以从Library中得到Function。

我们看一下根据Library name得到function实例的方法定义：

```
public static Function getFunction(String libraryName, String functionName, int callFlags, String encoding) {
        return NativeLibrary.getInstance(libraryName).getFunction(functionName, callFlags, encoding);
    }
```

这个方法可以接受4个参数，前面两个参数大家应该很熟悉了，第三个参数是callFlags,表示的是函数调用的flags，Function定义了三个callFlags：

```
    public static final int C_CONVENTION = 0;

    public static final int ALT_CONVENTION = 0x3F;

    public static final int THROW_LAST_ERROR = 0x40;
```

其中C_CONVENTION表示的是C语言类型的方法调用。

ALT_CONVENTION表示的其他的调用方式。

THROW_LAST_ERROR表示如果native函数的返回值是非零值的时候，将会抛出一个LastErrorException。

最后一个参数是encoding，表示的是字符串的编码方式，实际上指的是 Java unicode和native (const char*) strings 的转换方式。

除了根据Library name获取Function之外，JNA还提供了根据Pointer来获取Function的方法。

```
    public static Function getFunction(Pointer p, int callFlags, String encoding) {
        return new Function(p, callFlags, encoding);
    }
```

这里的Pointer指的是一个执行native方法的指针，因为Function本身就是继承自Pointer。所以跟Pointer来创建Function的本质就是在Pointer的基础上添加了一些Function特有的属性。

有了Function的定义，更为重要的是如何通过Function来调用对应的方法。跟反射很类似，Function中也有一个invoke方法，通过调用invoke，我们就可以执行对应的Function的功能。

Function中的invoke方法有两种，一种是通用的返回对象Object，一种是带有返回值的invoke方法，比如invokeString,invokePointer,invokeInt等。

# Function的实际应用

Function的实际使用和JAVA中的反射有点类似，其工作流程是首先获得要加载的NativeLibrary，然后从该NativeLibrary中找到要调用的Function，最后invoke该Function的某些方法。

C语言中的printf应该是大家最熟悉的native方法了。我们看一下如何使用Function来调用这个方法吧：

```
        NativeLibrary lib = NativeLibrary.getInstance(Platform.C_LIBRARY_NAME);
        Function f = lib.getFunction("printf");
        try {
            f.invoke(getClass(), new Object[] { getName() });
            fail("Invalid return types should throw an exception");
        } catch(IllegalArgumentException e) {
            // expected
        }
```

可以看到调用的流程非常简洁。如果是用interface Mapping或者direct Mapping的形式，我们还需要自定义一个interface或者class，并且在其中定义一个相应的java方法映射。但是如果使用Function的话，这些都不需要了。我们直接可以从NativeLibrary中拿到对应的函数，并最终调用其中的方法。

C语言中的printf的原型如下：

```
# include <stdio.h>
int printf(const char *format, ...);
```

printf带有返回值的，如果要输出这个返回值，则可以调用Function中的invokeInt命令。我们再来看一个有返回值的调用例子：

```
NativeLibrary lib = NativeLibrary.getInstance(Platform.C_LIBRARY_NAME);
        Function f = lib.getFunction("printf");
        Object[] args = new Object[Function.MAX_NARGS+1];
        // Make sure we don't break 'printf'
        args[0] = getName();
        try {
            f.invokeInt(args);
            fail("Arguments should be limited to " + Function.MAX_NARGS);
        } catch(UnsupportedOperationException e) {
            // expected
        }
```

# 总结

使用Function可以减少手写Mapping的工作，在某些情况下是非常好用的，但是Function的invoke支持TypeMapper，并不支持FunctionMapper,所以在使用中还是有一些限制。

大家可以在使用过程中酌情考虑。



