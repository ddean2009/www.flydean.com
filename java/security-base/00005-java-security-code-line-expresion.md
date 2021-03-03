java安全编码指南之:表达式规则

# 简介

在java编写过程中，我们会使用到各种各样的表达式，在使用表达式的过程中，有哪些安全问题需要我们注意的呢？一起来看看吧。

# 注意表达式的返回值

我们在使用JDK库的时候，一定要注意认真的读一下JDK中方法的含义和它的返回值。

有些返回值可能表示这个操作是否成功，有的返回值可能是方法操作的结果。我们看两个常见的例子：

~~~java
    public void deleteFileWrong(){
        File file= new File("/tmp/www.flydean.com.txt");
        file.delete();
        System.out.println("File delete success!");
    }

    public void deleteFileRight(){
        File file= new File("/tmp/www.flydean.com.txt");
        if(file.delete()){
            System.out.println("File delete success!");
        }
    }
~~~

先看一个文件删除的例子，delete方法是有返回值的，所以我们在调用delete方法之后，一定要判断一下返回值，看是否删除成功。

再看一个常见的String中字符替换的例子：

~~~java
    public void stringReplaceWrong(){
        String url="www.flydean.com";
        url.replace("www","WWW");
        System.out.println("replaced url..."+url);
    }
    public void stringReplaceRight(){
        String url="www.flydean.com";
        url=url.replace("www","WWW");
        System.out.println("replaced url..."+url);
    }
~~~

我们要记住，String是不可变的，所以它的replace方法，会返回一个替换过后的String，但是原String是不变的，所以我们需要将返回值重新赋值。

# 注意避免NullPointerException

NullPointerException应该是最最常见的运行时异常了。怎么避免这个异常呢？

我们要做的就是在调用object的方法时候，一定要判断这个object是不是为空。

在JDK8之后，我们引入了Stream操作：

~~~java
    public void streamWrong(Collection<Object> collection){
        collection.stream().filter(obj->obj.equals("www.flydean.com"));
    }
~~~

Stream操作的过程中，我们需要注意stream中的元素是否为空。

有时候，我们可能觉得已经判断是为空了，但是条件判断不准确，导致未知的异常，看下面这个例子：

~~~java
    public int countWrong(Collection<Object> collection, Object object){
        int count=0;
        if(collection ==null){
            return count;
        }
        for(Object element: collection){
            if((element ==null && object== null)
                || element.equals(object)){
                count++;
            }
        }
        return count;
    }
~~~

这个例子是用来查找collection中到底有多少元素和object相同，如果两者都为空，也记为相同。

但是上面的例子有一个漏洞，它没有考虑element ==null 而 object ！=null的情况，所以会导致NullPointerException的生成。

我们需要这样修改：

~~~java
   public int countRight(Collection<Object> collection, Object object){
        int count=0;
        if(collection ==null){
            return count;
        }
        for(Object element: collection){
            if((element ==null && object== null)
                    || (element !=null && element.equals(object))){
                count++;
            }
        }
        return count;
    }
~~~

# 数组相等的判断

如果我们需要比较两个数组是否相等，其实我们想比较的是两个数组中的元素是否相等。

我们知道数组是一个特殊的Object，那么数组对象也有一个equals方法，考虑下面的例子：

~~~java
    public boolean compareWrong(){
        int[] array1 = new int[10];
        int[] array2 = new int[10];
        return array1.equals(array2);
    }
~~~

返回的结果是false，因为数组直接使用了Object中定义的equals方法，我们看下该方法的定义：

~~~java
    public boolean equals(Object obj) {
        return (this == obj);
    }
~~~

可以看到，该方法比较的是两个地址是否相等。所以我们的到了false结果。

其实，我们可以使用Arrays.equals工具类中的方法来进行两个数组的比较：

~~~java
    public boolean compareRight(){
        int[] array1 = new int[10];
        int[] array2 = new int[10];
        return Arrays.equals(array1, array2);
    }
~~~

# 基础类型的封装类间的比较

在java中，我们知道有一些基础类型像boolean, byte，char, short, int他们会有相对应的封装类型：Boolean，Byte，Character，Short，Integer等。

我们可以直接将基础类型的值赋值给封装类型，封装类型会自行进行转换。

考虑下面的例子：

~~~java
        Boolean boolA=true;
        Boolean boolB=true;
        System.out.println(boolA==boolB);
~~~

结果是多少呢？

答案是true。为什么两个不同对象的比较会是true呢？

在回答这个问题之前，我们看一下字符串的比较：

~~~java
        String stringA="www.flydean.com";
        String stringB="www.flydean.com";
        System.out.println(stringA==stringB);
~~~

这个我们大家应该都知道，因为String有一个字符串常量池，直接从字符串常量构建的String对象，其实是同一个对象。

同样的对于Boolean和Byte来说，如果直接从基础类值构建的话，也是同一个对象。

而对于Character来说，如果值的范围在\u0000 to \u007f，则属于同一个对象，如果超出了这个范围，则是不同的对象。

对于Integer和Short来说，如果值的范围在-128 and 127，则属于同一个对象，如果超出了这个范围，则是不同的对象。

再考虑下面的例子：

~~~java
Boolean boolA=true;
Boolean boolC=new Boolean(true);
System.out.println(boolA==boolC);
~~~

输出的结果是false，因为boolC使用了new关键字，构建了一个新的对象。

# 集合中类型不匹配

现在java集合可以通过指定类型，从而只存储特定类型的对象。考虑下面的一个例子：

~~~java
    public void typeMismatch(){
        HashSet<Short> shortSet= new HashSet<>();
        for(int i=0;i<10;i++){
            shortSet.add((short)i);
            shortSet.remove(i);
        }
        System.out.println(shortSet.size());
    }
~~~

上面代码我们定义了一个Short的集合，然后将0-9添加进去，接着我们又调用了remove方法把i从集合删除。

但是最后输出结果是10，表明我们并没有删除成功。为什么呢？

看下HashSet的remove方法：

~~~java
    public boolean remove(Object o) {
        return map.remove(o)==PRESENT;
    }
~~~

remove方法的参数是Object，我们传入的i是int类型的，跟short不匹配，所以导致删除失败。

我们需要这样修改：

~~~java
    public void typeMatch(){
        HashSet<Short> shortSet= new HashSet<>();
        for(int i=0;i<10;i++){
            shortSet.add((short)i);
            shortSet.remove((short)i);
        }
        System.out.println(shortSet.size());
    }
~~~

# Asset的副作用

我们会使用Asset语句在代码中做调试使用，在使用的过程中需要注意Asset语句不要对系统的业务逻辑产生副作用，也就是说即使Asset语句不运行，也不会修改代码的业务逻辑。

看下面的例子：

~~~java
    public void assetWrong(ArrayList<Integer> list){
        assert  list.remove(0)>0;
    }
~~~

上的代码我们从list中删除第一个元素，并判断删除的元素是否大于0.

上面的代码如果assert语句不执行的话，会导致业务逻辑也不执行，所以需要修改成下面这样：

~~~java
    public void assetRight(ArrayList<Integer> list){
        int result=list.remove(0);
        assert  result>0;
    }
~~~

本文的例子：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)

