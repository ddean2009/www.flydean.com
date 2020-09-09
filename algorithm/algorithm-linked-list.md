看动画学算法之:linkedList

# 简介

linkedList应该是一种非常非常简单的数据结构了。节点一个一个的连接起来，就成了linkedList。今天我们使用动画的方法一起来看看linkedList是怎么插入和删除的。

# linkedList的构建

linkedList是由一个一个的节点构成的。而每个节点只需要存储要保存的数据和下一个节点的引用即可。

![](https://img-blog.csdnimg.cn/20200711205130793.png)

linkedList本身需要一个head节点，所以我们的linkedList可以这样构建：

~~~java
public class LinkedList {

    Node head; // head 节点

    //Node表示的是Linked list中的节点，包含一个data数据和下一个节点的引用
    class Node {
        int data;
        Node next;
        //Node的构造函数
        Node(int d) {
            data = d;
        }
    }
}
~~~

# linkedList的操作

先看一下linkedList怎么插入数据，插入数据有三种方式，头部插入，尾部插入，中间插入。

## 头部插入

先看一个头部插入的例子：

![](https://img-blog.csdnimg.cn/20200711205530567.gif)

头部插入的逻辑是什么呢？

新插入的节点作为head节点，然后将原来的head节点指向当前head节点的next引用即可。

~~~java
    //插入到linkedList的头部
    public void push(int newData) {
        //构建要插入的节点
        Node newNode = new Node(newData);
        //新节点的next指向现在的head节点
        newNode.next = head;
        //现有的head节点指向新的节点
        head = newNode;
    }
~~~

## 尾部插入

再看一下尾部插入的例子：

![](https://img-blog.csdnimg.cn/20200711210506686.gif)

插入的逻辑是什么呢？

找到最后一个节点，然后将最后一个节点的next指向新插入的节点。

~~~java
//新节点插入到list最后面
    public void append(int newData) {
        //创建新节点
        Node newNode = new Node(newData);
        //如果list是空，则新节点作为head节点
        if (head == null) {
            head = newNode;
            return;
        }

        newNode.next = null;
        //找到最后一个节点
        Node last = head;
        while (last.next != null) {
            last = last.next;
        }
        //插入
        last.next = newNode;
        return;
    }
~~~

## 中间插入

再看一下中间插入的例子：

![](https://img-blog.csdnimg.cn/2020071121075628.gif)

这个例子中，我们在第三个节点的位置插入了一个93。

插入逻辑就是先找到第二个节点，将第二个节点的next指向新节点，然后将新节点的next指向原先的第三个节点。

看下java代码如何实现：

~~~java
//插入在第几个元素之后
    public void insertAfter(int index, int newData) {
        Node prevNode = head;
        for (int i = 1; i < index; i++) {
            if (prevNode == null) {
                System.out.println("输入的index有误，请重新输入");
                return;
            }
            prevNode = prevNode.next;
        }
        //创建新的节点
        Node newNode = new Node(newData);
        //新节点的next指向prevNode的下一个节点
        newNode.next = prevNode.next;
        //将新节点插入在prevNode之后
        prevNode.next = newNode;
    }
~~~

## 删除节点

再看一下怎么删除某个位置的节点：

![](https://img-blog.csdnimg.cn/20200711211322969.gif)

上面的例子中，我们要删除第5个节点。

删除的逻辑就是找到第4个节点和第6个节点。然后将第四个节点的next指向第6个节点即可。

看下相应的java代码如下：

~~~java
    //删除特定位置的节点
    void deleteNode(int index)
    {
        // 如果是空的，直接返回
        if (head == null)
            return;

        // head节点
        Node temp = head;

        // 如果是删除head节点
        if (index == 1)
        {
            head = temp.next;
            return;
        }

        // 找到要删除节点的前一个节点
        for (int i=1; temp!=null && i<index-1; i++)
            temp = temp.next;

        // 如果超出范围
        if (temp == null || temp.next == null)
            return;

        // temp->next 是要删除的节点，删除节点
        Node next = temp.next.next;
        temp.next = next;
    }
~~~

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm/tree/master/sorting)

> 本文收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)





