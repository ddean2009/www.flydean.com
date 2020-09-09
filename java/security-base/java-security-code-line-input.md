java安全编码指南之:输入校验

# 简介

为了保证java程序的安全，任何外部用户的输入我们都认为是可能有恶意攻击意图，我们需要对所有的用户输入都进行一定程度的校验。

本文将带领大家探讨一下用户输入校验的一些场景。一起来看看吧。

# 在字符串标准化之后进行校验

通常我们在进行字符串校验的时候需要对一些特殊字符进行过滤，过滤之后再进行字符串的校验。

我们知道在java中字符是基于Unicode进行编码的。但是在Unicode中，同一个字符可能有不同的表示形式。所以我们需要对字符进行标准化。

java中有一个专门的类Normalizer来负责处理，字符标准化的问题。

我们看下面一个例子：

~~~java
    public void testNormalizer(){
        System.out.println(Normalizer.normalize("\u00C1", Normalizer.Form.NFKC));
        System.out.println(Normalizer.normalize("\u0041\u0301", Normalizer.Form.NFKC));
    }
~~~

输出结果：

~~~java
Á
Á
~~~

我们可以看到，虽然两者的Unicode不一样，但是最终表示的字符是一样的。所以我们在进行字符验证的时候，一定要先进行normalize处理。

考虑下面的例子：

~~~java
    public void falseNormalize(){
        String s = "\uFE64" + "script" + "\uFE65";
        Pattern pattern = Pattern.compile("[<>]"); // 检查是否有尖括号
        Matcher matcher = pattern.matcher(s);
        if (matcher.find()) {
            throw new IllegalStateException();
        }
        s = Normalizer.normalize(s, Normalizer.Form.NFKC);
    }
~~~

其中\uFE64表示的是&lt;,而\uFE65表示的是>,程序的本意是判断输入的字符串是否包含了尖括号，但是因为直接传入的是unicode字符，所以直接compile是检测不到的。

我们需要对代码进行下面的改动：

~~~java
    public void trueNormalize(){
        String s = "\uFE64" + "script" + "\uFE65";
        s = Normalizer.normalize(s, Normalizer.Form.NFKC);
        Pattern pattern = Pattern.compile("[<>]"); // 检查是否有尖括号
        Matcher matcher = pattern.matcher(s);
        if (matcher.find()) {
            throw new IllegalStateException();
        }
    }
~~~

先进行normalize操作，然后再进行字符验证。

# 注意不可信字符串的格式化

我们经常会使用到格式化来对字符串进行格式化，在格式化的时候如果格式化字符串里面带有用户输入信息，那么我们就要注意了。

看下面的例子：

~~~java
    public void wrongFormat(){
        Calendar c = new GregorianCalendar(2020, GregorianCalendar.JULY, 27);
        String input=" %1$tm";
        System.out.format(input + " 时间不匹配，应该是某个月的第 %1$terd 天", c);
    }
~~~

粗看一下没什么问题，但是我们的input中包含了格式化信息，最后输出结果：

~~~java
 07 时间不匹配，应该是某个月的第 27rd 天
~~~

变相的，我们获取到了系统内部的信息，在某些情况下面，可能会暴露系统的内部逻辑。

上面的例子我们应该将input也作为一个参数，如下所示：

~~~java
    public void rightFormat(){
        Calendar c = new GregorianCalendar(2020, GregorianCalendar.JULY, 27);
        String input=" %1$tm";
        System.out.format("%s 时间不匹配，应该是某个月的第 %terd 天",input, c);
    }
~~~

输出结果：

~~~java
 %1$tm 时间不匹配，应该是某个月的第 27rd 天
~~~

# 小心使用Runtime.exec()

我们知道Runtime.exec()使用来调用系统命令的，如果有恶意的用户调用了“rm -rf /”,一切的一切都完蛋了。

所以，我们在调用Runtime.exec()的时候，一定要小心注意检测用户的输入。

看下面的一个例子：

~~~java
    public void wrongExec() throws IOException {
        String dir = System.getProperty("dir");
        Runtime rt = Runtime.getRuntime();
        Process proc = rt.exec(new String[] {"sh", "-c", "ls " + dir});
    }
~~~

上面的例子中，我们从系统属性中读取dir，然后执行了系统的ls命令来查看dir中的内容。

如果有恶意用户给dir赋值成：

~~~java
/usr & rm -rf /
~~~

那么系统实际上执行的命令就是：

~~~java
sh -c 'ls /usr & rm -rf /'
~~~

从而导致恶意的删除。

解决上面的问题也有几个方法，第一个方法就是对输入做个校验，比如我们只运行dir包含特定的字符：

~~~java
    public void correctExec1() throws IOException {
        String dir = System.getProperty("dir");
        if (!Pattern.matches("[0-9A-Za-z@.]+", dir)) {
            // Handle error
        }
        Runtime rt = Runtime.getRuntime();
        Process proc = rt.exec(new String[] {"sh", "-c", "ls " + dir});
    }
~~~

第二种方法就是使用switch语句，限定特定的输入：

~~~java
    public void correctExec2(){
        String dir = System.getProperty("dir");
        switch (dir){
            case "/usr":
                System.out.println("/usr");
                break;
            case "/local":
                System.out.println("/local");
                break;
            default:
                break;
        }
    }
~~~

还有一种就是不使用Runtime.exec()方法，而是使用java自带的方法。

# 正则表达式的匹配

在正则表达式的构建过程中，如果使用用户自定义输入，同样的也需要进行输入校验。

考虑下面的正则表达式：

~~~java
(.*? +public\[\d+\] +.*<SEARCHTEXT>.*)
~~~

上面的表达式本意是想在public[1234]这样的日志信息中，搜索用户的输入。

但是用户实际上可以输入下面的信息：

~~~java
.*)|(.*
~~~

最终导致正则表达式变成下面的样子：

~~~java
(.*? +public\[\d+\] +.*.*)|(.*.*)
~~~

从而导致匹配所有的日志信息。

解决方法也有两个，一个是使用白名单，判断用户的输入。一个是使用Pattern.quote()来对恶意字符进行转义。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！





