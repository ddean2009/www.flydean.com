非阻塞算法（Lock-Free）的实现

上篇文章我们讲到了使用锁会带来的各种缺点，本文将会讲解如何使用非阻塞算法。非阻塞算法一般会使用CAS来协调线程的操作。

虽然非阻塞算法有诸多优点，但是在实现上要比基于锁的算法更加繁琐和负责。

本文将会介绍两个是用非阻塞算法实现的数据结构。

## 非阻塞的栈

我们先使用CAS来构建几个非阻塞的栈。栈是最简单的链式结构，其本质是一个链表，而链表的根节点就是栈顶。

我们先构建Node数据结构：

~~~java
public class Node<E> {
    public final E item;
    public Node<E> next;

    public Node(E item){
        this.item=item;
    }
}
~~~

这个Node保存了内存item和它的下一个节点next。

然后我们构建非阻塞的栈，在该栈中我们需要实现pop和push方法，我们使用一个Atomic类来保存top节点的引用，在pop和push之前调用compareAndSet命令来保证命令的原子性。同时，我们需要不断的循环，以保证在线程冲突的时候能够重试更新。

~~~java
public class ConcurrentStack<E> {

    AtomicReference<Node<E>> top= new AtomicReference<>();

    public void push(E item){
        Node<E> newNode= new Node<>(item);
        Node<E> oldNode;
        do{
            oldNode=top.get();
            newNode.next= oldNode;
        }while(!top.compareAndSet(oldNode, newNode));
    }

    public E pop(){
        Node<E> oldNode;
        Node<E> newNode;
        do {
            oldNode = top.get();
            if(oldNode == null){
                return null;
            }
            newNode=oldNode.next;
        }while(!top.compareAndSet(oldNode, newNode));
        return oldNode.item;
    }

}
~~~

## 非阻塞的链表

构建链表要比构建栈复杂。因为我们要维持头尾两个指针。以put方法来说，我们需要执行两步操作：1. 在尾部插入新的节点。2.将尾部指针指向最新的节点。

我们使用CAS最多只能保证其中的一步是原子执行。那么对于1和2的组合步骤该怎么处理呢？

我们再仔细考虑考虑，其实1和2并不一定要在同一个线程中执行，其他线程在检测到有线程插入了节点，但是没有将tail指向最后的节点时，完全帮忙完成这个操作。

我们看下具体的代码实现：

~~~java
public class LinkedNode<E> {
    public final E item;
    public final AtomicReference<LinkedNode<E>> next;

    public LinkedNode(E item, LinkedNode<E> next){
        this.item=item;
        this.next=new AtomicReference<>(next);
    }
}
~~~

先构建一个LinkedNode类。

~~~java
public class LinkedQueue<E> {
    private final LinkedNode<E> nullNode= new LinkedNode<>(null, null);
    private final AtomicReference<LinkedNode<E>> head= new AtomicReference<>(nullNode);
    private final AtomicReference<LinkedNode<E>> tail= new AtomicReference<>(nullNode);

    public boolean put(E item){
    LinkedNode<E> newNode = new LinkedNode<>(item, null);
    while (true){
        LinkedNode<E> currentTail= tail.get();
        LinkedNode<E> tailNext= currentTail.next.get();
        if(currentTail == tail.get()){
            if (tailNext != null) {
                //有其他的线程已经插入了一个节点，但是还没有将tail指向最新的节点
                tail.compareAndSet(currentTail, tailNext);
            }else{
                //没有其他的线程插入节点，那么做两件事情：1. 插入新节点，2.将tail指向最新的节点
                if(currentTail.next.compareAndSet(null, newNode)){
                    tail.compareAndSet(currentTail, newNode);
                }
            }
        }
    }
    }
}
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/nonblock](https://github.com/ddean2009/learn-java-concurrency/tree/master/nonblock)

更多内容请访问 [flydean的博客](www.flydean.com)
