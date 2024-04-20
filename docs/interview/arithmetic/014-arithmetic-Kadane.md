# Kadane算法


Kadane's算法是一种用于解决**最大子数组和问题**（Maximum Subarray Sum Problem）的动态规划算法。该问题的目标是在一个给定数组中找到一个连续子数组，使得子数组的和最大。

算法的基本思想是通过迭代数组的每个元素，维护两个变量：当前最大子数组和以及全局最大子数组和。在每一步中，都考虑是否将当前元素添加到当前最大子数组和中，或者重新开始一个新的子数组。这样一步步地迭代数组，最终得到全局最大子数组和。

## [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组** 是数组中的一个连续部分。

解法，动态规划，写出转移方程。

```java
dp[i] 表示：以 nums[i] 结尾的连续子数组的最大和，那么dp[i]和dp[i-1]有什么关系呢？
```

```java
public class Solution {

    public int maxSubArray(int[] nums) {
        int len = nums.length;
        // dp[i] 表示：以 nums[i] 结尾的连续子数组的最大和
        int[] dp = new int[len];
        dp[0] = nums[0];

        for (int i = 1; i < len; i++) {
            if (dp[i - 1] > 0) {
                dp[i] = dp[i - 1] + nums[i];
            } else {
                dp[i] = nums[i];
            }
        }

        // 也可以在上面遍历的同时求出 res 的最大值，这里我们为了语义清晰分开写，大家可以自行选择
        int res = dp[0];
        for (int i = 1; i < len; i++) {
            res = Math.max(res, dp[i]);
        }
        return res;
    }
}
```

空间优化算法：

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
}
```

## [918. 环形子数组的最大和](https://leetcode.cn/problems/maximum-sum-circular-subarray/)

给定一个长度为 `n` 的**环形整数数组** `nums` ，返回 *`nums` 的非空 **子数组** 的最大可能和* 。

**环形数组** 意味着数组的末端将会与开头相连呈环状。形式上， `nums[i]` 的下一个元素是 `nums[(i + 1) % n]` ， `nums[i]` 的前一个元素是 `nums[(i - 1 + n) % n]` 。

**子数组** 最多只能包含固定缓冲区 `nums` 中的每个元素一次。形式上，对于子数组 `nums[i], nums[i + 1], ..., nums[j]` ，不存在 `i <= k1, k2 <= j` 其中 `k1 % n == k2 % n` 。

解法1。动态规划，可以分为两种情况：

构成最大子数组和的子数组为 nums[i:j]，包括 nums[i] 到 nums[j−1] 共 j−i 个元素，其中 0≤i<j≤n
构成最大子数组和的子数组为 nums[0:i] 和 nums[j:n]，其中 0<i<j<n。

第一种情况的求解方法与求解普通数组的最大子数组和方法完全相同，读者可以参考 53 号题目的题解：最大子序和。

第二种情况中，答案可以分为两部分，nums[0:i] 为数组的某一前缀，nums[j:n]为数组的某一后缀。求解时，我们可以枚举 j，固定 sum(nums[j:n])的值，然后找到右端点坐标范围在 [0,j−1] 的最大前缀和，将它们相加更新答案。

右端点坐标范围在 [0,i] 的最大前缀和可以用 leftMax[i] 表示，递推方程为：

leftMax[i]=max⁡(leftMax[i−1],sum(nums[0:i+1])

先计算出i位置的左边最大的sam值，这样在遍历右边的时候，就可以直接加上左边的最大sam得到最大结果。

```java
class Solution {
    public int maxSubarraySumCircular(int[] nums) {
        int n = nums.length;
        int[] leftMax = new int[n];
        // 对坐标为 0 处的元素单独处理，避免考虑子数组为空的情况
        leftMax[0] = nums[0];
        int leftSum = nums[0];
        int pre = nums[0];
        int res = nums[0];
        for (int i = 1; i < n; i++) {
            pre = Math.max(pre + nums[i], nums[i]);
            res = Math.max(res, pre);
            leftSum += nums[i];
            leftMax[i] = Math.max(leftMax[i - 1], leftSum);
        }

        // 从右到左枚举后缀，固定后缀，选择最大前缀
        int rightSum = 0;
        for (int i = n - 1; i > 0; i--) {
            rightSum += nums[i];
            res = Math.max(res, rightSum + leftMax[i - 1]);
        }
        return res;
    }
}

```

解法二。反向考虑。对于两边的情况，我们可以考虑计算数组的最小值。然后用数组的sum减去最小值就是最大值了。

减法的时候需要考虑，如果数组中的数据都是小于0的话，sum - minRes=0。 所以需要对这种情况单独判断。

```java
class Solution {
    public int maxSubarraySumCircular(int[] nums) {
        int n = nums.length;
        int preMax = nums[0], maxRes = nums[0];
        int preMin = nums[0], minRes = nums[0];
        int sum = nums[0];
        for (int i = 1; i < n; i++) {
            preMax = Math.max(preMax + nums[i], nums[i]);
            maxRes = Math.max(maxRes, preMax);
            preMin = Math.min(preMin + nums[i], nums[i]);
            minRes = Math.min(minRes, preMin);
            sum += nums[i];
        }
        if (maxRes < 0) {
            return maxRes;
        } else {
            return Math.max(maxRes, sum - minRes);
        }
    }
}
```

解法三，把数组长度乘以2，那么就变成在2*n的数组里面，寻找长度不大于n的数字的最大和。

正常情况下对于长度等于n的数字求最大和，直接用滑动窗口存储**前缀和**，两个**前缀和相减**就是当前的sum值，就可以解决了。

但是这里要求的是长度不大n。那么前缀和相减最大值的前提是队列里面只存储前缀和最小的那个。

所以我们在一个前缀和入库之前，先比较一下他和之前的前缀和哪个更小。然后把小的那个放进队列。这样在pop的时候，就可以得到最大的值。

```java
class Solution {
    // 单调队列，队列中存放的是前缀和，从fist到last是递增的。
    public int maxSubarraySumCircular(int[] nums) {
        int length = nums.length;
        int count = length << 1;
        Deque<int[]> queue = new LinkedList<>();
        int preSum = nums[0];// 前缀和
        int max = nums[0];// 返回的结果
        queue.offerLast(new int[]{0, preSum});
        for (int i = 1; i < count; i++) {
            // 队列中最老元素的下标到当前距离不能大于数组长度length。
            if (!queue.isEmpty() && i - queue.peekFirst()[0] > length)
                queue.pollFirst();
            preSum += nums[i % length];// 累加前缀和。
            // 计算最大和，queue中元素是单调递增的，直接减去first即可。
            max = Math.max(max, preSum - queue.peekFirst()[1]);
            // 维护递增队列，把当前值添加之前，需要把前面比preSum大或相等的都要移除。
            while (!queue.isEmpty() && queue.peekLast()[1] >= preSum)
                queue.pollLast();
            queue.offerLast(new int[]{i, preSum});// 添加到队列中。
        }
        return max;
    }
}
```
