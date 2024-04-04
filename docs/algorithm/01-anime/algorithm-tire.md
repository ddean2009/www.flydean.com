---
slug: /algorithm-tire
---

# 24. 字典树Trie

# 简介

字典树的英文名叫做Trie,取自retrieval，也就是检索的意思。它是一种特殊的树状结构，可以进行快速的字符插入和字符串搜索，特别适用于文本搜索和词频统计等应用方面。

本文将会详细介绍字典树Trie的特性。

# Trie的特性

我们知道字典树是一棵树，为什么叫字典树呢？因为Trie的搜索和存储结构和字典非常类似。我们回忆一下十几年前我们使用新华字典查某个汉字的情况。

在新华字典中，所有的汉字都是以拼音来排序的。假如我们需要查询一个汉字，应该怎么查询呢？

首先我们需要将汉字转换为拼音，然后按照拼音顺序，一个字母一个字母的去查找。比如我们要查“全”这个字，它的拼音是“quan”。我们先找到Q的目录，然后在Q的目录里面再找u，再找a和n，最终就找到我们要找的汉字了。

我们来探讨一下字典树的结构。为了方便起见，我们假设字典是英文字典，Quan的结构存储结构应该是什么样的呢？

![](https://img-blog.csdnimg.cn/20201105180847261.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

从Root开始，我们分别用一个子节点来存储一个字符。然后从根节点到叶子节点中所有节点的字符连接起来就是我们要查找的字符串。

上面是只有一个拼音的情况，假如我们再多几个拼音又该怎么存储呢？ 比如我们再加上 “qun” 和 “lian” 这两个拼音，再看一下生成的Trie树的结构：

![](https://img-blog.csdnimg.cn/20201105181856483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

为了节省空间，qun和quan有共同前缀的部分可以共用相同的树结构，只有在不同的时候才去创建新的节点。

而对于lian来说，因为和quan没有公共前缀，所以从root节点开始就已经是新的子节点了。

通过上面的两个例子，我们来总结一下Trie树的特点：

1. Trie树中除了Root节点之外，其他的每个子节点都只包含一个字符。
2. 每个节点都可以有字母表个子节点，这些子节点不能重复。
3. 从根节点到每个叶子节点的字符连接起来是一个有效的字典中存储的字符串。

是不是很简单？

# Trie树和Hashing,BST的对比

为什么要使用Trie树呢？我们和一些常用的存储结构，比如Hashing，二叉搜索树BST有什么区别呢？

首先看下Hashing，写过程序的人应该对hashing都比较熟悉，简单点讲，就是将key转换成值比较小的value作为查找的index，一般来说hashing的搜索，插入和删除的时间复杂度是O(L) ，L是Hashing的key的长度。

然后看一下BST，为了避免极端的情况，我们这里讨论一下二叉平衡搜索树也就是AVL Tree，因为是二叉平衡树，所以它的时间复杂度一般来说是  O(L + Log n) ，其中L是key的长度，而 n 是集合中元素的个数。

二叉平衡树还有其他的优点，比如更快的查找极值等。

那么为什么要使用Trie树呢？

首先，Trie树它的查找和插入一个节点的时间复杂度是O(L) ，其中L表示的是单词的长度。这个时间肯定要不平衡二叉树要短。和Hashing相比，因为不用计算hash值，也不用解决hash冲突，所以比Hashing也会更加快速。

使用Trie树我们还可以按照字典那样安装字母表的顺序进行排序。

最后，Trie树的最大一个特点就是可以找出多个字符串的公共前缀。

当然，有优点就有缺点，从上面的例子中我们可以看到，Trie树的缺点就是占用空间比较大，除了公共前缀之外，几乎所有的单词都需要完全进行存储。

所以总结起来，Trie树虽然可以快速的查询，但是占用的空间会比较大。

# Trie树的程序化表示

那么如果用代码来表示Trie应该怎么表示呢？

假如我们的字典里面只存有英文单词，那么每一个TrieNode的节点都有可能有26个子节点，我们可以用一个包含26个字符的数组来表示。同时，为了有效的表示这个节点是否单词的最后一个字符，我们需要有一个标志位isEndOfWord来表示。

这样，我们的TrieNode就可以这样来表示：

~~~java
    // Trie的node节点
    static class TrieNode
    {
        TrieNode[] children = new TrieNode[ALPHABET_SIZE];

        // 这个节点是否是结束节点
        boolean isEndOfWord;

        //初始化TireNode节点
        TrieNode(){
            isEndOfWord = false;
            for (int i = 0; i < ALPHABET_SIZE; i++)
                children[i] = null;
        }
    }
~~~

# Trie树的插入

怎么插入Trie树呢？首先我们考虑一下，不管要插入什么单词，因为第零层是root节点，我们总会在第一层插入单词的第一个字符，在第二层插入单词的第二个字符，以此类推。

所以Trie树中新插入单词的层数和单词中字符的个数一致。

因为我们现在每个TrieNode都有26个节点，那么我们按照a放在第一个节点，b放在第二个节点的顺序来进行插入。

我们看下插入的代码该怎么写：

~~~java
static TrieNode root = new TrieNode();;
    
    // 如果当前level中不存在，那么就会在特定的位置插入新的节点
    // 如果当前level中存在该字符，则从其子节点继续插入
    // 最后，将该叶子节点标记为isEndOfWord。
    static void insert(String key)
    {
        int level;
        int length = key.length();
        int index;

        TrieNode currentNode = root;

        for (level = 0; level < length; level++)
        {
            index = key.charAt(level) - 'a';
            if (currentNode.children[index] == null)
                currentNode.children[index] = new TrieNode();

            currentNode = currentNode.children[index];
        }

        // 将叶子节点标记为 isEndOfWord
        currentNode.isEndOfWord = true;
    }
~~~

在遍历完单词的层数之后，需要将最后的叶子节点标记为isEndOfWord。

# Trie树的搜索

研究完Trie树的插入之后，我们看一下Trie树的搜索。其实搜索的逻辑和插入的逻辑很像，也是去判断子节点在该index的位置上是否存在有效的值。

搜索的时候也是安装层级的概念来搜索的，我们看下代码：

~~~java
    // 执行搜索，也是按level来进行查询
    static boolean search(String key)
    {
        int level;
        int length = key.length();
        int index;
        TrieNode currentNode = root;

        for (level = 0; level < length; level++)
        {
            index = key.charAt(level) - 'a';

            if (currentNode.children[index] == null)
                return false;

            currentNode = currentNode.children[index];
        }

        return (currentNode != null && currentNode.isEndOfWord);
    }
~~~

在遍历完level之后，我们需要去检测一下最后的节点是否为空或者是否isEndOfWord，当同时满足的时候才能说明该单词存在。

# Trie树的删除

删除Trie树，我们使用递归调用，一层层删除，如果删除的是单词的最后一个字符，那么将该字符的isEndOfWord标志设为false，然后判断该节点是否有子节点，如果没有的话就直接删除。如果有子节点，说该节点被其他单词使用，不做处理。

如果不是最后一个节点，那么就需要递归删除其子节点。子节点删除之后，我们还需要判断当前节点的状态。如果当前节点既没有子节点，也不是其他单词的结束节点，那么直接将这个节点删除即可。

代码如下：

~~~java
    //判断该节点是否有子节点
    static boolean hasChild(TrieNode currentNode)
    {
        for (int i = 0; i < ALPHABET_SIZE; i++)
            if (currentNode.children[i] != null)
                return true;
        return false;
    }

    static TrieNode remove(TrieNode currentNode, String key, int level ){
        if(currentNode ==null){
            return null;
        }

        int length = key.length();

        //正在处理最后一个字符
        if(level == length){
            //将当前节点的标志位删除
            if(currentNode.isEndOfWord){
                currentNode.isEndOfWord= false;
            }
            //如果没有子节点，则只接受删除该节点
            if (!hasChild(currentNode)) {
                currentNode = null;
            }

            return currentNode;
        }

        // 如果不是最后一个节点，则递归调用其子节点
        int index =  key.charAt(level) - 'a';
        currentNode.children[index] =
                remove(currentNode.children[index], key, level + 1);

        // 如果当前节点既没有子节点，也不是其他单词的结束节点，那么直接将这个节点删除即可。
        if (!hasChild(currentNode) && currentNode.isEndOfWord == false) {
            currentNode = null;
        }
        return currentNode;
    }
~~~

# Trie树的疑惑

有的朋友可能注意到了一个问题，上面我们举的例子中，并没有存在前缀包含的情况。比如说：我们有两个单词分别是：“quan” 和 “qu”，那这两个单词实际上是包含关系的，那么在Trie树上其实只能体现出“quan”,因为“qu”是包含在"quan"中的。

但是因为我们的节点引入了一个isEndOfWord的属性，所以u这个节点的isEndOfWord属性是true的，表示u同时是一个叶子节点，也是一个中间节点。

一切的逻辑都可以说得通。

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！











