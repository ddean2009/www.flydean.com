JDK 14的新特性:文本块Text Blocks

说起来，Text Blocks是在JDK13中以第一次预览版本引入的。现在在JDK14中是第二次预览版本 JEP 368: Text Blocks。

在我们日常的工作中，有时候需要用到一大段的字符串，这些字符串需要换行，需要排版，需要转义。在一个文本编辑器中，这当然是非常容易的事情。但是在java代码中，就是一个噩梦了。

虽然IDE可以自动帮我们加上换行甚至可以对字符串进行拼接。但在java程序眼中，添加的诸多额外的代码破坏了代码的美感。是任何一个有洁癖的程序员都无法忍受的。

怎么办？ Text Blocks就是来解救大家的。

# 举个例子

我们先来个直观的例子，然后再分析Text Blocks的特点。

还是举HTML的例子,如果我们想要打印出带缩减，有格式的html，传统方法可以这样做：

~~~java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
~~~

上面的代码看着特别别扭，让我们看看用文本块方式怎么做：

~~~java
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
~~~

是不是清爽很多，想要立即给文本块点个赞。

别慌点赞，我们还有更多的东西要讨论。

#  Indentation编排

可能有人又有问题了，文本块好用是好用，你这输出结果中，字段前面的空格都去哪了了呀？

这里就要介绍这个概念了：英文名字叫Indentation，中文我把它翻译为编排。

再看一下上面的代码，这一次我们把代码前面的空格以点来表示：

~~~java
String html = """
..............<html>
..............    <body>
..............        <p>Hello, world</p>
..............    </body>
..............</html>
..............""";
~~~

Indentation的规则就是以最下面的“”“为界，对每一行都移除相同数量的空格。

上面的代码输出：

~~~java
<html>
    <body>
        <p>Hello, world</p>
    </body>
</html>
~~~

上面的例子，最下面的”“”刚好在最左边的位置，如果把“”“向右移动4个空格会发生什么呢？

~~~java
String html = """
..............<html>
..............    <body>
..............        <p>Hello, world</p>
..............    </body>
..............</html>
..................""";
~~~

输出结果：

~~~java
<html>
    <body>
        <p>Hello, world</p>
    </body>
</html>
~~~

我们看到输出结果是不变的，这样我们又得到一条结论：如果”“”向右移动，则以text block中最左的那一行记录为准。

如果我们把“”“向左移动四位，就会发现最终的输出结果每行前面都有四个空格。

这个功能是和String添加的新的String::stripIndent()对于的。

# Escaping转义

还是看一个直观的例子：

~~~java
    @Test
    public void useEscape(){
        String code =
                """
                "
                ""
                \s\s\s\s\s保留这行前面的空白
                String text = \"""
                    这里展示的是escape的用法！
                \""";
                跟大家说个密码，这一行很长，我准备分行\
                来写，哈哈！
                """;
        log.info("{}",code);
    }
~~~

输出结果：

~~~java
”
""
     保留这行前面的空白
String text = """
    这里展示的是escape的用法！
""";
跟大家说个密码，这一行很长，我准备分行来写，哈哈！
~~~

首先可以看到一个双引号和两个双引号都是不用转义的，直接写就行了。三个双引号就需要转义了。

另外\s表示的是一个空格。在需要的时候可以使用。

在一行结尾直接插入\，表示这一行太长了，还没结束。

> 注意在Text Block中，不管是windows的回车，换行符还是linux的换行符都会转义成为换行符。

这个转义功能也对于了String的新方法translateEscapes()。

# formatted格式化

最后介绍一下Text block的格式化，和String的格式化是一样的，举个SQL的例子:

~~~java
    @Test
    public void useMethod(){
        String query1 = """
                SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
                WHERE `CITY` = '%s'
                ORDER BY `EMP_ID`, `LAST_NAME`;
                """;

        log.info(query1.formatted("我是一个参数"));
    }
~~~

输出结果：

~~~java
SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
WHERE `CITY` = '我是一个参数'
ORDER BY `EMP_ID`, `LAST_NAME`;
~~~

上面的例子中，我们使用%s来定义占位符。

# 总结

虽然Text Block好用，但可惜还是预览版本，正式版本可能要等JDK15了。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)







