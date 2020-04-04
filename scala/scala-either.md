在之前的文章中我们提到了Option，scala中Option表示存在0或者1个元素，如果在处理异常的时候Option就会有很大的限制，因为Option如果返回None，那么我并不知道具体的异常到底是什么，这样scala引入了Either。

顾名思意，Either表示或者是这一个元素或者是那个元素。这样在异常处理的时候就非常有用了。 

我们先看一下Either的定义：

~~~scala
sealed abstract class Either[+A, +B] extends Product with Serializable
~~~

它有两个子类Left和Right：

~~~scala
/** The left side of the disjoint union, as opposed to the [[scala.util.Right]] side.
 *
 *  @author <a href="mailto:research@workingmouse.com">Tony Morris</a>, Workingmouse
 */
final case class Left[+A, +B](@deprecatedName('a, "2.12.0") value: A) extends Either[A, B] {
  def isLeft  = true
  def isRight = false

  @deprecated("Use .value instead.", "2.12.0") def a: A = value
}

/** The right side of the disjoint union, as opposed to the [[scala.util.Left]] side.
 *
 *  @author <a href="mailto:research@workingmouse.com">Tony Morris</a>, Workingmouse
 */
final case class Right[+A, +B](@deprecatedName('b, "2.12.0") value: B) extends Either[A, B] {
  def isLeft  = false
  def isRight = true

  @deprecated("Use .value instead.", "2.12.0") def b: B = value
}
~~~

我们通过这两个子类从两个可能的元素中选择一种。

Either 概念的产生时间早于Scala。很长时间以来它被认为是抛出异常的一种替代方案。
为了尊重历史习惯，当Either 用于表示错误标志或某一对象值时，Left 值用于表示错误标志，如：信息字符串或下层库抛出的异常；而正常返回时则使用Right 对象。很明显，Either 可以用于任何需要持有某一个或另一个对象的场景中，而这两个对象的类型可能不同。

我们看下怎么用Either的常规使用：

~~~scala

def positive(i: Int): Either[String,Int] = 
  if (i > 0) Right(i) else Left(s"nonpositive number $i")

for {
  i1 <- positive(5).right
  i2 <- positive(10 * i1).right
  i3 <- positive(25 * i2).right
  i4 <- positive(2  * i3).right
} yield (i1 + i2 + i3 + i4)
// Returns: scala.util.Either[String,Int] = Right(3805)

for {
  i1 <- positive(5).right
  i2 <- positive(-1 * i1).right   // EPIC FAIL!
  i3 <- positive(25 * i2).right
  i4 <- positive(-2 * i3).right   // EPIC FAIL!
} yield i1 + i2 + i3 + i4
// Returns: scala.util.Either[String,Int] = Left(nonpositive number -5)

~~~

再看一下Either怎么在代码中消除程序错误，将错误封装在Either中。

~~~scala
scala> def addInts(s1: String, s2: String): Int =
| s1.toInt + s2.toInt
addInts: (s1: String, s2: String)Int
scala> for {
| i <- 1 to 3
| j <- 1 to i
| } println(s"$i+$j = ${addInts(i.toString,j.toString)}")
1+1 = 2
2+1 = 3
2+2 = 4
3+1 = 4
3+2 = 5
204 ｜ 第7 章
3+3 = 6
scala> addInts("0", "x")
java.lang.NumberFormatException: For input string: "x"
~~~

先看上面的例子，我们定义了一个addInts方法，接收两个String参数，并将其转换为Int。如果两个参数都是可以转换的字符串当然没问题，但是如果输入了一个无法转换的字符串就会报异常。

虽然异常有时候是好事情，但是异常会阻止程序的正常运行。我们看下怎么用Either来将其封装起来：

~~~scala
scala> def addInts2(s1: String, s2: String): Either[NumberFormatException,Int]=
| try {
| Right(s1.toInt + s2.toInt)
| } catch {
| case nfe: NumberFormatException => Left(nfe)
| }
addInts2: (s1: String, s2: String)Either[NumberFormatException,Int]
scala> println(addInts2("1", "2"))
Right(3)
scala> println(addInts2("1", "x"))
Left(java.lang.NumberFormatException: For input string: "x")
scala> println(addInts2("x", "2"))
Left(java.lang.NumberFormatException: For input string: "x")

~~~

按照上面的设计，Either封装好了异常，不会影响程序的正常运行，而且可以返回具体的错误信息，实在是一个不错的设计方式。

