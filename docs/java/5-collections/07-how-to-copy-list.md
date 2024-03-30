---
slug: /how-to-copy-list
---

# 7. Copy ArrayList的四种方式

# 简介

ArrayList是我们经常会用到的集合类，有时候我们需要拷贝一个ArrayList，今天向大家介绍拷贝ArrayList常用的四种方式。

# 使用构造函数

ArrayList有个构造函数，可以传入一个集合：

~~~java
    public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) {
            // c.toArray might (incorrectly) not return Object[] (see 6260652)
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // replace with empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
~~~

上面的代码我们可以看出，底层实际上调用了Arrays.copyOf方法来对数组进行拷贝。这个拷贝调用了系统的native arraycopy方法，注意这里的拷贝是引用拷贝，而不是值的拷贝。这就意味着这如果拷贝之后对象的值发送了变化，源对象也会发生改变。

举个例子：

~~~java
    @Test
    public void withConstructor(){
        List<String> stringList=new ArrayList<>(Arrays.asList("a","b","c"));
        List<String> copyList = new ArrayList<>(stringList);
        copyList.set(0,"e");
        log.info("{}",stringList);
        log.info("{}",copyList);

        List<CustBook> objectList=new ArrayList<>(Arrays.asList(new CustBook("a"),new CustBook("b"),new CustBook("c")));
        List<CustBook> copyobjectList = new ArrayList<>(objectList);
        copyobjectList.get(0).setName("e");
        log.info("{}",objectList);
        log.info("{}",copyobjectList);
    }
~~~

运行结果：

~~~java
22:58:39.001 [main] INFO com.flydean.CopyList - [a, b, c]
22:58:39.008 [main] INFO com.flydean.CopyList - [e, b, c]
22:58:39.009 [main] INFO com.flydean.CopyList - [CustBook(name=e), CustBook(name=b), CustBook(name=c)]
22:58:39.009 [main] INFO com.flydean.CopyList - [CustBook(name=e), CustBook(name=b), CustBook(name=c)]
~~~

我们看到对象的改变实际上改变了拷贝的源。而copyList.set(0,"e")实际上创建了一个新的String对象，并把它赋值到copyList的0位置。

# 使用addAll方法

List有一个addAll方法，我们可以使用这个方法来进行拷贝：

~~~java
    @Test
    public void withAddAll(){

        List<CustBook> objectList=new ArrayList<>(Arrays.asList(new CustBook("a"),new CustBook("b"),new CustBook("c")));
        List<CustBook> copyobjectList = new ArrayList<>();
        copyobjectList.addAll(objectList);
        copyobjectList.get(0).setName("e");
        log.info("{}",objectList);
        log.info("{}",copyobjectList);
    }
~~~

同样的拷贝的是对象的引用。

# 使用Collections.copy

同样的，使用Collections.copy也可以得到相同的效果，看下代码：

~~~java
    @Test
    public void withCopy(){
        List<CustBook> objectList=new ArrayList<>(Arrays.asList(new CustBook("a"),new CustBook("b"),new CustBook("c")));
        List<CustBook> copyobjectList = new ArrayList<>(Arrays.asList(new CustBook("d"),new CustBook("e"),new CustBook("f")));
        Collections.copy(copyobjectList, objectList);
        copyobjectList.get(0).setName("e");
        log.info("{}",objectList);
        log.info("{}",copyobjectList);
    }
~~~

# 使用stream

我们也可以使用java 8引入的stream来实现：

~~~java
    @Test
    public void withStream(){

        List<CustBook> objectList=new ArrayList<>(Arrays.asList(new CustBook("a"),new CustBook("b"),new CustBook("c")));
        List<CustBook> copyobjectList=objectList.stream().collect(Collectors.toList());
        copyobjectList.get(0).setName("e");
        log.info("{}",objectList);
        log.info("{}",copyobjectList);

    }
~~~

# 总结

好了，四种方法讲完了，大家要注意四种方法都是引用拷贝，在使用的时候要小心。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)








