---
slug: /jvm-string-intern-performance
---

# 12. JVM系列之:String.intern的性能

## 简介

String对象有个特殊的StringTable字符串常量池，为了减少Heap中生成的字符串的数量，推荐尽量直接使用String Table中的字符串常量池中的元素。

那么String.intern的性能怎么样呢？我们一起来看一下。

## String.intern和G1字符串去重的区别

之前我们提到了，String.intern方法会返回字符串常量池中的字符串对象的引用。

而G1垃圾回收器的字符串去重的功能其实和String.intern有点不一样，G1是让两个字符串的底层指向同一个byte[]数组。

有图为证：

![](https://img-blog.csdnimg.cn/20200621153827463.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图中的String1和String2指向的是同一个byte[]数组。

## String.intern的性能

我们看下intern方法的定义：

~~~java
public native String intern();
~~~

大家可以看到这是一个native的方法。native底层肯定是C++实现的。

那么是不是native方法一定会比java方法快呢？

其实native方法有这样几个耗时点：

1. native方法需要调用JDK-JVM接口，实际上是会浪费时间的。
2. 性能会受到native方法中HashTable实现方法的制约，如果在高并发的情况下，native的HashTable的实现可能成为性能的制约因素。

## 举个例子

还是用JMH工具来进行性能分析，我们使用String.intern，HashMap，和ConcurrentHashMap来对比分析，分别调用1次，100次，10000次和1000000。

代码如下：

~~~java
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Fork(value = 1, jvmArgsPrepend = "-XX:+PrintStringTableStatistics")
@Warmup(iterations = 5)
@Measurement(iterations = 5)
public class StringInternBenchMark {

    @Param({"1", "100", "10000", "1000000"})
    private int size;

    private StringInterner str;
    private ConcurrentHashMapInterner chm;
    private HashMapInterner hm;

    @Setup
    public void setup() {
        str = new StringInterner();
        chm = new ConcurrentHashMapInterner();
        hm = new HashMapInterner();
    }

    public static class StringInterner {
        public String intern(String s) {
            return s.intern();
        }
    }

    @Benchmark
    public void useIntern(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(str.intern("doit" + c));
        }
    }

    public static class ConcurrentHashMapInterner {
        private final Map<String, String> map;

        public ConcurrentHashMapInterner() {
            map = new ConcurrentHashMap<>();
        }

        public String intern(String s) {
            String exist = map.putIfAbsent(s, s);
            return (exist == null) ? s : exist;
        }
    }

    @Benchmark
    public void useCurrentHashMap(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(chm.intern("doit" + c));
        }
    }

    public static class HashMapInterner {
        private final Map<String, String> map;

        public HashMapInterner() {
            map = new HashMap<>();
        }

        public String intern(String s) {
            String exist = map.putIfAbsent(s, s);
            return (exist == null) ? s : exist;
        }
    }

    @Benchmark
    public void useHashMap(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(hm.intern("doit" + c));
        }
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(StringInternBenchMark.class.getSimpleName())
                .build();
        new Runner(opt).run();
    }
}
~~~

输出结果：

~~~java
Benchmark                                 (size)  Mode  Cnt          Score          Error  Units
StringInternBenchMark.useCurrentHashMap        1  avgt    5         34.259 ±        7.191  ns/op
StringInternBenchMark.useCurrentHashMap      100  avgt    5       3623.834 ±      499.806  ns/op
StringInternBenchMark.useCurrentHashMap    10000  avgt    5     421010.654 ±    53760.218  ns/op
StringInternBenchMark.useCurrentHashMap  1000000  avgt    5   88403817.753 ± 12719402.380  ns/op
StringInternBenchMark.useHashMap               1  avgt    5         36.927 ±        6.751  ns/op
StringInternBenchMark.useHashMap             100  avgt    5       3329.498 ±      595.923  ns/op
StringInternBenchMark.useHashMap           10000  avgt    5     417959.200 ±    62853.828  ns/op
StringInternBenchMark.useHashMap         1000000  avgt    5   79347127.709 ±  9378196.176  ns/op
StringInternBenchMark.useIntern                1  avgt    5        161.598 ±        9.128  ns/op
StringInternBenchMark.useIntern              100  avgt    5      17211.037 ±      188.929  ns/op
StringInternBenchMark.useIntern            10000  avgt    5    1934203.794 ±   272954.183  ns/op
StringInternBenchMark.useIntern          1000000  avgt    5  418729928.200 ± 86876278.365  ns/op
~~~

从结果我们可以看到，intern要比其他的两个要慢。

所以native方法不一定快。intern的用处不是在于速度，而是在于节约Heap中的内存使用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

