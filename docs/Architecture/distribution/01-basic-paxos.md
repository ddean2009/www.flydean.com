---
slug: /basic-paxos
---

# 1. 理解分布式一致性:Paxos协议之Basic Paxos


在[理解分布式一致性:Raft协议](http://www.flydean.com/understand-raft-protocol/)中，我们详细分析了什么是分布式一致性和实现分布式一致性的Raft协议，本文我们主要讲一下分布式一致性的Paxos协议。    

大家可能在各个场合都听说过Paxos协议，毕竟这个开创性的协议是很多分布式协议的鼻祖，比如后面比较有名的Raft协议就是基于Paxos协议发展而来的。现实中也有很多产品在使用Paxos协议，像是Google的Chubby，Spanner，IBM的SVC等。 但是在笔者的学习过程中，发现介绍Paxos协议的很多，但是真正能把它讲明白的却很少。所以笔者特意花了一定的时间来研究Paxos协议，现把学习结果分析如下。    

其实Paxos的作者Leslie Lamport早在2001年就写过一篇Paxos Made Simple的论文，来尽可能的简化Paxos的描述。大家可以在[Paxos Made Simple](https://www.microsoft.com/en-us/research/uploads/prod/2016/12/paxos-simple-Copy.pdf)获取作者的这篇论文。    

# 角色  

在Paxos协议中存在5种角色: client, acceptor, proposer, learner, 和 leader。但在实际的实现中，一个服务可能同时扮演一个或者多个角色，这样做的考虑是为了减少消息延迟和消息数量，提升整个Paxos协议的工作效率。    

**Client**  Client 是指请求的发起端，Client发送请求给分布式系统，并等待回复。    

**Acceptor (Voters)**  Acceptor 可以看做是消息请求的存储器。一般来说Acceptors是由一定数量的服务组成的，当消息被发送给Acceptor， 只有大部分Acceptor确认接收此消息，该消息才会被存储，否则该消息将被丢弃。    

**Proposer**  Proposer 可以看做Client的代理人，Proposer将Client的消息请求发送给Acceptors，并等待Acceptors的确认。在发生消息冲突时，Proposer将会尝试解决冲突。    

**Learner**  Learners可以看做是所有被确认消息的执行器，一旦有Client的消息请求被Acceptors确认之后，Learners会做相应的处理（如：执行消息内容，发送回复给Client）。Learner可以有多个。    

**Leader**  Paxos需要一个Leader来确保分布式系统可以按步骤进行下去。这里的Leader其实就是一个Proposer, Paxos协议会确保只有一个Proposer会被当做Leader。    

# Proposal Number & Agreed Value #  

Proposal Number 也叫提案编号，我们用n表示，对于每一个Proposer来说，每一个提案编号都是唯一的。  Agreed Value也叫确认值，我们用v来表示，v是Acceptors确认的值。  两个值组合起来就是（n，v）。    

# Basic Paxos #  

Paxos协议有很多变种，这里我们首先介绍一下Basis Paxos，后面的文章我们会继续介绍其他的Paxos协议。当然，既然是基础的Paxos协议，搞懂了它，对于其他的Paxos协议自然手到擒来。    

在Basic Paxos 协议中，有很多次的执行过程，每次执行过程产生一个单独的执行结果。每次执行过程都有很多轮次，每一轮都有2个阶段。    

**阶段1**    

- 阶段1A：Prepare
     在Prepare阶段，一个Proposer会创建一个Prepare消息，每个Prepare消息都有唯一的提案编号n。n并不是将要提案的内容，而只是一个唯一的编号，用来标志这个Prepare的消息。   n必须比该Proposer之前用过的所有编号都大，一般来说我们可以以数字递增的方式来实现这个编号。   接下来Proposer会把该编号发送给Acceptors，只有大多数Acceptors接收到Proposer发来的消息，该消息才算是发送成功。   

 - 阶段1B：Promise
     所有的Acceptors都在等待从Proposers发过来的Prepare消息。当一个Acceptor收到从Proposer发过来的Prepare消息时候，会有两种情况：  
   - 该消息中的n是Acceptor所有收到的Prepare消息中最大的一个，那么该Acceptor必须返回一个Promise消息给Proposer，告诉它后面所有小于n的消息我都会忽略掉。如果该Acceptor在过去的某个时间已经确认了某个消息，那么它必须返回那个消息的proposal number m 和 accepted value w （m，w）。如果该Acceptor在过去并没有确认过任何消息，那么会返回NULL。  
   - 如果Prepare消息中的n小于该Acceptor之前接收到的消息，那么该消息会被Acceptor忽略（为了优化也可以返回一个拒绝消息给Proposer，告诉它不要再发小于n的消息给我了）。      

**阶段2**    

- 阶段2A：Accept
     如果一个Proposer从Acceptors接收到了足够多的Promises（>n/2），这表示该Proposer可以开始下一个Accept请求的阶段了，在Accept阶段，Proposer需要设置一个值，然后向Acceptors发送Accept请求。   在阶段1B我们讲到了，如果Acceptor之前确认过消息，那么会把该消息编号和消息的值（m，w）返回给Proposer， Proposer收到多个Acceptors返回过来的消息之后，会从中选择编号最大的一个消息所对应的值z，并把他作为Accept请求的值（n，z）发给Acceptor。如果所有的Acceptors都没有确认过消息，那么Proposer可以自主选择要确认的值z。    
- 阶段 2b: Accepted   
当Acceptor接收到了Proposer的确认消息请求（n，z），如果该Acceptor在阶段1b的时候没有promise只接收>n的消息，那么该（n，z）消息就必须被Acceptor确认。   当（n，z）消息被Acceptor确认时，Acceptor会发送一个Accepted（n，z）消息给Proposer 和所有的Learner。当然在大部分情况下Proposer和Learner这两个角色可以合并。   
如果该Acceptor在阶段1b的时候promise只接收>n的消息，那么该确认请求消息会被拒绝或者忽略。   
按照以上的逻辑就会出现在一个轮次中，Acceptor 确认多次消息的情况。什么情况下才会出现这样的情况呢？ 我们举个例子：
   Acceptor 收到Accept（n，z），然后返回了Accepted（n，z），接下来该Acceptor 又收到了Prepare（n+1)请求，按照阶段1B的原则，Acceptor会 Promise （n+1，z），然后Acceptor 收到Accept（n+1，z），最后返回Accepted（n+1，z）。大家可以看到尽管Acceptor 确认了多次请求，但是最终会确保确认的值是保持一致的。    

下面我们会用序列图的方式形象的描述Basis Paxos中可能出现的各种情况。    

## Basic Paxos without failures ##  

在该序列图中，有1个Client，3个Acceptors和1个Learner，该图表示的是在第一轮执行过程中就成功的例子。    
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb8a4ebe028341c6994d70b31a840732~tplv-k3u1fbpfcp-zoom-1.image)


在第一轮就成功只是Paxos协议中一部分情况，其实在真实的世界中由于网络，系统等各种原因会造成多种情况的意外，最后导致协议往往并不能在第一轮就成功，往往需要经历好几轮。    

## Basic Paxos when an Acceptor fails ##  

如果有一个Acceptor因为各种原因挂掉了，3个Acceptors变成了2个Acceptors，还是满足>n/2 的要求，所以还是会成功。  

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/26c0eab073344967a8c8065ec0f2fad1~tplv-k3u1fbpfcp-zoom-1.image)

## Basic Paxos when an Proposer fails ##  

如果Proposer 在发送了一条Accept消息之后，但是还没收到Accepted消息之前就挂掉了，只有一个Acceptor接收到了Accept消息。那么整个Paxos协议就没法进行下去了，这时一个新的Leader（Proposer）会被选举出来，重新开始一轮新的共识。      

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52d86813443d406b811f51b0f98e7549~tplv-k3u1fbpfcp-zoom-1.image)

## Basic Paxos when multiple Proposers conflict ##  

最后再描述一个最复杂的情况，即有多个Proposers认为他们是Leaders，并不断的发送Prepare请求。为什么会有多个Leaders呢？ 有可能一个Proposer当了一段时间Leader之后挂掉了，新的Proposer被选为Leader继续新的一轮共识。后面挂掉的Proposer又恢复了，它认为自己还是Leader，所以继续发送Prepare请求。    
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aaf1ecdbe422457caadf8118b9d23a41~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/346f7a4b19734b39aff5166813111ac4~tplv-k3u1fbpfcp-zoom-1.image)


本次的Basic Paxos协议就介绍到这里。后面我们会继续介绍Paxos的其他变种。  



