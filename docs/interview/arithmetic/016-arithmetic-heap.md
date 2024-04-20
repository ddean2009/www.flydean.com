# 堆


## [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

给定整数数组 `nums` 和整数 `k`，请返回数组中第 `k` 个最大的元素。

请注意，你需要找的是数组排序后的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。

你必须设计并实现时间复杂度为 `O(n)` 的算法解决此问题。

解法1.直接sort：

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        Arrays.sort(nums);
        return nums[nums.length-k];

    }
}
```

解法2.快速排序。在分解的过程当中，我们会对子数组进行划分，如果划分得到的 q 正好就是我们需要的下标，就直接返回 a[q]；否则，如果 q 比目标下标小，就递归右子区间，否则递归左子区间。这样就可以把原来递归两个区间变成只递归一个区间，提高了时间效率。这就是「**快速选择**」算法。

```java
class Solution {
    int quickselect(int[] nums, int l, int r, int k) {
        if (l == r) return nums[k];
        int x = nums[l], i = l - 1, j = r + 1;
        while (i < j) {
            do i++; while (nums[i] < x);
            do j--; while (nums[j] > x);
            if (i < j){
                int tmp = nums[i];
                nums[i] = nums[j];
                nums[j] = tmp;
            }
        }
      //一次比较完之后，i=j,j右边都是大于x的，j左边的都是小于x的
      //判断递归范围
        if (k <= j) return quickselect(nums, l, j, k);
        else return quickselect(nums, j + 1, r, k);
    }
    public int findKthLargest(int[] _nums, int k) {
        int n = _nums.length;
        return quickselect(_nums, 0, n - 1, n - k);
    }
}
```

解法3.基于堆排序的选择方法

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        int heapSize = nums.length;
        buildMaxHeap(nums, heapSize);
        for (int i = nums.length - 1; i >= nums.length - k + 1; --i) {
            swap(nums, 0, i);
            --heapSize;
            maxHeapify(nums, 0, heapSize);
        }
        return nums[0];
    }

    public void buildMaxHeap(int[] a, int heapSize) {
        for (int i = heapSize / 2; i >= 0; --i) {
            maxHeapify(a, i, heapSize);
        } 
    }

    public void maxHeapify(int[] a, int i, int heapSize) {
        int l = i * 2 + 1, r = i * 2 + 2, largest = i;
        if (l < heapSize && a[l] > a[largest]) {
            largest = l;
        } 
        if (r < heapSize && a[r] > a[largest]) {
            largest = r;
        }
        if (largest != i) {
            swap(a, i, largest);
            maxHeapify(a, largest, heapSize);
        }
    }

    public void swap(int[] a, int i, int j) {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}
```

## [502. IPO](https://leetcode.cn/problems/ipo/)

假设 力扣（LeetCode）即将开始 **IPO** 。为了以更高的价格将股票卖给风险投资公司，力扣 希望在 IPO 之前开展一些项目以增加其资本。 由于资源有限，它只能在 IPO 之前完成最多 `k` 个不同的项目。帮助 力扣 设计完成最多 `k` 个不同项目后得到最大总资本的方式。

给你 `n` 个项目。对于每个项目 `i` ，它都有一个纯利润 `profits[i]` ，和启动该项目需要的最小资本 `capital[i]` 。

最初，你的资本为 `w` 。当你完成一个项目时，你将获得纯利润，且利润将被添加到你的总资本中。

总而言之，从给定项目中选择 **最多** `k` 个不同项目的列表，以 **最大化最终资本** ，并输出最终可获得的最多资本。

答案保证在 32 位有符号整数范围内。

解法：首先将项目按照所需资本的从小到大进行排序，每次进行选择时，假设当前手中持有的资本为 w，我们应该从所有投入资本小于等于 w 的项目中选择利润最大的项目 j，然后此时我们更新手中持有的资本为 w+profits[j]，同时再从所有花费资本小于等于 w+profits[j]的项目中选择，我们按照上述规则不断选择 k 次即可。

先把所有满足<=w的项目都入堆，在堆里面按利润从大到小排序，然后出堆。

```java
class Solution {
    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {

                int n = profits.length;
        int curr = 0;
        int[][] arr = new int[n][2];

        for (int i = 0; i < n; ++i) {
            arr[i][0] = capital[i];
            arr[i][1] = profits[i];
        }
        //按资本从小到大排列
        Arrays.sort(arr, (a, b) -> a[0] - b[0]);
        
        //按利润的降序排列
          PriorityQueue<Integer> pq = new PriorityQueue<>((x, y) -> y - x);

        //选择K个项目
          for(int i=0; i< k; i++){
              //总共n个项目，选择满足小于起始金额的项目，并入堆。
              while(curr < n && arr[curr][0] <=w){
                  pq.add(arr[curr][1]);
                  curr++;
              }
              //挑选一个利润最大的项目，出堆。
              if(!pq.isEmpty()){
                  w+=pq.poll();
              }else{
                  break;
              }
          }
          return w;

    }
}
```

## [373. 查找和最小的 K 对数字](https://leetcode.cn/problems/find-k-pairs-with-smallest-sums/)

给定两个以 **非递减顺序排列** 的整数数组 `nums1` 和 `nums2` , 以及一个整数 `k` 。

定义一对值 `(u,v)`，其中第一个元素来自 `nums1`，第二个元素来自 `nums2` 。

请找到和最小的 `k` 个数对 `(u1,v1)`, ` (u2,v2)` ...  `(uk,vk)` 。

解法：最小的肯定是nums1[0],nums2[0],最大的肯定是nums1[n-1],nums2[n-1]。

考虑用优先队列，把所有的组合都加入到队列里面，然后一条条取最小的值。

优化：先把nums1和nums2[0]的所有数据入队列。每次pop一个出来，判断能不能把nums[2]的下一个加进来。直到返回所有的结果。

```java
class Solution {
    public List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        // 使用优先队列来保持最小的 k 对元素
        // 优先队列的比较器是根据 nums1[i] + nums2[j] 的和进行比较
        // 元素索引存储在数组中，[i, j] 表示 nums1 中的第 i 个元素和 nums2 中的第 j 个元素
        PriorityQueue<int[]> pq = new PriorityQueue<>(k, (o1, o2) -> {
            return nums1[o1[0]] + nums2[o1[1]] - nums1[o2[0]] - nums2[o2[1]];
        });
        
        // 存储结果的列表
        List<List<Integer>> ans = new ArrayList<>();
        
        int m = nums1.length;
        int n = nums2.length;
        
        // 将 nums1 中的前 Math.min(m, k) 个元素与 nums2 的第 0 个元素组成初始的 k 对
        for (int i = 0; i < Math.min(m, k); i++) {
            pq.offer(new int[]{i, 0});
        }
        
        // 依次从优先队列中取出最小的一对元素，加入结果列表
        while (k-- > 0 && !pq.isEmpty()) {
            int[] idxPair = pq.poll();
            List<Integer> list = new ArrayList<>();
            list.add(nums1[idxPair[0]]);
            list.add(nums2[idxPair[1]]);
            ans.add(list);
            
            // 如果 nums2 中还有元素，将当前 nums1[i] 与 nums2[j+1] 组成的元素对加入队列
            if (idxPair[1] + 1 < n) {
                pq.offer(new int[]{idxPair[0], idxPair[1] + 1});
            }
        }
        
        return ans;
    }
}

```

## [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

**中位数**是有序整数列表中的中间值。如果列表的大小是偶数，则没有中间值，中位数是两个中间值的平均值。

- 例如 `arr = [2,3,4]` 的中位数是 `3` 。
- 例如 `arr = [2,3]` 的中位数是 `(2 + 3) / 2 = 2.5` 。

实现 MedianFinder 类:

- `MedianFinder() `初始化 `MedianFinder` 对象。
- `void addNum(int num)` 将数据流中的整数 `num` 添加到数据结构中。
- `double findMedian()` 返回到目前为止所有元素的中位数。与实际答案相差 `10-5` 以内的答案将被接受。

解法：流是动态的，所以考虑使用优先队列。因为要得到中位数，所以考虑使用两个优先队列，一个存储大于中位数的值（按升序排），一个存储小于中位数的值（按降序排）。

```java
class MedianFinder {
    PriorityQueue<Integer> queMin;
    PriorityQueue<Integer> queMax;

    public MedianFinder() {
      //降序排
        queMin = new PriorityQueue<Integer>((a, b) -> (b - a));
      //升序排
        queMax = new PriorityQueue<Integer>((a, b) -> (a - b));
    }
    
    public void addNum(int num) {
        if (queMin.isEmpty() || num <= queMin.peek()) {
            queMin.offer(num);
            if (queMax.size() + 1 < queMin.size()) {
                queMax.offer(queMin.poll());
            }
        } else {
            queMax.offer(num);
            if (queMax.size() > queMin.size()) {
                queMin.offer(queMax.poll());
            }
        }
    }
    
    public double findMedian() {
        if (queMin.size() > queMax.size()) {
            return queMin.peek();
        }
        return (queMin.peek() + queMax.peek()) / 2.0;
    }
}

```
