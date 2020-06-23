JDK12的新特性:CompactNumberFormat

# 简介

JDK12引入了新的格式化数字的类叫做CompactNumberFormat。主要方便我们对很长的数字进行简写。比如1000可以简写为1K或者1 thousand。

本文将会讲解CompactNumberFormat的基本构成和使用方法，最后在实际的例子中结束文章的讲解。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# CompactNumberFormat详解

CompactNumberFormat做为格式化数字的一部分是NumberFormat的子类。作用就是将数字进行格式化。要想构建一个CompactNumberFormat，最简单的办法就是使用NumberFormat.getCompactNumberInstance方法了。

下面是该方法的定义：

~~~java
    public static NumberFormat getCompactNumberInstance(Locale locale,
            NumberFormat.Style formatStyle)
~~~

方法需要传入两个参数：Locale和Style。

**Locale**

Locale代表着本地语言特性，比如在US locale中，10000可以表示为“10K”，而在China locale中，10000中就变成了“1万”。

**Style**

Style有两种类型，short和long。比如说10000的short表示是“10K”，而它的long表示是“10 thousand”。

JDK已经为我们自定义了很多种内置的Compact实现，我们可以直接使用：

~~~java
@Test
    public void testCompactNumberFormat(){
        NumberFormat fmtShort = NumberFormat.getCompactNumberInstance(
                Locale.US, NumberFormat.Style.SHORT);

        NumberFormat fmtLong = NumberFormat.getCompactNumberInstance(
                Locale.US, NumberFormat.Style.LONG);

        log.info(fmtShort.format(312));
        log.info(fmtShort.format(3123));
        log.info(fmtShort.format(31234));

        log.info(fmtLong.format(312));
        log.info(fmtLong.format(3123));
        log.info(fmtLong.format(31234));
    }
~~~

输出结果：

~~~java
 312
 3K
 31K

 312
 3 thousand
 31 thousand
~~~

# 自定义CompactNumberFormat

除了使用NumberFormat工具类之外，我们还可以自定义CompactNumberFormat。

先看下CompactNumberFormat的定义：

~~~java
public CompactNumberFormat(String decimalPattern,
DecimalFormatSymbols symbols, String[] compactPatterns)
~~~

~~~java
public CompactNumberFormat(String decimalPattern,
DecimalFormatSymbols symbols, String[] compactPatterns,
String pluralRules)
~~~

CompactNumberFormat可以接受3个或者4个参数的构造函数。

其中decimalPattern和symbols是用来正常解析数字的，compactPatterns则是用来生成缩写。pluralRules表示的是复数规则。

~~~java
@Test
    public void useCustom(){
         String[] compactPatterns
                = {"", "", "", "0千", "0万", "00万", "0百万", "0千万", "0亿",
                "00亿", "0百亿", "0千亿", "0兆", "00兆", "000兆"};

         DecimalFormat decimalFormat = (DecimalFormat)
                NumberFormat.getNumberInstance(Locale.CHINA);

         CompactNumberFormat format
                = new CompactNumberFormat( decimalFormat.toPattern(),
                decimalFormat.getDecimalFormatSymbols(),
                compactPatterns);

        log.info(format.format(312340000));
    }
~~~

上面是一个我们自定义的缩写规则。

输出结果：

~~~java
3亿
~~~

# 解析CompactNumber

能生成自然也能够解析，我们看一个解析的例子：

~~~java
    @Test
    public void testParse() throws ParseException {
        NumberFormat fmtLong = NumberFormat.getCompactNumberInstance(
                Locale.US, NumberFormat.Style.LONG);
        log.info(String.valueOf(fmtLong.parse("3 thousand")));
    }
~~~

输出结果：

~~~java
3000
~~~

# 总结

本文介绍了JDK12中引入的新的CompactNumberFormat类，希望大家能够喜欢。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/
learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)

