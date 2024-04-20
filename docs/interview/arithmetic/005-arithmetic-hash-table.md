# Hash表格


## [383. 赎金信](https://leetcode.cn/problems/ransom-note/)

给你两个字符串：`ransomNote` 和 `magazine` ，判断 `ransomNote` 能不能由 `magazine` 里面的字符构成。

如果可以，返回 `true` ；否则返回 `false` 。

`magazine` 中的每个字符只能在 `ransomNote` 中使用一次。

解法：hash表格，遍历字符串存储字符串中每个字符的出现次数。

```java
class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {

        Map<Character,Integer> result = new HashMap<Character,Integer>();

        for(int i=0;i<ransomNote.length();i++){
            result.put(ransomNote.charAt(i), result.getOrDefault(ransomNote.charAt(i),0)+1);
        }
        for(int j=0;j<magazine.length();j++){
            if(result.containsKey(magazine.charAt(j))){
                result.put(magazine.charAt(j), result.getOrDefault(magazine.charAt(j),0)-1);
            }
            if(result.getOrDefault(magazine.charAt(j),0)==0){
                result.remove(magazine.charAt(j));
            }
        }
        if(result.size()==0){
            return true;
        }
        return false;

    }
}
```

## [205. 同构字符串](https://leetcode.cn/problems/isomorphic-strings/)

给定两个字符串 `s` 和 `t` ，判断它们是否是同构的。

如果 `s` 中的字符可以按某种映射关系替换得到 `t` ，那么这两个字符串是同构的。

每个出现的字符都应当映射到另一个字符，同时不改变字符的顺序。不同字符不能映射到同一个字符上，相同字符只能映射到同一个字符上，字符可以映射到自己本身。

解法：双向映射，双向比较

```java
class Solution {
    public boolean isIsomorphic(String s, String t) {
        int len1=s.length();
        int len2=t.length();

        if(len1 !=len2){
            return false;
        }

        Map<Character,Character> map1 = new HashMap<Character,Character>();
        Map<Character,Character> map2 = new HashMap<Character,Character>();

        for(int i=0; i< len1; i++){
            if(map1.containsKey(s.charAt(i))){
                if(map1.get(s.charAt(i)) !=t.charAt(i)){
                    return false;
                }
            }else{
                map1.put(s.charAt(i),t.charAt(i));
            }
            if(map2.containsKey(t.charAt(i))){
                if(map2.get(t.charAt(i)) !=s.charAt(i)){
                    return false;
                }
            }else{
                map2.put(t.charAt(i),s.charAt(i));
            }
        }
        return true;

    }
}
```

## [290. 单词规律](https://leetcode.cn/problems/word-pattern/)

给定一种规律 `pattern` 和一个字符串 `s` ，判断 `s` 是否遵循相同的规律。

这里的 **遵循** 指完全匹配，例如， `pattern` 里的每个字母和字符串 `s` 中的每个非空单词之间存在着双向连接的对应规律。

解法：双向映射

```java
class Solution {
    public boolean wordPattern(String pattern, String s) {

        Map map1 = new HashMap();
        Map map2 = new HashMap();
        int len1 = pattern.length();
        String[] list = s.split("\\s+");
        int len2 = list.length;
        if(len1 != len2){
            return false;
        }
        for( int i=0; i<len1; i++){
            if(map1.containsKey(pattern.charAt(i)) && !map1.get(pattern.charAt(i)).equals(list[i])){
                return false;
            }
            if(map2.containsKey(list[i]) && !map2.get(list[i]).equals(pattern.charAt(i))){
                return false;
            }
        map1.put(pattern.charAt(i),list[i]);
        map2.put(list[i],pattern.charAt(i));
        }
        return true;
        
    }
}
```

## [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)

给定两个字符串 s 和 t ，编写一个函数来判断 `t` 是否是 `s` 的字母异位词。

**注意：**若 `s` 和 `t` 中每个字符出现的次数都相同，则称 `s` 和 `t` 互为字母异位词。

解法1.用hash表

```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }
        Map<Character, Integer> table = new HashMap<Character, Integer>();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            table.put(ch, table.getOrDefault(ch, 0) + 1);
        }
        for (int i = 0; i < t.length(); i++) {
            char ch = t.charAt(i);
            table.put(ch, table.getOrDefault(ch, 0) - 1);
            if (table.get(ch) < 0) {
                return false;
            }
        }
        return true;
    }
}
```

解法2：数组排序再比较

```java
class Solution {
    public boolean isAnagram(String s, String t) {

        if(s.length() != t.length()){
            return false;
        }

        char[] str1 = s.toCharArray();
        char[] str2 = t.toCharArray();

        Arrays.sort(str1);
        Arrays.sort(str2);
        return Arrays.equals(str1,str2);


    }
}
```

## [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

给你一个字符串数组，请你将 **字母异位词** 组合在一起。可以按任意顺序返回结果列表。

**字母异位词** 是由重新排列源单词的所有字母得到的一个新单词。

解法：字符串转换为字符数组，然后进行排序作为hash的key， 从而判断是否是同一个异位词

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<Object, List<String>> map = new HashMap<Object, List<String>>();
        for(String str: strs){
            char[] array = str.toCharArray();
            Arrays.sort(array);
            String key= new String(array);
            List<String> list = map.getOrDefault(key,new ArrayList<String>());
            list.add(str);
            map.put(key,list);
    
        }
        return new ArrayList<List<String>>(map.values());

    }
}
```

## [1. 两数之和](https://leetcode.cn/problems/two-sum/)

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出 **和为目标值** *`target`* 的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

解法，用hash把nums[i]作为key，i作为value。遍历的时候判断target-nums[i]是否在key里面即可。

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer,Integer> map=new HashMap();
        for(int i=0; i< nums.length; i++){
            if(map.containsKey(target -nums[i])){
                return new int[]{map.get(target -nums[i]),i};
            }
            map.put(nums[i],i);
        }
        
        return new int[0];
    }
}
```

## [202. 快乐数](https://leetcode.cn/problems/happy-number/)

编写一个算法来判断一个数 `n` 是不是快乐数。

**「快乐数」** 定义为：

- 对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。
- 然后重复这个过程直到这个数变为 1，也可能是 **无限循环** 但始终变不到 1。
- 如果这个过程 **结果为** 1，那么这个数就是快乐数。

如果 `n` 是 *快乐数* 就返回 `true` ；不是，则返回 `false` 。

解法：hash存储每个sum值，从而判断是否有循环。

```java
class Solution {
    private int getNext(int n) {
        int totalSum = 0;
        while (n > 0) {
            int d = n % 10;
            n = n / 10;
            totalSum += d * d;
        }
        return totalSum;
    }

    public boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1 && !seen.contains(n)) {
            seen.add(n);
            n = getNext(n);
        }
        return n == 1;
    }
}
```

## [219. 存在重复元素 II](https://leetcode.cn/problems/contains-duplicate-ii/)

给你一个整数数组 `nums` 和一个整数 `k` ，判断数组中是否存在两个 **不同的索引** `i` 和 `j` ，满足 `nums[i] == nums[j]` 且 `abs(i - j) <= k` 。如果存在，返回 `true` ；否则，返回 `false` 。

解法：map中存储nums[i],i,然后在遍历中判断区间是否满足。

```java
class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
      Map<Integer,Integer> map = new HashMap();
      for(int i=0; i< nums.length; i++){
          if(map.containsKey(nums[i]) && i- map.get(nums[i])<=k ){
              return true;
          }
          map.put(nums[i],i);
      }
      return false;
    }
}
```

## [128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

给定一个未排序的整数数组 `nums` ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为 `O(n)` 的算法解决此问题。

解法：用set存放数组中的元素，然后遍历过滤后的set数组，判断num-1和num+1是否存在。保持最大值。

先找到起点，然后循环找到终点。

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> num_set = new HashSet<Integer>();
        for (int num : nums) {
            num_set.add(num);
        }

        int longestStreak = 0;

        for (int num : num_set) {
            if (!num_set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
								
              //因为不要求原序列连续，所以只需要判断num_set中是否有后续的number即可
                while (num_set.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }

        return longestStreak;
    }
}
```
