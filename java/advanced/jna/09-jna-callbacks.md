java高级用法之:JNA中的回调

[toc]

# 简介

什么是callback呢？简单点说callback就是回调通知，当我们需要在某个方法完成之后，或者某个事件触发之后，来通知进行某些特定的任务就需要用到callback了。

最有可能看到callback的语言就是javascript了，基本上在javascript中，callback无处不在。为了解决callback导致的回调地狱的问题，ES6中特意引入了promise来解决这个问题。

为了方便和native方法进行交互，JNA中同样提供了Callback用来进行回调。JNA中回调的本质是一个指向native函数的指针，通过这个指针可以调用native函数中的方法，一起来看看吧。

# JNA中的Callback

先看下JNA中Callback的定义：

```
public interface Callback {
    interface UncaughtExceptionHandler {
        void uncaughtException(Callback c, Throwable e);
    }

    String METHOD_NAME = "callback";

    List<String> FORBIDDEN_NAMES = Collections.unmodifiableList(
            Arrays.asList("hashCode", "equals", "toString"));
}
```

所有的Callback方法都需要实现这个Callback接口。Callback接口很简单，里面定义了一个interface和两个属性。

先来看这个interface,interface名字叫做UncaughtExceptionHandler,里面有一个uncaughtException方法。这个interface主要用于处理JAVA的callback代码中没有捕获的异常。

> 注意，在uncaughtException方法中，不能抛出异常，任何从这个方法抛出的异常都会被忽略。

METHOD_NAME这个字段指定了Callback要调用的方法。

如果Callback类中只定义了一个public的方法，那么默认callback方法就是这个方法。如果Callback类中定义了多个public方法，那么会选择METHOD_NAME = "callback"的这个方法作为callback。

最后一个属性就是FORBIDDEN_NAMES。表示在这个列表里面的名字是不能作为callback方法使用的。

目前看来是有三个方法名不能够被使用，分别是："hashCode", "equals", "toString"。

Callback还有一个同胞兄弟叫做DLLCallback，我们来看下DLLCallback的定义：

```
public interface DLLCallback extends Callback {
    @java.lang.annotation.Native
    int DLL_FPTRS = 16;
}
```

DLLCallback主要是用在Windows API的访问中。

对于callback对象来说，需要我们自行负责对callback对象的释放工作。如果native代码尝试访问一个被回收的callback，那么有可能会导致VM崩溃。

# callback的应用

## callback的定义

因为JNA中的callback实际上映射的是native中指向函数的指针。首先看一下在struct中定义的函数指针：

```
struct _functions {
  int (*open)(const char*,int);
  int (*close)(int);
};
```

在这个结构体中，定义了两个函数指针，分别带两个参数和一个参数。

对应的JNA的callback定义如下：

```
public class Functions extends Structure {
  public static interface OpenFunc extends Callback {
    int invoke(String name, int options);
  }
  public static interface CloseFunc extends Callback {
    int invoke(int fd);
  }
  public OpenFunc open;
  public CloseFunc close;
}
```

我们在Structure里面定义两个接口继承自Callback，对应的接口中定义了相应的invoke方法。

然后看一下具体的调用方式：

```
Functions funcs = new Functions();
lib.init(funcs);
int fd = funcs.open.invoke("myfile", 0);
funcs.close.invoke(fd);
```

另外Callback还可以作为函数的返回值，如下所示：

```
typedef void (*sig_t)(int);
sig_t signal(int signal, sig_t sigfunc);
```

对于这种单独存在的函数指针，我们需要自定义一个Library,并在其中定义对应的Callback，如下所示：

```
public interface CLibrary extends Library {
    public interface SignalFunction extends Callback {
        void invoke(int signal);
    }
    SignalFunction signal(int signal, SignalFunction func);
}
```

## callback的获取和应用

如果callback是定义在Structure中的，那么可以在Structure进行初始化的时候自动实例化，然后只需要从Structure中访问对应的属性即可。

如果callback定义是在一个普通的Library中的话，如下所示：

```
    public static interface TestLibrary extends Library {

        interface VoidCallback extends Callback {
            void callback();
        }
        interface ByteCallback extends Callback {
            byte callback(byte arg, byte arg2);
        }

        void callVoidCallback(VoidCallback c);
        byte callInt8Callback(ByteCallback c, byte arg, byte arg2);
    }
```

上例中，我们在一个Library中定义了两个callback，一个是无返回值的callback，一个是返回byte的callback。

JNA提供了一个简单的工具类来帮助我们获取Callback，这个工具类就是CallbackReference，对应的方法是CallbackReference.getCallback,如下所示：

```
Pointer p = new Pointer("MultiplyMappedCallback".hashCode());
Callback cbV1 = CallbackReference.getCallback(TestLibrary.VoidCallback.class, p);
Callback cbB1 = CallbackReference.getCallback(TestLibrary.ByteCallback.class, p);
log.info("cbV1:{}",cbV1);
log.info("cbB1:{}",cbB1);
```

输出结果如下：

```
INFO com.flydean.CallbackUsage - cbV1:Proxy interface to native function@0xffffffffc46eeefc (com.flydean.CallbackUsage$TestLibrary$VoidCallback)
INFO com.flydean.CallbackUsage - cbB1:Proxy interface to native function@0xffffffffc46eeefc (com.flydean.CallbackUsage$TestLibrary$ByteCallback)
```

可以看出，这两个Callback实际上是对native方法的代理。如果详细看getCallback的实现逻辑：

```
private static Callback getCallback(Class<?> type, Pointer p, boolean direct) {
        if (p == null) {
            return null;
        }

        if (!type.isInterface())
            throw new IllegalArgumentException("Callback type must be an interface");
        Map<Callback, CallbackReference> map = direct ? directCallbackMap : callbackMap;
        synchronized(pointerCallbackMap) {
            Reference<Callback>[] array = pointerCallbackMap.get(p);
            Callback cb = getTypeAssignableCallback(type, array);
            if (cb != null) {
                return cb;
            }
            cb = createCallback(type, p);
            pointerCallbackMap.put(p, addCallbackToArray(cb,array));

            // No CallbackReference for this callback
            map.remove(cb);
            return cb;
        }
    }
```

可以看到它的实现逻辑是首先判断type是否是interface，如果不是interface则会报错。然后判断是否是direct mapping。实际上当前JNA的实现都是interface mapping，所以接下来的逻辑就是从pointerCallbackMap中获取函数指针对应的callback。然后按照传入的类型来查找具体的Callback。

如果没有查找到，则创建一个新的callback，最后将这个新创建的存入pointerCallbackMap中。

大家要注意， 这里有一个关键的参数叫做Pointer，实际使用的时候，需要传入指向真实naitve函数的指针。上面的例子中，为了简便起见，我们是自定义了一个Pointer，这个Pointer并没有太大的实际意义。

如果真的要想在JNA中调用在TestLibrary中创建的两个call方法：callVoidCallback和callInt8Callback，首先需要加载对应的Library：

```
TestLibrary lib = Native.load("testlib", TestLibrary.class);
```

然后分别创建TestLibrary.VoidCallback和TestLibrary.ByteCallback的实例如下，首先看一下VoidCallback：

```
final boolean[] voidCalled = { false };
        TestLibrary.VoidCallback cb1 = new TestLibrary.VoidCallback() {
            @Override
            public void callback() {
                voidCalled[0] = true;
            }
        };
        lib.callVoidCallback(cb1);
        assertTrue("Callback not called", voidCalled[0]);
```

这里我们在callback中将voidCalled的值回写为true表示已经调用了callback方法。

再看看带返回值的ByteCallback:

```
final boolean[] int8Called = {false};
        final byte[] cbArgs = { 0, 0 };
        TestLibrary.ByteCallback cb2 = new TestLibrary.ByteCallback() {
            @Override
            public byte callback(byte arg, byte arg2) {
                int8Called[0] = true;
                cbArgs[0] = arg;
                cbArgs[1] = arg2;
                return (byte)(arg + arg2);
            }
        };

final byte MAGIC = 0x11;
byte value = lib.callInt8Callback(cb2, MAGIC, (byte)(MAGIC*2));
```

我们直接在callback方法中返回要返回的byte值即可。

## 在多线程环境中使用callback

默认情况下， callback方法是在当前的线程中执行的。如果希望callback方法是在另外的线程中执行，则可以创建一个CallbackThreadInitializer,指定daemon,detach,name,和threadGroup属性：

```
        final String tname = "VoidCallbackThreaded";
        ThreadGroup testGroup = new ThreadGroup("Thread group for callVoidCallbackThreaded");
        CallbackThreadInitializer init = new CallbackThreadInitializer(true, false, tname, testGroup);
```
然后创建callback的实例：

```
TestLibrary.VoidCallback cb = new TestLibrary.VoidCallback() {
            @Override
            public void callback() {
                Thread thread = Thread.currentThread();
                daemon[0] = thread.isDaemon();
                name[0] = thread.getName();
                group[0] = thread.getThreadGroup();
                t[0] = thread;
                if (thread.isAlive()) {
                    alive[0] = true;
                }

                ++called[0];
                if (THREAD_DETACH_BUG && called[0] == 2) {
                    Native.detach(true);
                }
            }
        };
```
然后调用:

```
 Native.setCallbackThreadInitializer(cb, init);
```

将callback和CallbackThreadInitializer进行关联。

最后调用callback方法即可：

```
lib.callVoidCallbackThreaded(cb, 2, 2000, "callVoidCallbackThreaded", 0);
```

# 总结

JNA中的callback可以实现向native方法中传递方法的作用，在某些情况下用处还是非常大的。

本文的代码：[https://github.com/ddean2009/learn-java-base-9-to-20.git](https://github.com/ddean2009/learn-java-base-9-to-20.git)








