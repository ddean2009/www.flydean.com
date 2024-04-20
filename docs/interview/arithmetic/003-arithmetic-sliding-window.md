# 滑动窗口



## [209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/)

给定一个含有 `n` 个正整数的数组和一个正整数 `target` **。**

找出该数组中满足其总和大于等于 `target` 的长度最小的 **连续子数组** `[numsl, numsl+1, ..., numsr-1, numsr]` ，并返回其长度**。**如果不存在符合条件的子数组，返回 `0` 。

解法：滑动窗口，不断移动左右位置控制窗口大小

```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {

        int n = nums.length;
        int left =0,right =0;
        int sums=0;
        int result=Integer.MAX_VALUE;
        if(n==0){
            return 0;
        }

        while(right< n){
            		sums +=nums[right];
                while(sums >=target){
                    result = Math.min(result,right-left+1);
                    sums -=nums[left];
                    left++;
                }
                right++;
        }
        return result==Integer.MAX_VALUE?0:result;

    }
}
```

## [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

给定一个字符串 `s` ，请你找出其中不含有重复字符的 **最长子串** 的长度。

还是滑动窗口的实现，用一个set来存储是否包含之前的字符。

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        int result=0;
        Set<Character> occset = new HashSet<Character>();

        int j=0;
        for ( int i=0; i< s.length(); i++){
                if(i!=0){
                    occset.remove(s.charAt(i-1));
                }
           while( j< s.length() && !occset.contains(s.charAt(j))){
                occset.add(s.charAt(j));
                j++;
           }
          result = Math.max(j-i,result); 

        }
    return result;

    }
}
```

## [30. 串联所有单词的子串](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/)

给定一个字符串 `s` 和一个字符串数组 `words`**。** `words` 中所有字符串 **长度相同**。

`s` 中的 **串联子串** 是指一个包含 `words` 中**所有字符串**以任意顺序排列连接起来的子串。

- 例如，如果 `words = ["ab","cd","ef"]`， 那么 `"abcdef"`， `"abefcd"`，`"cdabef"`， `"cdefab"`，`"efabcd"`， 和 `"efcdab"` 都是串联子串。 `"acdbef"` 不是串联子串，因为他不是任何 `words` 排列的连接。

返回所有串联子串在 `s` 中的开始索引。你可以以 **任意顺序** 返回答案。

解答：-----这是定长窗口

还是使用滑动数组，因为需要包含words中的所有字符串，所以窗口长度为num * wordLen，因为是单词，所以多了一个单词长度wordLen的for循环。在内层遍历的时候每次都加wordLen。

```java
class Solution {
    public List<Integer> findSubstring(String s, String[] words) {
        List<Integer> res = new ArrayList<>();
        // 所有单词的个数
        int num = words.length;
        // 每个单词的长度（是相同的）
        int wordLen = words[0].length();
        // 字符串长度
        int stringLen = s.length();

        for (int i = 0; i < wordLen; i++) {
            // 遍历的长度超过了整个字符串的长度，退出循环
            if (i + num * wordLen > stringLen) {
                break;
            }
            // differ表示窗口中的单词频次和words中的单词频次之差
            Map<String, Integer> differ = new HashMap<>();
            // 初始化窗口，窗口长度为num * wordLen,依次计算窗口里每个切分的单词的频次
            for (int j = 0; j < num; j++) {
                String word = s.substring(i + j * wordLen, i + (j + 1) * wordLen);
                differ.put(word, differ.getOrDefault(word, 0) + 1);
            }
            // 遍历words中的word，对窗口里每个单词计算差值
            for (String word : words) {
                differ.put(word, differ.getOrDefault(word, 0) - 1);
                // 差值为0时，移除掉这个word
                if (differ.get(word) == 0) {
                    differ.remove(word);
                }
            }
            // 开始滑动窗口，窗口长度要注意
            for (int start = i; start < stringLen - num * wordLen + 1; start += wordLen) {
                if (start != i) {
                    // 右边的单词滑进来
                    String word = s.substring(start + (num - 1) * wordLen, start + num * wordLen);
                    differ.put(word, differ.getOrDefault(word, 0) + 1);
                    if (differ.get(word) == 0) {
                        differ.remove(word);
                    }
                    // 左边的单词滑出去
                    word = s.substring(start - wordLen, start);
                    differ.put(word, differ.getOrDefault(word, 0) - 1);
                    if (differ.get(word) == 0) {
                        differ.remove(word);
                    }
                }
                // 窗口匹配的单词数等于words中对应的单词数
                if (differ.isEmpty()) {
                    res.add(start);
                }
            }
        }
        return res;
    }
}
```

## [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

给你一个字符串 `s` 、一个字符串 `t` 。返回 `s` 中涵盖 `t` 所有字符的**最小子串**。如果 `s` 中不存在涵盖 `t` 所有字符的子串，则返回空字符串 `""` 。

解法：滑动窗口，在遍历中不断调整窗口大小。



```java
class Solution {
  public String minWindow(String s, String t) {
        Map<Character, Integer> need = new HashMap<>();
        Map<Character, Integer> window = new HashMap<>();
        for (int i = 0; i < t.length(); i++) {
            need.put(t.charAt(i), need.getOrDefault(t.charAt(i), 0) + 1);
        }
        int right = 0, left = 0;
        int valid = 0;
        int start = 0, minLen = Integer.MAX_VALUE;
        while (right < s.length()) {
            char cur = s.charAt(right);
            right++;
            // 进行窗口数据一系列更新,只有字符包含在need中的才需要更新
            if (need.containsKey(cur)) {
                Integer total = window.getOrDefault(cur, 0);
                window.put(cur, total + 1);
                if (window.get(cur).equals(need.get(cur))) {
                    valid++;
                }
            }
          //恰好包含当前t的所有字符
            while (need.size() == valid) {
              //更新最小值
                if (right - left < minLen) {
                    start = left;
                    minLen = right - left;
                }
                // d 是将移除窗口的字符串
                char d = s.charAt(left);
                // 左边移动窗口
                left++;
                // 进行窗口内数据当一系列更新
                if (window.containsKey(d)) {
                    if (window.get(d).equals(need.get(d))) {
                        valid--;
                    }
                    window.put(d, window.get(d) - 1);
                }
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
  
}
```
