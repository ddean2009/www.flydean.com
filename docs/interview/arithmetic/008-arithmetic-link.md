# 链表


## [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)

快慢指针

## [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)

给你两个 **非空** 的链表，表示两个非负的整数。它们每位数字都是按照 **逆序** 的方式存储的，并且每个节点只能存储 **一位** 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

单独设置一个进位carry:

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
      ListNode head=null, tail=null;
      int carry=0;
      while(l1 !=null || l2 !=null){
          int n1 =l1!=null? l1.val:0;
          int n2=l2!=null? l2.val:0;
          int sum = n1+n2+carry;
          if(head == null){
              head = tail = new ListNode(sum%10);
          }else{
              tail.next= new ListNode(sum%10);
              tail = tail.next;
          }
          carry =sum/10;
        //更新链表
          if (l1 != null) {
                l1 = l1.next;
            }
            if (l2 != null) {
                l2 = l2.next;
            }
      }
      //处理最后一个进位
      if(carry > 0){
          tail.next = new ListNode(carry);
      }
      return head;
    }
    
}
```

## [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

解法1，递归：

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        if (l1 == null) {
            return l2;
        } else if (l2 == null) {
            return l1;
        } else if (l1.val < l2.val) {
            l1.next = mergeTwoLists(l1.next, l2);
            return l1;
        } else {
            l2.next = mergeTwoLists(l1, l2.next);
            return l2;
        }
    }
}
```

解法2，迭代：

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode prehead = new ListNode(-1);

        ListNode prev = prehead;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                prev.next = l1;
                l1 = l1.next;
            } else {
                prev.next = l2;
                l2 = l2.next;
            }
            prev = prev.next;
        }
        // 合并后 l1 和 l2 最多只有一个还未被合并完，我们直接将链表末尾指向未合并完的链表即可
        prev.next = l1 == null ? l2 : l1;

        return prehead.next;
    }
}
```

## [138. 随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/)

给你一个长度为 `n` 的链表，每个节点包含一个额外增加的随机指针 `random` ，该指针可以指向链表中的任何节点或空节点。

构造这个链表的 **[深拷贝](https://baike.baidu.com/item/深拷贝/22785317?fr=aladdin)**。 深拷贝应该正好由 `n` 个 **全新** 节点组成，其中每个新节点的值都设为其对应的原节点的值。新节点的 `next` 指针和 `random` 指针也都应指向复制链表中的新节点，并使原链表和复制链表中的这些指针能够表示相同的链表状态。**复制链表中的指针都不应指向原链表中的节点** 。

解法1. 节点拆分

该链表中每一个节点拆分为两个相连的节点，例如对于链表 A→B→C，我们可以将其拆分为 A→A′→B→B′→C→C′

```java
class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }
        for (Node node = head; node != null; node = node.next.next) {
            Node nodeNew = new Node(node.val);
            nodeNew.next = node.next;
            node.next = nodeNew;
        }
        for (Node node = head; node != null; node = node.next.next) {
            Node nodeNew = node.next;
            nodeNew.random = (node.random != null) ? node.random.next : null;
        }
        Node headNew = head.next;
        for (Node node = head; node != null; node = node.next) {
            Node nodeNew = node.next;
            node.next = node.next.next;
            nodeNew.next = (nodeNew.next != null) ? nodeNew.next.next : null;
        }
        return headNew;
    }
}
```

解法2. 递归

```java
class Solution {
    Map<Node, Node> cachedNode = new HashMap<Node, Node>();
    
    public Node copyRandomList(Node head) {
       if (head == null) {
            return null;
        }
        if (!cachedNode.containsKey(head)) {
            Node headNew = new Node(head.val);
            cachedNode.put(head, headNew);
            headNew.next = copyRandomList(head.next);
            headNew.random = copyRandomList(head.random);
        }
        return cachedNode.get(head);
        
    }
}
```

## [92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/)

给你单链表的头指针 `head` 和两个整数 `left` 和 `right` ，其中 `left <= right` 。请你反转从位置 `left` 到位置 `right` 的链表节点，返回 **反转后的链表** 。

解法一，切断链表，然后反转，然后再接上

```java
class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        // 因为头节点有可能发生变化，使用虚拟头节点可以避免复杂的分类讨论
        ListNode dummyNode = new ListNode(-1);
        dummyNode.next = head;

        ListNode pre = dummyNode;
        // 第 1 步：从虚拟头节点走 left - 1 步，来到 left 节点的前一个节点
        // 建议写在 for 循环里，语义清晰
        for (int i = 0; i < left - 1; i++) {
            pre = pre.next;
        }

        // 第 2 步：从 pre 再走 right - left + 1 步，来到 right 节点
        ListNode rightNode = pre;
        for (int i = 0; i < right - left + 1; i++) {
            rightNode = rightNode.next;
        }

        // 第 3 步：切断出一个子链表（截取链表）
        ListNode leftNode = pre.next;
        ListNode curr = rightNode.next;

        // 注意：切断链接
        pre.next = null;
        rightNode.next = null;

        // 第 4 步：同第 206 题，反转链表的子区间
        reverseLinkedList(leftNode);

        // 第 5 步：接回到原来的链表中
        pre.next = rightNode;
        leftNode.next = curr;
        return dummyNode.next;
    }

    private void reverseLinkedList(ListNode head) {
        // 也可以使用递归反转一个链表
        ListNode pre = null;
        ListNode cur = head;

        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
    }
}
```

解法2.穿针引线

```java
class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        // 设置 dummyNode 是这一类问题的一般做法
        ListNode dummyNode = new ListNode(-1);
        dummyNode.next = head;
        ListNode pre = dummyNode;
        for (int i = 0; i < left - 1; i++) {
            pre = pre.next;
        }
        ListNode cur = pre.next;
        ListNode next;
        for (int i = 0; i < right - left; i++) {
            next = cur.next;
            cur.next = next.next;
            next.next = pre.next;
            pre.next = next;
        }
        return dummyNode.next;
    }
}
```

### 递归反转

```java
ListNode reverse(ListNode head) {
    if (head.next == null) return head;
    ListNode last = reverse(head.next);
    head.next.next = head;
    head.next = null;
    return last;
}
```

## 迭代反转两个具体的节点

```java
//迭代反转两个具体的节点
    public ListNode[] myReverse(ListNode head, ListNode tail) {
        ListNode prev = tail.next;
        ListNode cur = head;
        while (prev != tail) {
            ListNode nex = cur.next;
            cur.next = prev;
            prev = cur;
            cur = nex;
        }
        return new ListNode[]{tail, head};
    }
```

## 反转前n个节点

```java
ListNode successor = null; // 后驱节点

// 反转以 head 为起点的 n 个节点，返回新的头结点
ListNode reverseN(ListNode head, int n) {
    if (n == 1) { 
        // 记录第 n + 1 个节点
        successor = head.next;
        return head;
    }
    // 以 head.next 为起点，需要反转前 n - 1 个节点
    ListNode last = reverseN(head.next, n - 1);
    head.next.next = head;
    // 让反转之后的 head 节点和后面的节点连起来
    head.next = successor;
    return last;
} 
```

## 反转m-n之间的节点

```java
ListNode reverseBetween(ListNode head, int m, int n) {
    // base case
    if (m == 1) {
        return reverseN(head, n);
    }
    // 前进到反转的起点触发 base case---只到m=1
    head.next = reverseBetween(head.next, m - 1, n - 1);
    return head;
}
```

## [25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

给你链表的头节点 `head` ，每 `k` 个节点一组进行翻转，请你返回修改后的链表。

`k` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

解法1，穿针引线，每次反转k个节点

```java
class Solution {
    public static ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(-1, head), prev = dummy;
        while (true) {
            // 检查剩余节点是否有k个，不足则返回
            ListNode last = prev;
            for (int i = 0; i < k; i++) {
                last = last.next;
                if (last == null) {
                    return dummy.next;
                }
            }

            // 翻转k个节点，穿针引线
            ListNode curr = prev.next, next;
            for (int i = 0; i < k - 1; i++) {
                next = curr.next;
                curr.next = next.next;
                next.next = prev.next;
                prev.next = next;
            }
            prev = curr;
        }
    }
}
```

解法2，构造reverseBetween方法来反转

```java
class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {

        ListNode curr=head;
        int i=0;
        while(curr !=null){
            i++;
            curr=curr.next;
        }
        for(int j=0; j< i/k; j++){
            head= reverseBetween(head,j*k+1,j*k+k);
        }
        return head;
    }

   ListNode successer=null;
    public ListNode reverse(ListNode head, int m){
        if(m==1){
            successer=head.next;
            return head;
        }
        ListNode last=reverse(head.next, m-1);
        head.next.next =head;
        head.next=successer;
        return last;
    }

    public ListNode reverseBetween(ListNode head, int m, int n){
        if(m==1){
            return reverse(head, n);
        }
        head.next = reverseBetween(head.next, m-1,n-1);
        return head;
    }
}
```

## [19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

解法，用快慢指针找到倒数N的位置，first比second多走N个节点。

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode first = head;
        ListNode second = dummy;
        for (int i = 0; i < n; ++i) {
            first = first.next;
        }
        while (first != null) {
            first = first.next;
            second = second.next;
        }
        second.next = second.next.next;
        ListNode ans = dummy.next;
        return ans;
    }
}
```

## [82. 删除排序链表中的重复元素 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/)

给定一个已排序的链表的头 `head` ， 删除原始链表中所有重复数字的节点，只留下不同的数字。返回 *已排序的链表* 。

解法：用set保存链表的值，判断set中是否有这个值。

```java
class Solution {
    public ListNode deleteDuplicates(ListNode head) {
        ListNode dummyNode = new ListNode(-1);
        dummyNode.next=head;
        Set<Integer> set = new HashSet<Integer>();

        ListNode pre=dummyNode;
        ListNode curr=head;
        while(pre.next!=null){
          //先比较有没有重复，有重复就添加
            if(pre.next.next!=null && pre.next.val ==pre.next.next.val){
                set.add(pre.next.val);
            }
          //再判断删除
            if(set.contains(pre.next.val)){
                pre.next= pre.next.next;
            }else{
                pre=pre.next;
            }

        }
        return dummyNode.next;
    }
}
```

## [61. 旋转链表](https://leetcode.cn/problems/rotate-list/)

给你一个链表的头节点 `head` ，旋转链表，将链表每个节点向右移动 `k` 个位置。

解法1.闭合为环，然后再断开。

```java
class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (k == 0 || head == null || head.next == null) {
            return head;
        }
        int n = 1;
        ListNode iter = head;
        while (iter.next != null) {
            iter = iter.next;
            n++;
        }
        int add = n - k % n;
        if (add == n) {
            return head;
        }
        iter.next = head;
        while (add-- > 0) {
            iter = iter.next;
        }
        ListNode ret = iter.next;
        iter.next = null;
        return ret;
    }
}
```

解法2。用栈。再pop出K的节点。找到要断开的位置。

```java
class Solution {
    public ListNode rotateRight(ListNode head, int k) {

        Deque<ListNode> queue= new LinkedList();
        int size=0;
        ListNode last=null;
        ListNode curr=head;
        while(curr !=null){
            queue.push(curr);
            size++;
            last=curr;
            curr=curr.next;
        }

        ListNode returnHead=null;
        
        if(size ==0 || size==1 || k%size==0){
            return head;
        }
        k=k%size;
        while(k>0){
            k--;
            returnHead=queue.pop();
        }
        ListNode linkNode = queue.peek();
        linkNode.next =null;
        last.next=head;
        return returnHead;
    }
}
```

## [86. 分隔链表](https://leetcode.cn/problems/partition-list/)

给你一个链表的头节点 `head` 和一个特定值 `x` ，请你对链表进行分隔，使得所有 **小于** `x` 的节点都出现在 **大于或等于** `x` 的节点之前。

你应当 **保留** 两个分区中每个节点的初始相对位置。

解法，用**大小两个链表**，分别存储。

```java
class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode small = new ListNode(0);
        ListNode smallHead = small;
        ListNode large = new ListNode(0);
        ListNode largeHead = large;
        while (head != null) {
            if (head.val < x) {
                small.next = head;
                small = small.next;
            } else {
                large.next = head;
                large = large.next;
            }
            head = head.next;
        }
        large.next = null;
        small.next = largeHead.next;
        return smallHead.next;
    }
}
```

## [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)

请你设计并实现一个满足 [LRU (最近最少使用) 缓存](https://baike.baidu.com/item/LRU) 约束的数据结构。

实现 `LRUCache` 类：

- `LRUCache(int capacity)` 以 **正整数** 作为容量 `capacity` 初始化 LRU 缓存
- `int get(int key)` 如果关键字 `key` 存在于缓存中，则返回关键字的值，否则返回 `-1` 。
- `void put(int key, int value)` 如果关键字 `key` 已经存在，则变更其数据值 `value` ；如果不存在，则向缓存中插入该组 `key-value` 。如果插入操作导致关键字数量超过 `capacity` ，则应该 **逐出** 最久未使用的关键字。

函数 `get` 和 `put` 必须以 `O(1)` 的平均时间复杂度运行。

解法：双向链表，每次添加或者get的时候对链表进行移动操作，用双向链表是为了方便定位和删除节点。

```java
class LRUCache {

      class DLinkedNode {
        int key;
        int value;
        DLinkedNode prev;
        DLinkedNode next;
        public DLinkedNode() {}
        public DLinkedNode(int _key, int _value) {key = _key; value = _value;}
    }


    private Map<Integer, DLinkedNode> cache = new HashMap<Integer, DLinkedNode>();
    private int size;
    private int capacity;
    private DLinkedNode head, tail;

    public LRUCache(int capacity) {
        this.size=0;
        this.capacity=capacity;
        // 使用伪头部和伪尾部节点
        head = new DLinkedNode();
        tail = new DLinkedNode();
        head.next=tail;
        tail.prev=head;

    }
    
    public int get(int key) {
        DLinkedNode node = cache.get(key);
        if (node == null) {
            return -1;
        }
        moveToHead(node);
        return node.value;

    }
    
    public void put(int key, int value) {

         DLinkedNode node = cache.get(key);
         if (node == null) {
            // 如果 key 不存在，创建一个新的节点
            DLinkedNode newNode = new DLinkedNode(key, value);
            // 添加进哈希表
            cache.put(key, newNode);
            // 添加至双向链表的头部
            addToHead(newNode);
            ++size;
            if (size > capacity) {
                // 如果超出容量，删除双向链表的尾部节点
                DLinkedNode tail = removeTail();
                // 删除哈希表中对应的项
                cache.remove(tail.key);
                --size;
            }
        }
        else {
            // 如果 key 存在，先通过哈希表定位，再修改 value，并移到头部
            node.value = value;
            moveToHead(node);
        }
    }

    private void addToHead(DLinkedNode node){
        node.prev=head;
        node.next = head.next;
        head.next.prev =node;
        head.next = node;
    }

    private void removeNode(DLinkedNode node){
        node.prev.next=node.next;
        node.next.prev=node.prev;
    }

    private void moveToHead(DLinkedNode node){
        removeNode(node);
        addToHead(node);
    }

    private DLinkedNode removeTail(){
        DLinkedNode res=tail.prev;
        removeNode(res);
        return res;
    }
}

```

解法2.直接继承java中的LinkedHashMap

```java
class LRUCache extends LinkedHashMap<Integer, Integer>{
    private int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75F, true);
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity; 
    }
}
```


