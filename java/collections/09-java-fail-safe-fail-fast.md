fail-safe fail-fast知多少

# 简介

我们在使用集合类的时候，通常会需要去遍历集合中的元素，并在遍历中对其中的元素进行处理。这时候我们就要用到Iterator,经常写程序的朋友应该都知道，在Iterator遍历的过程中，是不能够修改集合数据的，否则就会抛出ConcurrentModificationException。

因为ConcurrentModificationException的存在，就把Iterator分成了两类，Fail-fast和Fail-safe。

# Fail-fast Iterator

Fail-fast看名字就知道它的意思是失败的非常快。就是说如果在遍历的过程中修改了集合的结构，则就会立刻报错。

Fail-fast通常在下面两种情况下抛出ConcurrentModificationException：

1. 单线程的环境中

如果在单线程的环境中，iterator创建之后，如果不是通过iterator自身的remove方法，而是通过调用其他的方法修改了集合的结构，则会报错。

2. 多线程的环境中

如果一个线程中创建了iterator,而在另外一个线程中修改了集合的结构，则会报错。

我们先看一个Fail-fast的例子：

~~~java
        Map<Integer,String> users = new HashMap<>();

        users.put(1, "jack");
        users.put(2, "alice");
        users.put(3, "jone");

        Iterator iterator1 = users.keySet().iterator();

        //not modify key, so no exception
        while (iterator1.hasNext())
        {
            log.info("{}",users.get(iterator1.next()));
            users.put(2, "mark");
        }
~~~

上面的例子中，我们构建了一个Map，然后遍历该map的key，在遍历过程中，我们修改了map的value。

运行发现，程序完美执行，并没有报任何异常。

这是因为我们遍历的是map的key，只要map的key没有被手动修改，就没有问题。

再看一个例子：

~~~java
Map<Integer,String> users = new HashMap<>();

        users.put(1, "jack");
        users.put(2, "alice");
        users.put(3, "jone");

        Iterator iterator1 = users.keySet().iterator();

        Iterator iterator2 = users.keySet().iterator();
        //modify key,get exception
        while (iterator2.hasNext())
        {
            log.info("{}",users.get(iterator2.next()));
            users.put(4, "mark");
        }
~~~

上面的例子中，我们在遍历map的key的同时，对key进行了修改。这种情况下就会报错。

# Fail-fast 的原理

为什么修改了集合的结构就会报异常呢？

我们以ArrayList为例，来讲解下Fail-fast 的原理。

在AbstractList中，定义了一个modCount变量：

~~~java
protected transient int modCount = 0;
~~~

在遍历的过程中都会去调用checkForComodification()方法来对modCount进行检测：

~~~java
      public E next() {
            checkForComodification();
            try {
                int i = cursor;
                E next = get(i);
                lastRet = i;
                cursor = i + 1;
                return next;
            } catch (IndexOutOfBoundsException e) {
                checkForComodification();
                throw new NoSuchElementException();
            }
        }
~~~

如果检测的结果不是所预期的，就会报错：

~~~java
        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
~~~

在创建Iterator的时候会复制当前的modCount进行比较，而这个modCount在每次集合修改的时候都会进行变动，最终导致Iterator中的modCount和现有的modCount是不一致的。

~~~java
        public void set(E e) {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();

            try {
                AbstractList.this.set(lastRet, e);
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }
~~~

注意，Fail-fast并不保证所有的修改都会报错，我们不能够依赖ConcurrentModificationException来判断遍历中集合是否被修改。

# Fail-safe Iterator

我们再来讲一下Fail-safe，Fail-safe的意思是在遍历的过程中，如果对集合进行修改是不会报错的。

Concurrent包下面的类型都是Fail-safe的。看一个ConcurrentHashMap的例子：

~~~java
Map<Integer,String> users = new ConcurrentHashMap<>();

        users.put(1, "jack");
        users.put(2, "alice");
        users.put(3, "jone");

        Iterator iterator1 = users.keySet().iterator();

        //not modify key, so no exception
        while (iterator1.hasNext())
        {
            log.info("{}",users.get(iterator1.next()));
            users.put(2, "mark");
        }

        Iterator iterator2 = users.keySet().iterator();
        //modify key,get exception
        while (iterator2.hasNext())
        {
            log.info("{}",users.get(iterator2.next()));
            users.put(4, "mark");
        }
~~~

上面的例子完美执行，不会报错。

# 总结

Fail-fast 和 Fail-safe 是集合遍历的重要概念，希望大家能够掌握。

本文的例子[ https://github.com/ddean2009/learn-java-streams
](https://github.com/ddean2009/learn-java-streams)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)








