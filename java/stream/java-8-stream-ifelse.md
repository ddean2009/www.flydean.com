在java 8 stream表达式中实现if/else逻辑

# 简介

在Stream处理中，我们通常会遇到if/else的判断情况，对于这样的问题我们怎么处理呢？

还记得我们在上一篇文章lambda最佳实践中提到，lambda表达式应该越简洁越好，不要在其中写臃肿的业务逻辑。

接下来我们看一个具体的例子。

# 传统写法

假如我们有一个1 to 10的list，我们想要分别挑选出奇数和偶数出来，传统的写法，我们会这样使用：

~~~java
    public void inForEach(){
        List<Integer> ints = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        ints.stream()
                .forEach(i -> {
                    if (i.intValue() % 2 == 0) {
                        System.out.println("i is even");
                    } else {
                        System.out.println("i is old");
                    }
                });
    }
~~~

上面的例子中，我们把if/else的逻辑放到了forEach中，虽然没有任何问题，但是代码显得非常臃肿。

接下来看看怎么对其进行改写。

# 使用filter

我们可以把if/else的逻辑改写为两个filter：

~~~java
List<Integer> ints = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        Stream<Integer> evenIntegers = ints.stream()
                .filter(i -> i.intValue() % 2 == 0);
        Stream<Integer> oddIntegers = ints.stream()
                .filter(i -> i.intValue() % 2 != 0);
~~~

有了这两个filter，再在filter过后的stream中使用for each：

~~~java
        evenIntegers.forEach(i -> System.out.println("i is even"));
        oddIntegers.forEach(i -> System.out.println("i is old"));
~~~

怎么样，代码是不是非常简洁明了。

# 总结

lambda表达式需要尽可能的简洁，我们可以用stream的filter来替代if/else业务逻辑。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/lambda-if-else](https://github.com/ddean2009/learn-java-streams/tree/master/lambda-if-else)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
