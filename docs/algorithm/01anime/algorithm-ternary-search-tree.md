---
slug: /algorithm-ternary-search-tree
---

# 23. 三分查找树ternary search tree

# 简介

之前我们介绍了tire字典树，tire字典树的优点就是插入和查找比较快速，但是它的缺点就是占用的空间比较大。假如我们要存放一个英文字典（全都是小写字母），那么每个节点将会有26个子节点，用来保存所有可能字符。

trie树既然这么占用空间，有没有比较好的办法来减少空间的占用或者提高空间的使用率呢？有的，这就是今天我们需要讲到的ternary search tree，中文叫做三分查找树。

# 三分查找树的结构

在讲三分查找树之前，我们先看一个trie树的结构：

![](https://img-blog.csdnimg.cn/20201106135620528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上面的trie树中我们存储了三个单词,分别是quan,qun和lian。 我们在每个节点中同时保存了该节点是否是单词结尾的标记，其中1表示是单词的结尾，0表示不是单词的结尾。

这样做的好处是可以在一条树的路径上存储多个单词。

同时trie树的根节点是个不存任何数据的节点，所有的数据都是接在这个根节点下面的。

我们先看下三分查找树的结构：

![](https://img-blog.csdnimg.cn/20201106140953409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

首先三分查找树的每个节点都有三个子节点，这也是三分查找树的名字的由来。然后我们给每个节点也添加一个是否是单词结尾的标记，用0和1来表示。

这次我们是四个单词，分别是：quan,qun和lian和qrr。

下面我们分析下三分查找树的构建流程，首先我们看下quan是怎么插入的。

首先插入q，这时候还没有任何节点，所以我们创建一个新的q节点，并且将其标记为0，表示是一个非单词结尾字符。

然后插入一个u，这个时候我们会先去判断q是否有子节点，这个时候因为q没有子节点，所以我们将u作为q的中间节点插入。

接着插入a和n，和前面插入u这个字符是一样的逻辑。最后在插入n的时候，因为是单词的最后一个字符，所以我们将其标记为1.

然后我们再插入qun。先看第一个字符q，这个时候root节点就是q，已经存在了，然后再看第二个u，也有了。第三个n终于没有了，这时候我们需要判断n和前面的一个字符u的大小关系，如果比u小就插入到u的左边，如果比u大就插入到u的右边。这里n比u小所以插入到n的左节点上。

接着插入lian，从第一个节点开始，就需要比较l和q的大小，因为l比q要小，所以需要插入到左节点。依次类推。

我们又插入了qrr这个单词。

# 三分查找树的代码表示

首先我们看一下三分查找树节点的构造，一个节点需要包含存储的字符，三个子节点和一个节点的类型表示这个节点是否表示一个单词的结束。

~~~java
    enum NodeType
    {
        COMPLETED,
        UNCOMPLETED
    }

    static class Node
    {
        public char word;

        public Node leftChild, centerChild, rightChild;

        public NodeType type;

        public Node(char ch, NodeType type)
        {
            word = ch;
            this.type = type;
        }
    }
~~~

我们看下插入的实现：

~~~java
    /**
     * 向node插入 s 中的 index 位的字符
     * @param s 整个单词
     * @param index 单词中的制定字符位
     * @param node 要被插入到的树的节点
     */
    private void insert(String s, int index, Node node)
    {
        if (null == node)
        {
            node = new Node(s.charAt(index), NodeType.UNCOMPLETED);
        }

        if (s.charAt(index) < node.word)
        {
            this.insert(s, index,  node.leftChild);
        }
        else if (s.charAt(index) > node.word)
        {
            this.insert(s, index,  node.rightChild);
        }
        else
        {
            if (index + 1 == s.length())
            {
                node.type = NodeType.COMPLETED;
            }
            else
            {
                this.insert(s, index + 1,  node.centerChild);
            }
        }
    }

    /**
     * 将单词 s 插入到树中
     * @param s
     */
    public void insert(String s)
    {
        if (s == null || s.length() == 0 )
        {
            return ;
        }

        insert(s, 0,  _root);
    }
~~~

插入的逻辑是先判断被插入的节点是不是空，如果是空则使用要插入的单词构建新的节点，然后判断要插入的字符串和当前节点的存储值的大小，如果小于，则插入到左节点，如果大于则插入到右节点，否则就插入到中间节点。

注意，这里插入到中间节点的一定是单词的index+1位置的新字符。

再来看看怎么查找一个特定的单词：

~~~java
    /**
     * 查找特定的单词
     * @param s 待查找的单词
     * @return
     */
    public Node find(String s)
    {
        if (s == null || s.length() == 0 )
        {
            return null;
        }

        int pos = 0;
        Node node = _root;
        _hashSet = new HashSet();
        while (node != null)
        {
            if (s.charAt(pos) < node.word)
            {
                node = node.leftChild;
            }
            else if (s.charAt(pos) > node.word)
            {
                node = node.rightChild;
            }
            else
            {
                if (++pos == s.length())
                {
                    _hashSet.add(s);
                    return node.centerChild;
                }

                node = node.centerChild;
            }
        }

        return null;
    }
~~~

查找的逻辑比较简单，分别是判断是否是左右节点，然后再到中间节点。

> 要注意的是，我们使用了一个HashSet来存储匹配好的字符串供后面使用。

# 三分查找树的应用

从上面的数据结构我们可以看出来，三分查找树的最大的应用就是查找共同前缀的字符串，也就是向搜索引擎那种单词自动填充的功能。

怎么用代码来实现呢？

~~~java
   /**
     * 前缀匹配
     * @param prefix
     * @param node
     */
    private void DFS(String prefix, Node node)
    {
        if (node != null)
        {
            if (NodeType.COMPLETED == node.type)
            {
                _hashSet.add(prefix + node.word);
            }

            DFS(prefix, node.leftChild);
            DFS(prefix + node.word, node.centerChild);
            DFS(prefix, node.rightChild);
        }
    }

    /**
     * 相识度查找
     * @param s 要查找的单词
     * @return
     */
    public HashSet<String> findSimilar(String s)
    {
        Node node = this.find(s);
        this.DFS(s, node);
        return _hashSet;
    }
~~~

这里我们先查找是否有相同的单词，并将查找到的单词放到hashSet中。然后我们又去查找具有相同前缀的单词，也将他们放在同样的hashMap中，供后面使用。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


