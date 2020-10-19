在前面一篇文章我们讲到了理解分布式一致性:[Paxos协议之Cheap Paxos & Fast Paxos](https://www.jianshu.com/p/12474fb95ed0)
，本篇文章我会讲解Paxos协议的另外两个变种：Generalized Paxos和Byzantine Paxos。

# Generalized Paxos
我们大家都知道，分布式一致性的最大问题就是数据同步的问题，而产生问题的原因就是冲突，按照之前讲到的各种Paxos协议方案，发生了冲突之后就必须解决冲突然后重新发送请求，这样就会提高数据同步的成本和时间，那么有没有更好的方式来解决这个问题呢？

答案肯定是有。在分布式系统中，冲突是不可避免的，遇到冲突的时候是不是每次都解决冲突然后重新发送请求呢？我们举个例子：

如果Client1发送请求ReadA，Client2 发送请求ReadB，系统4个Acceptors，有2个接收ReadA，有2个接收ReadB，在共识层面来说，因为没有达到最大的共识个数，达不成共识，需要重新发送。但是如果我们仔细观察一下两个请求，ReadA，ReadB这两个命令是没有任何联系的，无论先执行哪一个都是同样的效果。那么我们可以认为这种情况是没有冲突的，我们在执行层面自行安排两个请求的顺序，而不用再次共识。 这就叫做Generalized Paxos。

这种共识的前提就是不同命令的先后顺序无关。下面以序列图的形式更加详细的介绍：
![](https://upload-images.jianshu.io/upload_images/17266240-47470c2b84f92383.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/17266240-4db599a9981cca09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# Byzantine Paxos
最后一个我们要讲的Paxos协议是Byzantine Paxos。熟悉虚拟货币的人应该对拜占庭协议并不陌生，这里我们也不多讲拜占庭协议，后面我会用单独的文章来详细介绍拜占庭协议。

上面我们讲到的所有的Paxos协议，只讲到了服务出错的情况，并没有考虑服务伪造篡改信息的情况，即并没有考虑到恶意节点。而拜占庭协议就是为了解决这个问题而产生的。

Byzantine Paxos比正常的Paxos协议多了一个消息验证的过程，这个验证使用了拜占庭协议。

## Byzantine Multi-Paxos
下面是个Byzantine Multi-Paxos的序列图：
![](https://upload-images.jianshu.io/upload_images/17266240-a130b514bdcdc561.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Fast Byzantine Multi-Paxos
同样的也会有Fast Byzantine Multi-Paxos，为了更加Fast，本协议将Verify和Accepted进行融合，放在一步完成。
![](https://upload-images.jianshu.io/upload_images/17266240-2c930337257a3bce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

