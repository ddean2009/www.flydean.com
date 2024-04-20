# 分治

## [108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

给你一个整数数组 `nums` ，其中元素已经按 **升序** 排列，请你将其转换为一棵 **高度平衡** 二叉搜索树。

**高度平衡** 二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1 」的二叉树。

解法： 二叉搜索树的中序遍历是升序序列，题目给定的数组是按照升序排序的有序数组，因此可以确保数组是二叉搜索树的中序遍历序列。

我们可以选择中间数字作为二叉搜索树的根节点，这样分给左右子树的数字个数相同或只相差 1，可以使得树保持平衡。如果数组长度是奇数，则根节点的选择是唯一的，如果数组长度是偶数，则可以选择**中间位置左边的数字**作为根节点或者选择中间位置右边的数字作为根节点，选择不同的数字作为根节点则创建的平衡二叉搜索树也是不同的。

确定平衡二叉搜索树的根节点之后，其余的数字分别位于平衡二叉搜索树的左子树和右子树中，左子树和右子树分别也是平衡二叉搜索树，因此可以通过递归的方式创建平衡二叉搜索树。

递归的基准情形是平衡二叉搜索树不包含任何数字，此时平衡二叉搜索树为空。

```java
class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return helper(nums, 0, nums.length - 1);
    }

    public TreeNode helper(int[] nums, int left, int right) {
        if (left > right) {
            return null;
        }
        // 总是选择中间位置左边的数字作为根节点
        int mid = (left + right) / 2;

        TreeNode root = new TreeNode(nums[mid]);
        root.left = helper(nums, left, mid - 1);
        root.right = helper(nums, mid + 1, right);
        return root;
    }
}

```

## [148. 排序链表](https://leetcode.cn/problems/sort-list/)

给你链表的头结点 `head` ，请将其按 **升序** 排列并返回 **排序后的链表** 。

方法1. 归并排序。

找到链表的中点，以中点为分界，将链表拆分成两个子链表。寻找链表的中点可以使用快慢指针的做法，快指针每次移动 2 步，慢指针每次移动 1 步，当快指针到达链表末尾时，慢指针指向的链表节点即为链表的中点。

对两个子链表分别排序。

将两个排序后的子链表合并，得到完整的排序后的链表。可以使用「21. 合并两个有序链表」的做法，将两个有序的子链表进行合并。

```java
 public static ListNode sortList(ListNode head){
        if(head==null || head.next==null){
            return head;
        }
        // 找到中间节点并断开链表
        ListNode mid = findMiddle(head);
        ListNode right = mid.next;
        mid.next = null;

        // 递归排序左右两部分链表
        ListNode leftSorted = sortList(head);
        ListNode rightSorted = sortList(right);

        return mergeTwoList(leftSorted,rightSorted);
    }

    public static ListNode findMiddle(ListNode node){
       ListNode slow=node;
       ListNode fast=node;
       while(fast!=null && fast.next !=null && fast.next.next !=null){
           slow=slow.next;
           fast=fast.next.next;
       }
       return slow;
    }

    public static ListNode mergeTwoList(ListNode first, ListNode second){
        if(first==null){
            return second;
        }else if(second==null){
            return first;
        }else if(first.val < second.val){
            first.next=mergeTwoList(first.next, second);
            return first;
        }else{
            second.next=mergeTwoList(first,second.next);
            return second;
        }
    }
```

## [427. 建立四叉树](https://leetcode.cn/problems/construct-quad-tree/)

给你一个 `n * n` 矩阵 `grid` ，矩阵由若干 `0` 和 `1` 组成。请你用四叉树表示该矩阵 `grid` 。

你需要返回能表示矩阵 `grid` 的 四叉树 的根结点。

四叉树数据结构中，每个内部节点只有四个子节点。此外，每个节点都有两个属性：

- `val`：储存叶子结点所代表的区域的值。1 对应 **True**，0 对应 **False**。注意，当 `isLeaf` 为 **False** 时，你可以把 **True** 或者 **False** 赋值给节点，两种值都会被判题机制 **接受** 。
- `isLeaf`: 当这个节点是一个叶子结点时为 **True**，如果它有 4 个子节点则为 **False** 。

```java
class Node {
    public boolean val;
    public boolean isLeaf;
    public Node topLeft;
    public Node topRight;
    public Node bottomLeft;
    public Node bottomRight;
}
```

解法1。递归

```java
class Solution {
    public Node construct(int[][] grid) {
        return dfs(grid, 0, 0, grid.length, grid.length);
    }

    public Node dfs(int[][] grid, int r0, int c0, int r1, int c1) {
        boolean same = true;
        for (int i = r0; i < r1; ++i) {
            for (int j = c0; j < c1; ++j) {
              //判断是否所有的节点都是相同的
                if (grid[i][j] != grid[r0][c0]) {
                    same = false;
                    break;
                }
            }
            if (!same) {
                break;
            }
        }

        if (same) {
          //如果都相同，说明是一个叶子结点。
            return new Node(grid[r0][c0] == 1, true);
        }

       //不相同，那么递归四个节点
        Node ret = new Node(
            true,
            false,
            dfs(grid, r0, c0, (r0 + r1) / 2, (c0 + c1) / 2),
            dfs(grid, r0, (c0 + c1) / 2, (r0 + r1) / 2, c1),
            dfs(grid, (r0 + r1) / 2, c0, r1, (c0 + c1) / 2),
            dfs(grid, (r0 + r1) / 2, (c0 + c1) / 2, r1, c1)
        );
        return ret;
    }
}
```

解法2， 判断是否我们可以对方法一中暴力判定某一部分是否均为 0 或 1 的代码进行优化。

具体地，当某一部分均为 0 时，它的和为 0；某一部分均为 1 时，它的和为这一部分的面积大小。因此我们可以使用**二维前缀和**（参考「304. 二维区域和检索 - 矩阵不可变」）进行优化。

```java
class Solution {
    public Node construct(int[][] grid) {
        int n = grid.length;
        int[][] pre = new int[n + 1][n + 1];
        for (int i = 1; i <= n; ++i) {
            for (int j = 1; j <= n; ++j) {
                pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + grid[i - 1][j - 1];
            }
        }
        return dfs(grid, pre, 0, 0, n, n);
    }

    public Node dfs(int[][] grid, int[][] pre, int r0, int c0, int r1, int c1) {
        int total = getSum(pre, r0, c0, r1, c1);
        if (total == 0) {
            return new Node(false, true);
        } else if (total == (r1 - r0) * (c1 - c0)) {
            return new Node(true, true);
        }

        Node ret = new Node(
            true,
            false,
            dfs(grid, pre, r0, c0, (r0 + r1) / 2, (c0 + c1) / 2),
            dfs(grid, pre, r0, (c0 + c1) / 2, (r0 + r1) / 2, c1),
            dfs(grid, pre, (r0 + r1) / 2, c0, r1, (c0 + c1) / 2),
            dfs(grid, pre, (r0 + r1) / 2, (c0 + c1) / 2, r1, c1)
        );
        return ret;
    }

    public int getSum(int[][] pre, int r0, int c0, int r1, int c1) {
        return pre[r1][c1] - pre[r1][c0] - pre[r0][c1] + pre[r0][c0];
    }
}
```

## [303. 区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/)

给定一个整数数组  `nums`，处理以下类型的多个查询:

1. 计算索引 `left` 和 `right` （包含 `left` 和 `right`）之间的 `nums` 元素的 **和** ，其中 `left <= right`

实现 `NumArray` 类：

- `NumArray(int[] nums)` 使用数组 `nums` 初始化对象
- `int sumRange(int i, int j)` 返回数组 `nums` 中索引 `left` 和 `right` 之间的元素的 **总和** ，包含 `left` 和 `right` 两点（也就是 `nums[left] + nums[left + 1] + ... + nums[right]` )

解法：这种范围统计的，使用**前缀和**

```java
class NumArray {
    int[] sums;

    public NumArray(int[] nums) {
        int n = nums.length;
        sums = new int[n + 1];
        for (int i = 0; i < n; i++) {
            sums[i + 1] = sums[i] + nums[i];
        }
    }
    //为什么要j+1呢？考虑i=j的情况
    public int sumRange(int i, int j) {
        return sums[j + 1] - sums[i];
    }
}
```

## 304. 二维区域和检索 - 矩阵不可变

给定一个二维矩阵 `matrix`，以下类型的多个请求：

- 计算其子矩形范围内元素的总和，该子矩阵的 **左上角** 为 `(row1, col1)` ，**右下角** 为 `(row2, col2)` 。

实现 `NumMatrix` 类：

- `NumMatrix(int[][] matrix)` 给定整数矩阵 `matrix` 进行初始化
- `int sumRegion(int row1, int col1, int row2, int col2)` 返回 **左上角** `(row1, col1)` 、**右下角** `(row2, col2)` 所描述的子矩阵的元素 **总和** 。

解法：前缀和，田字形，已知整体面积，上面面积，左边面积，左上面积，求右下角矩形的面积。 右下角矩形的面积=整体面积-上面面积-左边面积+左上面积

```java
class NumMatrix {
    int[][] sums;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length;
        if (m > 0) {
            int n = matrix[0].length;
            sums = new int[m + 1][n + 1];
            for (int i = 0; i < m; i++) {
                for (int j = 0; j < n; j++) {
                  //当前以i,j为右下角的sum值
                    sums[i + 1][j + 1] = sums[i][j + 1] + sums[i + 1][j] - sums[i][j] + matrix[i][j];
                }
            }
        }
    }
    
    public int sumRegion(int row1, int col1, int row2, int col2) {
      //为什么要row2+1呢？考虑row1=row2的情况
        return sums[row2 + 1][col2 + 1] - sums[row1][col2 + 1] - sums[row2 + 1][col1] + sums[row1][col1];
    }
}
```





## [23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

方法1。顺序合并，分别按两个链表来合并。

```java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        ListNode ans = null;
        for (int i = 0; i < lists.length; ++i) {
            ans = mergeTwoLists(ans, lists[i]);
        }
        return ans;
    }

    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        if (a == null || b == null) {
            return a != null ? a : b;
        }
        ListNode head = new ListNode(0);
        ListNode tail = head, aPtr = a, bPtr = b;
        while (aPtr != null && bPtr != null) {
            if (aPtr.val < bPtr.val) {
                tail.next = aPtr;
                aPtr = aPtr.next;
            } else {
                tail.next = bPtr;
                bPtr = bPtr.next;
            }
            tail = tail.next;
        }
        tail.next = (aPtr != null ? aPtr : bPtr);
        return head.next;
    }
}
```

方法2.归并排序

```java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        return merge(lists, 0, lists.length - 1);
    }

    public ListNode merge(ListNode[] lists, int l, int r) {
        if (l == r) {
            return lists[l];
        }
        if (l > r) {
            return null;
        }
        int mid = (l + r) >> 1;
        return mergeTwoLists(merge(lists, l, mid), merge(lists, mid + 1, r));
    }

    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        if (a == null || b == null) {
            return a != null ? a : b;
        }
        ListNode head = new ListNode(0);
        ListNode tail = head, aPtr = a, bPtr = b;
        while (aPtr != null && bPtr != null) {
            if (aPtr.val < bPtr.val) {
                tail.next = aPtr;
                aPtr = aPtr.next;
            } else {
                tail.next = bPtr;
                bPtr = bPtr.next;
            }
            tail = tail.next;
        }
        tail.next = (aPtr != null ? aPtr : bPtr);
        return head.next;
    }
}

```

解法3.使用优先队列
