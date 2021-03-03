java安全编码指南之:堆污染Heap pollution

# 简介

什么是堆污染呢？堆污染是指当参数化类型变量引用的对象不是该参数化类型的对象时而发生的。

我们知道在JDK5中，引入了泛型的概念，我们可以在创建集合类的时候，指定该集合类中应该存储的对象类型。

如果在指定类型的集合中，引用了不同的类型，那么这种情况就叫做堆污染。

# 产生堆污染的例子

有同学可能会问了，既然JDK5引入了泛型，为什么还会出现堆污染呢？

这是一个好问题，让我们看一个例子：

~~~java
    public void heapPollution1(){
        List normalList= Arrays.asList("www.flydean.com",100);
        List<Integer> integerList= normalList;
    }
~~~

上面的例子中，我们使用Arrays.asList创建了一个普通的List。

这个List中包含了int和String两种类型，当我们将List赋值给List&lt;Integer>的时候，java编译器并不会去判断赋值List中的类型，integerList中包含了非Integer的元素，最终导致在使用的时候会出现错误。

直接给List&lt;Integer>赋值不会进行类型检查，那么如果我们是直接向List&lt;Integer>中添加元素呢？

我们看下下面的例子：

~~~java
    private void addToList(List list, Object object){
        list.add(object);
    }

    @Test
    public void heapPollution2(){
        List<Integer> integerList=new ArrayList<>();
        addToList(integerList,"www.flydean.com");
    }
~~~

上面的例子中，我们定义了一个addToList方法，这个方法的参数是一个普通的List，但是我们传入了一个List&lt;Integer>。

结果，我们发现list.add方法并没有进行参数类型校验。

上面的例子该怎么修改呢？

我们需要在addToList方法的List参数中，也添加上类型校验：

~~~java
    private void addToList(List<Integer> list, Object object){
        list.add(object);
    }
~~~

如果addToList是一个非常通用的方法怎么办呢？在addToList的参数中添加参数类型是现实的。

这个时候，我们可以考虑使用Collections.checkedList方法来将输入的List转换成为一个checkedList，从而只接收特定类型的元素。

~~~java
    public void heapPollutionRight(){
        List<Integer> integerList=new ArrayList<>();
        List<Integer> checkedIntegerList= Collections.checkedList(integerList, Integer.class);
        addToList(checkedIntegerList,"www.flydean.com");
    }
~~~

运行上面的代码，我们将会得到下面的异常：

~~~java
java.lang.ClassCastException: Attempt to insert class java.lang.String element into collection with element type class java.lang.Integer
~~~

# 更通用的例子

上面我们定义了一个addToList方法，因为没有做类型判断，所以可能会出现堆污染的问题。

有没有什么办法既可以通用，又可以避免堆污染呢？

当然有的，我们看下面的实现：

~~~java
    private <T> void addToList2(List<T> list, T t) {
        list.add(t);
    }

    public <T> void heapPollutionRight2(T element){
        List<T> list = new ArrayList<>();
        addToList2(list,element);
    }
~~~

上面的例子中，我们在addToList方法中定义了一个参数类型T，通过这样，我们保证了List中的元素类型的一致性。

# 可变参数

事实上，方法参数可以是可变的，我们考虑下面的例子：

~~~java
    private void addToList3(List<Integer>... listArray){
        Object[] objectArray = listArray;
        objectArray[0]= Arrays.asList("www.flydean.com");
        for(List<Integer> integerList: listArray){
            for(Integer element: integerList){
                System.out.println(element);
            }
        }
    }
~~~

上面的例子中我们的参数是一个List的数组，虽然List中的元素类型固定了，但是我们可以重新赋值给参数数组，从而实际上修改掉参数类型。

如果上面addToList3的方法参数修改为下面的方式，就不会出现问题了：

~~~java
private void addToList4(List<List<Integer>> listArray){

~~~

这种情况下，List的类型是固定的，我们无法通过重新赋值的方式来修改它。

本文的例子：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


