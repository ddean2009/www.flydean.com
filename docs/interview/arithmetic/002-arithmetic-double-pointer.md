# 双指针


## [125. 验证回文串](https://leetcode.cn/problems/valid-palindrome/)

如果在将所有大写字符转换为小写字符、并**移除所有非字母数字字符**之后，短语正着读和反着读都一样。则可以认为该短语是一个 **回文串** 。

字母和数字都属于字母数字字符。

给你一个字符串 `s`，如果它是 **回文串** ，返回 `true` ；否则，返回 `false` 。

```java
class Solution {
    public boolean isPalindrome(String s) {

        int left=0, right=s.length()-1;
        if(s.length()==1){
            return true;
        }
        while(left < right){
            while(!Character.isLetterOrDigit(s.charAt(left)) && left < right){
                left++;
            }
            while(!Character.isLetterOrDigit(s.charAt(right)) && left < right){
                right--;
            }
            if(Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))){
                return false;
            }
            left++;
            right--;
            
        }
        return true;

    }
}
```

## [392. 判断子序列](https://leetcode.cn/problems/is-subsequence/)

给定字符串 **s** 和 **t** ，判断 **s** 是否为 **t** 的子序列。

字符串的一个子序列是原始字符串删除一些（也可以不删除）字符而不改变剩余字符相对位置形成的新字符串。（例如，`"ace"`是`"abcde"`的一个子序列，而`"aec"`不是）。

解法：双指针

```java
class Solution {
    public boolean isSubsequence(String s, String t) {

      int lefts=0, leftt=0;
      if(s.length()>t.length()){
          return false;
      }
      while(lefts<s.length() && leftt < t.length()){
              if(s.charAt(lefts)== t.charAt(leftt)){
                  lefts ++;
                  leftt ++;
              }else{
                  leftt ++;
              }
          
      }
      if(lefts == s.length() && leftt <=t.length()){
          return true;
      }else{
          return false;
      }

    }
}
```

## [167. 两数之和 II - 输入有序数组](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)

给你一个下标从 **1** 开始的整数数组 `numbers` ，该数组已按 **非递减顺序排列** ，请你从数组中找出满足相加之和等于目标数 `target` 的两个数。如果设这两个数分别是 `numbers[index1]` 和 `numbers[index2]` ，则 `1 <= index1 < index2 <= numbers.length` 。

以长度为 2 的整数数组 `[index1, index2]` 的形式返回这两个整数的下标 `index1` 和 `index2`。

你可以假设每个输入 **只对应唯一的答案** ，而且你 **不可以** 重复使用相同的元素。

你所设计的解决方案必须只使用常量级的额外空间。

```java
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left=0, right=numbers.length-1;
    

        while(left < right){
            if(numbers[left]+numbers[right]== target){
                return new int[]{left+1, right+1};
            }
            if(numbers[left]+numbers[right] > target){
                right--;
            }
            if(numbers[left]+numbers[right] < target){
                left++;
            }
        }
        return new int[]{-1, -1};

    }
}
```

## [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

给定一个长度为 `n` 的整数数组 `height` 。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])` 。

找出其中的两条线，使得它们与 `x` 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

**说明：**你不能倾斜容器。

解：考虑移位的条件

```java
class Solution {
    public int maxArea(int[] height) {

        int left=0, right=height.length-1;
        int max=Integer.MIN_VALUE;

        while(left < right ){
            max =Math.max(max,(right -left) * Math.min(height[left], height[right]));
            if(height[left]>=height[right]){
                right--;
            }else{
                left++;
            }
        }
        return max;

    }
}
```

## [15. 三数之和](https://leetcode.cn/problems/3sum/)

给你一个整数数组 `nums` ，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k` ，同时还满足 `nums[i] + nums[j] + nums[k] == 0` 。请

你返回所有和为 `0` 且不重复的三元组。

**注意：**答案中不可以包含重复的三元组。

解： 先排序，然后后面的两元组分别左右遍历。

```java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        int n = nums.length;
        Arrays.sort(nums);
        List<List<Integer>> ans = new ArrayList<List<Integer>>();

        for(int first=0; first< n; first++){
          //剔除重复的元素
            if(first> 0 && nums[first] == nums[first-1]){
                continue;
            }
            int third = n-1;
            int target = -nums[first];

            for(int second =first +1; second< n ; second++){
              //剔除重复的元素
                if(second > first+1 && nums[second] == nums[second-1]){
                    continue;
                }
              //移动最后的指针，找到最后一个 nums[second]+ nums[third] <=target的位置
                while(second< third && nums[second]+ nums[third] > target){
                    --third;
                }
              	//循环结束
                if(second==third){
                    break;
                }
								//添加到列表中
                if (nums[second] + nums[third] == target) {
                    List<Integer> list = new ArrayList<Integer>();
                    list.add(nums[first]);
                    list.add(nums[second]);
                    list.add(nums[third]);
                    ans.add(list);
                }

            }
        }
        return ans;
    }
}
```
