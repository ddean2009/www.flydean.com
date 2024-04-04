---
slug: /difference-in-sql
---

# 从印度兵力分布聊聊Mybatis中#和$的区别

# 简介

大家在使用Mybatis的过程中可能都会自己去写SQL语句，并且需要向SQL语句传入参数。

但是在Mybatis中，传参的语法有两种，#{name} 和 ${name},两者有什么区别呢？一起来看看吧。

# 举个例子

最近印度比较嚣张，频繁挑起边境冲突，那么印度是不是这么有底气呢？

我们看一下印度的兵力分布表：

![](https://img-blog.csdnimg.cn/20200620082627764.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

其实印度军队还是挺强大的，是南亚的顶级军事强国。他拥有世界第三规模的现役部队，并且其陆军规模是世界第二。

印度是世界最大的武器进口国，进口当然有利有弊，弊端就是本国的武器研发实力不强。当然印度是世界上少数拥有核武器的国家。

# 查询举例

好了，有了印度的兵力分布表之后，我们怎么在mybatis中编写sql语句通过编号来查询印度的兵力分布呢？

~~~xml
  <select id="getIndiaTroopsById" resultType="com.flydean.IndiaTroop">
    select * from troops t
    where  t.id =#{id}
  </select>
~~~

大家一般都会像上面那样编写查询sql语句。

上面我们使用了#{id}作为传递的参数。那么#{id}有什么特点呢？

# #{id}的特点

首先，#{id}表示传递过来的id是String格式的，比如我传递过来的id=2，那么sql语句将会被解析为：

~~~sql
select * from troops t where t.id = '2'
~~~

第二，#{id}是会经过预编译的，也就是说上面的sql语句会会动态解析成一个参数标记符?：

~~~java
select * from troops t where t.id = ？
~~~

然后才进行参数替换。预编译有什么好处呢？

预编译的好处就是可以防止SQL注入。

# ${id}的特点

首先${id}不会进行预编译，传入是什么就被替换成什么。所以有SQL注入的危险。

还是上面的例子，如果我们使用${id}：

~~~xml
  <select id="getIndiaTroopsById" resultType="com.flydean.IndiaTroop">
    select * from troops t
    where  t.id =${id}
  </select>
~~~

如果我们传入参数2，那么相应的sql语句就是：

~~~sql
select * from troops t where t.id = 2
~~~

第二，${id}是取值之后再进行编译，无法防止SQL注入。

# 总结

我们总结一下这两个传参的不同使用场景：

${id}般用于传入数据库对象，例如传入表名。 

能用#的时候就不要用$。


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！






