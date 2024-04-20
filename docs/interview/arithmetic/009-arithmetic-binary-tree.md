# 二叉树


## [104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

给定一个二叉树 `root` ，返回其最大深度。

二叉树的 **最大深度** 是指从根节点到最远叶子节点的最长路径上的节点数。

递归

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if(root==null){
            return 0;
        }
        return Math.max(maxDepth(root.left),maxDepth(root.right))+1;

    }
}
```

## [100. 相同的树](https://leetcode.cn/problems/same-tree/)

给你两棵二叉树的根节点 `p` 和 `q` ，编写一个函数来检验这两棵树是否相同。

如果两个树在结构上相同，并且节点具有相同的值，则认为它们是相同的。

递归

```
class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {

        if(p==null && q ==null){
            return true;
        }
        if((p !=null && q ==null )|| (q!=null && p==null)){
            return false;
        }

        return p.val==q.val && isSameTree(p.left, q.left ) && isSameTree(p.right, q.right);


    }
}
```

## [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

给你一棵二叉树的根节点 `root` ，翻转这棵二叉树，并返回其根节点。

递归

```java
class Solution {
    public TreeNode invertTree(TreeNode root) {

        if(root ==null){
            return root;
        }
        TreeNode temp=root.left;
        root.left=root.right;
        root.right=temp;
        invertTree(root.left);
        invertTree(root.right);
        return root;

    }
}
```

## [101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/)

给你一个二叉树的根节点 `root` ， 检查它是否轴对称。

递归

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {

        if(root ==null){
            return false;
        }
        return isSymmetric(root.left,root.right);


    }

    public boolean isSymmetric(TreeNode node1, TreeNode node2){
        if(node1 ==null && node2 ==null){
            return true;
        }else if (node1 !=null && node2 !=null){
            return node1.val ==node2.val && isSymmetric(node1.left, node2.right) 
            && isSymmetric(node1.right, node2.left);

        }else{
            return false;
        }
    }

}
```

## [105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

给定两个整数数组 `preorder` 和 `inorder` ，其中 `preorder` 是二叉树的**先序遍历**， `inorder` 是同一棵树的**中序遍历**，请构造二叉树并返回其根节点。

解法：递归，在中序遍历中定位到根节点，那么我们就可以分别知道左子树和右子树中的节点数目。由于同一颗子树的前序遍历和中序遍历的长度显然是相同的，因此我们就可以对应到前序遍历的结果中，对上述形式中的所有左右括号进行定位。

同时使用hashMap来存储中序遍历的节点和位置。用来方便计算左右子树的长度。

```java
class Solution {
    private Map<Integer, Integer> indexMap;

    public TreeNode myBuildTree(int[] preorder, int[] inorder, int preorder_left, int preorder_right, int inorder_left, int inorder_right) {
        if (preorder_left > preorder_right) {
            return null;
        }

        // 前序遍历中的第一个节点就是根节点
        int preorder_root = preorder_left;
        // 在中序遍历中定位根节点
        int inorder_root = indexMap.get(preorder[preorder_root]);
        // 先把根节点建立出来
        TreeNode root = new TreeNode(preorder[preorder_root]);
        // 得到左子树中的节点数目
        int size_left_subtree = inorder_root - inorder_left;
        // 递归地构造左子树，并连接到根节点
        // 先序遍历中「从 左边界+1 开始的 size_left_subtree」个元素就对应了中序遍历中「从 左边界 开始到 根节点定位-1」的元素
        root.left = myBuildTree(preorder, inorder, preorder_left + 1, preorder_left + size_left_subtree, inorder_left, inorder_root - 1);
        // 递归地构造右子树，并连接到根节点
        // 先序遍历中「从 左边界+1+左子树节点数目 开始到 右边界」的元素就对应了中序遍历中「从 根节点定位+1 到 右边界」的元素
        root.right = myBuildTree(preorder, inorder, preorder_left + size_left_subtree + 1, preorder_right, inorder_root + 1, inorder_right);
        return root;
    }

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        int n = preorder.length;
        // 构造哈希映射，帮助我们快速定位根节点
        indexMap = new HashMap<Integer, Integer>();
        for (int i = 0; i < n; i++) {
            indexMap.put(inorder[i], i);
        }
        return myBuildTree(preorder, inorder, 0, n - 1, 0, n - 1);
    }
}
```

## [106. 从中序与后序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

给定两个整数数组 `inorder` 和 `postorder` ，其中 `inorder` 是二叉树的中序遍历， `postorder` 是同一棵树的后序遍历，请你构造并返回这颗 *二叉树* 。

解法，同样使用map来存储inorder的值和index。

因为postorder最后的元素就是根节点，所以可以直接length--得到。

```java
class Solution {

    int post_idx;
    int[] inorder;
    int[] postorder;

      Map<Integer, Integer> idx_map = new HashMap<Integer, Integer>();

     public TreeNode helper(int in_left, int in_right){
        if(in_left > in_right){
            return null;
        }
        int root_val=postorder[post_idx];
        TreeNode root = new TreeNode(root_val);
        int index = idx_map.get(root_val);
        post_idx--;

       //注意这里的顺序，因为我们是通过后续遍历的post_idx来定位root节点，后续遍历是先左，再右，最后后。所以这里的顺序得反过来，先右后左 。
        root.right=helper(index+1, in_right);
        root.left = helper(in_left,index-1);
        return root;
    }

    public TreeNode buildTree(int[] inorder, int[] postorder) {
        this.postorder=postorder;
        this.inorder=inorder;

        post_idx=inorder.length-1;

        int idx=0;
        for(Integer val: inorder){
            idx_map.put(val, idx++);
        }
        return helper(0,inorder.length-1);
    }
}
```

## [117. 填充每个节点的下一个右侧节点指针 II](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/)

给定一个二叉树：

```
struct Node {
  int val;
  Node *left;
  Node *right;
  Node *next;
}
```

填充它的每个 next 指针，让这个指针指向其下一个右侧节点。如果找不到下一个右侧节点，则将 next 指针设置为 `NULL` 。

初始状态下，所有 next 指针都被设置为 `NULL` 。

解法：层次遍历

```java
class Solution {
    public Node connect(Node root) {
        if (root == null) {
            return null;
        }
        Queue<Node> queue = new ArrayDeque<Node>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int n = queue.size();
            Node last = null;
            for (int i = 1; i <= n; ++i) {
                Node f = queue.poll();
                if (f.left != null) {
                    queue.offer(f.left);
                }
                if (f.right != null) {
                    queue.offer(f.right);
                }
                if (i != 1) {
                    last.next = f;
                }
               //last是本层的第一个节点
                last = f;
            }
        }
        return root;
    }
}
```

## [114. 二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

给你二叉树的根结点 `root` ，请你将它展开为一个单链表：

- 展开后的单链表应该同样使用 `TreeNode` ，其中 `right` 子指针指向链表中下一个结点，而左子指针始终为 `null` 。
- 展开后的单链表应该与二叉树 [**先序遍历**](https://baike.baidu.com/item/先序遍历/6442839?fr=aladdin) 顺序相同。

解法一，前序遍历

```java
//递归法
class Solution {
    public void flatten(TreeNode root) {
        List<TreeNode> list = new ArrayList<TreeNode>();
        preorderTraversal(root, list);
        int size = list.size();
        for (int i = 1; i < size; i++) {
            TreeNode prev = list.get(i - 1), curr = list.get(i);
            prev.left = null;
            prev.right = curr;
        }
    }

    public void preorderTraversal(TreeNode root, List<TreeNode> list) {
        if (root != null) {
            list.add(root);
            preorderTraversal(root.left, list);
            preorderTraversal(root.right, list);
        }
    }
}
```

迭代法

```java
class Solution {
    public void flatten(TreeNode root) {
        List<TreeNode> list = new ArrayList<TreeNode>();
        Deque<TreeNode> stack = new LinkedList<TreeNode>();
        TreeNode node = root;
        while (node != null || !stack.isEmpty()) {
            while (node != null) {
                list.add(node);
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            node = node.right;
        }
        int size = list.size();
        for (int i = 1; i < size; i++) {
            TreeNode prev = list.get(i - 1), curr = list.get(i);
            prev.left = null;
            prev.right = curr;
        }
    }
}
```

解法2：

1. 将左子树插入到右子树的地方
2. 将原来的右子树接到左子树的最右边节点
3. 考虑新的右子树的根节点，一直重复上边的过程，直到新的右子树为 null

```java
public void flatten(TreeNode root) {
    while (root != null) { 
        //左子树为 null，直接考虑下一个节点
        if (root.left == null) {
            root = root.right;
        } else {
            // 找左子树最右边的节点
            TreeNode pre = root.left;
            while (pre.right != null) {
                pre = pre.right;
            } 
            //将原来的右子树接到左子树的最右边节点
            pre.right = root.right;
            // 将左子树插入到右子树的地方
            root.right = root.left;
            root.left = null;
            // 考虑下一个节点
            root = root.right;
        }
    }
}

```

## [112. 路径总和](https://leetcode.cn/problems/path-sum/)

给你二叉树的根节点 `root` 和一个表示目标和的整数 `targetSum` 。判断该树中是否存在 **根节点到叶子节点** 的路径，这条路径上所有节点值相加等于目标和 `targetSum` 。如果存在，返回 `true` ；否则，返回 `false` 。

**叶子节点** 是指没有子节点的节点

递归，如果是叶子结点，则判断值是否一致，否则左右继续递归。

```java
class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if(root==null){
            return false;
        }
        if(root.left==null && root.right==null){
            return root.val ==targetSum;
        }
        return hasPathSum(root.left,targetSum-root.val) || hasPathSum(root.right,targetSum-root.val);
    }
}
```

## [129. 求根节点到叶节点数字之和](https://leetcode.cn/problems/sum-root-to-leaf-numbers/)

给你一个二叉树的根节点 `root` ，树中每个节点都存放有一个 `0` 到 `9` 之间的数字。

每条从根节点到叶节点的路径都代表一个数字：

- 例如，从根节点到叶节点的路径 `1 -> 2 -> 3` 表示数字 `123` 。

计算从根节点到叶节点生成的 **所有数字之和** 。

**叶节点** 是指没有子节点的节点。

解法：从上到下递归，如果是叶子结点，则返回sum值。

```java
class Solution {
    public int sumNumbers(TreeNode root) {
        return dfs(root, 0);
    }

    public int dfs(TreeNode root, int preSum){
        if(root ==null){
            return 0;
        }
        int sum=preSum*10 +root.val;
        if(root.left == null && root.right == null){
            return sum;
        }else{
            return dfs(root.left, sum) + dfs(root.right, sum);
        }
    
    }
}
```

## [124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

二叉树中的 **路径** 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 **至多出现一次** 。该路径 **至少包含一个** 节点，且不一定经过根节点。

**路径和** 是路径中各节点值的总和。

给你一个二叉树的根节点 `root` ，返回其 **最大路径和** 。

解法，首先定义一个函数，返回的是一个节点的**最大贡献值**，具体而言，就是在以该节点为根节点的子树中寻找以该节点为起点的一条路径，使得该路径上的节点值之和最大。

然后就可以使用递归了。然后在递归中计算最大的值。

```java
class Solution {
    int maxSum =Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) {
        maxGain(root);
        return maxSum;
    }

    private int maxGain(TreeNode root){
        if(root ==null){
            return 0;
        }

        int leftGain = Math.max(maxGain(root.left),0);
        int rightGain=Math.max(maxGain(root.right),0);

        int newPath = root.val+leftGain+rightGain;
        maxSum=Math.max(maxSum, newPath);
        return root.val+Math.max(leftGain,rightGain);
    }
}
```

## [173. 二叉搜索树迭代器](https://leetcode.cn/problems/binary-search-tree-iterator/)

实现一个二叉搜索树迭代器类`BSTIterator` ，表示一个按中序遍历二叉搜索树（BST）的迭代器：

- `BSTIterator(TreeNode root)` 初始化 `BSTIterator` 类的一个对象。BST 的根节点 `root` 会作为构造函数的一部分给出。指针应初始化为一个不存在于 BST 中的数字，且该数字小于 BST 中的任何元素。
- `boolean hasNext()` 如果向指针右侧遍历存在数字，则返回 `true` ；否则返回 `false` 。
- `int next()`将指针向右移动，然后返回指针处的数字。

注意，指针初始化为一个不存在于 BST 中的数字，所以对 `next()` 的首次调用将返回 BST 中的最小元素。

你可以假设 `next()` 调用总是有效的，也就是说，当调用 `next()` 时，BST 的中序遍历中至少存在一个下一个数字。

解法1:

我们可以直接对二叉搜索树做一次完全的递归遍历，获取中序遍历的全部结果并保存在数组中。随后，我们利用得到的数组本身来实现迭代器。

```JAVA
class BSTIterator {
    private int idx;
    private List<Integer> arr;

    public BSTIterator(TreeNode root) {
        idx = 0;
        arr = new ArrayList<Integer>();
        inorderTraversal(root, arr);
    }

    public int next() {
        return arr.get(idx++);
    }

    public boolean hasNext() {
        return idx < arr.size();
    }

    private void inorderTraversal(TreeNode root, List<Integer> arr) {
        if (root == null) {
            return;
        }
        inorderTraversal(root.left, arr);
        arr.add(root.val);
        inorderTraversal(root.right, arr);
    }
}
```

解法2：

除了递归的方法外，我们还可以利用栈这一数据结构，通过迭代的方式对二叉树做中序遍历。此时，我们无需预先计算出中序遍历的全部结果，只需要实时维护当前栈的情况即可

```java
class BSTIterator {
    private TreeNode cur;
    private Deque<TreeNode> stack;

    public BSTIterator(TreeNode root) {
        cur = root;
        stack = new LinkedList<TreeNode>();
    }
    
    public int next() {
        while (cur != null) {
            stack.push(cur);
            cur = cur.left;
        }
        cur = stack.pop();
        int ret = cur.val;
        cur = cur.right;
        return ret;
    }
    
    public boolean hasNext() {
        return cur != null || !stack.isEmpty();
    }
}
```

## [222. 完全二叉树的节点个数](https://leetcode.cn/problems/count-complete-tree-nodes/)

给你一棵 **完全二叉树** 的根节点 `root` ，求出该树的节点个数。

[完全二叉树](https://baike.baidu.com/item/完全二叉树/7773232?fr=aladdin) 的定义如下：在完全二叉树中，除了最底层节点可能没填满外，其余每层节点数都达到最大值，并且最下面一层的节点都集中在该层最左边的若干位置。若最底层为第 `h` 层，则该层包含 `1~ 2h` 个节点。

解法一，最简单方法递归。但是没有利用到完全二叉树的特定。

```java
class Solution {
    public int countNodes(TreeNode root) {
    	if(root == null) {
    		return 0;
    	}
    	int left = countNodes(root.left);
    	int right = countNodes(root.right);
    	
    	return left+right+1;
    	
    }
}
```

解法二，通过对于最大层数为 h 的完全二叉树，节点个数一定在 2^h,2^{h+1}-1 的范围内，可以在该范围内通过二分查找的方式得到完全二叉树的节点个数。

先找出level，然后通过二分查找法查看对应的节点是否存在。

如果第 k 个节点位于第 h 层，则 k 的二进制表示包含 h+1 位，其中最高位是 1，其余各位从高到低表示从根节点到第 k 个节点的路径，0 表示移动到左子节点，1 表示移动到右子节点。通过位运算得到第 k 个节点对应的路径，判断该路径对应的节点是否存在，即可判断第 k 个节点是否存在。

```java
class Solution {
    public int countNodes(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int level = 0;
        TreeNode node = root;
        while (node.left != null) {
            level++;
            node = node.left;
        }
        int low = 1 << level, high = (1 << (level + 1)) - 1;
        while (low < high) {
            int mid = (high - low + 1) / 2 + low;
          //判断存在，所以值要=mid，然后根据low的值去设置mid的值。
            if (exists(root, level, mid)) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        return low;
    }

    public boolean exists(TreeNode root, int level, int k) {
        int bits = 1 << (level - 1);
        TreeNode node = root;
        while (node != null && bits > 0) {
            if ((bits & k) == 0) {
                node = node.left;
            } else {
                node = node.right;
            }
            bits >>= 1;
        }
        return node != null;
    }
}

```

## [236. 二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

递归

解法1:dfs是当前root有没有p或者q的子节点。在dfs的过程中找到对应的公共祖先。

```java
class Solution {

    private TreeNode ans;

    public Solution() {
        this.ans = null;
    }

    private boolean dfs(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null) return false;
        boolean lson = dfs(root.left, p, q);
        boolean rson = dfs(root.right, p, q);
      //同时是是左节点和右节点的祖先，或者本身是左右节点本身，他的左右子树是左右节点的祖先
        if ((lson && rson) || ((root.val == p.val || root.val == q.val) && (lson || rson))) {
            ans = root;
        } 
        return lson || rson || (root.val == p.val || root.val == q.val);
    }

    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        this.dfs(root, p, q);
        return this.ans;
    }
}
```

解法二，先判断当前节点是否是p或者q节点，是的话那么root就是公共节点。否则的话，拿到左右两边的公共节点。

lowestCommonAncestor的作用是找到最近公共节点。

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if(root==null){
            return null;
        }
        if(p ==root || q==root){
            return root;
        }
        TreeNode left = lowestCommonAncestor(root.left, p,q);
        TreeNode right = lowestCommonAncestor(root.right, p,q);
        if(left ==null){
            return right;
        }
        if(right ==null){
            return left;
        }
        return root;
    }
}
```

## [199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

给定一个二叉树的 **根节点** `root`，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。

层次遍历：

```java
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        if(root ==null){
            return new ArrayList<Integer>();
        }
        List<Integer> ans= new ArrayList<>();
        Deque<TreeNode> queue = new LinkedList<TreeNode>();
        queue.offer(root);

        while(!queue.isEmpty()){
            int size= queue.size();
            while(size>0){
                TreeNode node = queue.poll();
                if(node.left !=null){
                    queue.offer(node.left);
                }
                if(node.right !=null){
                    queue.offer(node.right);
                }
                size--;
                if(size==0){
                    ans.add(node.val);
                }
            } 
        }
        return ans;

    }
}
```

## [637. 二叉树的层平均值](https://leetcode.cn/problems/average-of-levels-in-binary-tree/)

给定一个非空二叉树的根节点 `root` , 以数组的形式返回每一层节点的平均值。与实际答案相差 `10-5` 以内的答案可以被接受。

同样层次遍历

```java
class Solution {
    public List<Double> averageOfLevels(TreeNode root) {

        if(root==null){
        return new LinkedList<Double>();
        }
        List<Double>  ans = new LinkedList<Double>();
        Deque<TreeNode> queue = new LinkedList<TreeNode>();
        queue.offer(root);
        while(!queue.isEmpty()){
            int size=queue.size();
            int tempSize=size;
            Double sum=0d;
            while(size >0){
                TreeNode node = queue.poll();
                if(node.left !=null){
                    queue.offer(node.left);
                }
                if(node.right !=null){
                    queue.offer(node.right);
                }
                sum+=node.val;
                size--;
                if(size==0){
                    ans.add(sum/tempSize);
                }
            }
        }
        return ans;
    }
}
```

## [103. 二叉树的锯齿形层序遍历](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/)

给你二叉树的根节点 `root` ，返回其节点值的 **锯齿形层序遍历** 。（即先从左往右，再从右往左进行下一层遍历，以此类推，层与层之间交替进行）。

```java
class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> ans = new LinkedList<List<Integer>>();
        if (root == null) {
            return ans;
        }

        Queue<TreeNode> nodeQueue = new ArrayDeque<TreeNode>();
        nodeQueue.offer(root);
        boolean isOrderLeft = true;

        while (!nodeQueue.isEmpty()) {
            Deque<Integer> levelList = new LinkedList<Integer>();
            int size = nodeQueue.size();
            for (int i = 0; i < size; ++i) {
                TreeNode curNode = nodeQueue.poll();
                if (isOrderLeft) {
                    levelList.offerLast(curNode.val);
                } else {
                    levelList.offerFirst(curNode.val);
                }
                if (curNode.left != null) {
                    nodeQueue.offer(curNode.left);
                }
                if (curNode.right != null) {
                    nodeQueue.offer(curNode.right);
                }
            }
            ans.add(new LinkedList<Integer>(levelList));
            isOrderLeft = !isOrderLeft;
        }

        return ans;
    }
}
```



## [530. 二叉搜索树的最小绝对差](https://leetcode.cn/problems/minimum-absolute-difference-in-bst/)

一个二叉搜索树的根节点 `root` ，返回 **树中任意两不同节点值之间的最小差值** 。

差值是一个正数，其数值等于两值之差的绝对值。

按中序遍历，获取中序遍历的上一个值。然后在遍历过程中找到最小值

```java
class Solution {
    int pre;
    int ans;

    public int getMinimumDifference(TreeNode root) {
    //遍历，找到最小值
        ans = Integer.MAX_VALUE;
        pre = -1;
        dfs(root);
        return ans;

    }

    public void dfs(TreeNode root){
        if(root==null){
            return;
        }
        dfs(root.left);
        if(pre ==-1){
            pre=root.val;
        }else{
            ans=Math.min(ans, root.val-pre);
            pre=root.val;
        }
        dfs(root.right);
    }
}
```

## [230. 二叉搜索树中第K小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

给定一个二叉搜索树的根节点 `root` ，和一个整数 `k` ，请你设计一个算法查找其中第 `k` 个最小元素（从 1 开始计数）。

同样中序遍历，迭代第k次的时候就是要找的值

```java
class Solution {
    int i=0;
    TreeNode res=null;
    public int kthSmallest(TreeNode root, int k) {
        dfs(root,k);
        return res.val;
    }

    public void dfs(TreeNode root,int k){
        if(root==null){
            return;
        }
        dfs(root.left,k);
        i++;
        if(i==k){
            res=root;
            return;
        }
        dfs(root.right,k);

    }
}
```

## [98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

给你一个二叉树的根节点 `root` ，判断其是否是一个有效的二叉搜索树。

**有效** 二叉搜索树定义如下：

- 节点的左子树只包含 **小于** 当前节点的数。
- 节点的右子树只包含 **大于** 当前节点的数。
- 所有左子树和右子树自身必须也是二叉搜索树。

递归，构造好递归函数

```java
class Solution {
    public boolean isValidBST(TreeNode root) {
      return isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    public boolean isValidBST(TreeNode node, long lower,long upper){
        if(node ==null){
            return true;
        }
        if(node.val <=lower || node.val >=upper){
            return false;
        }
        return isValidBST(node.left, lower, node.val)&& isValidBST(node.right, node.val, upper);

    }
}
```

