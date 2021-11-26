看动画学算法之:doublyLinkedList

# 简介

今天我们来学习一下复杂一点的LinkedList：doublyLinkedList。

和LinkedList相比，doublyLinkedList中的节点除了next指向下一个节点之外，还有一个prev之前的一个节点。所以被称为doublyLinkedList。 doublyLinkedList是一个双向链表，我们可以向前或者向后遍历list。

今天我们来学习一下doublyLinkedList的基本操作和概念。

# doublyLinkedList的构建

和linkedList一样，doublyLinkedList是由一个一个的节点构成的。而每个节点除了要存储要保存的数据之外，还需要存储下一个节点和上一个节点的引用。

![](https://img-blog.csdnimg.cn/20200711225727337.png)

doublyLinkedList需要一个head节点，我们看下怎么构建：

~~~java
public class DoublyLinkedList {

    Node head; // head 节点

    //Node表示的是Linked list中的节点，包含一个data数据，上一个节点和下一个节点的引用
    class Node {
        int data;
        Node next;
        Node prev;
        //Node的构造函数
        Node(int d) {
            data = d;
        }
    }
}
~~~

# doublyLinkedList的操作

接下来，我们看一下doublyLinkedList的一些基本操作。

## 头部插入

![](https://img-blog.csdnimg.cn/20200711231151829.gif)

头部插入的逻辑是：将新插入的节点作为新的head节点，并且将newNode.next指向原来的head节点。

同时需要将head.prev指向新的插入节点。

看下java代码：

~~~java
    //插入到linkedList的头部
    public void push(int newData) {
        //构建要插入的节点
        Node newNode = new Node(newData);
        //新节点的next指向现在的head节点
        //新节点的prev指向null
        newNode.next = head;
        newNode.prev = null;

        if (head != null)
            head.prev = newNode;

        //现有的head节点指向新的节点
        head = newNode;
    }
~~~

## 尾部插入

![](https://img-blog.csdnimg.cn/20200711231502635.gif)

尾部插入的逻辑是：找到最后一个节点，将最后一个节点的next指向新插入的节点，并且将新插入的节点的prev指向最后一个节点。

~~~java
   //新节点插入到list最后面
    public void append(int newData) {
        //创建新节点
        Node newNode = new Node(newData);
        //如果list是空，则新节点作为head节点
        if (head == null) {
            newNode.prev = null;
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
        newNode.prev = last;
        return;
    }
~~~

## 插入给定的位置

![](https://img-blog.csdnimg.cn/202007112317512.gif)

如果要在给定的位置插入节点，我们需要先找到插入位置的前一个节点，然后将前一个节点的next指向新节点。新节点的prev指向前一个节点。

同时我们需要将新节点的next指向下一个节点，下一个节点的prev指向新的节点。

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
        //将新节点的prev指向prevNode
        newNode.prev = prevNode;

        //newNode的下一个节点的prev指向newNode
        if (newNode.next != null)
            newNode.next.prev = newNode;
    }
~~~

## 删除指定位置的节点

![](https://img-blog.csdnimg.cn/20200711232055223.gif)

删除节点的逻辑是：找到要删除节点的前一个节点，和下一个节点。前一个节点的next指向下一个节点，下一个节点的prev指向前一个节点。

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
        next.prev=temp;
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


