---
slug: /algorithm-quick-sort
---

# 5. 排序-快速排序

# 简介

快速排序也采用的是分而制之的思想。那么快速排序和归并排序的区别在什么地方呢？

归并排序是将所有的元素拆分成一个个排好序的数组，然后将这些数组再进行合并。

而快速排序虽然也是拆分，但是拆分之后的操作是从数组中选出一个中间节点，然后将数组分成两部分。

左边的部分小于中间节点，右边的部分大于中间节点。

然后在分别处理左边的数组合右边的数组。

# 快速排序的例子

假如我们有一个数组：29,10,14,37,20,25,44,15，怎么对它进行快速排序呢？

先看一个动画：

![](https://img-blog.csdnimg.cn/20200709201650259.gif)

我们再分析一下快速排序的步骤。

我们选择的是最左边的元素29作为中间点元素，然后将数组分成三部分：[0, 14, 15, 20, 25],[29],[44, 37]。

中间节点29已经排好序了，不需要处理。

接下来我们再对左右分别进行快速排序。最后就得到了一个所有元素都排序的数组。

# 选择排序的java代码实现

我们先来看最核心的部分partition，如何将数组以中间节点为界，分成左右两部分呢？

我们的最终结果，是要将array分割成为三部分。

首先我们选择最左侧的元素作为中间节点的值。然后遍历数组中的其他元素。

假如m=middleIndex，k=要遍历的元素index

考虑两种情况，第一种情况是数组中的元素比中间节点的值要大。

![](https://img-blog.csdnimg.cn/20200709165402221.png)

这种情况下，m不需要移动，k+1继续遍历即可。

第二种情况下，数组中的元素比中间节点的值要小。

![](https://img-blog.csdnimg.cn/20200709165601310.png)

因为m左边的元素都要比中间节点的值要小，所以这种情况下m需要+1，即右移一位。

现在m+1位置的元素要么还没有进行比较，要么就是比中间节点的值要大，我们可以巧妙的将m+1位置的元素和k位置的元素互换位置，这样仍然能够保证m左侧的元素要比中间节点的值要小。

将上面的分析总结成java代码如下：

~~~java
 private int partition(int[] array, int i, int j) {
        //选择最左侧的元素作为中心点,middleValue就是中心点的值
        int middleValue = array[i];
        int middleIndex = i;
        //从i+1遍历整个数组
        for (int k = i+1; k <= j; k++) {
            //如果数组元素小于middleValue，表示middleIndex需要右移一位
            //右移之后，我们需要将小于middleValue的array[k]移动到middleIndex的左边，
            // 最简单的办法就是交换k和middleIndex的值
            if (array[k] < middleValue) {
                middleIndex++;
                //交换数组的两个元素
                swap(array, k , middleIndex);
            } //如果数组元素大于等于middleValue,则继续向后遍历,middleIndex值不变
        }
        // 最后将中心点放入middleIndex位置
        swap(array, i, middleIndex);
        return middleIndex;
    }
~~~

最后我们需要将最左侧的元素和中间节点应该在的index的元素互换下位置，这样就将中间节点移动到了中间位置，并返回中间位置。

再来看下divide的代码：

~~~java
    public void doQuickSort(int[] array, int low, int high) {
        //递归的结束条件
        if (low < high) {
            //找出中心节点的值
            int middleIndex = partition(array, low, high);
            //数组分成了三部分：
            // a[low..high] ~> a[low..m–1], pivot, a[m+1..high]
            //递归遍历左侧部分
            doQuickSort(array, low, middleIndex-1);
            // a[m] 是中心节点，已经排好序了，不需要继续遍历
            //递归遍历右侧部分
            doQuickSort(array, middleIndex+1, high);
            log.info("QuickSort之后的数组:{}",array);
        }
    }
~~~

divide的代码就很简单了，找到中间节点的位置之后，我们再分别遍历数组的左右两边即可。最后得到排好序的数组。

# 随机快速排序的java实现

上面的例子中，我们的中间节点的选择是数组的最左元素，为了保证排序的效率，我们可以从数组中随机选择一个元素来作为中间节点。

~~~java
 private int partition(int[] array, int i, int j) {
        //随机选择一个元素作为中心点,middleValue就是中心点的值
        int randomIndex=i+new Random().nextInt(j-i);
        log.info("randomIndex:{}",randomIndex);
        //首先将randomIndex的值和i互换位置,就可以复用QuickSort的逻辑
        swap(array, i , randomIndex);
        int middleValue = array[i];
        int middleIndex = i;
        //从i遍历整个数组
        for (int k = i+1; k <= j; k++) {
            //如果数组元素小于middleValue，表示middleIndex需要右移一位
            //右移之后，我们需要将小于middleValue的array[k]移动到middleIndex的左边，
            // 最简单的办法就是交换k和middleIndex的值
            if (array[k] < middleValue) {
                middleIndex++;
                //交换数组的两个元素
                swap(array, k , middleIndex);
            } //如果数组元素大于等于middleValue,则继续向后遍历,middleIndex值不变
        }
        // 最后将中心点放入middleIndex位置
        swap(array, i, middleIndex);
        return middleIndex;
    }
~~~

上面的代码，我们在分区的时候，先选择出一个随机的节点，然后将这个随机的节点和最左侧的元素交换位置，后面的代码就可以重用上面的QuickSort的代码逻辑了。

# 快速排序的时间复杂度

从上面的分析我们可以看出，每次分区的时间复杂度应该是O(N)，而divide又近似二分法，所以总的时间复杂度是O(N logN)。

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
