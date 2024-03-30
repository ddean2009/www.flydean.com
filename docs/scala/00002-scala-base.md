# 2. Scala基础

这篇文章我们大概过一下Scala的基础概念，后面的文章我们会有更详细的讲解Scala的具体内容。

## 常量

在Scala中常量用val关键字表示，如下所示：

~~~sala
val x = 1 + 1
println(x) // 2
~~~

常量只能赋值一次，不能被多次赋值：

~~~scala
x = 3 // This does not compile.
~~~

在上面的例子中，x 的类型是根据后面的类型推算出来的，当然你也可以显示指定x的类型，如下所示：

~~~scala
val x: Int = 1 + 1
~~~

## 变量

变量和常量相比可以重新赋值，变量可以用var来定义。

~~~scala
var x = 1 + 1
x = 3 // This compiles because "x" is declared with the "var" keyword.
println(x * x) // 9
~~~

同样的，你可以显示指定变量的类型：

~~~scala
var x: Int = 1 + 1
~~~

## 代码块

在scala中，代码块用{}表示，在代码块中最后一个表达式的结果就是整个块的结果，可以作为返回值来使用。

~~~scala
println({
  val x = 1 + 1
  x + 1
}) // 3
~~~

## 函数

Scala的函数和java中的lambda表达式类似，它是一个带有参数的表达式。你可以定义匿名函数或者命名函数，如下所示：

~~~scala
(x: Int) => x + 1
~~~

~~~sala
val addOne = (x: Int) => x + 1
println(addOne(1)) // 2
~~~

函数还可以带多个参数：

~~~scala
val add = (x: Int, y: Int) => x + y
println(add(1, 2)) // 3
~~~

或者不带参数：
~~~scala
val getTheAnswer = () => 42
println(getTheAnswer()) // 42
~~~

## 方法

方法跟函数很类似，不同的是方法由def关键字来定义，def后面跟着一个名字、参数列表、返回类型和方法体。

~~~scala
def add(x: Int, y: Int): Int = x + y
println(add(1, 2)) // 3
~~~

和函数不同的是，scala的方法还可以接受多个参数列表：

~~~scala
def addThenMultiply(x: Int, y: Int)(multiplier: Int): Int = (x + y) * multiplier
println(addThenMultiply(1, 2)(3)) // 9
~~~

或者没有参数列表：
~~~scala
def name: String = System.getProperty("user.name")
println("Hello, " + name + "!")
~~~

如果方法的内容比较多的话，可以使用{}来表示多行。

~~~scala
def getSquareString(input: Double): String = {
  val square = input * input
  square.toString
}
println(getSquareString(2.5)) // 6.25
~~~

在代码块中我们讲到，最后一个表达式就是代码块的返回值，这里
返回值就是square.toString。 虽然在scala中也有return这个关键字，但是我们很少用到。

## 类

Scala的类用class关键字表示，后面跟着类的名字和构造函数：

~~~scala
class Greeter(prefix: String, suffix: String) {
  def greet(name: String): Unit =
    println(prefix + name + suffix)
}
~~~

类里面我们定义了一个方法greet，它的返回值是Unit，可以看成是java中的void。

你可以使用new关键词来创建类的实例：

~~~scala
val greeter = new Greeter("Hello, ", "!")
greeter.greet("Scala developer") // Hello, Scala developer!
~~~

## case类

scala中有一种专门用来做比较的类叫做case class：

~~~scala
case class Point(x: Int, y: Int)
~~~

case class可以不用new来实例化：

~~~scala
val point = Point(1, 2)
val anotherPoint = Point(1, 2)
val yetAnotherPoint = Point(2, 2)
~~~

他们的值可以做比较：

~~~scala
if (point == anotherPoint) {
  println(point + " and " + anotherPoint + " are the same.")
} else {
  println(point + " and " + anotherPoint + " are different.")
} // Point(1,2) and Point(1,2) are the same.

if (point == yetAnotherPoint) {
  println(point + " and " + yetAnotherPoint + " are the same.")
} else {
  println(point + " and " + yetAnotherPoint + " are different.")
} // Point(1,2) and Point(2,2) are different.
~~~

## 对象

对象使用object来定义的，对象可以看成是它自己类的单例。

~~~scala
object IdFactory {
  private var counter = 0
  def create(): Int = {
    counter += 1
    counter
  }
}
~~~

你可以通过引用它的名字来访问一个对象。

~~~scala
val newId: Int = IdFactory.create()
println(newId) // 1
val newerId: Int = IdFactory.create()
println(newerId) // 2
~~~

## trait

trait是包含某些字段和方法的类型。使用trait关键字来定义，它和java的接口很类似：

~~~scala
trait Greeter {
  def greet(name: String): Unit
}
~~~

trait可以有默认的实现：

~~~scala
trait Greeter {
  def greet(name: String): Unit =
    println("Hello, " + name + "!")
}
~~~

trait可以使用extends来继承，并使用override来覆盖默认的实现：

~~~scala
class DefaultGreeter extends Greeter

class CustomizableGreeter(prefix: String, postfix: String) extends Greeter {
  override def greet(name: String): Unit = {
    println(prefix + name + postfix)
  }
}

val greeter = new DefaultGreeter()
greeter.greet("Scala developer") // Hello, Scala developer!

val customGreeter = new CustomizableGreeter("How are you, ", "?")
customGreeter.greet("Scala developer") // How are you, Scala developer?
~~~




## main方法

和java一样，scala的main方法也是程序运行的入口。Scala 中的 main 方法是 def main(args: Array[String])，而且必须定义在 object 中。如下所示：

~~~scala
object Main {
  def main(args: Array[String]): Unit =
    println("Hello, World!")
}
~~~

除了自己写main方法以外，还可以继承App traits，然后将业务逻辑直接写在构造函数中，同时可以使用args来接收参数。如下所示：

~~~scala
object Test extends App {
  if(args.length >0 ){
    println("hello "+ args(0))
  }else{
    println("Hello world")
  }
}
~~~

