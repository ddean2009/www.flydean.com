---
slug: /duration-period-ChronoUnit
---

# 5. JDK8中的新时间API:Duration Period和ChronoUnit介绍

# 简介

在JDK8中，引入了三个非常有用的时间相关的API：Duration，Period和ChronoUnit。

他们都是用来对时间进行统计的，本文将会详细讲解一下这三个API的使用。

# Duration

Duration主要用来衡量秒级和纳秒级的时间，使用于时间精度要求比较高的情况。

先来看看Duration的定义：

~~~java
public final class Duration
        implements TemporalAmount, Comparable<Duration>, Serializable
~~~

可以看到，Duration是一个final class，并且它是可序列化和可比较的。我们注意，Duration还实现了TemporalAmount接口。

那么TemporalAmount接口是什么呢？

TemporalAmount是Duration和Period的父接口。

![](https://img-blog.csdnimg.cn/20200902104648163.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

它定义了4个必须要实现的方法：

~~~java
long get(TemporalUnit unit);
List<TemporalUnit> getUnits();
Temporal addTo(Temporal temporal);
Temporal subtractFrom(Temporal temporal);
~~~

其中TemporalUnit代表的是时间对象的单位，比如：years, months, days, hours, minutes 和 seconds.
而Temporal代表的是对时间对象的读写操作。

我们看下Duration的一些基本操作：

~~~java
        Instant start = Instant.parse("2020-08-03T10:15:30.00Z");
        Instant end = Instant.parse("2020-08-03T10:16:30.12Z");
        Duration duration = Duration.between(start, end);
        log.info("{}",duration.getSeconds());
        log.info("{}",duration.getNano());
        log.info("{}",duration.getUnits());
~~~

上面我们创建了两个Instant，然后使用Duration.between方法来测算他们之间的差异。

其中秒部分的差异，使用duration.getSeconds()来获取，而秒以下精度部分的差异，我们使用duration.getNano()来获取。

最后我们使用duration.getUnits()来看一下duration支持的TemporalUnit（时间单位）。

看下执行结果：

~~~java
 INFO com.flydean.time - 60
 INFO com.flydean.time - 120000000
 INFO com.flydean.time - [Seconds, Nanos]
~~~

除了Instance，我们还可以使用LocalTime：

~~~java
        LocalTime start2 = LocalTime.of(1, 20, 25, 1314);
        LocalTime end2 = LocalTime.of(3, 22, 27, 1516);
        Duration.between(start2, end2).getSeconds();
~~~

我们还可以对Duration做plus和minus操作，并且通过使用isNegative来判断两个时间的先后顺序：

~~~java
duration.plusSeconds(60);
duration.minus(30, ChronoUnit.SECONDS);
log.info("{}",duration.isNegative());
~~~

除此之外，我们方便的使用Duration.of方法来方便的创建Duration：

~~~java
Duration fromDays = Duration.ofDays(1);
Duration fromMinutes = Duration.ofMinutes(60);
~~~

# Period

Period的单位是year, month 和day 。

操作基本上和Duration是一致的。

先看下定义：

~~~java
public final class Period
        implements ChronoPeriod, Serializable 
~~~

其中ChronoPeriod是TemporalAmount的子接口。

同样的，我们可以使用Period.between从LocalDate来构建Period：

~~~java
        LocalDate startDate = LocalDate.of(2020, 2, 20);
        LocalDate endDate = LocalDate.of(2021, 1, 15);

        Period period = Period.between(startDate, endDate);
        log.info("{}",period.getDays());
        log.info("{}",period.getMonths());
        log.info("{}",period.getYears());
~~~

也可以直接从Period.of来构建：

~~~java
Period fromUnits = Period.of(3, 10, 10);
        Period fromDays = Period.ofDays(50);
        Period fromMonths = Period.ofMonths(5);
        Period fromYears = Period.ofYears(10);
        Period fromWeeks = Period.ofWeeks(40);
~~~

最后我们还可以使用plus或者minus的操作：

~~~java
period.plusDays(50);
period.minusMonths(2);
~~~

# ChronoUnit

ChronoUnit是用来表示时间单位的，但是也提供了一些非常有用的between方法来计算两个时间的差值：

~~~java
        LocalDate startDate = LocalDate.of(2020, 2, 20);
        LocalDate endDate = LocalDate.of(2021, 1, 15);
        long years = ChronoUnit.YEARS.between(startDate, endDate);
        long months = ChronoUnit.MONTHS.between(startDate, endDate);
        long weeks = ChronoUnit.WEEKS.between(startDate, endDate);
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        long hours = ChronoUnit.HOURS.between(startDate, endDate);
        long minutes = ChronoUnit.MINUTES.between(startDate, endDate);
        long seconds = ChronoUnit.SECONDS.between(startDate, endDate);
        long milis = ChronoUnit.MILLIS.between(startDate, endDate);
        long nano = ChronoUnit.NANOS.between(startDate, endDate);
~~~

本文的例子: [learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/java-base)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！












