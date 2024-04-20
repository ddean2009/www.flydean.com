# 位运算


## [67. 二进制求和](https://leetcode.cn/problems/add-binary/)

给你两个二进制字符串 `a` 和 `b` ，以二进制字符串的形式返回它们的和。

设置一个carry进位。从字符串的尾部进行比较累加。字符串长度不够的以0代替。

```java
class Solution {
    public String addBinary(String a, String b) {

              StringBuffer ans = new StringBuffer();

        int n = Math.max(a.length(), b.length()), carry = 0;
        //倒着加
        for (int i = 0; i < n; ++i) {
            carry += i < a.length() ? (a.charAt(a.length() - 1 - i) - '0') : 0;
            carry += i < b.length() ? (b.charAt(b.length() - 1 - i) - '0') : 0;
            ans.append(carry % 2 );
            carry /= 2;
        }
        if (carry > 0) {
            ans.append('1');
        }
        ans.reverse();
        return ans.toString();
    }
}
```

解法2：

```java
class Solution {
    public String addBinary(String a, String b) {
        return Integer.toBinaryString(
            Integer.parseInt(a, 2) + Integer.parseInt(b, 2)
        );
    }
}
```

解法3：

- 计算当前 x 和 *y* 的无进位相加结果：`answer = x ^ y    相同数字异或=0，0和任何数字异或=数字本身`
- 计算当前 *x* 和 *y* 的进位：`carry = (x & y) << 1`

```java
public class Solution {
    public String addBinary(String a, String b) {
        int x = Integer.parseInt(a, 2);
        int y = Integer.parseInt(b, 2);

        while (y != 0) {
            int answer = x ^ y;
            int carry = (x & y) << 1;
            x = answer;
            y = carry;
        }

        return Integer.toBinaryString(x);
    }
}


```



## [190. 颠倒二进制位](https://leetcode.cn/problems/reverse-bits/)

颠倒给定的 32 位无符号整数的二进制位。

**提示：**

- 请注意，在某些语言（如 Java）中，没有无符号整数类型。在这种情况下，输入和输出都将被指定为有符号整数类型，并且不应影响您的实现，因为无论整数是有符号的还是无符号的，其内部的二进制表示形式都是相同的。
- 在 Java 中，编译器使用[二进制补码](https://baike.baidu.com/item/二进制补码/5295284)记法来表示有符号整数。因此，在 **示例 2** 中，输入表示有符号整数 `-3`，输出表示有符号整数 `-1073741825`。

解法：n&1 得到最低位，然后左移31-i位，跟rev做按位或。保留最高位。然后把n逻辑右移一位。重复得到结果。

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

解法2.位运算分治

```java
public class Solution {
    private static final int M1 = 0x55555555; // 01010101010101010101010101010101
    private static final int M2 = 0x33333333; // 00110011001100110011001100110011
    private static final int M4 = 0x0f0f0f0f; // 00001111000011110000111100001111
    private static final int M8 = 0x00ff00ff; // 00000000111111110000000011111111

    public int reverseBits(int n) {
        n = n >>> 1 & M1 | (n & M1) << 1;
        n = n >>> 2 & M2 | (n & M2) << 2;
        n = n >>> 4 & M4 | (n & M4) << 4;
        n = n >>> 8 & M8 | (n & M8) << 8;
        return n >>> 16 | n << 16;
    }
}
```



## [191. 位1的个数](https://leetcode.cn/problems/number-of-1-bits/)

编写一个函数，输入是一个无符号整数（以二进制串的形式），返回其二进制表达式中数字位数为 '1' 的个数（也被称为[汉明重量](https://baike.baidu.com/item/汉明重量)）。



```java
public class Solution {
    // you need to treat n as an unsigned value
    public int hammingWeight(int n) {
        int cnt=0;
    while(n!=0){
        cnt += (n & 1);
        n >>>= 1;
    }
    return cnt;
        
    }
}
```

## [136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

给你一个 **非空** 整数数组 `nums` ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。

解法：同样的数异或=0，0和任何数异或等于这个数本身。所以可以用异或操作。

```java
class Solution {
    public int singleNumber(int[] nums) {

        int single = 0;
        for (int num : nums) {
            single ^= num;
        }
        return single;
    }
}
```

## [137. 只出现一次的数字 II](https://leetcode.cn/problems/single-number-ii/)

给你一个整数数组 `nums` ，除某个元素仅出现 **一次** 外，其余每个元素都恰出现 **三次 。**请你找出并返回那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法且使用常数级空间来解决此问题。

解法1：同样是异或，但是判断出现的次数是否<=2

```java
class Solution {
    public int singleNumber(int[] nums) {


        int ans=0;
        Map<Integer, Integer> map = new HashMap<>();
        for(int num : nums){
            map.put(num, map.getOrDefault(num,0)+1);
            if(map.get(num)==null || map.get(num)<=2){
                ans ^=num;
            }
        }

        return ans;

    }
}
```

解法2.依次确定每一个二进制位

答案的第 i 个二进制位就是数组中所有元素的第 i 个二进制位之和除以 3 的余数。

```java
class Solution {
    public int singleNumber(int[] nums) {
        int ans = 0;
        for (int i = 0; i < 32; ++i) {
            int total = 0;
            for (int num: nums) {
                total += ((num >> i) & 1);
            }
            if (total % 3 != 0) {
                ans |= (1 << i);
            }
        }
        return ans;
    }
}
```

## [260. 只出现一次的数字 III](https://leetcode.cn/problems/single-number-iii/)

给你一个整数数组 `nums`，其中恰好有两个元素只出现一次，其余所有元素均出现两次。 找出只出现一次的那两个元素。你可以按 **任意顺序** 返回答案。

你必须设计并实现线性时间复杂度的算法且仅使用常量额外空间来解决此问题。

解法1。使用Hash表。  ------**没想到更好办法之前，就用最笨的办法**

解法2.位运算，考虑136只出现一次的数字是通过异或操作做出来的。

如果能把数组中的两个只出现一次的数字分成两组。再做异或操作就能得到两个数字的值了。

因为x1不等于x2,我们找到异或后的最后一个1，那么x1或者x2跟这个值进行异或的结果是不同的。这样就可以把x1和x2分组。

`x & -x` 是一种常见的位运算操作，通常用于获取整数 `x` 的最低位的1。这个操作的原理基于补码表示。

具体来说，对于二进制数的补码表示，`-x` 可以通过 `~x + 1` 得到。在补码表示中，`x` 和 `-x` 在二进制中只有最低位的1是相同的，其他位都是互补的。

```java
class Solution {
    public int[] singleNumber(int[] nums) {
        int xorsum = 0;
        for (int num : nums) {
            xorsum ^= num;
        }
        // 防止溢出 注意这里的防溢出操作
        int lsb = (xorsum == Integer.MIN_VALUE ? xorsum : xorsum & (-xorsum));
        int type1 = 0, type2 = 0;
        for (int num : nums) {
            if ((num & lsb) != 0) {
                type1 ^= num;
            } else {
                type2 ^= num;
            }
        }
        return new int[]{type1, type2};
    }
}
```

## [421. 数组中两个数的最大异或值](https://leetcode.cn/problems/maximum-xor-of-two-numbers-in-an-array/)

给你一个整数数组 `nums` ，返回 `nums[i] XOR nums[j]` 的最大运算结果，其中 `0 ≤ i ≤ j < n` 。

解法1.字典树

可以将数组中的元素看成长度为 31 的字符串，字符串中只包含 0 和 1。如果我们将字符串放入字典树中，那么在字典树中查询一个字符串的过程，恰好就是从高位开始确定每一个二进制位的过程。

如何求出 x 呢？我们可以从字典树的根节点开始进行遍历，遍历的「参照对象」为 ai。在遍历的过程中，我们根据 ai的第 x个二进制位是 0 还是 1，确定我们应当走向哪个子节点以继续遍历。假设我们当前遍历到了第 k 个二进制位：

如果 ai 的第 k 个二进制位为 0，那么我们应当往表示 1 的子节点走，这样 0⊕1=1，可以使得 x 的第 k 个二进制位为 1。如果不存在表示 1 的子节点，那么我们只能往表示 0 的子节点走，x 的第 k个二进制位为 0；

如果 ai的第 k 个二进制位为 1，那么我们应当往表示 0 的子节点走，这样 1⊕0=1，可以使得 x 的第 k 个二进制位为 1。如果不存在表示 0 的子节点，那么我们只能往表示 1 的子节点走，x 的第 k 个二进制位为 0。



由于字典树中的每个节点最多只有两个子节点，分别表示 0 和 1，因此本题中的字典树是一棵二叉树。在设计字典树的数据结构时，我们可以令左子节点 left 表示 0，右子节点 right 表示 1。

```java
class Solution {
    // 字典树的根节点
    Trie root = new Trie();
    // 最高位的二进制位编号为 30
    static final int HIGH_BIT = 30;

    public int findMaximumXOR(int[] nums) {
        int n = nums.length;
        int x = 0;
      //添加一个，check一个，为啥呢？因为i和j是有顺序的，j在i后面。
        for (int i = 1; i < n; ++i) {
            // 将 nums[i-1] 放入字典树，此时 nums[0 .. i-1] 都在字典树中
            add(nums[i - 1]);
            // 将 nums[i] 看作 ai，找出最大的 x 更新答案
            x = Math.max(x, check(nums[i]));
        }
        return x;
    }

    public void add(int num) {
        Trie cur = root;
        for (int k = HIGH_BIT; k >= 0; --k) {
            int bit = (num >>> k) & 1;
            if (bit == 0) {
                if (cur.left == null) {
                    cur.left = new Trie();
                }
                cur = cur.left;
            }
            else {
                if (cur.right == null) {
                    cur.right = new Trie();
                }
                cur = cur.right;
            }
        }
    }

    public int check(int num) {
        Trie cur = root;
        int x = 0;
        for (int k = HIGH_BIT; k >= 0; --k) {
            int bit = (num >>> k) & 1;
            if (bit == 0) {
                // a_i 的第 k 个二进制位为 0，应当往表示 1 的子节点 right 走
                if (cur.right != null) {
                    cur = cur.right;
                    x = x * 2 + 1;
                } else {
                    cur = cur.left;
                    x = x * 2;
                }
            } else {
                // a_i 的第 k 个二进制位为 1，应当往表示 0 的子节点 left 走
                if (cur.left != null) {
                    cur = cur.left;
                    x = x * 2 + 1;
                } else {
                    cur = cur.right;
                    x = x * 2;
                }
            }
        }
        return x;
    }
}

class Trie {
    // 左子树指向表示 0 的子节点
    Trie left = null;
    // 右子树指向表示 1 的子节点
    Trie right = null;
}
```

解法2.用hash表。从高位起，一位一位的进行处理。判断是否能够异或成为1

先处理最高位，我们的目标是结果尽可能多的1，我们把数字的最高位存入set，遍历的时候，判断最高位跟结果做异或操作，看是否存在set里面。如果有就说明可行。否则把结果减一。

```java
class Solution {
    // 最高位的二进制位编号为 30
    static final int HIGH_BIT = 30;

    public int findMaximumXOR(int[] nums) {
        int x = 0;
        for (int k = HIGH_BIT; k >= 0; --k) {
            Set<Integer> seen = new HashSet<Integer>();
            // 将所有的 pre^k(a_j) 放入哈希表中
            for (int num : nums) {
                // 如果只想保留从最高位开始到第 k 个二进制位为止的部分
                // 只需将其右移 k 位
                seen.add(num >> k);
            }
            // 目前 x 包含从最高位开始到第 k+1 个二进制位为止的部分
            // 我们将 x 的第 k 个二进制位置为 1，即为 x = x*2+1
            int xNext = x * 2 + 1;
            boolean found = false;
            // 枚举 i
            for (int num : nums) {
              //判断是否能够异或得到xNext
                if (seen.contains(xNext ^ (num >> k))) {
                    found = true;
                    break;
                }
            }
            if (found) {
                x = xNext;
            } else {
                // 如果没有找到满足等式的 a_i 和 a_j，那么 x 的第 k 个二进制位只能为 0
                // 即为 x = x*2
                x = xNext - 1;
            }
        }
        return x;
    }
}

```

## [187. 重复的DNA序列](https://leetcode.cn/problems/repeated-dna-sequences/)

**DNA序列** 由一系列核苷酸组成，缩写为 `'A'`, `'C'`, `'G'` 和 `'T'`.。

- 例如，`"ACGAATTCCG"` 是一个 **DNA序列** 。

在研究 **DNA** 时，识别 DNA 中的重复序列非常有用。

给定一个表示 **DNA序列** 的字符串 `s` ，返回所有在 DNA 分子中出现不止一次的 **长度为 `10`** 的序列(子字符串)。你可以按 **任意顺序** 返回答案。

```java
class Solution {
    static final int L = 10;

    public List<String> findRepeatedDnaSequences(String s) {
        List<String> ans = new ArrayList<String>();
        Map<String, Integer> cnt = new HashMap<String, Integer>();
        int n = s.length();
        for (int i = 0; i <= n - L; ++i) {
            String sub = s.substring(i, i + L);
            cnt.put(sub, cnt.getOrDefault(sub, 0) + 1);
            if (cnt.get(sub) == 2) {
                ans.add(sub);
            }
        }
        return ans;
    }
}
```

## 318.最大单词长度乘积

给你一个字符串数组 `words` ，找出并返回 `length(words[i]) * length(words[j])` 的最大值，并且这两个单词不含有公共字母。如果不存在这样的两个单词，返回 `0` 。

解法：如果可以将判断两个单词是否有公共字母的时间复杂度降低到 O(1)？

由于单词只包含小写字母，共有 26个小写字母，因此可以使用位掩码的最低 26 位分别表示每个字母是否在这个单词中出现。将 a 到 z 分别记为第 0 个字母到第 25 个字母，则位掩码的从低到高的第 i 位是 1 当且仅当第 i 个字母在这个单词中，其中 0≤i≤25 。

用数组 masks 记录每个单词的位掩码表示。计算数组 masks 之后，判断第 i 个单词和第 j 个单词是否有公共字母可以通过判断 masks[i] & masks[j] 是否等于 0 实现，当且仅当 masks[i] & masks[j]=0 时第 i 个单词和第 j 个单词没有公共字母，此时使用这两个单词的长度乘积更新最大单词长度乘积。

```java
class Solution {
    public int maxProduct(String[] words) {
        int length = words.length;
     		//先计算每个单词的掩码mask
        int[] masks = new int[length];
        for (int i = 0; i < length; i++) {
            String word = words[i];
            int wordLength = word.length();
            for (int j = 0; j < wordLength; j++) {
              //计算单词的mask，26个字符分别占26位 
                masks[i] |= 1 << (word.charAt(j) - 'a');
            }
        }
        int maxProd = 0;
        for (int i = 0; i < length; i++) {
            for (int j = i + 1; j < length; j++) {
                if ((masks[i] & masks[j]) == 0) {
                    maxProd = Math.max(maxProd, words[i].length() * words[j].length());
                }
            }
        }
        return maxProd;
    }
}

```



## [201. 数字范围按位与](https://leetcode.cn/problems/bitwise-and-of-numbers-range/)

给你两个整数 `left` 和 `right` ，表示区间 `[left, right]` ，返回此区间内所有数字 **按位与** 的结果（包含 `left` 、`right` 端点）。

解法：找数字二进制的最长前缀。抹去最右边的1：

```java
class Solution {
    public int rangeBitwiseAnd(int left, int right) {

  while (left < right) {
            // 抹去最右边的 1
            right = right & (right - 1);
        }
        return right;
    }
}
```
