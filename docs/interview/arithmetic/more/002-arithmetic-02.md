# 算法基础面试题(二)

# 数据范围

## 整数类型

byte：8 位，范围为 -128 到 127

short：16 位，范围为 -32,768 到 32,767  3万

int：32 位，范围为 -2^31 到 2^31-1 21亿， 4bytes,100w int占4M，1亿int 400M. 

long：64 位，范围为 -2^63 到 2^63-1

4G内存可以表示340亿bits， 1G内存可以表示85亿bits

100w int占4M， 1亿int 400M. 

1亿bytes 100M, 4亿bytes 400M。

1亿bits 12M，4亿bits 48M内存

## 浮点类型

float：32 位，范围为 IEEE 754 单精度浮点数表示的取值范围。4bytes,100w float占4M，1亿 400M

double：64 位，范围为 IEEE 754 双精度浮点数表示的取值范围。

## 字符类型

char：16 位 Unicode 字符，范围为 0 到 65,535。  6万

java中理论上一个字符占用两个字节

**Unicode只是一个编码规范，目前实际实现的unicode编码只要有三种：UTF-8,UCS-2和UTF-16，三种unicode字符集之间可以按照规范进行转换。**

UTF-8最大的一个特点，就是它是一种**变长**的编码方式。它可以使用1~6个字节表示一个符号，根据不同的符号而**变化字节长度**。

占2个字节的：〇（〇有两个读音 xīng líng，（一） [xīng](https://www.zhihu.com/search?q=xīng&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2289164118}) 同“星”；（二） líng 同“零”。）

占3个字节的：基本等同于GBK，含21000多个汉字

占4个字节的：中日韩超大[字符集](https://www.zhihu.com/search?q=字符集&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2289164118})里面的汉字，有5万多个

一个utf8数字占1个字节

一个utf8英文字母占1个字节

## 布尔类型

boolean：表示逻辑值，只能取 true 或 false。

# java.lang.Integer

*MIN_VALUE* = 0x80000000  -2^31

*MAX_VALUE* = 0x7fffffff  2^31-1

Integer.toBinaryString(int)方法将一个整数转换成二进制表示的字符串

Integer.parseInt(binaryString, 2) 把一个二进制字符串转换成为整数

Integer.reverse(123)  ---按位反转整数

```java
public class Solution {
    // you need treat n as an unsigned value
    public int reverseBits(int n) {
      int rev =0;
      for(int i=0; i<32 && n!=0; i++){
          rev |=(n&1)<<(31-i);
          n >>>=1;
      }
      return rev;
    }
}
```



```java
public class Solution {
    private static final int M1 = 0x55555555; // 01010101010101010101010101010101
    private static final int M2 = 0x33333333; // 00110011001100110011001100110011
    private static final int M4 = 0x0f0f0f0f; // 00001111000011110000111100001111
    private static final int M8 = 0x00ff00ff; // 00000000111111110000000011111111

    public int reverseBits(int n) {
      //交换不同的位置
        n = n >>> 1 & M1 | (n & M1) << 1;
        n = n >>> 2 & M2 | (n & M2) << 2;
        n = n >>> 4 & M4 | (n & M4) << 4; 
        n = n >>> 8 & M8 | (n & M8) << 8;
        return n >>> 16 | n << 16;
    }
}
```

Integer.bitCount(122)  --统计int中1的个数

```java
    public static int bitCount(int i) {
        // HD, Figure 5-2
        i = i - ((i >>> 1) & 0x55555555);
        i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
        i = (i + (i >>> 4)) & 0x0f0f0f0f;
        i = i + (i >>> 8);
        i = i + (i >>> 16);
        return i & 0x3f;
    }
```



Integer.highestOneBit(123) ---最高位的1的值

```java
    public static int highestOneBit(int i) {
        // 先把i最高位1以下的所有位都变成1。折半法
        i |= (i >>  1);
        i |= (i >>  2);
        i |= (i >>  4);
        i |= (i >>  8);
        i |= (i >> 16);
        //用移位运算得到最高位的i
        return i - (i >>> 1);
    }
```



Integer.*lowestOneBit*(3)  ---最低位的1的值

```java
public static int lowestOneBit(int i) {
        // HD, Section 2-1
        return i & -i;
    }
```

Integer.*numberOfLeadingZeros*(3)  ---前面0的个数

```java
public static int numberOfLeadingZeros(int i) {
        // HD, Figure 5-6
        if (i == 0)
            return 32;
        int n = 1;
  			//折半法
        if (i >>> 16 == 0) { n += 16; i <<= 16; }
        if (i >>> 24 == 0) { n +=  8; i <<=  8; }
        if (i >>> 28 == 0) { n +=  4; i <<=  4; }
        if (i >>> 30 == 0) { n +=  2; i <<=  2; }
  			//如果前面条件都不满足
        n -= i >>> 31;
        return n;
    }
```

Integer.numberOfTrailingZeros(3) ---后面0的个数

```java
    public static int numberOfTrailingZeros(int i) {
        // HD, Figure 5-14
        int y;
        if (i == 0) return 32;
        int n = 31;
        y = i <<16; if (y != 0) { n = n -16; i = y; }
        y = i << 8; if (y != 0) { n = n - 8; i = y; }
        y = i << 4; if (y != 0) { n = n - 4; i = y; }
        y = i << 2; if (y != 0) { n = n - 2; i = y; }
        return n - ((i << 1) >>> 31);
    }
```

# java.util.HashMap

map.getOrDefault(a,b);

map.remove(key);

map.containsKey(key)

map.values()

# java.util.HashSet

把List转成Set

List<String> list = Arrays.asList("apple", "orange", "banana");

Set<String> set = new HashSet<>(list);

List<String> list = Arrays.asList("apple", "orange", "banana");

Set<String> set = new HashSet<>();

set.addAll(list);

# java.util.List

list.add("apple"); // 在末尾添加元素

list.add(0, "banana"); 

list.remove("apple"); // 删除元素"apple"

list.remove(1); 

list.clear();

//list转数组：

list.toArray(new int[0])

list.toArray(new int\[0][2])

//list to数组字符串: 

list.toString()  [1, 2]



# Array



[]:

int[] array = {1, 2, 3, 4, 5};

int length = array.length;

# java.util.Arrays

List<String> wordList = Arrays.asList(s.split("\\\s+"));  ----数组变成list

升序Arrays.sort

降序:Arrays.sort(arr, (o1, o2) -> o2 - o1);  ---注意如果要对sort进行反向排序，要确保arr不是基础类型的数组，必须是对象类型的数组。

如果对int进行排序,两个int的减法运算可能溢出，需要将其转换成long来计算，compare的返回值是1或者-1.

Arrays.sort(points, (a, b)-> (long)a[1]-(long)b[1]>0?1:-1) ------int\[][]是可以的，但是int[]不行。

Arrays.equals(str1,str2)  ---两个数组相等

System.arraycopy(src, srcPos, dest, destPos, length)   ---拷贝数组

byte[] partArray = Arrays.copyOfRange(fullArray, start, end)   ---end不包含，长度可以大于原始数组的长度

byte[] mergedArray = Arrays.copyOf(byteArray1, byteArray1.length + byteArray2.length) ---拷贝数组,长度可以大于原始数组的长度

Arrays.fill(dp, max)  ---填充数组



Integer[] a = new Integer[]{1,2,35,34,21};

Arrays.toString(a) ----数组转成字符串。[35, 34, 21, 2, 1]

byte转字符：直接用(char)a

byte数组转字符串：byte[] byteArray = {65, 66, 67}; String result = new String(byteArray)；

打印数组

Arrays.*stream*(arr).forEach(System.*out*::println);



# String

char[] str1 = s.toCharArray() ---字符串转成char数组

s.charAt(1)

str.substring(0, 3)   ----不包含end

str.length()

int转String：String s = String.valueOf(x);

String.join(" ",d) ----合并集合，变成字符串。只要是Iterable的都可以join。比如List，Set，但是不能是数组



mainString.contains(subString)

"abc".indexOf("a")

"abc".lastIndexOf("a")



# StringBuffer

ans.reverse() ---反转字符

ans.toCharArray()  ---转换成char数组

修改其中的某个字符

 StringBuffer sb = new StringBuffer(curr);
 sb.setCharAt(j, keys[k]);
 String next = sb.toString();

# java.util.Random

```
new Random().nextInt(10)
```



# java.util.Collections

```java
List<Integer> intList = new ArrayList<>();
intList.add(12);
intList.add(15);
Collections.swap(intList, 0, 1);  //swap list里面的两个元素
```

反转数组：

```java
Integer[] arr = {1, 2, 3, 4, 5};  
Collections.reverse(Arrays.asList(arr));  //不能反转数组，需要把数组转换成list, 最后arr数组的值被反转
```

1. **排序 (`sort`)：**

   ```java
   List<Integer> numbers = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9, 2, 6, 5));
   Collections.sort(numbers);
   System.out.println(numbers); // 输出 [1, 1, 2, 3, 4, 5, 5, 6, 9]
   ```

2. **反转 (`reverse`)：**

   ```java
   List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie", "David"));
   Collections.reverse(names);
   System.out.println(names); // 输出 [David, Charlie, Bob, Alice]
   ```

3. **打乱 (`shuffle`)：**

   ```java
   List<Character> letters = new ArrayList<>(List.of('A', 'B', 'C', 'D', 'E'));
   Collections.shuffle(letters);
   System.out.println(letters); // 输出可能为 [C, A, B, E, D]
   ```

4. **查找最大值和最小值 (`max` 和 `min`)：**

   ```java
   List<Double> prices = new ArrayList<>(List.of(19.99, 29.99, 15.99, 39.99, 9.99));
   double maxPrice = Collections.max(prices);
   double minPrice = Collections.min(prices);
   System.out.println("Max Price: " + maxPrice); // 输出 Max Price: 39.99
   System.out.println("Min Price: " + minPrice); // 输出 Min Price: 9.99
   ```

5. **替换所有元素 (`replaceAll`)：**

   ```java
   List<String> words = new ArrayList<>(List.of("apple", "banana", "cherry"));
   Collections.replaceAll(words, "banana", "orange");
   System.out.println(words); // 输出 [apple, orange, cherry]
   ```

6. **查找元素位置 (`binarySearch`)：在列表中进行二分查找**，该列表必须是按升序排序的，如果未找到，则返回一个负值

   ```java
   List<Integer> sortedNumbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9)); //必须是排序数组
   int index = Collections.binarySearch(sortedNumbers, 5);
   System.out.println("Index of 5: " + index); // 输出 Index of 5: 4
   ```

   

# Character

```java
Character.isDigit,

Character.isLetterOrDigit,

Character.isLetter,

Character.toLowerCase
```



# java.util.Stack,PriorityQueue

```java
Stack<Integer> stack = new Stack<>();
stack.push(1);
int top = stack.peek();
int poppedElement = stack.pop();
PriorityQueue<Float> minHeap = new PriorityQueue<>(k);
```

# Deque 

```java
Deque<Character> stack = new LinkedList<Character>();
Deque<Integer> deque = new ArrayDeque<Integer>();

add/remove源自集合，所以添加到队尾，从队头删除；
offer/poll源自队列（先进先出 => 尾进头出），所以添加到队尾，从队头删除；
push/pop源自栈（先进后出 => 头进头出），所以添加到队头，从队头删除；
offerFirst/offerLast/pollFirst/pollLast源自双端队列（两端都可以进也都可以出），根据字面意思，offerFirst添加到队头，offerLast添加到队尾，pollFirst从队头删除，pollLast从队尾删除。
总结：
add/offer/offerLast添加队尾，三个方法等价；
push/offerFirst添加队头，两个方法等价。
remove/pop/poll/pollFirst删除队头，四个方法等价；
pollLast删除队尾。
```



# ConcurrentLinkedDeque(线程安全)

```java
ConcurrentLinkedDeque<String> deque = new ConcurrentLinkedDeque<>();
deque.add("element1");
deque.addLast("element2"); // 添加到队列的末尾
deque.addFirst("element3"); // 添加到队列的头部
String firstElement = deque.getFirst(); // 获取队列的头部元素，如果不存在则返回null
String lastElement = deque.getLast(); // 获取队列的尾部元素，如果不存在则返回null
deque.removeFirst(); // 删除队列的头部元素
deque.removeLast(); // 删除队列的尾部元素
if (deque.isEmpty()) {
    // 队列为空时执行操作
}
for (String element : deque) {
    // 遍历队列中的每个元素并执行操作
}
```



# LinkedList, ArrayDeque, Queue

# 链表

反转链表：

```java
//迭代反转
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


//递归反转
ListNode reverse(ListNode head) {
    if (head.next == null) return head;
    ListNode last = reverse(head.next);
    head.next.next = head;
    head.next = null;
    return last;
}

//反转前n个节点
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

//反转m-n之间的节点:
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
