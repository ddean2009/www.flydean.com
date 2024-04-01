---
slug: /02-probability-god-mod
---

# 3. AI数学基础之:概率和上帝视角

# 简介

天要下雨，娘要嫁人。虽然我们不能控制未来的走向，但是可以一定程度上预测为来事情发生的可能性。而这种可能性就叫做概率。什么是概率呢？概率就是事情出现的可能性。比如扔骰子，我们知道骰子有六面，很容易知道扔出1点的概率是1/6，听起来很简单，但是如果放在复杂事件中，概率计算就变得比较麻烦和抽象，很多时候，我们可能没办法很简单的进行计算。今天我们来介绍一个计算概率的完全不同的视角：上帝视角。

# 蒙题霍尔问题



蒙题霍尔问题出自美国的一个电视节目Let's Make a Deal，问题名字来自该节目的主持人蒙提·霍尔（Monty Hall）。该问题内容大概是这样的：有三扇门，其中一个门中藏的是汽车，另外两扇门中藏的是山羊。这三扇门最开始都是关闭的，参赛者可以选择其中的一扇门，选择有汽车的那扇门就可以赢得汽车。

一开始的时候，参赛者会选择其中一扇门，然后主持人会打开剩下两扇门中藏有山羊的那扇，然后问参赛者是否需要更换选择。

聪明的读者，你们的选择是换还是不换呢？

最开始参赛者的中奖几率是1/3大家应该是没有问题的。问题是打开一扇门之后，参赛者最初选择的门和剩下那个未开的门中奖几率是否发生了变化呢？假设三个门分别被标记为A，B，C。

```
有人可能这样想，最开始的时候A，B，C三个门的中奖概率都是1/3。

现在打开了一个门，假设是B门被打开了。那么剩下的A和C的概率都变成了1/2。
```

听起来好像很有道理。

那么我们再换一个角度来看下这个问题。

```
如果参赛者最初选择了A，那么A有1/3的概率中奖，还有2/3的概率不中奖。这很好理解。

我们来考虑下如果重选，那么会发生什么事情：

假如A是正确的，那么重选一定错误。

假如A是不正确的，那么重选一定正确。
```

换句话说，A正确的概率也就是重选错误的概率。重选正确的概率= 1 - A正确的概率 = 1- 1/3 = 2/3。

也就是说重选更加有利。

问题的关键在于，在参赛者做出选择的时候，几率就已经确定了。后面发生的任何事情都不会影响它的几率。也就是说当参赛者选择A的时候，A获胜的几率就是1/3，不会因为后面发生事情的改变而改变。

> 注意，概率指的是事件发生多次的统计结果，并不是指确切的某个事件。

# 上帝视角解决概率问题

概率还是太抽象了。上面我的解释可能还有一些小伙伴不相信。那么我们来换个角度看概率的问题，我们把这个角度称之为上帝视角。

概率是指事情多次发生的时候，某种特殊情况可能出现的比率。比如扔骰子，我们仍1000次，1点出现的次数大概是170次，也就是1/6，我们说1点出现的概率是1/6。

回到上面的蒙题霍尔的问题，我们来构建一个上帝视角，这次不再是3个门了，而是3*360个门。假设我们有360个电视节目都在做猜奖的活动。每个电视节目都有3个门，其中只有1个门有汽车。那么我们总共会有总共有360个汽车。因为A，B，C三个编号的门中放有汽车的概率是一样的。

我们可以构建下面的一张表：

|           | 参赛者选择A      | 参赛者选择B      | 参赛者选择C      |
| --------- | ---------------- | ---------------- | ---------------- |
| A中有汽车 | 40个电视节目中奖 | 40               | 40               |
| B中有汽车 | 40               | 40个电视节目中奖 | 40               |
| C中有汽车 | 40               | 40               | 40个电视节目中奖 |

可以看到在360个电视节目中，选择A的会中奖40次，选择B的会中奖40次，选择C的同样会中奖40次。总共中奖120次，也就是说中奖的概率是1/3。

再来详细看一下主持人选择打开一个门时，参赛者如果选择更换会什么情况。

在A中有汽车的情况中，参赛者本来选择A，如果换选择，不管选择B或者C，都会失败，也就是说有40个电视节目是未中奖的。

如果参赛者本来选择的是B或者C，如果换选择则一定会成功，也就是说有40+40个节目会中奖。

同样的情况发送在B或者Z中有汽车的情况。统计一下，如果换选择，中奖的次数说80*3 = 240 。 中奖的几率是 240/360= 2/3。

明显看出，换选择之后，中奖比例是提高的。

# 上帝视角的好处

从上面的例子中，我们可以看出，上帝视角将一个概率问题，转换成了大数据情况下的，统计问题。在某些情况下，可以为我们的概率计算提供更加直观可靠的解释。

