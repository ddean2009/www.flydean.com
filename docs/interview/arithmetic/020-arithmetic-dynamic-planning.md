# 动态规划


# 一维动态规划

动态规划的题目分为两大类，一种是求**最优解类**，典型问题是背包问题，另一种就是**计数类**，比如这里的统计方案数的问题，它们都存在一定的递推性质。前者的递推性质还有一个名字，叫做 「最优子结构」 ——即当前问题的最优解取决于子问题的最优解，后者类似，当前问题的方案数取决于子问题的方案数。所以在遇到**求方案数**的问题时，我们可以往动态规划的方向考虑。

## [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。

每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶呢？

解法2：递归会超时，我们从头开始。

```java
class Solution {
    public int climbStairs(int n) {
        List<Integer> list = new ArrayList<>();
        list.add(1);
        list.add(2);
        for(int i=2; i<n; i++){
            list.add(list.get(i-1)+list.get(i-2));
        }
        return list.get(n-1);
    }
}
```

解法3： 可以用「滚动数组思想」把空间复杂度优化成 O(1）

滚动数组，用3个变量。

```java
class Solution {
    public int climbStairs(int n) {
        int p = 0, q = 0, r = 1;
        for (int i = 1; i <= n; ++i) {
            p = q; 
            q = r; 
            r = p + q;
        }
        return r;
    }
}
```

## [198. 打家劫舍](https://leetcode.cn/problems/house-robber/)

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警**。

给定一个代表每个房屋存放金额的非负整数数组，计算你 **不触动警报装置的情况下** ，一夜之内能够偷窃到的最高金额。

解法2.从前到后迭代，动态规划

```java
class Solution {
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        int length = nums.length;
        if (length == 1) {
            return nums[0];
        }
        int[] dp = new int[length];
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);
        for (int i = 2; i < length; i++) {
            dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
        }
        return dp[length - 1];
    }
}
```

解法3.使用滚动数组，只需要两个变量

```java
class Solution {
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        int length = nums.length;
        if (length == 1) {
            return nums[0];
        }
        int first = nums[0], second = Math.max(nums[0], nums[1]);
        for (int i = 2; i < length; i++) {
            int temp = second;
            second = Math.max(first + nums[i], second);
            first = temp;
        }
        return second;
    }
}
```

## [139. 单词拆分](https://leetcode.cn/problems/word-break/)

给你一个字符串 `s` 和一个字符串列表 `wordDict` 作为字典。请你判断是否可以利用字典中出现的单词拼接出 `s` 。

**注意：**不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。

解法2：动态规划，定义 dp[i]表示字符串 s 前 i个字符组成的字符串 s[0..i−1]是否能被空格拆分成若干个字典中出现的单词

递推公式是对于<i的所有j，只要满足dp[j]并且wordDictSet.contains(s.substring(j, i),那么dp[i]就成立。

```java
public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> wordDictSet = new HashSet(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && wordDictSet.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];
    }
}
```

## [322. 零钱兑换](https://leetcode.cn/problems/coin-change/)

给你一个整数数组 `coins` ，表示不同面额的硬币；以及一个整数 `amount` ，表示总金额。

计算并返回可以凑成总金额所需的 **最少的硬币个数** 。如果没有任何一种硬币组合能组成总金额，返回 `-1` 。

你可以认为每种硬币的数量是无限的。

解法1：记忆化搜索,回溯所有coins的所有可能组合。但是会超时。

假设我们知道 F(S)，即组成金额 S 最少的硬币数，最后一枚硬币的面值是 C。那么由于问题的最优子结构，转移方程应为：

F(S)=F(S−C)+1

但我们不知道最后一枚硬币的面值是多少，所以我们需要枚举每个硬币面额值 c0,c1,c2…cn−1并选择其中的F(S-C)的最小值。

F(S)=min(F(S−C))+1

考虑边界情况：amount<1,count=0。amount<0,count=-1. amount=0,count=0.

另外需要一个数组来缓存F(S)，避免重复计算。---可能会超时

解法2.动态规划

自下而上的方式进行思考。

先计算前面的，再计算后面的。dp[i]表示金额为i的最少硬币个数。

```java
public class Solution {
    public int coinChange(int[] coins, int amount) {
        int max = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, max);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int j = 0; j < coins.length; j++) {
                if (coins[j] <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

## [300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

给你一个整数数组 `nums` ，找到其中最长严格递增子序列的长度。

**子序列** 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3,6,2,7]` 是数组 `[0,3,1,6,2,2,7]` 的子序列。

解法1：dp(i) 以i结尾的最长严格递增子序列长度。

结果是：max(dp(i))

dp(i) 的转移方程怎么写呢？肯定是要在之前的上面加一。但是需要满足特定的条件才能加一，否则就等1.这个条件就是遍历一遍数组，找到nums[i] > nums[j]的进行dp(i)状态的更新。

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums.length == 0) {
            return 0;
        }
        int[] dp = new int[nums.length];
        dp[0] = 1;
        int maxans = 1;
        for (int i = 1; i < nums.length; i++) {
          //先给dp[i]一个初始值，然后再更新dp[i]
            dp[i] = 1;
          //根据dp[j]来计算dp[i]的值
            for (int j = 0; j < i; j++) {
                //满足递增条件才会修改dp[i]
                if (nums[i] > nums[j]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxans = Math.max(maxans, dp[i]);
        }
        return maxans;
    }
}
```

# 多维动态规划

## [120. 三角形最小路径和](https://leetcode.cn/problems/triangle/)

给定一个三角形 `triangle` ，找出自顶向下的最小路径和。

每一步只能移动到下一行中相邻的结点上。**相邻的结点** 在这里指的是 **下标** 与 **上一层结点下标** 相同或者等于 **上一层结点下标 + 1** 的两个结点。也就是说，如果正位于当前行的下标 `i` ，那么下一步可以移动到下一行的下标 `i` 或 `i + 1` 。

解法：f(i,j)=min(f(i-1,j),f(i-1,j-1))+val(i,j)，  其中f(i,j)表示的是从顶点走到i，j这个位置的时候最小的路径和。

转移方程需要特别考虑最左边的节点和最右边的节点。

```java
class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        int[][] f = new int[n][n];
        f[0][0] = triangle.get(0).get(0);
        for (int i = 1; i < n; ++i) {
          //最左边的节点
            f[i][0] = f[i - 1][0] + triangle.get(i).get(0);
            for (int j = 1; j < i; ++j) {
                f[i][j] = Math.min(f[i - 1][j - 1], f[i - 1][j]) + triangle.get(i).get(j);
            }
          //最右边的节点
            f[i][i] = f[i - 1][i - 1] + triangle.get(i).get(i);
        }
        int minTotal = f[n - 1][0];
      //取最下面一层的最小值
        for (int i = 1; i < n; ++i) {
            minTotal = Math.min(minTotal, f[n - 1][i]);
        }
        return minTotal;
    }
}
```

解法2，空间优化版本，我们使用两个长度为 n 的一维数组进行转移，将 i 根据奇偶性映射到其中一个一维数组，那么 i−1就映射到了另一个一维数组。这样我们使用这两个一维数组，交替地进行状态转移。

```java
class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        int[][] f = new int[2][n];
        f[0][0] = triangle.get(0).get(0);
        for (int i = 1; i < n; ++i) {
            int curr = i % 2;
            int prev = 1 - curr;
            f[curr][0] = f[prev][0] + triangle.get(i).get(0);
            for (int j = 1; j < i; ++j) {
                f[curr][j] = Math.min(f[prev][j - 1], f[prev][j]) + triangle.get(i).get(j);
            }
            f[curr][i] = f[prev][i - 1] + triangle.get(i).get(i);
        }
        int minTotal = f[(n - 1) % 2][0];
        for (int i = 1; i < n; ++i) {
            minTotal = Math.min(minTotal, f[(n - 1) % 2][i]);
        }
        return minTotal;
    }
}
```

## [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)

给定一个包含非负整数的 `m x n 网格 `grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。

**说明：**每次只能向下或者向右移动一步。

解法：动态规划方程f(i,j)=min(f(i,j-1),f(i-1,j))+grid(i,j) 其中f(i,j)表示从左上角到i，j位置的最小路径和。

```java
class Solution {
    public int minPathSum(int[][] grid) {
         if (grid == null || grid.length == 0 || grid[0].length == 0) {
            return 0;
        }
        int[][] f = new int[m][n];
        f[0][0]=grid[0][0];
        //第一列
        for(int i=1;i<m; i++){
            f[i][0]=f[i-1][0]+grid[i][0];
        }
        //第一行
        for(int j=1;j<n;j++){
            f[0][j]=f[0][j-1]+grid[0][j];
        }

        for(int i=1;i<m;i++){
            for(int j=1;j<n;j++){    
              f[i][j]=Math.min(f[i][j-1],f[i-1][j])+grid[i][j];
            }
        }
        return f[m-1][n-1];
    }
}
```

## [63. 不同路径 II](https://leetcode.cn/problems/unique-paths-ii/)

一个机器人位于一个 `m x n` 网格的左上角 （起始点在下图中标记为 “Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish”）。

现在考虑网格中有障碍物。那么从左上角到右下角将会有多少条不同的路径？

网格中的障碍物和空位置分别用 `1` 和 `0` 来表示。

解法：动态规划。f(i,j)=f(i,j-1)+f(i-1,j) 其中f(i,j)表示从左上角到i，j位置的最少路径。其中nums(i,j)==0

考虑边界情况。

解法1：全部记录

```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {

        if(obstacleGrid==null){
            return 0;
        }
        int m = obstacleGrid.length;
        if(m==0){
            return 0;
        }
        int n=obstacleGrid[0].length;
        if(n==0 ){
            return 0;
        }
        int[][] f = new int[m][n];
        if(obstacleGrid[0][0] ==1){
            return 0;
        }
        f[0][0]=1;
        //第一列
        boolean blockedC=false;
        for(int i=1;i<m; i++){
            if(obstacleGrid[i][0]==1){
                blockedC=true;
            }
            if(blockedC){
                f[i][0]=0;
            }else{
                f[i][0]=1;
            }   
        }
        //第一行
        boolean blockedR=false;
        for(int j=1;j<n;j++){
            if(obstacleGrid[0][j]==1){
                blockedR=true;
            }
            if(blockedR){
                f[0][j]=0;
            }else{
                f[0][j]=1;
            }   
        }

        for(int i=0;i<m;i++){
            for(int j=0;j<n;j++){   
                if(obstacleGrid[i][j]==1){
                    f[i][j]=0;
                    continue;
                }
                if(f[i][j-1]==0 ){
                    f[i][j]=f[i-1][j];
                    continue;
                }
                if(f[i-1][j]==0){
                    f[i][j]=f[i][j-1];
                    continue;
                }

              f[i][j]=f[i][j-1]+f[i-1][j];

            }
        }
        return f[m-1][n-1];

    }
}
```

解法2.滚动数组

```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int n = obstacleGrid.length, m = obstacleGrid[0].length;
        int[] f = new int[m];

        f[0] = obstacleGrid[0][0] == 0 ? 1 : 0;
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < m; ++j) {
                if (obstacleGrid[i][j] == 1) {
                    f[j] = 0;
                    continue;
                }
                if (j - 1 >= 0 && obstacleGrid[i][j - 1] == 0) {
                    f[j] += f[j - 1];
                }
            }
        }
        
        return f[m - 1];
    }
}
```

## [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

给你一个字符串 `s`，找到 `s` 中最长的回文子串。

如果字符串的反序与原始字符串相同，则该字符串称为回文字符串。

解法1.动态规划

用 P(i,j) 表示字符串 s 的第 i 到 j 个字母组成的串（下文表示成 s[i:j]）是否为回文串

最后要求的就是所有 P(i,j)=true 中 j−i+1(即子串长度）的最大值.

从字符串长度2，一直往后枚举。

```java
public class Solution {

    public String longestPalindrome(String s) {
        int len = s.length();
        if (len < 2) {
            return s;
        }

        int maxLen = 1;
        int begin = 0;
        // dp[i][j] 表示 s[i..j] 是否是回文串
        boolean[][] dp = new boolean[len][len];
        // 初始化：所有长度为 1 的子串都是回文串
        for (int i = 0; i < len; i++) {
            dp[i][i] = true;
        }

        char[] charArray = s.toCharArray();
        // 递推开始
        // 先枚举子串长度 L是字符串的长度
        for (int L = 2; L <= len; L++) {
            // 枚举左边界，左边界的上限设置可以宽松一些
            for (int i = 0; i < len; i++) {
                // 由 L 和 i 可以确定右边界，即 j - i + 1 = L 得
                int j = L + i - 1;
                // 如果右边界越界，就可以退出当前循环
                if (j >= len) {
                    break;
                }
                if (charArray[i] != charArray[j]) {
                    dp[i][j] = false;
                } else {
                  //长度小于等2，则为正值
                    if (j - i < 3) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i + 1][j - 1];
                    }
                }

                // 只要 dp[i][L] == true 成立，就表示子串 s[i..L] 是回文，此时记录回文长度和起始位置
                if (dp[i][j] && j - i + 1 > maxLen) {
                    maxLen = j - i + 1;
                    begin = i;
                }
            }
        }
        return s.substring(begin, begin + maxLen);
    }
}
```

解法2：中心扩展算法，边界情况即为子串长度为 1 或 2 的情况。「边界情况」对应的子串实际上就是我们「扩展」出的回文串的「回文中心」。方法二的本质即为：我们枚举所有的「回文中心」并尝试「扩展」，直到无法扩展为止，此时的回文串长度即为此「回文中心」下的最长回文串长度。我们对所有的长度求出最大值，即可得到最终的答案。

从长度为1的进行扩展。

从长度为2的进行扩展。

```java
class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) {
            return "";
        }
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
          //从长度为1的进行扩展
            int len1 = expandAroundCenter(s, i, i);
          //从长度为2的进行扩展
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = Math.max(len1, len2);
           //只有len更新了才需要更新start和end
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        return s.substring(start, end + 1);
    }

    public int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            --left;
            ++right;
        }
        return right - left - 1;
    }
}
```

## [97. 交错字符串](https://leetcode.cn/problems/interleaving-string/)

给定三个字符串 `s1`、`s2`、`s3`，请你帮忙验证 `s3` 是否是由 `s1` 和 `s2` **交错** 组成的。

两个字符串 `s` 和 `t` **交错** 的定义与过程如下，其中每个字符串都会被分割成若干 **非空** 子字符串：

- `s = s1 + s2 + ... + sn`
- `t = t1 + t2 + ... + tm`
- `|n - m| <= 1`
- **交错** 是 `s1 + t1 + s2 + t2 + s3 + t3 + ...` 或者 `t1 + s1 + t2 + s2 + t3 + s3 + ...`

**注意：**`a + b` 意味着字符串 `a` 和 `b` 连接。

解法： f(i,j) 表示 s1的前 i 个元素和 s2的前 j 个元素是否能交错组成 s3的前 i+j个元素。

动态规划转移方程：

f(i,j)=[f(i−1,j) and s1(i−1)=s3(p)] or [f(i,j−1) and s2(j−1)=s3(p)]

```java
class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int n = s1.length(), m = s2.length(), t = s3.length();
        if (n + m != t) {
            return false;
        }
        boolean[][] f = new boolean[n + 1][m + 1];
      //边界条件
        f[0][0] = true;
        for (int i = 0; i <= n; ++i) {
            for (int j = 0; j <= m; ++j) {
                int p = i + j - 1;
                if (i > 0) {
                  //为什么要进行或运算呢?是因为在i>0和j>0的时候，都会计算f[i][j]的值，为了避免相互影响，需要对自身进行或运算
                    f[i][j] = f[i][j] || (f[i - 1][j] && s1.charAt(i - 1) == s3.charAt(p));
                }
                if (j > 0) {
                    f[i][j] = f[i][j] || (f[i][j - 1] && s2.charAt(j - 1) == s3.charAt(p));
                }
            }
        }
        return f[n][m];
    }
}
```

解法2.用滚动数组优化

```java
class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int n = s1.length(), m = s2.length(), t = s3.length();

        if (n + m != t) {
            return false;
        }

        boolean[] f = new boolean[m + 1];

        f[0] = true;
        for (int i = 0; i <= n; ++i) {
            for (int j = 0; j <= m; ++j) {
                int p = i + j - 1;
                if (i > 0) {
                    f[j] = f[j] && s1.charAt(i - 1) == s3.charAt(p);
                }
                if (j > 0) {
                    f[j] = f[j] || (f[j - 1] && s2.charAt(j - 1) == s3.charAt(p));
                }
            }
        }

        return f[m];
    }
}
```

## [72. 编辑距离](https://leetcode.cn/problems/edit-distance/)

给你两个单词 `word1` 和 `word2`， *请返回将 `word1` 转换成 `word2` 所使用的最少操作数* 。

你可以对一个单词进行如下三种操作：

- 插入一个字符
- 删除一个字符
- 替换一个字符

解法：f(i,j)=f(i-1,j-1)+1  i=j   A替换字符， 特殊情况：如果i和j位置的字符相同，那么还是等于f(i-1,j-1)

f(i,j)=f(i-1,j)+1  i=j-1    A添加字符

f(i,j)=f(i,j-1)+1  i=j+1    B删除字符

取三种情况的最小值。

那么我们可以写出如下的状态转移方程：

若 A 和 B 的最后一个字母相同：

D\[i][j]=

=min(D\[i][j−1]+1,D\[i−1][j]+1,D\[i−1][j−1])
=1+min(D\[i][j−1],D\[i−1][j],D\[i−1][j−1]−1)

若 A 和 B 的最后一个字母不同：
D\[i][j]=1+min(D\[i][j−1],D\[i−1][j],D\[i−1][j−1])

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int n = word1.length();
        int m = word2.length();

        // 有一个字符串为空串，返回另外一个字符串的长度
        if (n * m == 0) {
            return n + m;
        }

        // DP 数组
        int[][] D = new int[n + 1][m + 1];

        // 边界状态初始化
        for (int i = 0; i < n + 1; i++) {
            D[i][0] = i;
        }
        for (int j = 0; j < m + 1; j++) {
            D[0][j] = j;
        }

        // 计算所有 DP 值
        for (int i = 1; i < n + 1; i++) {
            for (int j = 1; j < m + 1; j++) {
                int left = D[i - 1][j] + 1;
                int down = D[i][j - 1] + 1;
                int left_down = D[i - 1][j - 1];
                if (word1.charAt(i - 1) != word2.charAt(j - 1)) {
                    left_down += 1;
                }
                D[i][j] = Math.min(left, Math.min(down, left_down));
            }
        }
        return D[n][m];
    }
}
```

## [123. 买卖股票的最佳时机 III](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/)

给定一个数组，它的第 `i` 个元素是一支给定的股票在第 `i` 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 **两笔** 交易。

**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

解法：从前往后计算前一段的最大利益， 从后往前计算后一段的最大利益，然后两段相加。去最大值。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int[] dp1 = new int[n],dp2 = new int[n];
        // 从前往后计算前一段的最大利益
        int minVal = prices[0];
        for(int i=1;i<n;i++){
        	//找到最低点
            dp1[i] = Math.max(dp1[i-1],prices[i]-minVal);
            minVal = Math.min(minVal,prices[i]);
        }
        // 从后往前计算后一段的最大利益
        int maxVal = prices[n-1];
        for(int i=n-2;i>=0;i--){
        //找到最高点
            dp2[i] = Math.max(dp2[i+1],maxVal-prices[i]);
            maxVal = Math.max(maxVal,prices[i]);
        }
        //两段相加
        int res = 0;
        for(int i=0;i<n;i++){
            res = Math.max(res,dp1[i]+dp2[i]);
        }
        return res;
    }
}
```

动态规划。buy1，sell1，buy2以及 sell2分别表示，只进行过一次买操作，进行了一次买操作和一次卖操作，即完成了一笔交易，在完成了一笔交易的前提下，进行了第二次买操作，完成了全部两笔交易时候的最大利润。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int buy1 = -prices[0], sell1 = 0;
        int buy2 = -prices[0], sell2 = 0;
        for (int i = 1; i < n; ++i) {
            buy1 = Math.max(buy1, -prices[i]);
            sell1 = Math.max(sell1, buy1 + prices[i]);
            buy2 = Math.max(buy2, sell1 - prices[i]);
            sell2 = Math.max(sell2, buy2 + prices[i]);
        }
        return sell2;
    }
}
```

通用解法最多K次交易：

```java
class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (n == 0) return 0;
        int[] buy = new int[k + 1];
        int[] sell = new int[k + 1];
        Arrays.fill(buy, -prices[0]);
        for (int i = 1; i < n; i++) {
            for (int j = 1; j <= k; j++) {
                buy[j] = Math.max(buy[j], sell[j - 1] - prices[i]);
                sell[j] = Math.max(sell[j], buy[j] + prices[i]);
            }
        }
        return sell[k];
    }
}
```

## [188. 买卖股票的最佳时机 IV](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/)

给你一个整数数组 `prices` 和一个整数 `k` ，其中 `prices[i]` 是某支给定的股票在第 `i` 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 `k` 笔交易。也就是说，你最多可以买 `k` 次，卖 `k` 次。

**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

解法，动态规划

我们使用一系列变量存储「买入」的状态，再用一系列变量存储「卖出」的状态，通过动态规划的方法即可解决本题。

## [221. 最大正方形](https://leetcode.cn/problems/maximal-square/)

在一个由 `'0'` 和 `'1'` 组成的二维矩阵内，找到只包含 `'1'` 的最大正方形，并返回其面积。

解法：动态规划，用 dp(i,j) 表示以 (i,j)为右下角，且只包含 1 的正方形的**边长最大值**。

如果该位置的值是 0，则 dp(i,j)=0 因为当前位置不可能在由 1组成的正方形中；

如果该位置的值是 1，则 dp(i,j)的值由其上方、左方和左上方的三个相邻位置的 dp 值决定。具体而言，当前位置的元素值等于三个相邻位置的元素中的最小值加 1，状态转移方程如下：
dp(i,j)=min(dp(i−1,j),dp(i−1,j−1),dp(i,j−1))+1   前提条件是matrix\[i][j] == '1'

```java
class Solution {
    public int maximalSquare(char[][] matrix) {
        int maxSide = 0;
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return maxSide;
        }
        int rows = matrix.length, columns = matrix[0].length;
        int[][] dp = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                if (matrix[i][j] == '1') {
                    if (i == 0 || j == 0) {
                        dp[i][j] = 1;
                    } else {
                        dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]) + 1;
                    }
                    maxSide = Math.max(maxSide, dp[i][j]);
                }
            }
        }
        int maxSquare = maxSide * maxSide;
        return maxSquare;
    }
}

```

## [1277. 统计全为 1 的正方形子矩阵](https://leetcode.cn/problems/count-square-submatrices-with-all-ones/)

给你一个 `m * n` 的矩阵，矩阵中的元素不是 `0` 就是 `1`，请你统计并返回其中完全由 `1` 组成的 **正方形** 子矩阵的个数。

解法和221题一样。

f(i,j) 表示以 (i,j)为右下角，且只包含 1 的正方形的**边长最大值**

那么除此定义之外，`f[i][j] = x` 也表示以 `(i, j)` 为右下角的正方形的数目为 `x`(即边长为 `1, 2, ..., x` 的正方形各一个）。在计算出所有的 `f[i][j]` 后，我们将它们进行累加，就可以得到矩阵中正方形的数目。

```java
class Solution {
    public int countSquares(int[][] matrix) {
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return 0;
        }

        int m = matrix.length, n = matrix[0].length;
        int[][] f = new int[m][n];
        int ans = 0;
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (i == 0 || j == 0) {
                    f[i][j] = matrix[i][j];
                }
                else if (matrix[i][j] == 0) {
                    f[i][j] = 0;
                }
                else {
                    f[i][j] = Math.min(Math.min(f[i][j - 1], f[i - 1][j]), f[i - 1][j - 1]) + 1;
                }
                ans += f[i][j];
            }
        }
        return ans;

    }
}
```

