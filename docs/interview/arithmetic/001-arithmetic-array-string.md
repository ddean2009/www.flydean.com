# 数组字符串

## [88. 合并两个有序数组](https://leetcode.cn/problems/merge-sorted-array/)

给你两个按 **非递减顺序** 排列的整数数组 `nums1` 和 `nums2`，另有两个整数 `m` 和 `n` ，分别表示 `nums1` 和 `nums2` 中的元素数目。

请你 **合并** `nums2` 到 `nums1` 中，使合并后的数组同样按 **非递减顺序** 排列。

**注意：**最终，合并后数组不应由函数返回，而是存储在数组 `nums1` 中。为了应对这种情况，`nums1` 的初始长度为 `m + n`，其中前 `m` 个元素表示应合并的元素，后 `n` 个元素为 `0` ，应忽略。`nums2` 的长度为 `n` 。

解法：

1. 合并之后，直接排序 Arrays.sort(nums1);
2. 新建数组，用双指针拷贝到新数组中，最后把数组拷贝回原来的nums1.
3. 双指针从后面开始，这样就有位置放多余的元素，不用新建数组。

```java
class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int p1 = m - 1, p2 = n - 1;
        int tail = m + n - 1;
        int cur;
        while (p1 >= 0 || p2 >= 0) {
            if (p1 == -1) {
                cur = nums2[p2--];
            } else if (p2 == -1) {
                cur = nums1[p1--];
            } else if (nums1[p1] > nums2[p2]) {
                cur = nums1[p1--];
            } else {
                cur = nums2[p2--];
            }
            nums1[tail--] = cur;
        }
    }
}
```

## [27. 移除元素](https://leetcode.cn/problems/remove-element/)

给你一个数组 `nums` 和一个值 `val`，你需要 **[原地](https://baike.baidu.com/item/原地算法)** 移除所有数值等于 `val` 的元素，并返回移除后数组的新长度。

不要使用额外的数组空间，你必须仅使用 `O(1)` 额外空间并 **[原地 ](https://baike.baidu.com/item/原地算法)修改输入数组**。

元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。

解法：1双指针

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int n = nums.length;
        int left = 0;
        for (int right = 0; right < n; right++) {
            if (nums[right] != val) {
                nums[left] = nums[right];
                left++;
            }
        }
        return left;
    }
}
```

解法2:双指针优化，从头开始判断是否符合，如果符合则把尾部的元素复制给头部元素。然后尾部指针左移一位。否则左边指针指针右移一位。

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int left = 0;
        int right = nums.length;
        while (left < right) {
            if (nums[left] == val) {
                nums[left] = nums[right - 1];
                right--;
            } else {
                left++;
            }
        }
        return left;
    }
}
```



## [26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)

给你一个 **非严格递增排列** 的数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使每个元素 **只出现一次** ，返回删除后数组的新长度。元素的 **相对顺序** 应该保持 **一致** 。然后返回 `nums` 中唯一元素的个数。

解法：

1. 用快慢双指针，一次遍历，比较快指针跟快指针的前一位。

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        int n = nums.length;
        if (n == 0) {
            return 0;
        }
        int fast = 1, slow = 1;
        while (fast < n) {
            if (nums[fast] != nums[fast - 1]) {
                nums[slow] = nums[fast];
                ++slow;
            }
            ++fast;
        }
        return slow;
    }
}
```

## [80. 删除有序数组中的重复项 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/)

给你一个有序数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使得出现次数超过两次的元素**只出现两次** ，返回删除后数组的新长度。

不要使用额外的数组空间，你必须在 **[原地 ](https://baike.baidu.com/item/原地算法)修改输入数组** 并在使用 O(1) 额外空间的条件下完成。

解法：

1.同样双指针，但是**判断的是slow-2和fast的值是否相同**

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        int n = nums.length;
        if (n <= 2) {
            return n;
        }
        int slow = 2, fast = 2;
        while (fast < n) {
            if (nums[slow - 2] != nums[fast]) {
                nums[slow] = nums[fast];
                ++slow;
            }
            ++fast;
        }
        return slow;
    }
}

```

## [169. 多数元素](https://leetcode.cn/problems/majority-element/)

给定一个大小为 `n` 的数组 `nums` ，返回其中的多数元素。多数元素是指在数组中出现次数 **大于** `⌊ n/2 ⌋` 的元素。

你可以假设数组是非空的，并且给定的数组总是存在多数元素。

解法：

1. #### Boyer-Moore 投票算法

如果我们把众数记为 +1，把其他数记为 −1，将它们全部加起来，显然和大于 `0`。

我们维护一个候选众数 candidate 和它出现的次数 count。初始时 candidate 可以为任意值，count 为 0；

我们遍历数组 nums 中的所有元素，对于每个元素 x，在判断 x 之前，如果 count 的值为 0，我们先将 x 的值赋予 candidate，随后我们判断 x：

如果 x 与 candidate 相等，那么计数器 count 的值增加 1；

如果 x 与 candidate 不等，那么计数器 count 的值减少 1。

在遍历完成后，candidate 即为整个数组的众数。

```java
class Solution {
    public int majorityElement(int[] nums) {
        int count = 0;
        Integer candidate = null;

        for (int num : nums) {
            if (count == 0) {
                candidate = num;
            }
            count += (num == candidate) ? 1 : -1;
        }

        return candidate;
    }
}
```

## [189. 轮转数组](https://leetcode.cn/problems/rotate-array/)

给定一个整数数组 `nums`，将数组中的元素向右轮转 `k` 个位置，其中 `k` 是非负数。

解法1：

反转再反转：

```java
class Solution {
    public void rotate(int[] nums, int k) {
        k %= nums.length;
        reverse(nums, 0, nums.length - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, nums.length - 1);
    }

    public void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start += 1;
            end -= 1;
        }
    }
}
```

解法2.使用额外的数组。

```java
class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        int[] newArr = new int[n];
        for (int i = 0; i < n; ++i) {
            newArr[(i + k) % n] = nums[i];
        }
        System.arraycopy(newArr, 0, nums, 0, n);
    }
}
```



## [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

给定一个数组 `prices` ，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。

你只能选择 **某一天** 买入这只股票，并选择在 **未来的某一个不同的日子** 卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 `0` 。

解法：每天找到历史最低点，计算profit并更新最大的profit

```java
public class Solution {
    public int maxProfit(int prices[]) {
        int minprice = Integer.MAX_VALUE;
        int maxprofit = 0;
        for (int i = 0; i < prices.length; i++) {
            if (prices[i] < minprice) {
                minprice = prices[i];
            } else if (prices[i] - minprice > maxprofit) {
                maxprofit = prices[i] - minprice;
            }
        }
        return maxprofit;
    }
}
```

## [122. 买卖股票的最佳时机 II](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

给你一个整数数组 `prices` ，其中 `prices[i]` 表示某支股票第 `i` 天的价格。

在每一天，你可以决定是否购买和/或出售股票。你在任何时候 **最多** 只能持有 **一股** 股票。你也可以先购买，然后在 **同一天** 出售。

返回 *你能获得的 **最大** 利润* 。

解法：贪心算法，把所有大于0的profit都加起来。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int ans = 0;
        int n = prices.length;
        for ( int i=1; i<n; i++){
            ans += Math.max(0, prices[i]-prices[i-1]);
        }
        return ans;
    }
}
```

解法2.动态规划

定义状态 dp\[i][0]表示第 i天交易完后手里没有股票的最大利润，dp\[i][1]表示第 i 天交易完后手里持有一支股票的最大利润（i从 0 开始）。

对于初始状态，根据状态定义我们可以知道第 0天交易结束的时候 dp\[0][0]=0，dp\[0][1]=−prices[0]。

因此，我们只要从前往后依次计算状态即可。由于全部交易结束后，持有股票的收益一定低于不持有股票的收益，因此这时候 dp\[n−1][0] 的收益必然是大于 dp\[n−1][1] 的，最后的答案即为 dp\[n−1][0]。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int[][] dp = new int[n][2];
        dp[0][0] = 0;
        dp[0][1] = -prices[0];
        for (int i = 1; i < n; ++i) {
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] + prices[i]);
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]);
        }
        return dp[n - 1][0];
    }
}
```



## [55. 跳跃游戏](https://leetcode.cn/problems/jump-game/)

给你一个非负整数数组 `nums` ，你最初位于数组的 **第一个下标** 。数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个下标，如果可以，返回 `true` ；否则，返回 `false` 。

解法：依次遍历，返回每个节点能达到的最右位置即可。（遍历过程中如果i>之前的rightmost，则说明到不了i的位置，则返回false）

```java
class Solution {
    public boolean canJump(int[] nums) {
        int n = nums.length;
        int rightmost=0;
        for (int i=0;i< n; i++){
            if(i<= rightmost){
                rightmost = Math.max(i+nums[i], rightmost);
                if(rightmost >= n-1){
                return true;
                }
            }
        }
        return false;

    }
}
```

## [45. 跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/)

给定一个长度为 `n` 的 **0 索引**整数数组 `nums`。初始位置为 `nums[0]`。

每个元素 `nums[i]` 表示从索引 `i` 向前跳转的最大长度。换句话说，如果你在 `nums[i]` 处，你可以跳转到任意 `nums[i + j]` 处:

- `0 <= j <= nums[i]`
- `i + j < n`

返回到达 `nums[n - 1]` 的最小跳跃次数。生成的测试用例可以到达 `nums[n - 1]`。

解法：

遍历过程中获得maxPosition，同时设置上一个跳跃的end位置，当i到达上一个end位置时，跳跃次数加一。然后把end设置为此时的maxPosition。

```java
class Solution {
    public int jump(int[] nums) {
        int length= nums.length;
        int end =0;
        int maxPosition=0;
        int steps=0;
        for ( int i=0;i< length-1; i++){
            maxPosition = Math.max(maxPosition, i+nums[i]);
            if(i ==end ){
                end = maxPosition;
                steps++;
            }
        }
        return steps;

    }
}
```

## [274. H 指数](https://leetcode.cn/problems/h-index/)

给你一个整数数组 `citations` ，其中 `citations[i]` 表示研究者的第 `i` 篇论文被引用的次数。计算并返回该研究者的 **`h` 指数**。

根据维基百科上 [h 指数的定义](https://baike.baidu.com/item/h-index/3991452?fr=aladdin)：`h` 代表“高引用次数” ，一名科研人员的 `h` **指数** 是指他（她）至少发表了 `h` 篇论文，并且每篇论文 **至少** 被引用 `h` 次。如果 `h` 有多种可能的值，**`h` 指数** 是其中最大的那个。

解法：

1. 把citations排序，然后按从大到小的顺序把citations[i]和h进行比较，如果大于则把h+1，直到h无法增大为止

```java
class Solution {
    public int hIndex(int[] citations) {
        Arrays.sort(citations);
        int h = 0, i = citations.length - 1; 
      //考虑什么时候h需要加一,找到了一篇被引用了至少 h+1 次的论文
      //为什么是citations[i] > h，而不是>=呢？考虑只有1个元素的情况，citations[0]=0,h=0,得到的结果应该是0而不是1。
      //如果当前 H 指数为 h 并且在遍历过程中找到当前值 citations[i]>h，则说明我们找到了一篇被引用了至少 h+1 次的论文，所以将现有的 h值加 1
        while (i >= 0 && citations[i] > h) {
            h++; 
            i--;
        }
        return h;
    }
}
```

2. 新建并维护一个数组 counter用来记录当前引用次数的论文有几篇，

   从后向前遍历数组 counter，对于每个 0≤i≤n，在数组 counter 中得到大于或等于当前引用次数 i 的总论文数。

```java
public class Solution {
    public int hIndex(int[] citations) {
        int n = citations.length, tot = 0;
        int[] counter = new int[n + 1];
        for (int i = 0; i < n; i++) {
          //对于引用次数超过论文发表数的情况，我们可以将其按照总的论文发表数来计算即可
            if (citations[i] >= n) {
                counter[n]++;
            } else {
                counter[citations[i]]++;
            }
        }
        for (int i = n; i >= 0; i--) {
            tot += counter[i];
            if (tot >= i) {
                return i;
            }
        }
        return 0;
    }
}
```

## [238. 除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

给你一个整数数组 `nums`，返回 *数组 `answer` ，其中 `answer[i]` 等于 `nums` 中除 `nums[i]` 之外其余各元素的乘积* 。

题目数据 **保证** 数组 `nums`之中任意元素的全部前缀元素和后缀的乘积都在 **32 位** 整数范围内。

请 **不要使用除法，**且在 `O(n)` 时间复杂度内完成此题。

解法：先计算L和R两个数组，然后通过L和R来计算结果。

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int length = nums.length;
        int[] L = new int[length];
        int[] R = new int[length];

        int[] answner = new int[length];

        L[0]=1;
        for (int i=1; i< length; i++){
            L[i]= nums[i-1] * L[i-1];
        }

        R[length-1]=1;
        for ( int i = length-2; i>=0; i--){
            R[i] = nums[i+1]* R[i+1];
        }

        for (int i=0; i< length; i++){
            answner[i]=L[i] * R[i];
        }
        return answner;

    }
}
```

## [134. 加油站](https://leetcode.cn/problems/gas-station/)

在一条环路上有 `n` 个加油站，其中第 `i` 个加油站有汽油 `gas[i]` 升。

你有一辆油箱容量无限的的汽车，从第 `i` 个加油站开往第 `i+1` 个加油站需要消耗汽油 `cost[i]` 升。你从其中的一个加油站出发，开始时油箱为空。

给定两个整数数组 `gas` 和 `cost` ，如果你可以按顺序绕环路行驶一周，则返回出发时加油站的编号，否则返回 `-1` 。如果存在解，则 **保证** 它是 **唯一** 的。

解法：

1. 我们首先检查第 0 个加油站，并试图判断能否环绕一周；如果不能，就从第一个无法到达的加油站开始继续检查。

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        int i = 0;
        while (i < n) {
            int sumOfGas = 0, sumOfCost = 0;
          //cnt是本轮触发可以走的步数
            int cnt = 0;
            while (cnt < n) {
                int j = (i + cnt) % n;
                sumOfGas += gas[j];
                sumOfCost += cost[j];
                if (sumOfCost > sumOfGas) {
                    break;
                }
                cnt++;
            }
            if (cnt == n) {
                return i;
            } else {
                i = i + cnt + 1;
            }
        }
        return -1;
    }
}
```

2. 图解法

找到sum的最小值，并且小于0的那个点。要找的值就是下一个点：

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {

        int sum = 0;
        int min = Integer.MAX_VALUE;
        int minIndex = -1;
        for(int i = 0; i < gas.length; i++){
            sum = sum + gas[i] - cost[i];
            if(sum < min && sum < 0){
                min = sum;
                minIndex = i;
            }
        }
        if(sum < 0) return -1;
        return (minIndex + 1 )%gas.length;
    }
}
```

## [135. 分发糖果](https://leetcode.cn/problems/candy/)

`n` 个孩子站成一排。给你一个整数数组 `ratings` 表示每个孩子的评分。

你需要按照以下要求，给这些孩子分发糖果：

- 每个孩子至少分配到 `1` 个糖果。
- 相邻两个孩子评分更高的孩子会获得更多的糖果。

请你给每个孩子分发糖果，计算并返回需要准备的 **最少糖果数目** 。

解法：

分别计算左右两个数组，然后取两边的最大值加起来。

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] left = new int[n];
        for ( int i=0; i< n ; i++){
            if(i>0 && ratings[i] > ratings[i-1]){
                left[i] = left[i-1]+1;
            }else{
                left[i]=1;
            }
        }

        int right=0, ret=0;
        for ( int i=n-1; i>=0; i--){
            if(i < n-1&& ratings[i] > ratings[i+1]){
                right++;
            }else{
                right=1;
            }
            ret += Math.max(left[i], right);

        }
        return ret;

    }
}
```

## [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

解法：

分别找到当前位置左右两边的最大高度。则最后的结果就是两边最大高度的最小值减去柱子的高度

```java
class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if(n==0){
            return 0;
        }

        int[] leftMax = new int[n];
        leftMax[0] = height[0];
        for(int i=1; i< n; i++){
            leftMax[i] = Math.max(leftMax[i-1], height[i]);
        }
        int[] rightMax= new int[n];
        rightMax[n-1] = height[n-1];
        for(int i=n-2; i >=0 ; i--){
            rightMax[i] = Math.max(rightMax[i+1], height[i]);
        }
        int ans=0;
        for(int i=0;i< n; i++){
            ans += Math.min(leftMax[i], rightMax[i]) - height[i];
        }

        return ans;

    }
}
```

解法2.单调栈

维护一个单调栈，单调栈存储的是下标，满足从栈底到栈顶的下标对应的数组 height中的元素递减。

从左到右遍历数组，遍历到下标 i 时，如果栈内至少有两个元素，记栈顶元素为 top 的下面一个元素是 left，则一定有 height[left]≥height[top]。

如果 height[i]>height[top]，则得到一个可以接雨水的区域，该区域的宽度是 i−left−1，高度是 min⁡(height[left],height[i])−height[top]，根据宽度和高度即可计算得到该区域能接的雨水量。

为了得到 left，需要将 top 出栈。在对 top 计算能接的雨水量之后，left 变成新的 top，重复上述操作，直到栈变为空，或者栈顶下标对应的 height 中的元素大于或等于 height[i]。

```java
class Solution {
    public int trap(int[] height) {
        int ans = 0;
        Deque<Integer> stack = new LinkedList<Integer>();
        int n = height.length;
        for (int i = 0; i < n; ++i) {
          //判断stack中是否还有小于当前值的元素，保证单调栈的单调性
            while (!stack.isEmpty() && height[i] > height[stack.peek()]) {
                int top = stack.pop();
                if (stack.isEmpty()) {
                    break;
                }
                //面积等于两边的距离乘以(两边的最小高度-当前的高度）
                int left = stack.peek();
                int currWidth = i - left - 1;
                int currHeight = Math.min(height[left], height[i]) - height[top];
                ans += currWidth * currHeight;
            }
            stack.push(i);
        }
        return ans;
    }
}
```

## [14. 最长公共前缀](https://leetcode.cn/problems/longest-common-prefix/)

编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 `""`。

解法:

依次遍历字符串数组中的每个字符串，对于每个遍历到的字符串，更新最长公共前缀，当遍历完所有的字符串以后，即可得到字符串数组中的最长公共前缀。

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }
        String prefix = strs[0];
        int count = strs.length;
        for (int i = 1; i < count; i++) {
            prefix = longestCommonPrefix(prefix, strs[i]);
            if (prefix.length() == 0) {
                break;
            }
        }
        return prefix;
    }

    public String longestCommonPrefix(String str1, String str2) {
        int length = Math.min(str1.length(), str2.length());
        int index = 0;
        while (index < length && str1.charAt(index) == str2.charAt(index)) {
            index++;
        }
        return str1.substring(0, index);
    }
}
```

解法2：纵向扫描

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }
        int length = strs[0].length();
        int count = strs.length;
        for (int i = 0; i < length; i++) {
            char c = strs[0].charAt(i);
            for (int j = 1; j < count; j++) {
              //1.到达字符串长度 2.当前字符不相等
                if (i == strs[j].length() || strs[j].charAt(i) != c) {
                    return strs[0].substring(0, i);
                }
            }
        }
        return strs[0];
    }
}
```



## [151. 反转字符串中的单词](https://leetcode.cn/problems/reverse-words-in-a-string/)

给你一个字符串 `s` ，请你反转字符串中 **单词** 的顺序。

**单词** 是由非空格字符组成的字符串。`s` 中使用至少一个空格将字符串中的 **单词** 分隔开。

返回 **单词** 顺序颠倒且 **单词** 之间用单个空格连接的结果字符串。

**注意：**输入字符串 `s`中可能会存在前导空格、尾随空格或者单词间的多个空格。返回的结果字符串中，单词间应当仅用单个空格分隔，且不包含任何额外的空格。

解法1,直接使用函数：

```java
class Solution {
    public String reverseWords(String s) {
        // 除去开头和末尾的空白字符
        s = s.trim();
        // 正则匹配连续的空白字符作为分隔符分割
        List<String> wordList = Arrays.asList(s.split("\\s+"));
        Collections.reverse(wordList);
        return String.join(" ", wordList);
    }
}
```

解法2：

用栈。从左到右遍历，找到每个word，然后把word加入到Dqueue的

```java
class Solution {
    public String reverseWords(String s) {
        s = s.trim();

        Deque<String> d = new ArrayDeque<String>();
        StringBuilder word = new StringBuilder();

        int left =0, right=s.length()-1;

        while(left <=right){
            char c = s.charAt(left);
            if(word.length()!=0 && c==' '){
                d.offerFirst(word.toString());
                word.setLength(0);
            }else if(c !=' '){
                word.append(c);
            }
            left++;
        }
        d.offerFirst(word.toString());
        return String.join(" ",d);
    }
}
```

## [6. N 字形变换](https://leetcode.cn/problems/zigzag-conversion/)

将一个给定字符串 `s` 根据给定的行数 `numRows` ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"PAYPALISHIRING"` 行数为 `3` 时，排列如下：

```
P   A   H   N
A P L S I I G
Y   I   R
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"PAHNAPLSIIGYIR"`。

请你实现这个将字符串进行指定行数变换的函数：

```
string convert(string s, int numRows);
```

解法：

计算好每个遍历的周期，用StringBuilder[]来保存每行的结果。

```java
class Solution {
    public String convert(String s, int numRows) {

    int n= s.length(), r= numRows;
    if(r==1 || r >=n){
        return s;
    }

    StringBuilder[] mat = new StringBuilder[r];

    for(int i=0; i<r; i++){
        mat[i]= new StringBuilder();
    }

        for(int i=0,x=0, t=r*2-2; i<n ;i++){
            mat[x].append(s.charAt(i));
            if(i%t < r-1){
                x++;
            }else{
                x--;
            }
        }

        StringBuilder ans = new StringBuilder();
        for(StringBuilder row : mat){
                ans.append(row);
        }
        return ans.toString();

    }
}
```

## [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)

给你两个字符串 `haystack` 和 `needle` ，请你在 `haystack` 字符串中找出 `needle` 字符串的第一个匹配项的下标（下标从 0 开始）。如果 `needle` 不是 `haystack` 的一部分，则返回 `-1` 。

**解法：KMP算法**

```java
class Solution {
    public int strStr(String haystack, String needle) {
        int n=haystack.length(), m=needle.length();
        if(m==0){
            return 0;
        }

        int[] next = new int[m];

        for(int i=1,j=0; i<m; i++){
            while(j>0 && needle.charAt(i) != needle.charAt(j)){
                j=next[j-1];
            }
            if(needle.charAt(i)==needle.charAt(j)){
                j++;
            }
            next[i]=j;
        }

        for(int i=0,j=0; i<n; i++){
            while(j>0 && haystack.charAt(i)!= needle.charAt(j)){
                j=next[j-1];
            }
            if(haystack.charAt(i)== needle.charAt(j)){
                j++;
            }
          //和needle的长度一致
            if(j==m){
                return i-j+1;
            }
        }

        return -1;

    }
}
```
