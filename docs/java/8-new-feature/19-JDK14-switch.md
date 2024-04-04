---
slug: /JDK14-switch
---

# 19. JDK 14的新特性:switch表达式

# 简介

switch的新特性可是源远流长，早在JDK 12就以预览功能被引入了，最终在JDK 14成为了正式版本的功能：JEP 361: Switch Expressions (Standard)。

其实Switch新增的功能有两个，一个就是可以连写case，一个就是switch可以带返回值了。

# 写在前面

就在我兴致勃勃的想要创建一个以switch命名的package的时候，突然间发现在IDEA中居然创建不java类了。

经过我的再三尝试，反复改名，终于被我发现了隐藏在里面的小秘密：

java key word是不能被用在package名字中的。好吧，一直以来package的名字就那么多个，现在想创建一个拉风一点的，居然发现还有这样一个规则。

那么java key word有哪些呢？ 下面就是了。

![](https://img-blog.csdnimg.cn/20200427175928590.png)

# 连写case

先看一个老版本的例子：

~~~java
    @Test
    public void useOldSwitch(){
        switch (MONDAY) {
            case MONDAY:
            case FRIDAY:
            case SUNDAY:
                System.out.println(6);
                break;
            case TUESDAY:
                System.out.println(7);
                break;
            case THURSDAY:
            case SATURDAY:
                System.out.println(8);
                break;
            case WEDNESDAY:
                System.out.println(9);
                break;
        }
    }
~~~

上面的例子中，我们想要匹配所有的星期，然后打印出相应的结果。写了很多个case语句，不美观。

再看一下新版本的例子：

~~~java
    @Test
    public void useNewSwitch(){
        switch (MONDAY) {
            case MONDAY, FRIDAY, SUNDAY -> System.out.println(6);
            case TUESDAY                -> System.out.println(7);
            case THURSDAY, SATURDAY     -> System.out.println(8);
            case WEDNESDAY              -> System.out.println(9);
        }
    }
~~~

一个漂亮的连写，将一切都带走。 

> 注意这里switch语句没有返回值，所以并不需要default语句。

# switch返回值

考虑一个在switch中赋值的情况：

~~~java
    @Test
    public void oldSwitchWithReturnValue(){
        int numLetters;
        switch (MONDAY) {
            case MONDAY:
            case FRIDAY:
            case SUNDAY:
                numLetters = 6;
                break;
            case TUESDAY:
                numLetters = 7;
                break;
            case THURSDAY:
            case SATURDAY:
                numLetters = 8;
                break;
            case WEDNESDAY:
                numLetters = 9;
                break;
            default:
                throw new IllegalStateException("这天没发见人！");
        }
    }
~~~

传统方式我们需要定义一个局部变量，并在case中给这个局部变量赋值。

我们看下怎么使用新版的switch替换：

~~~java
    @Test
    public void newSwitchWithReturnValue(){
        int numLetters = switch (MONDAY) {
            case MONDAY, FRIDAY, SUNDAY -> 6;
            case TUESDAY                -> 7;
            case THURSDAY, SATURDAY     -> 8;
            case WEDNESDAY              -> 9;
            default -> throw new IllegalStateException("这天没发见人!");
        };
    }
~~~

是不是非常简单。

> 注意，这里需要一个default操作，否则会报编译错误。因为可能存在未遍历的值。

# yield

上面的switch返回值的情况，如果case后面的表达式比较复杂，那么就需要使用大括号来围起来。这种情况我们需要使用到yield来返回要返回的值。

~~~java
    @Test
    public void withYield(){
        int result = switch (MONDAY) {
            case MONDAY: {
                yield 1;
            }
            case TUESDAY: {
                yield 2;
            }
            default: {
                System.out.println("不是MONDAY，也不是TUESDAY！");
                yield 0;
            }
        };
    }
~~~

# 总结

本文介绍了JDK14中的switch新特性。也是唯一正式版本的新特性....

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)


