---
slug: /wordcount-in-one-line
---

# 15. 巧用HashMap一行代码统计单词出现次数

# 简介

JDK是在一直在迭代更新的，很多我们熟悉的类也悄悄的添加了一些新的方法特性。比如我们最常用的HashMap。

今天给大家讲一下HashMap在JDK8中添加的两个新方法compute和merge，从而实现一行代码实现单词统计的功能。一起来看看吧。

# 爱在JDK8之前

JDK8为我们引入了很多非常非常有用新特性，比如Stream和lambda表达式，可以让我们的程序更加简洁。

如果我们需要统计一个数组中单词出现的次数该怎么做呢？

这里不是讲算法，所以可以直接使用HashMap：

~~~java
public void countBefore8(){
        Map<String,Integer> wordCount=  new HashMap<>();
        String[] wordArray= new String[]{"we","are","the","world","we"};
        for(String word: wordArray){
            //如果存在则加1，否则将值设置为1
            if(wordCount.containsKey(word)) {
                wordCount.put(word, wordCount.get(word) + 1);
            }else{
                wordCount.put(word, 1);
            }
        }
    }
~~~

基本上流程是上面样子的。我们对数组进行遍历，然后判断这个单词是否存在于hashMap中，如果存在则+1。

逻辑很简单，但是看起来有些臃肿。

别怕，我们有JDK8。

# JDK8中使用compute

先看下JDK8中compute的定义：

~~~java
default V compute(K key,
            BiFunction<? super K, ? super V, ? extends V> remappingFunction) {
        Objects.requireNonNull(remappingFunction);
        V oldValue = get(key);

        V newValue = remappingFunction.apply(key, oldValue);
        if (newValue == null) {
            // delete mapping
            if (oldValue != null || containsKey(key)) {
                // something to remove
                remove(key);
                return null;
            } else {
                // nothing to do. Leave things as they were.
                return null;
            }
        } else {
            // add or replace old mapping
            put(key, newValue);
            return newValue;
        }
    }
~~~

可以看到compute有第二个参数BiFunction，BiFunction就是一个函数，输入两个参数，返回一个参数。

BiFunction的两个参数分别是key和key所对应的oldValue。

可考虑到我们的单词统计，我们可以直接将oldValue+1 即可。所以使用compute，可以将方法改写为：

~~~java
public void countAfter8WithCompute(){
        Map<String,Integer> wordCount=  new HashMap<>();
        String[] wordArray= new String[]{"we","are","the","world","we"};
        Arrays.asList(wordArray).forEach(word ->{
            wordCount.putIfAbsent(word,0);
            wordCount.compute(word,(w,count)->count+1);
        });
    }
~~~

当然，我们可以将putIfAbsent放到compute中：

~~~java
public void countAfter8WithCompute2(){
        Map<String,Integer> wordCount=  new HashMap<>();
        String[] wordArray= new String[]{"we","are","the","world","we"};
        Arrays.asList(wordArray).forEach(word -> wordCount.compute(word,(w, count)->count == null ? 1 : count + 1));
    }
~~~

一行代码就完成了。

# JDK8中使用merge

再看看merge方法：

~~~java
default V merge(K key, V value,
            BiFunction<? super V, ? super V, ? extends V> remappingFunction) {
        Objects.requireNonNull(remappingFunction);
        Objects.requireNonNull(value);
        V oldValue = get(key);
        V newValue = (oldValue == null) ? value :
                   remappingFunction.apply(oldValue, value);
        if (newValue == null) {
            remove(key);
        } else {
            put(key, newValue);
        }
        return newValue;
    }
~~~

merge方法需要3个参数，第一个参数是key，第二个参数是key对应的oldValue为空的值，也就是为空的默认值，第三个参数是一个BiFunction参数。

不同的是BiFunction的第一个参数是oldValue，第二个参数是value。

生成newValue的逻辑是：如果oldValue不存在，则使用value。如果oldValue存在，则调用BiFunction对oldValue和Value进行合并。

我们可以写出相应的代码如下：

~~~java
 public void countAfter8WithMerge(){
        Map<String,Integer> wordCount=  new HashMap<>();
        String[] wordArray= new String[]{"we","are","the","world","we"};
        Arrays.asList(wordArray).forEach(word->wordCount.merge(word, 1, (oldCount, one) -> oldCount + one));
    }
~~~

后面的函数可以用Integer::sum替代：

~~~java
 public void countAfter8WithMerge(){
        Map<String,Integer> wordCount=  new HashMap<>();
        String[] wordArray= new String[]{"we","are","the","world","we"};
        Arrays.asList(wordArray).forEach(word->wordCount.merge(word, 1, Integer::sum));
    }
~~~

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/java-base](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/java-base)






