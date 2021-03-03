java中functional interface的分类和使用

# 简介

java 8引入了lambda表达式，lambda表达式实际上表示的就是一个匿名的function。

在java 8之前，如果需要使用到匿名function需要new一个类的实现，但是有了lambda表达式之后，一切都变的非常简介。

我们看一个之前讲线程池的时候的一个例子：

~~~java
//ExecutorService using class
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        executorService.submit(new Runnable() {
            @Override
            public void run() {
            log.info("new runnable");
            }
        });
~~~

executorService.submit需要接收一个Runnable类，上面的例子中我们new了一个Runnable类，并实现了它的run（）方法。

上面的例子如果用lambda表达式来重写，则如下所示：

~~~java
//ExecutorService using lambda
        executorService.submit(()->log.info("new runnable"));
~~~

看起是不是很简单，使用lambda表达式就可以省略匿名类的构造，并且可读性更强。

那么是不是所有的匿名类都可以用lambda表达式来重构呢？也不是。

我们看下Runnable类有什么特点：

~~~java
@FunctionalInterface
public interface Runnable 
~~~

Runnable类上面有一个@FunctionalInterface注解。这个注解就是我们今天要讲到的Functional Interface。

# Functional Interface

Functional Interface是指带有 @FunctionalInterface 注解的interface。它的特点是其中只有一个子类必须要实现的abstract方法。如果abstract方法前面带有default关键字，则不做计算。

其实这个也很好理解，因为Functional Interface改写成为lambda表达式之后，并没有指定实现的哪个方法，如果有多个方法需要实现的话，就会有问题。

~~~java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface FunctionalInterface {}
~~~

Functional Interface一般都在java.util.function包中。

根据要实现的方法参数和返回值的不同，Functional Interface可以分为很多种，下面我们分别来介绍。

# Function：一个参数一个返回值

Function接口定义了一个方法，接收一个参数，返回一个参数。

~~~java
@FunctionalInterface
public interface Function<T, R> {

    /**
     * Applies this function to the given argument.
     *
     * @param t the function argument
     * @return the function result
     */
    R apply(T t)；
~~~

一般我们在对集合类进行处理的时候，会用到Function。

~~~java
Map<String, Integer> nameMap = new HashMap<>();
        Integer value = nameMap.computeIfAbsent("name", s -> s.length());
~~~

上面的例子中我们调用了map的computeIfAbsent方法，传入一个Function。

上面的例子还可以改写成更短的：

~~~java
Integer value1 = nameMap.computeIfAbsent("name", String::length);
~~~

Function没有指明参数和返回值的类型，如果需要传入特定的参数，则可以使用IntFunction, LongFunction, DoubleFunction：

~~~java
@FunctionalInterface
public interface IntFunction<R> {

    /**
     * Applies this function to the given argument.
     *
     * @param value the function argument
     * @return the function result
     */
    R apply(int value);
}
~~~

如果需要返回特定的参数，则可以使用ToIntFunction, ToLongFunction, ToDoubleFunction：

~~~java
@FunctionalInterface
public interface ToDoubleFunction<T> {

    /**
     * Applies this function to the given argument.
     *
     * @param value the function argument
     * @return the function result
     */
    double applyAsDouble(T value);
}
~~~

如果要同时指定参数和返回值，则可以使用DoubleToIntFunction, DoubleToLongFunction, IntToDoubleFunction, IntToLongFunction, LongToIntFunction, LongToDoubleFunction：

~~~java
@FunctionalInterface
public interface LongToIntFunction {

    /**
     * Applies this function to the given argument.
     *
     * @param value the function argument
     * @return the function result
     */
    int applyAsInt(long value);
}
~~~

# BiFunction：接收两个参数，一个返回值

如果需要接受两个参数，一个返回值的话，可以使用BiFunction：BiFunction, ToDoubleBiFunction, ToIntBiFunction,  ToLongBiFunction等。

~~~java
@FunctionalInterface
public interface BiFunction<T, U, R> {

    /**
     * Applies this function to the given arguments.
     *
     * @param t the first function argument
     * @param u the second function argument
     * @return the function result
     */
    R apply(T t, U u);
~~~

我们看一个BiFunction的例子：

~~~java
//BiFunction
        Map<String, Integer> salaries = new HashMap<>();
        salaries.put("alice", 100);
        salaries.put("jack", 200);
        salaries.put("mark", 300);

        salaries.replaceAll((name, oldValue) ->
                name.equals("alice") ? oldValue : oldValue + 200);
~~~

# Supplier：无参的Function

如果什么参数都不需要，则可以使用Supplier：

~~~java
@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
~~~

# Consumer：接收一个参数，不返回值

Consumer接收一个参数，但是不返回任何值，我们看下Consumer的定义：

~~~java
@FunctionalInterface
public interface Consumer<T> {

    /**
     * Performs this operation on the given argument.
     *
     * @param t the input argument
     */
    void accept(T t);
~~~

看一个Consumer的具体应用：

~~~java
//Consumer
        nameMap.forEach((name, age) -> System.out.println(name + " is " + age + " years old"));
~~~

# Predicate：接收一个参数，返回boolean

Predicate接收一个参数，返回boolean值：

~~~java
@FunctionalInterface
public interface Predicate<T> {

    /**
     * Evaluates this predicate on the given argument.
     *
     * @param t the input argument
     * @return {@code true} if the input argument matches the predicate,
     * otherwise {@code false}
     */
    boolean test(T t);
~~~

如果用在集合类的过滤上面那是极好的：

~~~java
//Predicate
        List<String> names = Arrays.asList("A", "B", "C", "D", "E");
        List<String> namesWithA = names.stream()
                .filter(name -> name.startsWith("A"))
                .collect(Collectors.toList());
~~~

# Operator：接收和返回同样的类型

Operator接收和返回同样的类型，有很多种Operator：UnaryOperator BinaryOperator ，DoubleUnaryOperator, IntUnaryOperator, LongUnaryOperator, DoubleBinaryOperator, IntBinaryOperator,  LongBinaryOperator等。


~~~java
@FunctionalInterface
public interface IntUnaryOperator {

    /**
     * Applies this operator to the given operand.
     *
     * @param operand the operand
     * @return the operator result
     */
    int applyAsInt(int operand);
~~~

我们看一个BinaryOperator的例子：

~~~java
 //Operator
        List<Integer> values = Arrays.asList(1, 2, 3, 4, 5);
        int sum = values.stream()
                .reduce(0, (i1, i2) -> i1 + i2);
~~~

# 总结

Functional Interface是一个非常有用的新特性，希望大家能够掌握。

本文的例子：[https://github.com/ddean2009/learn-java-streams/tree/master/functional-interface](https://github.com/ddean2009/learn-java-streams/tree/master/functional-interface)

更多内容请访问 [www.flydean.com](www.flydean.com)










