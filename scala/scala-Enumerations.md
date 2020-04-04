Enumeration应该算是程序语言里面比较通用的一个类型，在scala中也存在这样的类型， 我们看下Enumeration的定义：

~~~scala
abstract class Enumeration (initial: Int) extends Serializable 
~~~

Enumeration是一个抽象类，它定义四个value方法，来设置内部的值， 四个value方法如下定义：

~~~scala
  /** Creates a fresh value, part of this enumeration. */
  protected final def Value: Value = Value(nextId)

  /** Creates a fresh value, part of this enumeration, identified by the
   *  integer `i`.
   *
   *  @param i An integer that identifies this value at run-time. It must be
   *           unique amongst all values of the enumeration.
   *  @return  Fresh value identified by `i`.
   */
  protected final def Value(i: Int): Value = Value(i, nextNameOrNull)

  /** Creates a fresh value, part of this enumeration, called `name`.
   *
   *  @param name A human-readable name for that value.
   *  @return  Fresh value called `name`.
   */
  protected final def Value(name: String): Value = Value(nextId, name)

  /** Creates a fresh value, part of this enumeration, called `name`
   *  and identified by the integer `i`.
   *
   * @param i    An integer that identifies this value at run-time. It must be
   *             unique amongst all values of the enumeration.
   * @param name A human-readable name for that value.
   * @return     Fresh value with the provided identifier `i` and name `name`.
   */
  protected final def Value(i: Int, name: String): Value = new Val(i, name)
  ~~~

  知道如何设置Enum的值后，我们就可以尝试创建一个Enum了。

  ~~~scala
  println("Step 1: How to create an enumeration")
object Donut extends Enumeration {
  type Donut = Value

  val Glazed      = Value("Glazed")
  val Strawberry  = Value("Strawberry")
  val Plain       = Value("Plain")
  val Vanilla     = Value("Vanilla")
}
~~~

上面的例子中，我们创建了一个Enum，并且设置了几个值。

下面我们看下怎么取到Enum的值：

~~~scala
println("\nStep 2: How to print the String value of the enumeration")
println(s"Vanilla Donut string value = ${Donut.Vanilla}")
~~~

你可以看到如下的输出：

~~~scala

Step 2: How to print the String value of the enumeration
Vanilla Donut string value = Vanilla
~~~

下面是怎么输出Enum的id：

~~~scala
println("\nStep 3: How to print the id of the enumeration")
println(s"Vanilla Donut's id = ${Donut.Vanilla.id}")
~~~

结果如下：

~~~scala
Step 3: How to print the id of the enumeration
Vanilla Donut's id = 3
~~~

怎么输出所有的Enum项呢？

~~~scala
println("\nStep 4: How to print all the values listed in Enumeration")
println(s"Donut types = ${Donut.values}")
~~~

输出结果如下：

~~~scala
Step 4: How to print all the values listed in Enumeration
Donut types = Donut.ValueSet(Glazed, Strawberry, Plain, Vanilla)
~~~

接下来，我们看下怎么打印出所有的Enum：

~~~scala
println("\nStep 5: How to pattern match on enumeration values")
Donut.values.foreach {
  case d if (d == Donut.Strawberry || d == Donut.Glazed) => println(s"Found favourite donut = $d")
  case _ => None
}
~~~

输出如下：

~~~scala

Step 5: How to pattern match on enumeration values
Found favourite donut = Glazed
Found favourite donut = Strawberry
~~~

最后，我们看下怎么改变Enum值的顺序：

~~~scala
println("\nStep 6: How to change the default ordering of enumeration values")
object DonutTaste extends Enumeration{
  type DonutTaste = Value

  val Tasty       = Value(0, "Tasty")
  val VeryTasty   = Value(1, "Very Tasty")
  val Ok          = Value(-1, "Ok")
}

println(s"Donut taste values = ${DonutTaste.values}")
println(s"Donut taste of OK id = ${DonutTaste.Ok.id}")
~~~

输出结果如下：

~~~scala

Step 6: How to change the default ordering of enumeration values
Donut taste values = DonutTaste.ValueSet(Ok, Tasty, Very Tasty)
Donut taste of OK id = -1
~~~



