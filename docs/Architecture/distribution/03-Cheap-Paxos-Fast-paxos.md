---
slug: /Cheap-Paxos-Fast-paxos
---

# 3. Cheap Paxos和Fast paxos

在前面一篇文章我们讲到了[理解分布式一致性:Paxos协议之Multi-Paxos](http://www.flydean.com/understant-paxos-multi-paxos/)，本篇文章我会讲解Paxos协议的另外两个变种：Cheap Paxos和Fast Paxos。

# Cheap Paxos
Cheap Paxos 是Basic Paxos 的继承版本。其实所有的Paxos变种都来自与Basic Paxos，都是基于它来进行改进的。那么Cheap Paxos有什么特点呢？ 

在Basic Paxos中，我们知道，共识如果想要正常进行的话，出错的节点数目必须小于n/2, 也就是说必须要有大于n/2的节点正常运行才能共识成功。节点运行就不可避免的会占用资源，有没有什么办法可以即节省资源又可以保证节点正常共识呢？

办法就是Cheap Paxos：我们在Cheap Paxos里面引入了辅助节点的概念，辅助节点只有在必须需要它来达成共识的情况下才会启动。举个例子，如果我们总共有N+1个节点，那么我们只能够忍受N/2个节点出错，否则系统不能达成共识。但是当我们再引入N个辅助节点，即使有N个节点出错，只要额外的N个辅助节点启动并正常工作，就能达成共识并保证系统的正常运行，辅助节点在正常节点恢复工作后会自动停止，这样只是在必要的时候才启动辅助资源，就大大的解约了分布式系统的成本，所以叫它Cheap Paxos.

## Message flow: Cheap Multi-Paxos
下图是3个正常节点+1个辅助节点的流程，如果系统规定的共识节点个数是3个，那么当一个正常节点挂掉之后，辅助节点会起来帮助完成共识工作。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19338e51b9744daa9e521ea283f5c71b~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06f01e9238d0486d960d2cc97bf6002d~tplv-k3u1fbpfcp-zoom-1.image)


# Fast Paxos
在之前提到的Paxos协议中，消息最后到达Learner一般都要经历 Client-->Proposer-->Acceptor-->Learner 总共3个步骤。

那么有没有更快的方法让消息到达Learner呢？毕竟Learner是真正执行任务的，我们希望这个任务更加快速的为Learner所知。方法就是如果Proposer本身没有数据需要被确认的话，那么Client可以直接发送Accept请求给Acceptor，从而跳过Proposer这一步，这样的操作叫做Fast Paxos。

这里还要注意一点，Client 发送请求给Proposer是直接发送给Leader，也就是发送一次就够了，但是发给Acceptor的话就要所有的Acceptors都发一遍。

## Message flow: Fast Paxos, non-conflicting
下图列出了正常运行的情况，没有冲突正常执行。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e24f88d12c047a1b9e7018de42f523c~tplv-k3u1fbpfcp-zoom-1.image)

## Message flow: Fast Paxos, conflicting proposals
当有多个Client同时发送Accept请求的时候就有可能产生冲突。这时候有两种解决办法。
1. Leader检测到冲突之后，根据规定的算法从冲突中选择一个数据，重新发送Accept请求。如下图所示：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/888db5b5e6b54abc911002cb6832cf5e~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a870a329fd54a08b7df5b5ee226a9fd~tplv-k3u1fbpfcp-zoom-1.image)

2. 当检测到冲突的时候，如果Acceptors自己就能解决冲突，那么就完全不需要Leader再次发送Accept请求了，这样就又减少了一次请求，节省了时间。如下图所示：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ca4e1928929413fa65364512ee64db9~tplv-k3u1fbpfcp-zoom-1.image)


## Message flow: Fast Paxos with uncoordinated recovery, collapsed roles
下图是所有的角色集合到一个Server的情况，是更加简洁的实现。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f73d320009247778a97debe213357f4~tplv-k3u1fbpfcp-zoom-1.image)
