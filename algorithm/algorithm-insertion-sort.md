看动画学算法之:排序-插入排序

# 简介

插入排序就是将要排序的元素插入到已经排序的数组中，从而形成一个新的排好序的数组。

这个算法就叫做插入排序。

# 插入排序的例子

同样的，假如我们有一个数组：29,10,14,37,20,25,44,15，怎么对它进行插入排序呢？

先看一个插入排序的动画，对它有个直观的了解：

![](https://img-blog.csdnimg.cn/20200708225626590.gif)

我们来分析一下排序的流程。

八个数字，我们分为7轮。

第一轮，假设29是已经排好序的数组，从第二个元素开始，向排好序的数组插入新的元素。 也就是说向数组[29]插入10。得到[10,29]。

第二轮，[10,29]已经排好序了，选择数组中的第三个元素14，插入排好序的数组[10,29]。

先将29和14比较，发现29>14,则将29右移一位[10, ,29],然后比较10和14，发现10小于14，那么将14插入10后面[10,14,29]，以此类推。

# 插入排序的java程序

我们看下java程序怎么写：

~~~java
public class InsertionSort {

    public void doInsertSort(int[] array){
        log.info("排序前的数组为:{}",array);
        int n = array.length;
        //从第二个元素开始插入
        for (int i = 1; i < n; ++i) {
            int key = array[i];
            int j = i - 1;
            //j表示的是要插入元素之前的已经排好序的数组
            //已经排好序的数组，从后向前和要插入的数据比较，如果比要插入的数据大，需要右移一位
            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                    j = j - 1;
            }
            //最后的j+1的位置就是需要插入新元素的位置
            array[j + 1] = key;
            log.info("第{}轮排序后的数组为:{}", i+1, array);
        }

    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        InsertionSort insertionSort=new InsertionSort();
        insertionSort.doInsertSort(array);
    }
}
~~~

运行结果：

![](https://img-blog.csdnimg.cn/20200708225733188.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

# 插入排序的时间复杂度

从代码中我们可以看到，插入排序有一个for循环，在for循环中还有一个while循环。

所以插入排序的时间复杂度也是O(n²)。

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)


