---
slug: /algorithm-bubble-sort
---

# 1. 排序-冒泡排序

# 简介

排序可能是所有的算法中最最基础和最最常用的了。排序是一个非常经典的问题，它以一定的顺序对一个数组（或一个列表）中的项进行重新排序。

排序算法有很多种，每个都有其自身的优点和局限性。

今天我们来学习最最简单的冒泡排序算法。

# 冒泡排序的原理

冒泡排序的原理很简单，我们想象一下一个一个的气泡上浮的过程。

假设我们有八个数字 29,10,14,37,20,25,44,15 要进行排序。

我们先用一个动画图来直观的观察一下整个冒泡排序的过程：

![](https://img-blog.csdnimg.cn/20200708155735461.gif)

排序共进行八轮，每一轮都会做两两比较，并将较大的元素右移，就像冒泡一下。

一轮结束之后，八个元素中最大的那个元素44将会移动到最右边。

然后再重复其他的几轮。最终得到一个完全排序的数组。

也可以这样看：

第一轮是将八个元素中的最大值44交换移动到最右位置。
第二轮是将八个元素中的次大值37交换移动到最右位置。
以此类推。

# 冒泡排序算法的java实现

我们先看一个最简单的冒泡算法：

~~~java
public class BubbleSort {

    public void doBubbleSort(int[] array){
        log.info("排序前的数组为:{}",array);
        //外层循环,遍历所有轮数
        for(int i=0; i< array.length-1; i++){
            //内层循环，两两比较，选中较大的数字，进行交换
            for(int j=0; j<array.length-1; j++){
                if(array[j]>array[j+1]){
                    //交换两个数字
                    int temp = array[j];
                    array[j] = array[j+1];
                    array[j+1] = temp;
                }
            }
            log.info("第{}轮排序后的数组为:{}", i+1, array);
        }
    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        BubbleSort bubbleSort=new BubbleSort();
        bubbleSort.doBubbleSort(array);
    }

}
~~~

这个算法就是两层遍历，外层遍历表示的是进行的轮数。内层遍历表示的是每一轮的排序。

我们看下输出结果：

![](https://img-blog.csdnimg.cn/2020070816421585.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

# 冒泡算法的第一次改进

分析上面的遍历过程，我们可以发现，第一次排序之后，44已经放到最右边的位置了，已经排好序了。

第二次排序之后，37也已经排好序了。每过一轮，内部循环需要比较的次数就可以减一。

这就意味着，在内部循环的时候，我们只需要进行array.length-i-1次比较就可以了。

修改代码如下：

~~~java
public class BubbleSort1 {

    public void doBubbleSort(int[] array){
        log.info("排序前的数组为:{}",array);
        //外层循环,遍历所有轮数
        for(int i=0; i< array.length-1; i++){
            //内层循环，两两比较，选中较大的数字，进行交换, 最后的i个数字已经排完序了，不需要再进行比较
            for(int j=0; j<array.length-i-1; j++){
                if(array[j]>array[j+1]){
                    //交换两个数字
                    int temp = array[j];
                    array[j] = array[j+1];
                    array[j+1] = temp;
                }
            }
            log.info("第{}轮排序后的数组为:{}", i+1, array);
        }
    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        BubbleSort1 bubbleSort=new BubbleSort1();
        bubbleSort.doBubbleSort(array);
    }

}
~~~

运行结果：

![](https://img-blog.csdnimg.cn/20200708164629451.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

可以看到运行结果其实没什么不同，只不过我们少做了几次比较。

# 冒泡算法的第二次改进

从上面的结果，我们可以看到实际上第5轮排序过后就已经排序完成了。但是我们仍然进行了第6，7次排序。

有没有什么办法可以判断排序是不是已经完成了呢？

我们考虑一下，在内部循环中，我们是进行两两比较，然后交换位置。

如果在某一次遍历中，没有进行交互，这就意味着排序已经完成了。

所以我们可以再引入一个flag来做判断。

~~~java
public class BubbleSort2 {

    public void doBubbleSort(int[] array){
        log.info("排序前的数组为:{}",array);
        //外层循环,遍历所有轮数
        for(int i=0; i< array.length-1; i++){
            //添加一个flag，如果这一轮都没有排序，说明排序已经结束，可以提前退出
            boolean flag=false;
            //内层循环，两两比较，选中较大的数字，进行交换, 最后的i个数字已经排完序了，不需要再进行比较
            for(int j=0; j<array.length-i-1; j++){
                if(array[j]>array[j+1]){
                    //交换两个数字
                    int temp = array[j];
                    array[j] = array[j+1];
                    array[j+1] = temp;
                    flag = true;
                }
            }
            log.info("第{}轮排序后的数组为:{}", i+1, array);
            if(!flag)
            {
                log.info("本轮未发生排序变化，排序结束");
                return;
            }
        }
    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        BubbleSort2 bubbleSort=new BubbleSort2();
        bubbleSort.doBubbleSort(array);
    }

}
~~~

运行结果如下：

![](https://img-blog.csdnimg.cn/20200708165143914.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

从结果我们可以看到少了一轮排序，提升了速度。

# 冒泡排序的时间复杂度

虽然我们可以在冒泡的时候进行一些性能优化，但是基本上还是要进行嵌套的两次遍历。遍历次数近似的=n*n，所以冒泡排序算法的时间复杂度是O(n²)。

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！   




