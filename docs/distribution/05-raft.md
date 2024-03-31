[toc]



在分布式系统中，分布式一致性是一个非常重要的概念，它是指分布式系统的各个服务器都保持一个统一的状态（数据）。但是在分布式系统中，通常由于网络，系统状态等原因会导致某些服务不可用或者不可靠。这就需要一种分布式一致性的协议来保证系统在某些服务失败的情况下仍然整体可用。

Raft协议是受到Paxos的影响而产生的，相对于Paxos而言，Raft协议更加简单易懂。我会在后面的博客里面专门详细介绍Paxos协议的具体内容。这里我们重点讨论Raft协议。

# 什么是分布式一致性
下面举个例子：

假如我们有一个单节点的服务节点A，这个单节点的服务只是用来存储一个字母。同时我们还有一个客户端向这个服务发起更新数据的请求。

对于单节点的分布式一致性来说，服务响应客户端的更新请求即可。但是当我们有多个服务节点的情况下会怎么样呢？
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5bd088e7bd7447ea7489e4e4c902b63~tplv-k3u1fbpfcp-zoom-1.image)
Raft协议就是保证多个服务器节点数据一致性的协议。

接下来我们看看Raft是怎么工作的。

Raft协议中，一个服务器的节点可以是以下三种状态中的任意一个：

1. Follower 状态：跟随者，被动接收数据。我们用实心圆表示。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04c31b64d7de4ae68b811997052e790a~tplv-k3u1fbpfcp-zoom-1.image)

2. Candidate 状态：候选人，可以被选做Leader。我们用实心圆+虚线边框表示。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02f539f0c0d7402f91e135865f643d6f~tplv-k3u1fbpfcp-zoom-1.image)
3. Leader 状态：领导者，处理所有客户端交互，日志复制等，一般一次只有一个Leader. 我们用实心圆+实线边框表示。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af865a1e40d94344908b4c270aeb907d~tplv-k3u1fbpfcp-zoom-1.image)


# Leader选举
所有的节点都是从Follower状态开始的。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc4c94d3d82b4f7f82a8e5be81b20476~tplv-k3u1fbpfcp-zoom-1.image)


如果Follower在一定的时间里面没有收到选举请求或者Leader节点的回复，Follower则会转变为Candidate。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/550be17f34964754b507f6ab2eb9e591~tplv-k3u1fbpfcp-zoom-1.image)

Candidate会发送选举请求给所有的其他节点，收到选举请求的其他节点会反馈回Candidate，当Candidate收到的所有响应数目大于n/2 时，Candidate会认为绝大多数节点已经选我作为Leader了，这时候Candidate就会转变为Leader。接下来所有的数据变化都会经由Leader发起。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b97491799ec4951a73318dec25aa225~tplv-k3u1fbpfcp-zoom-1.image)

# 日志复制流程
在Raft系统中，所有的数据变化都是以日志记录的形式添加到服务节点之中。服务节点会不断的读取日志记录，并将日志记录更新到服务节点的数据中。日志记录最开始的状态是uncommited, 更新之后状态则变为commited.

为了实现所有服务节点的一致性更新，步骤如下：

 1. client 发送数据更改请求到Leader
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3321305d756f4f908f29dde7a0cceb17~tplv-k3u1fbpfcp-zoom-1.image)
 2. Leader复制日志记录到Follower节点
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea69a83ca55a4494b153ee68ec968454~tplv-k3u1fbpfcp-zoom-1.image)
 3. Leader等待大多数节点完成复制日志记录。
 4. Leader节点commit 当前日志记录，并更新Leader节点的数据。
![image.png](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae5a143b96944749abc5ea1abd14c3b7~tplv-k3u1fbpfcp-zoom-1.image)
 5. Leader通知Follower节点该日志记录已经commit.
 6. Follower节点commit该日志记录。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d89fee3823094eec955186c0ac750894~tplv-k3u1fbpfcp-zoom-1.image)
 7. 整个分布式系统实现了数据一致性。

# term选举周期
在Raft 协议中，有一个term的概念。term是一个选举周期，一个term周期只会产生一个Leader，term连续递增。
# timeout
在Raft协议中，为了保证选举和数据更新的顺利进行，规定了两种类型的timeout:
选举timeout和心跳timeout。

# 选举和选举timeout

 1. 每个term开始时，会重置选举timeout。在一个term中，Follower会等待timeout的时间，如果超出这个时间还没有得到其他节点的选举请求，Follower会主动转变为Candidate，并且term+1，意味着开启了新的选举周期。

	选举timeout是150ms-300ms之间的一个随机数，之所以随机产生timeout，是为了避免同时产生多个Candidate的情况。

	当Follower转变为Candidate之后，term加1， 然后开始新一轮的选举。Candidate首先会将自己的Vote Count 加1，然后发送请求选举的消息给其他节点。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17494d3d071e417291fb5fe060a42e21~tplv-k3u1fbpfcp-zoom-1.image)
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b923f87d369247f0a86f7a0da1dd0914~tplv-k3u1fbpfcp-zoom-1.image)
 2. 接收节点首先会比较term的大小，如果自己的term小于Candidate的term，则更新自己的term和Candidate的term保持一致，并重置timeout。如果接收节点在这个term中还没有做任何选举，则会返回选举响应消息给Candidate节点。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fba1f26c406f4419afb5cc62d6a9d2e8~tplv-k3u1fbpfcp-zoom-1.image)

3. Candidate 节点收到大部分节点的选举响应之后，会变成Leader 节点。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91e9b4d2d25545cb9799da2592b0157b~tplv-k3u1fbpfcp-zoom-1.image)

4. 一个选举周期完成，接下来Leader 发送更新日志给Follower节点，进入日志更新阶段。

# 选举分裂
值得注意的是Candidate只有得到超出n/2个节点的选举响应才能变为Leader节点。如果两个Follower节点同时变成Candidate节点，则会产生选举分裂的问题。
现在假设我们总共有4个节点，其中两个节点同时变成Candidate节点，并向其余两个节点发送选举请求：
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4509b768d1114333a96b92396ade7f53~tplv-k3u1fbpfcp-zoom-1.image)
节点B，C成为Candidate节点并行向节点A，D发送选举请求。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ed8848d81aa483cbc4791340a2f087c~tplv-k3u1fbpfcp-zoom-1.image)
节点A，D分别响应节点B，C的请求，这时候两个Candidate节点由于得到的Vote都是2，不满足大于n/2的条件，则其不能转变为Leader节点，继续等待timeout至新的term开始并开启新一轮的选举，只到符合条件为止。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c96a8165e80f4bf8b72b0147394b0a58~tplv-k3u1fbpfcp-zoom-1.image)
# 日志复制和心跳timeout
当系统进入到日志复制阶段，Leader节点会以心跳timeout的节奏向Follower节点发送日志记录，并且需要确保所有的节点都能够接受到完整的日志记录。
1. 客户发送set 5 给Leader， 在下一个心跳timeout，Leader将set 5的日志记录发给Follower。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4f2562286f141c88158acf7d1a8ed4c~tplv-k3u1fbpfcp-zoom-1.image)
2. Leader 收到大部分节点的ack 响应之后，commit 该日志记录。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/226c835849cf43f9b51e4ffbec6c1a8e~tplv-k3u1fbpfcp-zoom-1.image)
3. Leader通知Client已经提交该日志记录，同时通知Follower 提交该日志记录。
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a50473f4d1b4a119d57a76ac133ee47~tplv-k3u1fbpfcp-zoom-1.image)


更多教程请参考 [flydean的博客](http://www.flydean.com/understand-raft-protocol/)
