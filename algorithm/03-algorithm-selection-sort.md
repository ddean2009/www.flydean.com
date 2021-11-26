看动画学算法之:排序-选择排序

# 简介

选择排序就是从数组中选择出来最大或者最小的元素，然后将其和队首或者队尾的元素进行交互。

因为首先做的是一个选择的过程，所以叫做选择排序。

# 选择排序的例子

假如我们有一个数组：29,10,14,37,20,25,44,15，怎么对它进行选择排序呢？

先看一个动画：

![](https://img-blog.csdnimg.cn/2020070819571632.gif)

选择排序的原理如下：

8个数字，我们需要进行7轮排序。

以第一轮为例，我们对对所有的数据进行比较，找到其中最小的那个10，然后把10放在数组的第一个。

当第二轮时，因为数组的第一个元素10已经排好序了，我们只需要从第二个位置开始就行了，同样的，第二轮我们找到后面几个元素中最小的那个14，将其放在数组的第二个位置。

以此类推进行7轮排序就得到了最后的结果。

# 选择排序的java代码实现

我们把上面的逻辑用java代码实现如下：

~~~java
public class SelectionSort {

    public void doSelectionSort(int[] array){
        log.info("排序前的数组为:{}",array);
        //外层循环,遍历所有轮数
        for(int i=0; i< array.length-1; i++){
            //内层循环，找出最小的那个数字
            int minIndex=i;
            for(int j=i+1;j<array.length;j++)
            {
                if(array[j] < array[minIndex])
                {
                    minIndex = j;
                }
            }
            //每次选择完成后，将minIndex所在元素和第i个元素互换
            int temp = array[minIndex];
            array[minIndex] = array[i];
            array[i] = temp;
            log.info("第{}轮排序后的数组为:{}", i+1, array);
        }
    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        SelectionSort selectionSort=new SelectionSort();
        selectionSort.doSelectionSort(array);
    }
}
~~~

运行结果：

![](https://img-blog.csdnimg.cn/2020070820282894.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

# 选择排序的第二种java实现

上面的代码中，我们每次查找的是最小的那个元素，同样的，我们也可以查找最大的那个元素。

~~~java
public class SelectionSort1 {

    public void doSelectionSort(int[] array){
        log.info("排序前的数组为:{}",array);
        //外层循环,遍历所有轮数
        for(int i=0; i< array.length-1; i++){
            //内层循环，找出最大的那个数字
            int maxIndex=0;
            for(int j=0;j<array.length-i;j++)
            {
                if(array[j] > array[maxIndex])
                {
                    maxIndex = j;
                }
            }
            //每次选择完成后，将maxIndex所在元素和length-i-1的元素互换
            int temp = array[array.length-i-1];
            array[array.length-i-1] = array[maxIndex];
            array[maxIndex] = temp;
            log.info("第{}轮排序后的数组为:{}", i+1, array);
        }
    }

    public static void main(String[] args) {
        int[] array= {29,10,14,37,20,25,44,15};
        SelectionSort1 selectionSort=new SelectionSort1();
        selectionSort.doSelectionSort(array);
    }
}
~~~

运行结果：

![](https://img-blog.csdnimg.cn/20200708203021643.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

两种排序大家要注意内部循环的比较条件是不一样的。

# 选择排序的时间复杂度

选择排序和冒泡排序一样，都需要进行n*n的循环，所以其时间复杂度也是O(n²)。

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
