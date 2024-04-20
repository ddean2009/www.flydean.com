# 回溯


## [17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

给定一个仅包含数字 `2-9` 的字符串，返回所有它能表示的字母组合。答案可以按 **任意顺序** 返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

回溯过程中维护一个字符串，表示已有的字母排列（如果未遍历完电话号码的所有数字，则已有的字母排列是不完整的）。该字符串初始为空。每次取电话号码的一位数字，从哈希表中获得该数字对应的所有可能的字母，并将其中的一个字母插入到已有的字母排列后面，然后继续处理电话号码的后一位数字，直到处理完电话号码中的所有数字，即得到一个完整的字母排列。然后进行回退操作，遍历其余的字母排列。

**回溯算法用于寻找所有的可行解，如果发现一个解不可行，则会舍弃不可行的解。在这道题中，由于每个数字对应的每个字母都可能进入字母组合，因此不存在不可行的解，直接穷举所有的解即可。**

解法：回溯用递归

```java
class Solution {
    public List<String> letterCombinations(String digits) {
        List<String> combinations = new ArrayList<String>();
        if (digits.length() == 0) {
            return combinations;
        }
        Map<Character, String> phoneMap = new HashMap<Character, String>() {{
            put('2', "abc");
            put('3', "def");
            put('4', "ghi");
            put('5', "jkl");
            put('6', "mno");
            put('7', "pqrs");
            put('8', "tuv");
            put('9', "wxyz");
        }};
        backtrack(combinations, phoneMap, digits, 0, new StringBuffer());
        return combinations;
    }

    public void backtrack(List<String> combinations, Map<Character, String> phoneMap, String digits, int index, StringBuffer combination) {
        if (index == digits.length()) {
            combinations.add(combination.toString());
        } else {
            char digit = digits.charAt(index);
            String letters = phoneMap.get(digit);
            int lettersCount = letters.length();
            for (int i = 0; i < lettersCount; i++) {
                combination.append(letters.charAt(i));
                backtrack(combinations, phoneMap, digits, index + 1, combination);
                combination.deleteCharAt(index);
            }
        }
    }
}

```

## [77. 组合](https://leetcode.cn/problems/combinations/)

给定两个整数 `n` 和 `k`，返回范围 `[1, n]` 中所有可能的 `k` 个数的组合。

你可以按 **任何顺序** 返回答案。

解法：回溯

```java
  class Solution {
        List<List<Integer>> listTotal = new ArrayList<>();

        private void backtrack(int n, int k, List<Integer> list, int index) {
            if (list.size() == k) {
                listTotal.add(new ArrayList<>(list));
                return;
            }
          	//为什么这里是index 而不是0呢？因为这里要的结果是不重复的，并且是升序的组合
            for (int i = index; i <= n; i++) {
                // 经典回溯模板
                list.add(i);
                // 以 i + 1进行递归
                backtrack(n , k, list, i + 1);
                list.remove(list.size() - 1);
            }
        }

        public List<List<Integer>> combine(int n, int k) {
            backtrack(n, k, new ArrayList<Integer>(), 1);
            return listTotal;
        }
    }
```

## [46. 全排列](https://leetcode.cn/problems/permutations/)

给定一个**不含重复数字**的数组 `nums` ，返回其 *所有可能的全排列* 。你可以 **按任意顺序** 返回答案

解法1，回溯，因为是不含重复数字，所以需要在回溯的过程中判断数字是否被使用，所以需要一个额外的数组判断数字是否已被使用。

```java
class Solution {
    private List<List<Integer>> lists = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
        int n = nums.length;
        List<Integer> list = new ArrayList<>(n);
        boolean[] used = new boolean[n];
        int count = 0;
        backtrace(list, used, count, nums);
        return lists;
    }

    public void backtrace(List<Integer> list, boolean[] used, int count, int[] nums) {
        if (count == nums.length) {
            lists.add(new ArrayList(list));
            return;
        }
      //每次都是从0开始，就有可能出现重复的数字，所以需要一个额外的数组来判断是否重复了。
        for (int i = 0; i < used.length; i++) {
            if (!used[i]) {
                list.add(nums[i]);
                used[i] = true;
                backtrace(list, used, count + 1, nums);
                list.remove(list.size() - 1);
                used[i] = false;
            }
        }
    }
```

解法2.不是用额外数组，使用交换结果数组中数字的方式，把数组中的数组划分为已使用和未使用两部分，从而来区分是否已被使用。

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<List<Integer>>();

        List<Integer> output = new ArrayList<Integer>();
        for (int num : nums) {
            output.add(num);
        }

        int n = nums.length;
        backtrack(n, output, res, 0);
        return res;
    }

    public void backtrack(int n, List<Integer> output, List<List<Integer>> res, int first) {
        // 所有数都填完了
        if (first == n) {
            res.add(new ArrayList<Integer>(output));
        }
      //i=first可以保证不重复，
        for (int i = first; i < n; i++) {
            // 动态维护数组，这里要填output中的first的值，我们通过swap的方式来替换first的值，实现填充操作。
            Collections.swap(output, first, i);
            // 继续递归填下一个数
            backtrack(n, output, res, first + 1);
            // 撤销操作
            Collections.swap(output, first, i);
        }
    }
}
```

## [39. 组合总和](https://leetcode.cn/problems/combination-sum/)

给你一个 **无重复元素** 的整数数组 `candidates` 和一个目标整数 `target` ，找出 `candidates` 中可以使数字和为目标数 `target` 的 所有 **不同组合** ，并以列表形式返回。你可以按 **任意顺序** 返回这些组合。

`candidates` 中的 **同一个** 数字可以 **无限制重复被选取** 。如果至少一个数字的被选数量不同，则两种组合是不同的。

对于给定的输入，保证和为 `target` 的不同组合数少于 `150` 个。

对于这类寻找所有可行解的题，我们都可以尝试用「搜索回溯」的方法来解决。

我们定义递归函数 dfs(target,combine,idx)表示当前在 candidates 数组的第 idx 位，还剩 target要组合，已经组合的列表为 combine。递归的终止条件为 target≤0或者 candidates数组被全部用完。那么在当前的函数中，每次我们可以选择跳过不用第 idx个数，即执行 dfs(target,combine,idx+1)。也可以选择使用第 idx 个数，即执行 dfs(target−candidates[idx],combine,idx)，注意到每个数字可以被无限制重复选取，因此搜索的下标仍为 idx。

```java
class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> ans = new ArrayList<List<Integer>>();
        List<Integer> combine = new ArrayList<Integer>();
        dfs(candidates, target, ans, combine, 0);
        return ans;
    }

    public void dfs(int[] candidates, int target, List<List<Integer>> ans, List<Integer> combine, int idx) {
        if (idx == candidates.length) {
            return;
        }
        if (target == 0) {
            ans.add(new ArrayList<Integer>(combine));
            return;
        }
        // 直接跳过
        dfs(candidates, target, ans, combine, idx + 1);
        // 选择当前数
        if (target - candidates[idx] >= 0) {
            combine.add(candidates[idx]);
            dfs(candidates, target - candidates[idx], ans, combine, idx);
            combine.remove(combine.size() - 1);
        }
    }
}

```

## [52. N 皇后 II](https://leetcode.cn/problems/n-queens-ii/)

**n 皇后问题** 研究的是如何将 `n` 个皇后放置在 `n × n` 的棋盘上，并且使皇后彼此之间不能相互攻击。

给你一个整数 `n` ，返回 **n 皇后问题** 不同的解决方案的数量。

：依次在每一行放置一个皇后，每次新放置的皇后都不能和已经放置的皇后之间有攻击，即新放置的皇后不能和任何一个已经放置的皇后在同一列以及同一条斜线上。当 N 个皇后都放置完毕，则找到一个可能的解，将可能的解的数量加 1。

列的表示法很直观，一共有 N 列，每一列的下标范围从 0 到 N−1，使用列的下标即可明确表示每一列。

如何表示两个方向的斜线呢？对于每个方向的斜线，需要找到斜线上的每个位置的行下标与列下标之间的关系。

方向一的斜线为从左上到右下方向，同一条斜线上的每个位置满足行下标与列下标之差相等，例如 (0,0) 和 (3,3) 在同一条方向一的斜线上。因此使用行下标与列下标之差即可明确表示每一条方向一的斜线。

```java
class Solution {
    public int totalNQueens(int n) {
        Set<Integer> columns = new HashSet<Integer>();
        Set<Integer> diagonals1 = new HashSet<Integer>();
        Set<Integer> diagonals2 = new HashSet<Integer>();
        return backtrack(n, 0, columns, diagonals1, diagonals2);
    }

  //一行一行遍历，先遍历第0行，直到第n-1行
    public int backtrack(int n, int row, Set<Integer> columns, Set<Integer> diagonals1, Set<Integer> diagonals2) {
        if (row == n) {
            return 1;
        } else {
            int count = 0;
          //有n列
            for (int i = 0; i < n; i++) {
                if (columns.contains(i)) {
                    continue;
                }
                int diagonal1 = row - i;
                if (diagonals1.contains(diagonal1)) {
                    continue;
                }
                int diagonal2 = row + i;
                if (diagonals2.contains(diagonal2)) {
                    continue;
                }
                columns.add(i);
                diagonals1.add(diagonal1);
                diagonals2.add(diagonal2);
                count += backtrack(n, row + 1, columns, diagonals1, diagonals2);
                columns.remove(i);
                diagonals1.remove(diagonal1);
                diagonals2.remove(diagonal2);
            }
            return count;
        }
    }
}
```



## [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/)

数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。

解法1：递归生成可用的左右括号。

```java
class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        generateOne(res, "", n, n);
        return res;
    }
    
    private void generateOne(List<String> list, String string, int left, int right) {
        // left, rigth 分别代表可用的左括号数和可用的右括号数，初始都是 n个可用
        if (left == 0 && right == 0) {
            list.add(string);
            return;
        }
        if (left > 0) {
            generateOne(list, string + "(", left - 1, right);
        }
        // 可用的括号 右括号大于左括号时，说明有 左括号先放置，才会是有效的括号组合
        if (right > left) {
            generateOne(list, string + ")", left, right - 1);    
        }        
        
    }
}
```

解法2.回溯 TODO



## [79. 单词搜索](https://leetcode.cn/problems/word-search/)

给定一个 `m x n` 二维字符网格 `board` 和一个字符串单词 `word` 。如果 `word` 存在于网格中，返回 `true` ；否则，返回 `false` 。

单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。

解法：对比212题，这里使用的是回溯。

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        int h = board.length, w = board[0].length;
        boolean[][] visited = new boolean[h][w];
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                boolean flag = check(board, visited, i, j, word, 0);
                if (flag) {
                    return true;
                }
            }
        }
        return false;
    }

    public boolean check(char[][] board, boolean[][] visited, int i, int j, String s, int k) {
        if (board[i][j] != s.charAt(k)) {
            return false;
        } else if (k == s.length() - 1) {
            return true;
        }
        visited[i][j] = true;
        int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        boolean result = false;
        for (int[] dir : directions) {
            int newi = i + dir[0], newj = j + dir[1];
            if (newi >= 0 && newi < board.length && newj >= 0 && newj < board[0].length) {
                if (!visited[newi][newj]) {
                    boolean flag = check(board, visited, newi, newj, s, k + 1);
                    if (flag) {
                        result = true;
                        break;
                    }
                }
            }
        }
        visited[i][j] = false;
        return result;
    }
}
```
