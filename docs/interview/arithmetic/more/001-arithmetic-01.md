# 算法基础面试题(一)

# 排序

## 选择排序

选择排序就是从数组中选择出来最大或者最小的元素，然后将其和队首或者队尾的元素进行交互。时间复杂度：O(n^2)

```java
public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;

        // 外层循环控制选择排序的轮数
        for (int i = 0; i < n - 1; i++) {
            // 假设当前轮次的第一个元素是最小的
            int minIndex = i;

            // 内层循环在未排序的部分中找到最小元素的索引
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            // 将找到的最小元素与当前轮次的第一个元素交换位置
            swap(arr, i, minIndex);
        }
    }
    // 辅助方法用于交换数组中的两个元素
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
```



## 冒泡排序

冒泡排序的原理很简单，我们想象一下一个一个的气泡上浮的过程。排序共进行八轮，每一轮都会做两两比较，并将较大的元素右移，就像冒泡一下。

一轮结束之后，八个元素中最大的那个元素44将会移动到最右边。

然后再重复其他的几轮。最终得到一个完全排序的数组。

时间复杂度O(n^2)。

## 归并排序

归并排序简称Merge sort是一种递归思想的排序算法。这个算法的思路就是将要排序的数组分成很多小的部分，直到这些小的部分都是已排序的数组为止（只有一个元素的数组）。

然后将这些排序过的数组两两合并起来，组成一个更大一点的数组。接着将这些大一点的合并过的数组再继续合并，直到排序完整个数组为止。

时间复杂度为 O(nlogn)

```java
public class MergeSort {
    public static void mergeSort(int[] arr, int low, int high) {
        if (low < high) {
            int mid = (high -low) / 2+ low;
            mergeSort(arr, low, mid);
            mergeSort(arr, mid + 1, high);
            merge(arr, low, mid, high);
        }
    }
    private static void merge(int[] arr, int low, int mid, int high) {
        int[] temp = new int[arr.length];
        int i = low;
        int j = mid + 1;
        int k = low;
        while (i <= mid && j <= high) {
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }
        while (i <= mid) { // 合并左边剩余元素
            temp[k++] = arr[i++];
        }
        while (j <= high) { // 合并右边剩余元素
            temp[k++] = arr[j++];
        }
        for (int l = low; l <= high; l++) { // 将合并后的结果拷贝回原数组
            arr[l] = temp[l];
        }
    }
}
```

## 插入排序

插入排序就是将要排序的元素插入到已经排序的数组中，从而形成一个新的排好序的数组。时间复杂度为 O(n^2)

```java
public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;

        // 外层循环控制待插入的元素，从第二个元素开始
        for (int i = 1; i < n; i++) {
            // 当前要插入的元素
            int key = arr[i];
            // 内层循环用于在已排序的部分找到插入位置
            int j = i - 1;

            // 从后到前，移动比 key 大的元素向右，为 key 腾出插入位置
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }

            // 插入 key 到正确的位置
            arr[j + 1] = key;
        }
    }
```

## 快速排序

快速排序也采用的是分而制之的思想。那么快速排序和归并排序的区别在什么地方呢？

归并排序是将所有的元素拆分成一个个排好序的数组，然后将这些数组再进行合并。

而快速排序虽然也是拆分，但是拆分之后的操作是从数组中选出一个中间节点，然后将数组分成两部分。

左边的部分小于中间节点，右边的部分大于中间节点。

然后再分别处理左边的数组合右边的数组。

```java
public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[low];
        while (low < high) {
            while (low < high && arr[high] >= pivot) {
                high--;
            }
            arr[low] = arr[high];
            while (low < high && arr[low] <= pivot) {
                low++;
            }
            arr[high] = arr[low];
        }
        arr[low] = pivot;
        return low;
    }
}
```



## count排序

count排序是一种空间换时间的算法，我们借助一个外部的count数组来统计各个元素出现的次数，从而最终完成排序。

```java
public class CountingSort {
    public static void countingSort(int[] arr) {
        int n = arr.length;

        // 找到数组中的最大值，确定计数数组的大小
        int max = findMax(arr);

        // 初始化计数数组，大小为最大值加一
        int[] count = new int[max + 1];

        // 统计每个元素的出现次数
        for (int value : arr) {
            count[value]++;
        }

        // 根据计数数组重构原始数组
        int index = 0;
        for (int i = 0; i <= max; i++) {
            while (count[i] > 0) {
                arr[index++] = i;
                count[i]--;
            }
        }
    }

    private static int findMax(int[] arr) {
        int max = arr[0];
        for (int value : arr) {
            if (value > max) {
                max = value;
            }
        }
        return max;
    }

```

- 计数排序的时间复杂度为 O(n + k)，其中 n 是数组的长度，k 是数组中元素的范围（最大值减最小值加一）。
- 计数排序是一种稳定的排序算法，适用于一定范围内的整数排序，但对于范围较大的整数或浮点数排序并不适用。
- 计数排序是一种线性时间复杂度的排序算法，但需要额外的空间来存储计数数组。

## 堆排序

java中的PriorityQueue

```java
public class HeapSort {
    public static void heapSort(int[] arr) {
      	//不包含n
        int n = arr.length;

        // 构建最大堆，从最后一个非叶子节点开始向上调整
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
        // 从堆顶依次取出最大元素，将堆重新调整为最大堆
        for (int i = n - 1; i > 0; i--) {
            // 将堆顶元素（最大值）与当前未排序部分的最后一个元素交换
            swap(arr, 0, i);
            // 调整剩余部分为最大堆，剩余部分不包含i
            heapify(arr, i, 0);
        }
    }

  //调整i这个节点，比较他跟他的子节点，并递归继续调整被交换的larget节点
    private static void heapify(int[] arr, int n, int i) {
        int largest = i; // 初始化最大值的索引为当前节点
        int leftChild = 2 * i + 1; // 左子节点的索引
        int rightChild = 2 * i + 2; // 右子节点的索引

        // 如果左子节点比当前节点大，则更新最大值的索引 ，为什么要小于n呢？是因为不包含n
        if (leftChild < n && arr[leftChild] > arr[largest]) {
            largest = leftChild;
        }
        // 如果右子节点比当前节点大，则更新最大值的索引
        if (rightChild < n && arr[rightChild] > arr[largest]) {
            largest = rightChild;
        }
        // 如果最大值的索引不等于当前节点，交换它们并递归调整子树
        if (largest != i) {
            swap(arr, i, largest);
            heapify(arr, n, largest);
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
```

# 技巧

二维前缀和？

单调队列?

计算n/t的结果，如果有余数则+1，可以简化为(n+t-1)/t  非常巧妙

检查整数的类型：正整数，负整数，符号

int * int 的值需要用long来存储。

链表求倒数可以用栈

求最大公约数，碾转相除法：

```java
    public int gcd(int a, int b) {
      return b != 0 ? gcd(b, a % b) : a;
  }
```

## 二进制运算

计算当前 x 和 y 的无进位相加结果：answer = x ^ y

计算当前 x 和 y 的进位：carry = (x & y) << 1

完成本次循环，更新 x = answer，y = carry



位运算: 抹去最右边的 1 : n = n & (n - 1);

保留最后一位：n&1 

位运算 x & -x  取出 x 的二进制表示中最低位那个 1

~a  按位取反

i - (i >>> 1) 得到i的最高位的1

只出现一次的数组---异或，相同的数字异或结果是0，0和任何数字异或是数字本身



*>>（带符号右移）： 对于正数，>> 和 >>> 的效果是相同的。*

*>>>（无符号右移）： 与 >> 不同，>>> 在移动过程中不管符号位，总是使用0来填充左侧的空位。*



```java
//数字范围按位与----选择数字范围的公共二进制前缀
    public int rangeBitwiseAnd(int left, int right) {

  while (left < right) {
            // 抹去最右边的 1
            right = right & (right - 1);
        }
        return right;
    }
```

```java
    public int hammingWeight(int n) {
        int cnt=0;
    while(n!=0){
        cnt += (n & 1);
        n >>>= 1;
    }
    return cnt;
    }
```

```java
//Brian Kernighan 算法
public class Solution {
    public int hammingWeight(int n) {
        int ret = 0;
      //移除最右的1
        while (n != 0) {
            n &= n - 1;
            ret++;
        }
        return ret;
    }
}
```

# 二分查找

二分查找特定的值：

while(left <= right) left=mid+1, right=mid-1; 



当left,right边界条件都可能满足的情况下使用left <=right

while: left <=right的时候，一定是left=mid+1;right=mid-1; 否则会出现循环的情况。

当非搜索特定值的时候使用left < right, 如果 int mid=(left+right)/2;则 left=mid+1; right=mid 否则可能会出现遗漏的情况。



如果是left <=right，并且mid=(left+right)/2，或者mid=(left+right+1)/2 ----同样效果，不影响最后的值。的时候，那么最后的一次判断时候，left=right=mid, 可以根据最后一次的比较结果来判断最后返回left或者right。



当left,right边界条件部分可能满足的情况下使用left < right。会少一次边界情况的判断。

如果是left < right, 如果mid=(left+right)/2，(更新时候left=mid+1, right=mid),那么最后的mid=left, mid=right-1。会导致mid有可能到不了right的位置，从而少判断一次情况。如果在动态判断比较中已经用用到了right的值，那么可以忽略。

如果是left < right, 如果mid=(left+right+1)/2，(更新时候left=mid, right=mid-1),那么最后的mid=right,mid=left+1,会导致mid可能到不了最左边的情况。从而少判断一次情况。如果在动态判断中用到了left的值，那么可以忽略。

这两种情况下，需要判断最后一次未比较的判断是通过哪个判断条件引起的。



在left< right的情况下，什么时候用mid=(left+right)/2，什么时候用mid=(left+right+1)/2呢？

主要看比较条件，看在在比较条件下加一，还是不加一是否仍然满足比较条件。选择仍然满足条件的那个，然后对mid进行调整。



```java
   public int searchInsert(int[] nums, int target) {
        int left=0; 
        int right = nums.length-1;
        while(left <=right){
            int mid=(left+right)/2;
            if(nums[mid]<target){
                left=mid+1;
            }else{
                right=mid-1;
            } 
        }
        return left; 
    }
    
    // 两次二分查找，分开查找第一个和最后一个
  // 时间复杂度 O(log n), 空间复杂度 O(1)
  // [1,2,3,3,3,3,4,5,9]
  public int[] searchRange2(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    int first = -1;
    int last = -1;
    // 找第一个等于target的位置
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] == target) {
        first = middle;
        right = middle - 1; //重点
      } else if (nums[middle] > target) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    // 最后一个等于target的位置
    left = 0;
    right = nums.length - 1;
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] == target) {
        last = middle;
        left = middle + 1; //重点
      } else if (nums[middle] > target) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    return new int[]{first, last};
  }
```

# 字符串匹配算法

## 暴力匹配



## KMP算法

*KMP**算法在大规模文本匹配中具有较高的效率，尤其在一些大数据处理场景下表现优越。*

* ### KMP算法步骤：

* 1. 初始化文本串指针 `i` 和模式串指针 `j`。

* 2. 若当前字符匹配，则 `i` 和 `j` 同时后移。

* 3. 若当前字符不匹配，根据 `next[j]` 调整 `j` 的位置。

* 4. 重复步骤2-3，直到找到匹配或文本串遍历完。

```java
 public static int KmpSearch(String str1, String str2) {
        int[] next = KMP_next(str2);
        //遍历
        for (int i = 0, j = 0; i < str1.length(); i++) {
            while (j > 0 && str1.charAt(i) != str2.charAt(j)) {
                j = next[j - 1];
            }
            if (str1.charAt(i) == str2.charAt(j)) {
                j++;
            }
            if (j == str2.length()) {
                return i - j + 1;
            }
        }
        return -1;
    }

    //获取到一个字符串的部分匹配值
    public static int[] KMP_next(String dest) {
        //创建一个数组next，保存部分匹配值
        int[] next = new int[dest.length()];
        next[0] = 0;//如果字符串是长度为1 部分匹配值就是0
        for (int i = 1, j = 0; i < dest.length(); i++) {
            //当dest.charAt(j) != dest.charAt(i)，我们需要从next[j-1]获取新的j
            //直到我们发现有dest.charAt(j) == dest.charAt(i)成立才停止
            while (j > 0 && dest.charAt(j) != dest.charAt(i)) {
                j = next[j - 1];
            }
            //当dest.charAt(j) == dest.charAt(i)满足时，部分匹配值就是+1
            if (dest.charAt(j) == dest.charAt(i)) {
                j++;
            }
            next[i] = j;
        }
        return next;
    }
```

## Boyer-Moore 算法


Boyer-Moore 算法是一种用于字符串搜索的高效算法，于 1977 年由 Robert S. Boyer 和 J Strother Moore 提出。该算法在实际应用中通常比其他字符串搜索算法更快。

Boyer-Moore 算法的主要思想是从右到左进行字符串匹配，而不是从左到右。算法利用两个规则来跳过不匹配的字符，从而加速搜索：

1. **坏字符规则（Bad Character Rule）：** 当发现不匹配的字符时，算法会将模式中最右边的该字符与文本中匹配位置对齐，从而跳过一些不可能匹配的位置。
2. **好后缀规则（Good Suffix Rule）：** 当发现不匹配的字符时，算法会查找模式中与文本匹配的最右边的部分，并将其与文本中匹配位置对齐，跳过一些不可能匹配的位置。

## Sunday 算法


Sunday 算法是一种字符串匹配算法，用于在文本中查找模式的出现位置。它由Daniel M. Sunday于1990年提出，是一种线性时间复杂度的字符串匹配算法，类似于Boyer-Moore算法。

Sunday 算法的基本思想是从左到右比较文本和模式，当发现不匹配的字符时，尽量将模式向右移动，使得下一个字符对齐文本中的下一个字符。具体而言，当发现不匹配时，根据下一个字符在模式中的位置，决定模式的移动距离。

以下是 Sunday 算法的基本步骤：

1. 从左到右比较文本和模式。
2. 如果发现不匹配，找到文本中与模式最右端对齐的字符的下一个字符（称为关键字符）。
3. 根据关键字符在模式中的位置，决定模式向右移动的距离。

## Manacher 算法

Manacher 算法是一种用于查找最长回文子串的线性时间复杂度算法。

Manacher 算法的关键在于利用已知的回文串信息，避免了重复计算。它维护一个数组 P，其中 P[i] 表示以字符 s[i] 为中心的最长回文串的半径长度。通过动态规划的方式计算 P 数组，从而得到最长回文子串的位置和长度。

以下是 Manacher 算法的基本步骤：

1. 预处理字符串，使其变成奇数长度。
2. 初始化 P 数组。
3. 以每个字符为中心，向两侧扩展并更新 P 数组。
4. 根据 P 数组得到最长回文子串。

Manacher 算法的时间复杂度为 O(n)，其中 n 是字符串的长度。由于其高效性和简洁性，Manacher 算法在解决回文串相关问题时被广泛使用。

最长回文半径和最长回文子串长度之间的关系：`int maxLength = p[i]-1`。`maxLength`表示最长回文子串长度。

最长回文子串的起始索引`int index = (i - p[i])/2`

```java
public class ManacherAlgorithm {

    public static String longestPalindrome(String s) {
        if (s == null || s.length() == 0) {
            return "";
        }

        // 预处理字符串，使其变成奇数长度
        String processedString = preprocessString(s);

        int n = processedString.length();
        int[] p = new int[n];
        int center = 0, right = 0; // 当前回文串的中心和右边界

        for (int i = 1; i < n - 1; i++) {
            int mirror = 2 * center - i; // 计算 i 关于 center 的对称位置
            if (right > i) {
                p[i] = Math.min(right - i, p[mirror]);
            }
            // 尝试扩展回文串
            while (processedString.charAt(i + p[i] + 1) == processedString.charAt(i - p[i] - 1)) {
                p[i]++;
            }
            // 更新 center 和 right
            if (i + p[i] > right) {
                center = i;
                right = i + p[i];
            }
        }
        // 找到最长回文子串的中心和半径
        int maxLen = 0;
        int centerIndex = 0;
        for (int i = 1; i < n - 1; i++) {
            if (p[i] > maxLen) {
                maxLen = p[i];
                centerIndex = i;
            }
        }

        // 提取最长回文子串
        int start = (centerIndex - maxLen) / 2;
        return s.substring(start, start + maxLen);
    }

    private static String preprocessString(String s) {
        StringBuilder sb = new StringBuilder("#");
        for (char c : s.toCharArray()) {
            sb.append(c).append("#");
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String s = "babad";
        System.out.println("Longest Palindrome: " + longestPalindrome(s));
    }
}

```

# Kadane 算法

Kadane 算法的关键点在于，对于数组中的每个元素，我们在计算当前最大和时要考虑包含该元素的情况。如果当前最大和变为负数，就说明前面的子数组和对后续元素的贡献为负，所以可以将当前最大和重置为当前元素。

```java
public static int maxSubArraySum(int[] nums) {
    if (nums == null || nums.length == 0) {
        return 0;
    }
    int maxCurrent = nums[0];
    int maxGlobal = nums[0];
    for (int i = 1; i < nums.length; i++) {
        maxCurrent = Math.max(nums[i], maxCurrent + nums[i]);
        maxGlobal = Math.max(maxGlobal, maxCurrent);
    }
    return maxGlobal;
}

public static void main(String[] args) {
    int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    System.out.println("Maximum Subarray Sum: " + maxSubArraySum(nums));
}
```


# 贪心算法

贪心算法的特点包括：

1. **局部最优解：** 在每一步选择中都采取当前状态下的最优策略，即局部最优解。
2. **不回溯：** 一旦做出了选择，在当前状态下不再改变。
3. **无法保证全局最优解：** 贪心算法的策略可能无法得到全局最优解，因为在做出每个局部选择时，无法预测之后的状态。

贪心算法常见的应用包括：

- **最小生成树问题（Minimum Spanning Tree）：** Kruskal 算法和 Prim 算法。
- **最短路径问题（Shortest Path）：** Dijkstra 算法。
- **背包问题（Knapsack Problem）：** 每次选择当前价值密度最高的物品放入背包。
