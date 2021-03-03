Scala中有一个很有用的traits叫PartialFunction，我看了下别人的翻译叫做偏函数，但是我觉得部分函数更加确切。

那么PartialFunction是做什么用的呢？简单点说PartialFunction用在模式匹配中，是一个不完整的函数，它只实现了函数的部分功能，也就是列举了部分case的情况。

我们先看下PartialFunction的定义：

~~~scala
trait PartialFunction[-A, +B] extends (A => B) { 
    ...

 def isDefinedAt(x: A): Boolean

    ...
~~~

我们可以看到PartialFunction是一个trait，它继承自函数 (A => B)， 这个函数有一个参数和一个返回值，在Scala中，该函数会被自动解析为Function1。

我们看下Function1的定义：

~~~scala
trait Function1[@specialized(scala.Int, scala.Long, scala.Float, scala.Double) -T1, @specialized(scala.Unit, scala.Boolean, scala.Int, scala.Float, scala.Long, scala.Double) +R] extends AnyRef { self =>
  /** Apply the body of this function to the argument.
   *  @return   the result of function application.
   */
  def apply(v1: T1): R
~~~

我们可以看到Function1定义了一个方法： def apply(v1: T1): R

PartialFunction也定义了一个方法： def isDefinedAt(x: A): Boolean

如果我们要自己实现一个PartialFunction，则必须实现上述两个方法：

~~~scala
  val inc = new PartialFunction[Any, Int] {
    override def isDefinedAt(x: Any): Boolean = ???

    override def apply(v1: Any): Int = ???
  }
~~~

其中isDefinedAt用来选择PartialFunction入参的范围，而apply是真正的业务逻辑。

除了用new来实例化一个PartialFunction外，还有一个最简单的方法就是使用case语句。 我们举个例子， 如果我们有段case逻辑是匹配各个好吃等级，如下：

~~~scala
  println("Step 1: Review of Pattern Matching in Scala")
  val donut = "Glazed Donut"
  val tasteLevel = donut match {
    case "Glazed Donut" | "Strawberry Donut" => "Very tasty"
    case "Plain Donut" => "Tasty"
    case _  => "Tasty"
  }
  println(s"Taste level of $donut = $tasteLevel")
~~~

我们使用了3个case语句，看起来比较繁琐，使用PartialFunction， 我们可以将其转换为如下的形式：

~~~scala
  val donutTaste = isVeryTasty orElse isTasty orElse unknownTaste
  println(donutTaste("Glazed Donut"))
  println(donutTaste("Plain Donut"))
  println(donutTaste("Chocolate Donut"))
~~~

PartialFunction可以通过使用orElse关键字来合并成一个完整的Function。

我们看下这几个PartialFunction该怎么定义：

~~~scala
  val isVeryTasty: PartialFunction[String, String] = {
    case "Glazed Donut" | "Strawberry Donut" => "Very Tasty"
  }

  val isTasty: PartialFunction[String, String] = {
    case "Plain Donut" => "Tasty"
  }

  val unknownTaste: PartialFunction[String, String] = {
    case donut1 @ _ => s"Unknown taste for donut = $donut1"
  }

~~~

实际上就是把整个的业务逻辑，用PartialFunction拆分开来了。这里使用case语句，会自动转换成为PartialFunction。

关注下最后一个unknownTaste的case语句，  @ 使用来做模式匹配的， case donut1 @ _  就意味着 donut1 将会匹配所有的输入。



