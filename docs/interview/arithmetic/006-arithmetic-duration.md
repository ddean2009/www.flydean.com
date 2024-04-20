# 区间


## [228. 汇总区间](https://leetcode.cn/problems/summary-ranges/)

给定一个  **无重复元素** 的 **有序** 整数数组 `nums` 。

返回 ***恰好覆盖数组中所有数字** 的 **最小有序** 区间范围列表* 。也就是说，`nums` 的每个元素都恰好被某个区间范围所覆盖，并且不存在属于某个范围但不属于 `nums` 的数字 `x` 。

列表中的每个区间范围 `[a,b]` 应该按如下格式输出：

- `"a->b"` ，如果 `a != b`
- `"a"` ，如果 `a == b`

解法：一次遍历，左右两个指针，不断移动右边指针，判断是否满足条件。



```java
class Solution {
    public List<String> summaryRanges(int[] nums) {
        List<String> ret = new ArrayList<String>();
        int i = 0;
        int n = nums.length;
        while (i < n) {
            int low = i;
            i++;
            while (i < n && nums[i] == nums[i - 1] + 1) {
                i++;
            }
            int high = i - 1;
            StringBuffer temp = new StringBuffer(Integer.toString(nums[low]));
            if (low < high) {
                temp.append("->");
                temp.append(Integer.toString(nums[high]));
            }
            ret.add(temp.toString());
        }
        return ret;
    }
}
```

## [56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

以数组 `intervals` 表示若干个区间的集合，其中单个区间为 `intervals[i] = [starti, endi]` 。请你合并所有重叠的区间，并返回 *一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间* 。

解法： 我们将列表中的区间按照左端点升序排序。如果当前区间的左端点在数组 merged 中最后一个区间的右端点之后，那么它们不会重合，我们可以直接将这个区间加入数组 merged 的末尾；

否则，它们重合，我们需要用当前区间的右端点更新数组 merged 中最后一个区间的右端点，将其置为二者的较大值。

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        if(intervals.length ==0){
            return new int[0][2];
        }
        Arrays.sort(intervals, (a,b)->a[0]-b[0]);
        List<int[]> merged = new ArrayList<int[]>();
        for (int i = 0; i < intervals.length; ++i) {
            int L = intervals[i][0], R = intervals[i][1];
          //merged为空，或者最后一个元素的右边<L,直接添加
            if (merged.size() == 0 || merged.get(merged.size() - 1)[1] < L) {
                merged.add(new int[]{L, R});
            } else {
              //否则合并最右边
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], R);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}
```

## [57. 插入区间](https://leetcode.cn/problems/insert-interval/)

给你一个 **无重叠的** *，*按照区间起始端点排序的区间列表。

在列表中插入一个新的区间，你需要确保列表中的区间仍然有序且不重叠（如果有必要的话，可以合并区间）。

解法：判断区间范围

```java
class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        int left = newInterval[0];
        int right = newInterval[1];
        boolean placed = false;
        List<int[]> ansList = new ArrayList<int[]>();
        for (int[] interval : intervals) {
            if (interval[0] > right) {
                // 在插入区间的右侧且无交集，可以直接插入
                if (!placed) {
                    ansList.add(new int[]{left, right});
                    placed = true;                    
                }
                ansList.add(interval);
            } else if (interval[1] < left) {
                // 在插入区间的左侧且无交集，这种情况可以先插入interval，但是newInterval不能直接插入，需要比较跟后续interval的关系。
                ansList.add(interval);
            } else {
                // 与插入区间有交集，计算它们的并集，也不能直接插入，需要更新left和right
                left = Math.min(left, interval[0]);
                right = Math.max(right, interval[1]);
            }
        }
      //最后看是不是还没有插入，没有插入的话就插入。
        if (!placed) {
            ansList.add(new int[]{left, right});
        }
        int[][] ans = new int[ansList.size()][2];
        for (int i = 0; i < ansList.size(); ++i) {
            ans[i] = ansList.get(i);
        }
        return ans;
    }
}
```

## [452. 用最少数量的箭引爆气球](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/)

有一些球形气球贴在一堵用 XY 平面表示的墙面上。墙面上的气球记录在整数数组 `points` ，其中`points[i] = [xstart, xend]` 表示水平直径在 `xstart` 和 `xend`之间的气球。你不知道气球的确切 y 坐标。

一支弓箭可以沿着 x 轴从不同点 **完全垂直** 地射出。在坐标 `x` 处射出一支箭，若有一个气球的直径的开始和结束坐标为 `x``start`，`x``end`， 且满足  `xstart ≤ x ≤ x``end`，则该气球会被 **引爆** 。可以射出的弓箭的数量 **没有限制** 。 弓箭一旦被射出之后，可以无限地前进。

给你一个数组 `points` ，*返回引爆所有气球所必须射出的 **最小** 弓箭数* 。

解法，points按右侧排序。遍历points，只要points的left大于right，就说明需要新的箭。把最后结果加一即可。

```java
class Solution {
    public int findMinArrowShots(int[][] points) {

        if(points.length ==0 ){
            return 0;
        }
				//int相减的时候有可能会溢出，所以需要转换成long再减。
        Arrays.sort(points, (a, b)-> (long)a[1]-(long)b[1]>0?1:-1);

        int ans =1;
        int pos = points[0][1];
        for( int[] point : points){
            if(point[0]>pos){
                pos = point[1];
                ans ++;
            }
        }
        return ans;
    }
}
```
