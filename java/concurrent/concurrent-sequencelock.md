由于不当的执行顺序导致的死锁

为了保证线程的安全，我们引入了加锁机制，但是如果不加限制的使用加锁，就有可能会导致顺序死锁（Lock-Ordering Deadlock）。上篇文章我们也提到了在线程词中因为资源的不足而导致的资源死锁（Resource Deadlock）。

本文将会讨论一下顺序死锁的问题。

我们来讨论一个经常存在的账户转账的问题。账户A要转账给账户B。为了保证在转账的过程中A和B不被其他的线程意外的操作，我们需要给A和B加锁，然后再进行转账操作， 我们看下转账的代码：

~~~java
    public void transferMoneyDeadLock(Account from,Account to, int amount) throws InsufficientAmountException {
        synchronized (from){
            synchronized (to){
                transfer(from,to,amount);
            }
        }
    }

    private void transfer(Account from,Account to, int amount) throws InsufficientAmountException {
        if(from.getBalance() < amount){
            throw new InsufficientAmountException();
        }else{
            from.debit(amount);
            to.credit(amount);
        }
    }
~~~

看起来上面的程序好像没有问题，因为我们给from和to都加了锁，程序应该可以很完美的按照我们的要求来执行。

那如果我们考虑下面的一个场景：

~~~java
A：transferMoneyDeadLock（accountA, accountB, 20）
B：transferMoneyDeadLock（accountB, accountA, 10）
~~~

如果A和B同时执行，则可能会产生A获得了accountA的锁，而B获得了accountB的锁。从而后面的代码无法继续执行，从而导致了死锁。

对于这样的情况，我们有没有什么好办法来处理呢？

加入不管参数怎么传递，我们都先lock accountA再lock accountB是不是就不会出现死锁的问题了呢？ 

我们看下代码实现：

~~~java
    private void transfer(Account from,Account to, int amount) throws InsufficientAmountException {
        if(from.getBalance() < amount){
            throw new InsufficientAmountException();
        }else{
            from.debit(amount);
            to.credit(amount);
        }
    }

    public void transferMoney(Account from,Account to, int amount) throws InsufficientAmountException {

       int fromHash= System.identityHashCode(from);
       int toHash = System.identityHashCode(to);

       if(fromHash < toHash){
           synchronized (from){
               synchronized (to){
                   transfer(from,to, amount);
               }
           }
       }else if(fromHash < toHash){
            synchronized (to){
                synchronized (from){
                    transfer(from,to, amount);
                }
            }
        }else{
           synchronized (lock){
           synchronized (from) {
               synchronized (to) {
                   transfer(from, to, amount);
               }
             }
           }
       }
    }
~~~

上面的例子中，我们使用了System.identityHashCode来获得两个账号的hash值，通过比较hash值的大小来选定lock的顺序。

如果两个账号的hash值恰好相等的情况下，我们引入了一个新的外部lock，从而保证同一时间只有一个线程能够运行内部的方法，从而保证了任务的执行而不产生死锁。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/accountTransferLock](https://github.com/ddean2009/learn-java-concurrency/tree/master/accountTransferLock)

更多内容请访问 [flydean的博客](www.flydean.com)
