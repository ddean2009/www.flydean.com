在java 8中，为了避免NullPointerException，引入了Option，在Scala中也有同样的用法。他们就是Option, Some 和None.

其中Option是一个抽象类。

~~~scala
sealed abstract class Option[+A] extends Product with Serializable 
~~~

我们看下Some和None的定义：

~~~scala
final case class Some[+A](@deprecatedName('x, "2.12.0") value: A) extends Option[A] {
  def isEmpty = false
  def get = value

  @deprecated("Use .value instead.", "2.12.0") def x: A = value
}


/** This case object represents non-existent values.
 *
 *  @author  Martin Odersky
 *  @since   1.0
 */
@SerialVersionUID(5066590221178148012L) // value computed by serialver for 2.11.2, annotation added in 2.11.4
case object None extends Option[Nothing] {
  def isEmpty = true
  def get = throw new NoSuchElementException("None.get")
}
~~~

可以看到Some是一个继承了Option的case class。 而None是一个继承了Option[Nothing]的case object。

我们看下在程序中该怎么使用他们。

## Option和Some
  
~~~scala
  println("Step 1: How to use Option and Some - a basic example")
  val glazedDonutTaste: Option[String] = Some("Very Tasty")
  println(s"Glazed Donut taste = ${glazedDonutTaste.get}")
~~~

上面的例子中，我们定义了一个类型为String的Option，然后用Some给它赋了一个值。接下来我们调用Option的get方法来获取这个String值。

下面是运行的结果：

~~~scala

Step 1: How to use Option and Some - a basic example
Glazed Donut taste = Very Tasty
~~~

这里直接调用get会有问题，就是get出来的结果也可能是空的，这样就不能避免NullPointerException的问题。

## Option和None

下面我们看下None的用法：

~~~scala
println("\nStep 2: How to use Option and None - a basic example")
val glazedDonutName: Option[String] = None
println(s"Glazed Donut name = ${glazedDonutName.getOrElse("Glazed Donut")}")
~~~

上面我们定义了一个Option，并给给他赋值None。在获取值的时候，我们没有调用get方法，相反我们使用的是getOrElse，如果值为空，则给他一个默认值。 下面是输出结果：

~~~scala
Step 2: How to use Option and None - a basic example
Glazed Donut name = Glazed Donut
~~~

注意， None没有get方法， 如果你像第一个例子一样调用的话，会报错：java.util.NoSuchElementException: None.get。

## Option和模式匹配

上面的例子中我们使用了getOrElse来获取值，还有一种方法叫做模式匹配：

~~~scala

println("\nStep 3: How to use Pattern Matching with Option")
glazedDonutName match {
  case Some(name) => println(s"Received donut name = $name")
  case None       => println(s"No donut name was found!")
~~~

这样我们不管Option里面到底有没有值，都可以完成匹配。下面是输出的结果。

~~~scala
Step 3: How to use Pattern Matching with Option
No donut name was found!
~~~

