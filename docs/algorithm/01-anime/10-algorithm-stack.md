---
slug: /10-algorithm-stack
---

# 10. 栈stack

# 简介

栈应该是一种非常简单并且非常有用的数据结构了。栈的特点就是先进后出FILO或者后进先出LIFO。

实际上很多虚拟机的结构都是栈。因为栈在实现函数调用中非常的有效。

今天我们一起来看学习一下栈的结构和用法。

# 栈的构成

栈一种有序的线性表，只能在一端进行插入或者删除操作。这一端就叫做top端。

定义一个栈，我们需要实现两种功能，一种是push也就是入栈，一种是pop也就是出栈。

当然我们也可以定义一些其他的辅助功能，比如top：获取栈上最顶层的节点。isEmpty:判断栈是否为空。isFull:判断栈是否满了之类。

先看下入栈的动画：
![](https://img-blog.csdnimg.cn/20200712230940583.gif)

再看下出栈的动画：

![](https://img-blog.csdnimg.cn/2020071223093139.gif)

# 栈的实现

具有这样功能的栈是怎么实现呢？

一般来说栈可以用数组实现，也可以用链表来实现。

## 使用数组来实现栈

如果使用数组来实现栈的话，我们可以使用数组的最后一个节点作为栈的head。这样在push和pop栈的操作的时候，只需要修改数组中的最后一个节点即可。

我们还需要一个topIndex来保存最后一个节点的位置。

实现代码如下：

~~~java
public class ArrayStack {

    //实际存储数据的数组
    private int[] array;
    //stack的容量
    private int capacity;
    //stack头部指针的位置
    private int topIndex;

    public ArrayStack(int capacity){
        this.capacity= capacity;
        array = new int[capacity];
        //默认情况下topIndex是-1，表示stack是空
        topIndex=-1;
    }

    /**
     * stack 是否为空
     * @return
     */
    public boolean isEmpty(){
        return topIndex == -1;
    }

    /**
     * stack 是否满了
     * @return
     */
    public boolean isFull(){
        return topIndex == array.length -1 ;
    }

    public void push(int data){
        if(isFull()){
            System.out.println("Stack已经满了，禁止插入");
        }else{
            array[++topIndex]=data;
        }
    }

    public int pop(){
        if(isEmpty()){
            System.out.println("Stack是空的");
            return -1;
        }else{
            return array[topIndex--];
        }
    }
}
~~~

## 使用动态数组来实现栈

上面的例子中，我们的数组大小是固定的。也就是说stack是有容量限制的。

如果我们想构建一个无限容量的栈应该怎么做呢？

很简单，在push的时候，如果栈满了，我们将底层的数组进行扩容就可以了。

实现代码如下：

~~~java
public void push(int data){
        if(isFull()){
            System.out.println("Stack已经满了，stack扩容");
            expandStack();
        }
        array[++topIndex]=data;
    }

    //扩容stack，这里我们简单的使用倍增方式
    private void expandStack(){
        int[] expandedArray = new int[capacity* 2];
        System.arraycopy(array,0, expandedArray,0, capacity);
        capacity= capacity*2;
        array= expandedArray;
    }
~~~

当然，扩容数组有很多种方式，这里我们选择的是倍增方式。

## 使用链表来实现

除了使用数组，我们还可以使用链表来创建栈。

使用链表的时候，我们只需要对链表的head节点进行操作即可。插入和删除都是处理的head节点。

~~~java
public class LinkedListStack {

    private Node headNode;

    class Node {
        int data;
        Node next;
        //Node的构造函数
        Node(int d) {
            data = d;
        }
    }

    public void push(int data){
        if(headNode == null){
            headNode= new Node(data);
        }else{
            Node newNode= new Node(data);
            newNode.next= headNode;
            headNode= newNode;
        }
    }

    public int top(){
        if(headNode ==null){
            return -1;
        }else{
            return headNode.data;
        }
    }

    public int pop(){
        if(headNode ==null){
            System.out.println("Stack是空的");
            return -1;
        }else{
            int data= headNode.data;
            headNode= headNode.next;
            return data;
        }
    }

    public boolean isEmpty(){
        return headNode==null;
    }
}
~~~

本文的代码地址：

[learn-algorithm](https://github.com/ddean2009/learn-algorithm)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
