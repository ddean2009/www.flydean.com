# 栈


## [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s` ，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

解法：用栈Stack。

```java
class Solution {
    public boolean isValid(String s) {

        int len=s.length();
        if(len%2 ==1){
            return false;
        }
        Stack<Character> stack = new Stack();
        for( int i =0; i< len; i++){
            if(s.charAt(i) =='(' || s.charAt(i) =='{' || s.charAt(i) =='['){
                stack.push(s.charAt(i));
            }else{
                if(stack.isEmpty()){
                        return false;
                }
            }
            if(s.charAt(i) ==')'){
                char c = stack.pop();
                if(c !='('){
                    return false;
                }
            }
            if(s.charAt(i) =='}' ){
                char c = stack.pop();
                if(c !='{'){
                    return false;
                }
            }
            if(s.charAt(i) ==']' ){
                char c = stack.pop();
                if(c !='['){
                    return false;
                }
            }
        } 
        return stack.isEmpty();
    }
}
```



## [71. 简化路径](https://leetcode.cn/problems/simplify-path/)

给你一个字符串 `path` ，表示指向某一文件或目录的 Unix 风格 **绝对路径** （以 `'/'` 开头），请你将其转化为更加简洁的规范路径。

在 Unix 风格的文件系统中，一个点（`.`）表示当前目录本身；此外，两个点 （`..`） 表示将目录切换到上一级（指向父目录）；两者都可以是复杂相对路径的组成部分。任意多个连续的斜杠（即，`'//'`）都被视为单个斜杠 `'/'` 。 对于此问题，任何其他格式的点（例如，`'...'`）均被视为文件/目录名称。

请注意，返回的 **规范路径** 必须遵循下述格式：

- 始终以斜杠 `'/'` 开头。
- 两个目录名之间必须只有一个斜杠 `'/'` 。
- 最后一个目录名（如果存在）**不能** 以 `'/'` 结尾。
- 此外，路径仅包含从根目录到目标文件或目录的路径上的目录（即，不含 `'.'` 或 `'..'`）。

返回简化后得到的 **规范路径** 。

```java
class Solution {
    public String simplifyPath(String path) {
        String[] names = path.split("/");
        Deque<String> stack = new ArrayDeque<String>();
        for (String name : names) {
            if ("..".equals(name)) {
                if (!stack.isEmpty()) {
                    stack.pollLast();
                }
            } else if (name.length() > 0 && !".".equals(name)) {
                stack.offerLast(name);
            }
        }
        StringBuffer ans = new StringBuffer();
        if (stack.isEmpty()) {
            ans.append('/');
        } else {
            while (!stack.isEmpty()) {
                ans.append('/');
                ans.append(stack.pollFirst());
            }
        }
        return ans.toString();
    }
}
```

## [155. 最小栈](https://leetcode.cn/problems/min-stack/)

设计一个支持 `push` ，`pop` ，`top` 操作，并能在常数时间内检索到最小元素的栈。

实现 `MinStack` 类:

- `MinStack()` 初始化堆栈对象。
- `void push(int val)` 将元素val推入堆栈。
- `void pop()` 删除堆栈顶部的元素。
- `int top()` 获取堆栈顶部的元素。
- `int getMin()` 获取堆栈中的最小元素。

解：这是一个辅助栈，用来存储当前的最小值

```java
class MinStack {

    private Deque<Integer> stack;
    private List<Integer> list;

    public MinStack() {
        this.stack= new LinkedList();
        this.list = new ArrayList();
        stack.push(Integer.MAX_VALUE);
    }
    
    public void push(int val) {
     list.add(val);
     stack.push(Math.min(val,stack.peek()));

    }
    
    public void pop() {
        list.remove(list.size()-1);
        stack.pop();
    }
    
    public int top() {
        return list.get(list.size()-1);
    }
    
    public int getMin() {
        return stack.peek();
    }
}
```

## [150. 逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

给你一个字符串数组 `tokens` ，表示一个根据 [逆波兰表示法](https://baike.baidu.com/item/逆波兰式/128437) 表示的算术表达式。

请你计算该表达式。返回一个表示表达式值的整数。

```java
class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new LinkedList();
        for(int i=0; i< tokens.length; i++){
            if(!isCal(tokens[i])){
                stack.push(Integer.valueOf(tokens[i]));
                continue;
            }else{
                int num1 = stack.pop();
                int num2 = stack.pop();
                if(tokens[i].equals("+")){
                    stack.push(num1+num2);
                }
                if(tokens[i].equals("-")){
                    stack.push(num2-num1);
                }
                if(tokens[i].equals("*")){
                    stack.push(num1*num2);
                }
                if(tokens[i].equals("/")){
                    stack.push(num2/num1);
                }      
            }
        }
        return stack.peek();
    }

    public boolean isCal(String str){
        return str.equals("+") || str.equals("-")  || str.equals("*") || str.equals("/");
    }
}
```



## [224. 基本计算器](https://leetcode.cn/problems/basic-calculator/)

给你一个字符串表达式 `s` ，请你实现一个基本计算器来计算并返回它的值。

注意:不允许使用任何将字符串作为数学表达式计算的内置函数，比如 `eval()` 。

解：用栈来存放运算符。

```java
class Solution {
    public int calculate(String s) {

        Deque<Integer> ops = new LinkedList<Integer>();
        ops.push(1);
        int sign =1;
        int ret =0;
        int n = s.length();
        int i=0;
        while(i <n ){
            if(s.charAt(i)==' '){
                i++;
            }else if(s.charAt(i)=='+'){
                sign=ops.peek();
                i++;
            }else if(s.charAt(i)=='-'){
                sign =-ops.peek();
                i++;
            }else if(s.charAt(i)=='('){
                ops.push(sign);
                i++;
            }else if(s.charAt(i)==')'){
                ops.pop();
                i++;
            }else{
                long num =0;
                while(i<n && Character.isDigit(s.charAt(i))){
                    num = num*10 + s.charAt(i)-'0';
                    i++;
                }
                ret +=sign*num;
            }
        }
        return ret;
    }
}
```
