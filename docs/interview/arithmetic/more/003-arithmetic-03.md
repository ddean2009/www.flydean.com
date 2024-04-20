# 算法基础面试题(三)
## 二叉树

//迭代实现前序遍历

```java
// 前序单层循环，要先压入右子节点，再压入左子节点
    public static void preOrder1(TreeNode root) {
        if (root == null) return;

        Deque<TreeNode> stack = new LinkedList<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            System.out.print(node.val + " ");
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        }
    }

    //前序（迭代，双层循环） 内循环中压入子树的所有左子节点
    public static void preOrder2(TreeNode root) { // 前序双层循环
        if (root == null) return;
        TreeNode node = root;
        Deque<TreeNode> stack = new LinkedList<>();
        while (!stack.isEmpty() || node != null) {
            while (node != null) {
                System.out.print(node.val + " ");
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            node = node.right;
        }
    }

```

//迭代实现后序遍历，先序遍历是中左右，后续遍历是左右中，那么我们只需要调整一下先序遍历的代码顺序，就变成中右左的遍历顺序，然后在反转result数组，输出的结果顺序就是左右中了

```java
    // 后序单层循环，对于单层循环方式，后序遍历可以采用一个讨巧的办法：逆序输出
    public static void postOrder1(TreeNode root) { // 后序单层循环
        if (root == null) return;

        Deque<TreeNode> stack1 = new LinkedList<>();
        Deque<TreeNode> stack2 = new LinkedList<>();
        stack1.push(root);
        while (!stack1.isEmpty()) {
            TreeNode node = stack1.pop();
            stack2.push(node);
            if (node.left != null) stack1.push(node.left);
            if (node.right != null) stack1.push(node.right);
        }
        while (!stack2.isEmpty()) {
            System.out.print(stack2.pop().val + " ");
        }
    }

    // 后序双层循环
    public static void postOrder2(TreeNode root) { // 后序双层循环
        if (root == null) return;

        TreeNode node = root;
        TreeNode prev = null;
        Deque<TreeNode> stack = new LinkedList<>();
        while (!stack.isEmpty() || node != null) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            //因为是后序，需要判断当前节点有没有右节点，或者当前节点的右节点已经遍历过了
            if (node.right == null || node.right == prev) {
                System.out.print(node.val + " ");
                prev = node;
                //设置为null，避免再次压入
                node = null;
            } else {
                //如果右节点还没遍历，把中节点继续入栈。
                stack.push(node);
                node = node.right;
            }
        }
    }

```

//迭代实现中序遍历

```java
    public static void inOrder(TreeNode root) { // 中序双层循环
        if (root == null) return;

        TreeNode node = root;
        Deque<TreeNode> stack = new LinkedList<>();
        while (!stack.isEmpty() || node != null) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            System.out.print(node.val + " ");
            node = node.right;
        }
    }
```



## 前缀树

Trie，又称前缀树或字典树，是一棵有根树，其每个节点包含以下字段：



指向子节点的指针数组 children对于本题而言，数组长度为 26，即小写英文字母的数量。

布尔字段 isEnd 表示该节点是否为字符串的结尾。

```java
class Trie {
    private Trie[] children;
    private boolean isEnd;

    public Trie() {
        children = new Trie[26];
        isEnd = false;
    }
    
    public void insert(String word) {
        Trie node = this;
        for (int i = 0; i < word.length(); i++) {
            char ch = word.charAt(i);
            int index = ch - 'a';
            if (node.children[index] == null) {
                node.children[index] = new Trie();
            }
            node = node.children[index];
        }
        node.isEnd = true;
    }
    
    public boolean search(String word) {
        Trie node = searchPrefix(word);
        return node != null && node.isEnd;
    }
    
    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    private Trie searchPrefix(String prefix) {
        Trie node = this;
        for (int i = 0; i < prefix.length(); i++) {
            char ch = prefix.charAt(i);
            int index = ch - 'a';
            if (node.children[index] == null) {
                return null;
            }
            node = node.children[index];
        }
        return node;
    }
}
```

```java
class WordDictionary {
    private Trie root;

    public WordDictionary() {
        root = new Trie();
    }
    
    public void addWord(String word) {
        root.insert(word);
    }
    
    public boolean search(String word) {
        return dfs(word, 0, root);
    }

    private boolean dfs(String word, int index, Trie node) {
        if (index == word.length()) {
            return node.isEnd();
        }
        char ch = word.charAt(index);
        if (Character.isLetter(ch)) {
            int childIndex = ch - 'a';
            Trie child = node.getChildren()[childIndex];
            if (child != null && dfs(word, index + 1, child)) {
                return true;
            }
        } else {
            for (int i = 0; i < 26; i++) {
                Trie child = node.getChildren()[i];
                if (child != null && dfs(word, index + 1, child)) {
                    return true;
                }
            }
        }
        return false;
    }
}

class Trie {
    private Trie[] children;
    private boolean isEnd;

    public Trie() {
        children = new Trie[26];
        isEnd = false;
    }
    
    public void insert(String word) {
        Trie node = this;
        for (int i = 0; i < word.length(); i++) {
            char ch = word.charAt(i);
            int index = ch - 'a';
            if (node.children[index] == null) {
                node.children[index] = new Trie();
            }
            node = node.children[index];
        }
        node.isEnd = true;
    }

    public Trie[] getChildren() {
        return children;
    }

    public boolean isEnd() {
        return isEnd;
    }
}
```

## 图

图的遍历

并查集?

DFS、BFS 和 Floyd 算法

### 拓扑排序

拓扑排序常常应用于表示任务之间先后关系的有向无环图（DAG），例如任务调度、编译顺序等场景。

拓扑排序的经典算法有深度优先搜索（DFS）和广度优先搜索（BFS）。

DFS：

```java
import java.util.*;

class Graph {
    private int V;
    private List<List<Integer>> adjList;

    public Graph(int vertices) {
        V = vertices;
        adjList = new ArrayList<>(V);
        for (int i = 0; i < V; i++) {
            adjList.add(new LinkedList<>());
        }
    }

    public void addEdge(int u, int v) {
        adjList.get(u).add(v);
    }

    public List<Integer> topologicalSort() {
        Stack<Integer> stack = new Stack<>();
        boolean[] visited = new boolean[V];

        for (int i = 0; i < V; i++) {
            if (!visited[i]) {
                topologicalSortUtil(i, visited, stack);
            }
        }

        List<Integer> result = new ArrayList<>();
        while (!stack.isEmpty()) {
            result.add(stack.pop());
        }
        return result;
    }

    private void topologicalSortUtil(int v, boolean[] visited, Stack<Integer> stack) {
        visited[v] = true;

        for (Integer neighbor : adjList.get(v)) {
            if (!visited[neighbor]) {
                topologicalSortUtil(neighbor, visited, stack);
            }
        }

        stack.push(v);
    }
}

public class TopologicalSortExample {
    public static void main(String[] args) {
        Graph graph = new Graph(6);
        graph.addEdge(5, 2);
        graph.addEdge(5, 0);
        graph.addEdge(4, 0);
        graph.addEdge(4, 1);
        graph.addEdge(2, 3);
        graph.addEdge(3, 1);

        List<Integer> result = graph.topologicalSort();
        System.out.println("Topological Sort: " + result);
    }
}

```

BFS:

```java
public class BfsTopologicalSort {
    static class Graph {
        private int V;
        private List<List<Integer>> adjList;
        private int[] indeg;

        public Graph(int vertices) {
            V = vertices;
            adjList = new ArrayList<>(V);
            for (int i = 0; i < V; i++) {
                adjList.add(new LinkedList<>());
            }
            indeg= new int[V];
        }
        public void addEdge(int u, int v) {
            adjList.get(u).add(v);
            indeg[v]++;
        }

        public List<Integer> bfsSort() {
            Deque<Integer> qeue = new LinkedList<>();

            for (int i = 0; i < V; i++) {
                if(indeg[i]==0){
                    qeue.offer(i);
                }
            }

            List<Integer> result=new ArrayList<>();
            while(!qeue.isEmpty()){
               int number= qeue.poll();
                result.add(number);
                for(Integer i: adjList.get(number)){
                    indeg[i]--;
                    if(indeg[i]==0){
                        qeue.offer(i);
                    }
                }
            }
            return result;
        }

    }

    public static void main(String[] args) {
        Graph graph = new Graph(6);
        //有向图，表示5在2之前
        graph.addEdge(5, 2);
        graph.addEdge(5, 0);
        graph.addEdge(4, 0);
        graph.addEdge(4, 1);
        graph.addEdge(2, 3);
        graph.addEdge(3, 1);

        List<Integer> result = graph.bfsSort();
        System.out.println("Topological Sort: " + result);
    }
}
```

## 海量数据处理

Hash法

BIt-map法

Bloom filter法

数据库优化法

倒排索引法

外排序法

Trie树

堆

双层桶

Map-reduce法

### TOP K问题

针对TOP K问题，通常使用分治+Trie树/hash+小顶堆。首先把数据集按照hash方法分解成多个小数据集，然后使用Tire树或者hash统计每个小数据集中的query词频，之后用小顶堆求出每个数据集中出现频率最高的前K个树，最后在所有的top K中求出最终的top K。

###### 一亿个浮点数，如何找出其中最大的10000个 ：

解法：建立最小堆

```java
import java.util.PriorityQueue;

public class TopKFloats {

    public static double[] findTopK(float[] nums, int k) {
        if (nums == null || nums.length == 0 || k <= 0 || k > nums.length) {
            return new double[0];
        }
        // 使用最小堆
        PriorityQueue<Float> minHeap = new PriorityQueue<>(k);
        // 初始阶段插入前 K 个元素
        for (int i = 0; i < k; i++) {
            minHeap.offer(nums[i]);
        }
        // 遍历剩余元素，维护最小堆
        for (int i = k; i < nums.length; i++) {
            if (nums[i] > minHeap.peek()) {
                minHeap.poll();
                minHeap.offer(nums[i]);
            }
        }
        // 将堆中的元素转为数组
        double[] result = new double[k];
        for (int i = 0; i < k; i++) {
            result[i] = minHeap.poll();
        }
        return result;
    }

    public static void main(String[] args) {
        float[] nums = {3.1f, 1.5f, 5.2f, 7.8f, 2.4f, 4.6f, 8.9f, 6.7f};
        int k = 4;
        double[] result = findTopK(nums, k);

        System.out.print("Top " + k + " elements: ");
        for (double num : result) {
            System.out.print(num + " ");
        }
    }
}

```

###### 有1000万个记录，这些查询串的重复度比较高，如果除去重复后，不超过300万个。请tongji最热门的10个查询串，要求使用的内存不超过1GB。

300万，1G内存，一个大概400字节，对于查询串来说，够用了。

先用hash统计次数，然后**最小堆维护Top K**。

```java
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

public class TopQueries {

    public static void findTopQueries(String[] queries, int k) {
        Map<String, Integer> queryCount = new HashMap<>();
        // 哈希统计
        for (String query : queries) {
            queryCount.put(query, queryCount.getOrDefault(query, 0) + 1);
        }
        // 使用最小堆
        PriorityQueue<Map.Entry<String, Integer>> minHeap = new PriorityQueue<>(
                (a, b) -> Integer.compare(a.getValue(), b.getValue())
        );
        // 遍历哈希表，维护最小堆
        for (Map.Entry<String, Integer> entry : queryCount.entrySet()) {
            minHeap.offer(entry);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }
        // 输出最热门的查询串
        while (!minHeap.isEmpty()) {
            Map.Entry<String, Integer> entry = minHeap.poll();
            System.out.println("Query: " + entry.getKey() + ", Count: " + entry.getValue());
        }
    }
    public static void main(String[] args) {
        String[] queries = {"query1", "query2", "query3", /* ... 1000万个查询串 ... */};
        int k = 10;
        findTopQueries(queries, k);
    }
}

```

###### 有10个文件，每个文件1GB，每个文件的每一行都存放的是用户的query，每个文件的query都有可能重复，请按照query的频度排序

1. **切分文件：** 将每个1GB的文件切分成适当大小的块，每个块可以装入内存。
2. **内部排序：** 对每个块进行内部排序，可以使用快速排序、归并排序等算法。
3. **归并排序：** 对排序后的块进行归并排序，生成一个全局有序的大文件。
4. **归并处理：** 逐个读取每个文件中的每一行 query，使用哈希表进行频度统计。
5. **最小堆维护 Top K：** 维护一个最小堆，用于存储当前频度最高的 K 个 query。
6. **输出结果：** 当处理完所有文件后，堆中的元素即为频度最高的 K 个 query。

###### 有一个 1GB 大小的文件，文件里每一行是一个词，每个词的大小不超过 16B，内存大小限制是 1MB，要求返回频数最高的 100 个词(Top 100)。

由于内存限制，我们无法把每个单词读进内存。因此一般采用**分治**的办法。例如我们将1GB文件分开存储在2000个0.512MB的小文件，思路如下：

- 首先逐行读取大文件，对单词word取哈希和取模`hash(word) % 2000`， 然后分别保存到小文件`file_i` 中。
- 对所有小文件进行词频统计。可以采用**小顶堆**获得每个文件词频最高的100个词。（为什么用小顶堆？因为小顶堆满了之后，每次pop的是最小的元素。）
- 对所有小文件的结果进行合并，同样采用小顶堆。

总结：**最大的 K 个用小顶堆；最小的 K 个用大顶堆**。

### 重复问题

在海量数据中找出重复出现的元素或者去重重复出现的元素，一般可以通过位图法实现。

```java
int BITS_PER_WORD=32;
int WORD_OFFSET(int b){
  return b/BITS_PER_WORD;
}
int BIT_OFFSET(int b){
  return b%BITS_PER_WORD;
}
void setBit(int[] words, int n){
  words[WORD_OFFSET(n)] |= (1<< BIT_OFFSET(n));
}
void clearBit(int[] words, int n){
  words[WORD_OFFSET(n)] &= ~(1<< BIT_OFFSET(n));
}
boolean getBit(int[] words, int n){
  int bit=words[WORD_OFFSET(n)] & (1<< BIT_OFFSET(n));
  return bit !=0;
}
```

###### 给40亿个不重复的无符号整数，没排过序。给一个无符号整数，如何快速判断一个数是否在这40亿个数中。

- **哈希分治（hash & divide and conquer）**

我们可以将40亿个数保存到N个小文件中。然后遍历40亿个数，将哈希值`hash(num)`保存到下标为`hash(num) % N` 的文件中。然后遍历小文件，如果有一个文件存在`x`，就可以返回true。

- **位图（bitmap）**

位图的原理是用unsigned int整数的每一位来表示一个数是否存在，例如在unsigned int表示32位的机器上，能表示2<<32的数据，占用的空间约为512MB。

通常一个位图底层是一个数组，保存很多数字。40亿个数差不多需要长度为10的数组来表示。



###### 给定A、B两个文件，各存放50亿个url，每个url各占64字节，[内存](https://link.zhihu.com/?target=https%3A//so.csdn.net/so/search%3Fq%3D%E5%86%85%E5%AD%98%26spm%3D1001.2101.3001.7020)限制是4G，让你找出A、B文件共同的url？

- **分治思想**

1. 遍历文件A，对每个url求hash(url)%N，然后将取得的值分布到N个小文件中，每个小文件可以放在内存中。
2. 遍历文件B，采取和A相同的方式将url存储到N个小文件中.
3. 分布取两个小文件，把一个小文件加入哈希表，然后遍历另一个，如果url在哈希表，则为共同url，汇总到结果中。

有可能出现哈希碰撞，可以采用多个哈希函数减少碰撞概率。

- **bloom过滤器**

bloom过滤器非常适合查找不存在的数据。

如果允许一定的误判率，4G内存可以表示340亿bit，我们将其中一个文件映射到340亿bit上，然后读取另外一个文件的url，检查元素是否在bloom过滤器中.

优化：

可以采用前缀树进行优化。



###### 在 2.5 亿个整数中找出不重复的整数。注意：内存不足以容纳这 2.5 亿个整数。



根据“内存不足以容纳这2.5亿个整数”，可以知道我们需要用bitmap。

SetBit(x)：将整数存入位图。 如果一个数状态为NONE，则变为SINGLE；如果为SINGLE则变为MULTIPLE。

```java
public class BitVector<T> {
    private static final int NONE = 0;
    private static final int SINGLE = 1;
    private static final int MULTIPLE = 2;

    private int[][] bitVec;

    public BitVector(int size) {
        int arraySize = size / 32 + ((size % 32 != 0) ? 1 : 0);
        bitVec = new int[arraySize][3];
    }

    public void setBit(T x) {
        int index = (int) x >> 5;
        int bit = (int) x % 32;

        if (!hasNum(x, NONE)) {
            bitVec[index][NONE] |= (1 << bit);
        } else if (!hasNum(x, SINGLE)) {
            bitVec[index][SINGLE] |= (1 << bit);
        } else if (!hasNum(x, MULTIPLE)) {
            bitVec[index][MULTIPLE] |= (1 << bit);
        }
    }

    public boolean hasNum(T x, int bitState) {
        int index = (int) x >> 5;
        int bit = (int) x % 32;
        return ((bitVec[index][bitState] >> bit) & 1) == 1;
    }
}
```

**在某个项目中，我们需要对2亿条手机号码删除重复记录(过滤号码黑名单同样有效)**

解决方案:
将电话号码由12位单个数字组成的字符串转换为一个unsigned int型数据(这个完全可能,手机号码由前三位数字和后面八位数字组成,后面八位需要占到1~1000万的空间,而前面用0~100的数字存储已经足够)为简单起见,默认为0~4G的数字都有可能分布号码,为此我们分配4G/32=512M的内存将这2亿个号码整理成unsigned int类型后按上述办法存放在这块内存中(比如13512345678我们整理后为112345678,我们找到内存中112345678bit的下标,并将此bit值设为1)遍历整个bit数组,记录下所有的号码,这些号码即是不重复的手机号码

总结
建立一个足够大的bit数组当作hash表
以bit数组的下标来表示一个整数
以bit位中的0或1来表示这个整数是否在这个数组中存在
适用于无重复原始数据的搜索
原来每个整数需要4byte空间变为1bit，空间压缩率为32倍
扩展后可实现其他类型（包括重复数据）的搜索

### 排序问题

分治法

位图法

**假设一个文件中有9亿条不重复的9位整数，现在要求对这个文件进行排序。**

1. 分段排序

先将整个9位整数进行分段，亿条数据进行分成20段，每段5000万条
在文件中依次搜索0~5000万，50000001~1亿……
将排序的结果存入文件

2. 位图排序

声明一个可以包含9位整数的bit数组(10亿)，一共需要10亿/8=120M内存
把内存中的数据全部初始化为0, 读取文件中的数据，并将数据放入内存。比如读到一个数据为341245909这个数据，那就先在内存中找到341245909这个bit，并将bit值置为1遍历整个bit数组，将bit为1的数组下标存入文件 
