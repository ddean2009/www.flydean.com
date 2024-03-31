---
slug: /algorithm-radix-sort
---

# 7. 排序-基数排序

# 简介

之前的文章我们讲了count排序，但是count排序有个限制，因为count数组是有限的，如果数组中的元素范围过大，使用count排序是不现实的，其时间复杂度会膨胀。

而解决大范围的元素排序的办法就是基数排序。

# 基数排序的例子

什么是基数排序呢？

考虑一下，虽然我们不能直接将所有范围内的数字都使用count数组进行排序，但是我们可以考虑按数字的位数来进行n轮count排序，每一轮都只对数字的某一位进行排序。

最终仍然可以得到结果，并且还可以摆脱count数组大小的限制，这就是基数排序。

假如我们现在数组的元素是：1221, 15, 20, 3681, 277, 5420, 71, 1522, 4793。 

先看动画，看下最直观的基数排序的过程：

![](https://img-blog.csdnimg.cn/20200709234431411.gif)

在上面的例子中，我们先对个位进行count排序，然后对十位进行count排序，然后是百位和千位。

最后生成最终的排序结果。

# 基数排序的java代码实现

因为基数排序实际上是分别按位数的count排序。所以我们可以重用之前写的count排序的代码，只是需要进行一些改造。

doCountingSort方法除了传入数组外，还需要传入排序的位数digit，我们用1，10，100，1000来表示。

看一下改造过后的doCountingSort方法：

~~~java
   public void doRadixSort(int[] array, int digit){
        int n = array.length;

        // 存储排序过后的数组
        int output[] = new int[n];

        // count数组，用来存储统计各个元素出现的次数
        int count[] = new int[10];
        Arrays.fill(count,0);
        log.info("初始化count值:{}",count);

        // 将原始数组中数据出现次数存入count数组
        for (int i=0; i<n; ++i) {
            count[(array[i]/digit)%10]++;
        }
        log.info("count之后count值:{}",count);

        // 这里是一个小技巧，我们根据count中元素出现的次数计算对应元素第一次应该出现在output中的下标。
        //这里的下标是从右往左数的
        for (int i=1; i<10; i++) {
            count[i] += count[i - 1];
        }
        log.info("整理count对应的output下标:{}",count);
        // 根据count中的下标，构建排序后的数组
        //插入一个之后，相应的count下标要减一
        for (int i = n-1; i>=0; i--)
        {
            output[count[(array[i]/digit)%10]-1] = array[i];
            count[(array[i]/digit)%10]--;
        }
        log.info("构建output之后的output值:{}",output);

        //将排序后的数组写回原数组
        for (int i = 0; i<n; ++i)
            array[i] = output[i];
    }
~~~

跟count排序变化不大，区别就是这里我们需要使用count[(array[i]/digit)%10]，来对每一位进行排序。

另外，为了计算出位数digit的值，我们还需要拿到数组中最大元素的值：

~~~java
public int getMax(int[] array)
    {
        int mx = array[0];
        for (int i = 1; i < array.length; i++)
            if (array[i] > mx){
                mx = array[i];
            }
        return mx;
    }
~~~

看下怎么调用：

~~~java
    public static void main(String[] args) {
        int[] array= {1221, 15, 20, 3681, 277, 5420, 71, 1522, 4793};
        RadixSort radixSort=new RadixSort();
        log.info("radixSort之前的数组为:{}",array);
        //拿到数组的最大值，用于计算digit
        int max = radixSort.getMax(array);
        //根据位数，遍历进行count排序
        for (int digit = 1; max/digit > 0; digit *= 10){
            radixSort.doRadixSort(array,digit);
        }
    }
~~~

看下输出结果：

![](https://img-blog.csdnimg.cn/20200710085956449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

很好，结果都排序了。

# 基数排序的时间复杂度

从计算过程我们可以看出，基数排序的时间复杂度是O(d*(n+b)) ，其中b是数字的进制数，比如上面我们使用的是10进制，那么b=10。

d是需要循环的轮数，也就是数组中最大数的位数。假如数组中最大的数字用K表示，那么d=logb(k)。

综上，基数排序的时间复杂度是O((n+b) * logb(k))。

当k <= n<sup>c</sup>，其中c是常量时，上面的时间复杂度可以近似等于O(nLogb(n))。

考虑下当b=n的情况下，基数排序的时间复杂度可以近似等于线性时间复杂度O(n)。

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)




