# 17. Scala的Higher-Kinded类型

Higher-Kinded从字面意思上看是更高级的分类，也就是更高一级的抽象。我们先看个例子。

如果我们要在scala中实现一个对Seq[Int]的sum方法，应该怎么做呢？ 

~~~scala
def sum(seq: Seq[Int]): Int = seq reduce (_ + _)

sum(Vector(1,2,3,4,5)) // 结果值: 15
~~~

看起来很简单，刚刚我们实现了Seq[Int]的sum操作，那么如果我们想更进一步，我们想同时实现Seq[Int]和Seq[(Int,Int)]的操作该怎么处理呢？

不同的Seq需要不同的add实现，我们先抽象一个trait:

~~~scala
trait Add[T] { 
def add(t1: T, T2: T): T
}
~~~

接下来我们在Add的伴生类中定义两个隐式实例，一个Add[Int]， 一个Add[(Int,Int)]。 

~~~scala
object Add { 
implicit val addInt = new Add[Int] {
def add(i1: Int, i2: Int): Int = i1 + i2
}
implicit val addIntIntPair = new Add[(Int,Int)] {
def add(p1: (Int,Int), p2: (Int,Int)): (Int,Int) =
(p1._1 + p2._1, p1._2 + p2._2)
}
}
~~~

这两个隐式实例分别为Add[Int]， 一个Add[(Int,Int)]实现了add方法。

最后我们可以定义sumseq方法了：

~~~scala
def sumSeq[T : Add](seq: Seq[T]): T = 
seq reduce (implicitly[Add[T]].add(_,_))
~~~

T : Add 被称为 上下文定界（ context bound）， 它暗指隐式参数列表将接受Add[T] 实例。

我们看下怎么调用：

~~~scala
sumSeq(Vector(1 -> 10, 2 -> 20, 3 -> 30)) // 结果值: (6,60)
sumSeq(1 to 10) // 结果值: 55
sumSeq(Option(2)) // 出错!
~~~

sumSeq可以接受Seq[Int]和Seq[(Int,Int)]类型，但是无法接收Option。

对于任何一种序列，只要我们为它定义了隐式的Add 实例，那么sumSeq 方法便能计算出该序列的总和。

不过，sumSeq 仍然只支持Seq 子类型。假如容器类型并不是Seq 子类型，但是却实现了reduce 方法，我们该如何对该容器进行处理呢？我们会使用更加泛化的求和操作。这时候就需要使用到higher-kinded 类型了。 

我们用M替代Seq，则可以得到M[T],M[T]就是本文介绍的Higher-Kinded类型。

~~~scala
trait Reduce[T, -M[T]] { 
def reduce(m: M[T])(f: (T, T) => T): T
}
object Reduce { 
implicit def seqReduce[T] = new Reduce[T, Seq] {
def reduce(seq: Seq[T])(f: (T, T) => T): T = seq reduce f
}
implicit def optionReduce[T] = new Reduce[T, Option] {
def reduce(opt: Option[T])(f: (T, T) => T): T = opt reduce f
}
}
~~~

为了能对Seq 和Option 值执行reduce操作，我们分别为这两类类型提供了隐式实例。为了简化起见，我们将直接使用类型中已经提供的reduce 方法执行reduce操作。

> 注意这里-M[T]是逆变类型，还记得我们之前的结论吗？函数的参数一定是逆变类型的。 因为M[T]是reduce(m: M[T])的参数，所以我们需要定义它为逆变类型-M[T]。

我们看一下sum方法该怎么定义：

~~~scala
def sum[T : Add, M[T]](container: M[T])( 
implicit red: Reduce[T,M]): T =
red.reduce(container)(implicitly[Add[T]].add(_,_))
~~~

调用结果如下：

~~~scala
sum(Vector(1 -> 10, 2 -> 20, 3 -> 30)) // 结果值: (6,60)
sum(1 to 10) // 结果值: 55
sum(Option(2)) // 结果值: 2
sum[Int,Option](None) // 错误!
~~~

最后一个调用，我们为sum 方法添加的类型签名[Int, Opton] 会要求编译器将None 解释成Option[Int] 类型。假如不添加该类型签名，我们将得到编译错误：无法判断Option[T] 类型中的类型参数T 到底应该对应addInt 方法还是addIntIntPair 方法。

通过显式地指定类型，我们能够得到真正希望捕获的运行错误：我们不能对None 值调用reduce 方法。

在上面的sum方法中，sum[T : Add, M[T]]， T: Add是上下文边界，我们也想定义M[T] 的上下文边界，比如M[T] : Reduce。 
因为上下文边界只适用于包含单参数的场景，而Reduce 特征包
含两个类型参数，所以我们需要对Reduce进行改造：

~~~scala
trait Reduce1[-M[_]] { 
def reduce[T](m: M[T])(f: (T, T) => T): T
}
object Reduce1 { 
implicit val seqReduce = new Reduce1[Seq] {
def reduce[T](seq: Seq[T])(f: (T, T) => T): T = seq reduce f
}
implicit val optionReduce = new Reduce1[Option] {
def reduce[T](opt: Option[T])(f: (T, T) => T): T = opt reduce f
}
}
~~~

在新的reduce1中，只包含一个类型参数且属于higher-kinded 类型。

M[_]是上篇文章我们讲到的存在类型。T 参数被移至reduce 方法。

修改后的sum方法如下：

~~~scala
def sum[T : Add, M[_] : Reduce1](container: M[T]): T =
implicitly[Reduce1[M]].reduce(container)(implicitly[Add[T]].add(_,_))
~~~

我们定义了两个上下文边界，它们分别作用于Reduce1 和Add。而使用implicity 修饰的类型参数则能够区分出这两种不同的隐式值。

M[_]就是我们经常会看到的higher-kinded， higher-kinded虽然带给我们额外的抽象，但是使代码变得更加复杂。大家可以酌情考虑是否需要使用。

















