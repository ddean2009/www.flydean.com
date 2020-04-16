java 8 stream中的Spliterator简介

# 简介

Spliterator是在java 8引入的一个接口，它通常和stream一起使用，用来遍历和分割序列。

只要用到stream的地方都需要Spliterator，比如List，Collection，IO channel等等。

我们先看一下Collection中stream方法的定义：

~~~java
default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }
~~~

~~~java
default Stream<E> parallelStream() {
        return StreamSupport.stream(spliterator(), true);
    }
~~~

我们可以看到，不管是并行stream还是非并行stream，都是通过StreamSupport来构造的，并且都需要传入一个spliterator的参数。

好了，我们知道了spliterator是做什么的之后，看一下它的具体结构：

![](https://img-blog.csdnimg.cn/20200414221557893.png)

spliterator有四个必须实现的方法，我们接下来进行详细的讲解。

# tryAdvance

tryAdvance就是对stream中的元素进行处理的方法，如果元素存在，则对他进行处理，并返回true，否则返回false。

如果我们不想处理stream后续的元素，则在tryAdvance中返回false即可，利用这个特征，我们可以中断stream的处理。这个例子我将会在后面的文章中讲到。

# trySplit

trySplit尝试对现有的stream进行分拆，一般用在parallelStream的情况，因为在并发stream下，我们需要用多线程去处理stream的不同元素，trySplit就是对stream中元素进行分拆处理的方法。

理想情况下trySplit应该将stream拆分成数目相同的两部分才能最大提升性能。

# estimateSize

estimateSize表示Spliterator中待处理的元素，在trySplit之前和之后一般是不同的，后面我们会在具体的例子中说明。

# characteristics

characteristics表示这个Spliterator的特征，Spliterator有8大特征：

~~~java
public static final int ORDERED    = 0x00000010;//表示元素是有序的（每一次遍历结果相同）
public static final int DISTINCT   = 0x00000001;//表示元素不重复
public static final int SORTED     = 0x00000004;//表示元素是按一定规律进行排列（有指定比较器）
public static final int SIZED      = 0x00000040;//
表示大小是固定的
public static final int NONNULL    = 0x00000100;//表示没有null元素
public static final int IMMUTABLE  = 0x00000400;//表示元素不可变
public static final int CONCURRENT = 0x00001000;//表示迭代器可以多线程操作
public static final int SUBSIZED   = 0x00004000;//表示子Spliterators都具有SIZED特性
~~~

一个Spliterator可以有多个特征，多个特征进行or运算，最后得到最终的characteristics。

# 举个例子

上面我们讨论了Spliterator一些关键方法，现在我们举一个具体的例子：

~~~java
@AllArgsConstructor
@Data
public class CustBook {
    private String name;

}
~~~

先定义一个CustBook类，里面放一个name变量。

定义一个方法，来生成一个CustBook的list：

~~~java
    public static List<CustBook> generateElements() {
        return Stream.generate(() -> new CustBook("cust book"))
                .limit(1000)
                .collect(Collectors.toList());
    }
~~~

我们定义一个call方法，在call方法中调用了tryAdvance方法，传入了我们自定义的处理方法。这里我们修改book的name,并附加额外的信息。

~~~java
    public String call(Spliterator<CustBook> spliterator) {
        int current = 0;
        while (spliterator.tryAdvance(a -> a.setName("test name"
                .concat("- add new name")))) {
            current++;
        }

        return Thread.currentThread().getName() + ":" + current;
    }
~~~

最后，写一下测试方法：

~~~java
    @Test
    public void useTrySplit(){
        Spliterator<CustBook> split1 = SpliteratorUsage.generateElements().spliterator();
        Spliterator<CustBook> split2 = split1.trySplit();

        log.info("before tryAdvance: {}",split1.estimateSize());
        log.info("Characteristics {}",split1.characteristics());
        log.info(call(split1));
        log.info(call(split2));
        log.info("after tryAdvance {}",split1.estimateSize());
    }
~~~

运行的结果如下：

~~~txt
23:10:08.852 [main] INFO com.flydean.SpliteratorUsage - before tryAdvance: 500
23:10:08.857 [main] INFO com.flydean.SpliteratorUsage - Characteristics 16464
23:10:08.858 [main] INFO com.flydean.SpliteratorUsage - main:500
23:10:08.858 [main] INFO com.flydean.SpliteratorUsage - main:500
23:10:08.858 [main] INFO com.flydean.SpliteratorUsage - after tryAdvance 0
~~~

List总共有1000条数据，调用一次trySplit之后，将List分成了两部分，每部分500条数据。

注意，在tryAdvance调用之后，estimateSize变为0，表示所有的元素都已经被处理完毕。

再看一下这个Characteristics=16464，转换为16进制：Ox4050 = ORDERED or SIZED or SUBSIZED 这三个的或运算。

这也是ArrayList的基本特征。

# 总结

本文介绍了跟stream息息相关的接口Spliterator，讨论了它的构成，并举例说明，希望大家能够掌握。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/Spliterator](https://github.com/ddean2009/learn-java-streams/tree/master/Spliterator)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)









