---
slug: /concurrent-ThreadLocal
---

# 8. java中ThreadLocal的使用

ThreadLocal主要用来为当前线程存储数据，这个数据只有当前线程可以访问。

在定义ThreadLocal的时候，我们可以同时定义存储在ThreadLocal中的特定类型的对象。

~~~java
ThreadLocal<Integer> threadLocalValue = new ThreadLocal<>();
~~~

上面我们定义了一个存储Integer的ThreadLocal对象。

要存储和获取ThreadLocal中的对象也非常简单，使用get（）和set（）即可：

~~~java
threadLocalValue.set(1);
Integer result = threadLocalValue.get();
~~~

我可以将ThreadLocal看成是一个map，而当前的线程就是map中的key。

除了new一个ThreadLocal对象，我们还可以通过：

~~~java
    public static <S> ThreadLocal<S> withInitial(Supplier<? extends S> supplier) {
        return new SuppliedThreadLocal<>(supplier);
    }
~~~

ThreadLocal提供的静态方法withInitial来初始化一个ThreadLocal。

~~~java
ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 1);
~~~

withInitial需要一个Supplier对象，通过调用Supplier的get()方法获取到初始值。

要想删除ThreadLocal中的存储数据，可以调用：

~~~java
threadLocal.remove();
~~~

下面我通过两个例子的对比，来看一下使用ThreadLocal的好处。

在实际的应用中，我们通常会需要为不同的用户请求存储不同的用户信息，一般来说我们需要构建一个全局的Map，来根据不同的用户ID，来存储不同的用户信息，方便在后面获取。

## 在Map中存储用户数据

我们先看下如果使用全局的Map该怎么用：

~~~java
public class SharedMapWithUserContext implements Runnable {

    public static Map<Integer, Context> userContextPerUserId
            = new ConcurrentHashMap<>();
    private Integer userId;
    private UserRepository userRepository = new UserRepository();

    public SharedMapWithUserContext(int i) {
        this.userId=i;
    }

    @Override
    public void run() {
        String userName = userRepository.getUserNameForUserId(userId);
        userContextPerUserId.put(userId, new Context(userName));
    }
}
~~~

这里我们定义了一个static的Map来存取用户信息。

再看一下怎么使用：

~~~java
    @Test
    public void testWithMap(){
        SharedMapWithUserContext firstUser = new SharedMapWithUserContext(1);
        SharedMapWithUserContext secondUser = new SharedMapWithUserContext(2);
        new Thread(firstUser).start();
        new Thread(secondUser).start();
        assertEquals(SharedMapWithUserContext.userContextPerUserId.size(), 2);
    }
~~~

## 在ThreadLocal中存储用户数据

如果我们要在ThreadLocal中使用可以这样：

~~~java
public class ThreadLocalWithUserContext implements Runnable {

    private static ThreadLocal<Context> userContext
            = new ThreadLocal<>();
    private Integer userId;
    private UserRepository userRepository = new UserRepository();

    public ThreadLocalWithUserContext(int i) {
        this.userId=i;
    }

    @Override
    public void run() {
        String userName = userRepository.getUserNameForUserId(userId);
        userContext.set(new Context(userName));
        System.out.println("thread context for given userId: "
                + userId + " is: " + userContext.get());
    }

}
~~~

测试代码如下：

~~~java
public class ThreadLocalWithUserContextTest {

    @Test
    public void testWithThreadLocal(){
        ThreadLocalWithUserContext firstUser
                = new ThreadLocalWithUserContext(1);
        ThreadLocalWithUserContext secondUser
                = new ThreadLocalWithUserContext(2);
        new Thread(firstUser).start();
        new Thread(secondUser).start();
    }
}
~~~

运行之后，我们可以得到下面的结果：

~~~java
thread context for given userId: 1 is: com.flydean.Context@411734d4
thread context for given userId: 2 is: com.flydean.Context@1e9b6cc
~~~

不同的用户信息被存储在不同的线程环境中。

> 注意，我们使用ThreadLocal的时候，一定是我们可以自由的控制所创建的线程。如果在ExecutorService环境下，就最好不要使用ThreadLocal，因为在ExecutorService中，线程是不可控的。
