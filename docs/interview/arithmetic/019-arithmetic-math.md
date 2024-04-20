# 数学


## [9. 回文数](https://leetcode.cn/problems/palindrome-number/)

给你一个整数 `x` ，如果 `x` 是一个回文整数，返回 `true` ；否则，返回 `false` 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

- 例如，`121` 是回文，而 `123` 不是。

解法1，数字转换成字符串，判断：

```java
class Solution {
    public boolean isPalindrome(int x) {
        String s = String.valueOf(x);
        boolean result =false;
        for(int i=0; i< s.length()/2;i++){
            result= (s.charAt(i) == s.charAt(s.length()-1-i));
            if(result ==false){
                return false;
            }
        }
        return true;

    }
}
```

解法2.反转一半数字，因为如果反转整个int，可能会溢出。如果该数字是回文，其后半部分反转后应该与原始数字的前半部分相同。

首先，我们应该处理一些临界情况。所有负数都不可能是回文，例如：-123 不是回文，因为 - 不等于 3。所以我们可以对所有负数返回 false。除了 0 以外，所有个位是 0 的数字不可能是回文，因为最高位不等于 0。所以我们可以对所有大于 0 且个位是 0 的数字返回 false。

当原始数字小于或等于反转后的数字时，就意味着我们已经处理了一半位数的数字了



```java
class Solution {
    public boolean isPalindrome(int x) {
        // 特殊情况：
        // 如上所述，当 x < 0 时，x 不是回文数。
        // 同样地，如果数字的最后一位是 0，为了使该数字为回文，
        // 则其第一位数字也应该是 0
        // 只有 0 满足这一属性
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int revertedNumber = 0;
        while (x > revertedNumber) {
            revertedNumber = revertedNumber * 10 + x % 10;
            x /= 10;
        }
        // 当数字长度为奇数时，我们可以通过 revertedNumber/10 去除处于中位的数字。
        // 例如，当输入为 12321 时，在 while 循环的末尾我们可以得到 x = 12，revertedNumber = 123，
        // 由于处于中位的数字不影响回文（它总是与自己相等），所以我们可以简单地将其去除。
        return x == revertedNumber || x == revertedNumber / 10;
    }
}
```

## [66. 加一](https://leetcode.cn/problems/plus-one/)

给定一个由 **整数** 组成的 **非空** 数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储**单个**数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

解法：判断最后一个9的位置。加一之后，之前不等于9的位置后面全部是0。

```java
class Solution {
    public int[] plusOne(int[] digits) {
        int n = digits.length;
        for (int i = n - 1; i >= 0; --i) {
          //不等于9，把值加一，同时把后面的所有位置为0
            if (digits[i] != 9) {
                ++digits[i];
                for (int j = i + 1; j < n; ++j) {
                    digits[j] = 0;
                }
                return digits;
            }
        }

        // digits 中所有的元素均为 9
        int[] ans = new int[n + 1];
        ans[0] = 1;
        return ans;
    }
}
```

## [172. 阶乘后的零](https://leetcode.cn/problems/factorial-trailing-zeroes/)

给定一个整数 `n` ，返回 `n!` 结果中尾随零的数量。

提示 `n! = n * (n - 1) * (n - 2) * ... * 3 * 2 * 1`

n! 尾零的数量即为 n! 中因子 10 的个数，而 10=2×5，因此转换成求 n! 中质因子 2 的个数和质因子 5的个数的较小值。

由于质因子 5 的个数不会大于质因子 2 的个数（具体证明见方法二），我们可以仅考虑质因子 **5 的个数**。

而 n! 中质因子 5 的个数等于[1,n] 的每个数的质因子 5 的个数之和，我们可以通过遍历[1,n] 的所有 5 的倍数求出。

```java
class Solution {
    public int trailingZeroes(int n) {

     int ans = 0; 
     while (n >0){
         n=n/5;
         ans+=n;
     }
     return ans;

    }
}
```

## [69. x 的平方根](https://leetcode.cn/problems/sqrtx/)

给你一个非负整数 `x` ，计算并返回 `x` 的 **算术平方根** 。

由于返回类型是整数，结果只保留 **整数部分** ，小数部分将被 **舍去 。**

**注意：**不允许使用任何内置指数函数和算符，例如 `pow(x, 0.5)` 或者 `x ** 0.5` 。

解法1，二分法，使用外部变量保存值。

```java
class Solution {
    public int mySqrt(int x) {

        int left=0, right=x, ans=-1;
        while(left <= right){
            int mid = left + (right-left)/2;
            if((long)mid*mid <=x){
                ans = mid;
                left = mid +1;
            }else{
                right = mid -1;
            }
        }
        return ans;
    }
}
```

解法2.直接返回left或者right

```java
class Solution {
    public int mySqrt(int x) {

        int left=0, right=x;
        while(left <= right){
            int mid = left + (right-left)/2;
            if((long)mid*mid <=x){
                left = mid +1;
            }else{
                right = mid -1;
            }
        }
        return right;
    }
}
```

## [50. Pow(x, n)](https://leetcode.cn/problems/powx-n/)

实现 [pow(*x*, *n*)](https://www.cplusplus.com/reference/valarray/pow/) ，即计算 `x` 的整数 `n` 次幂函数（即，`xn` ）。

考虑n可能是负数。

解法：快速幂算法

```java
class Solution {
    public double myPow(double x, int n) {
            int N =n;
            return N >=0 ? quickMul(x,N):1.0/quickMul(x,-N);
    }

    public double quickMul(double x, int N){
        if(N ==0){
            return 1;
        }
        double y=quickMul(x,N/2);
        return N%2 ==0 ? y*y: y*y*x;
    }
}
```
