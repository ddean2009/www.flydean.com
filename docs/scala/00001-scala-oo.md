# 1. 面向对象的scala

我们知道Scala是一种JVM语言，可以合java无缝衔接，这也就大大的扩展了scala的应用范围，大数据里面有名的spark就是使用scala编写的，那么scala到底有什么奥秘和特性呢？我们一一来揭秘。

首先scala是一门面向对象的编程语言，他的面向对象性主要表现在如下几个方面：

* Unified Types
* Classes
* Traits

下面我们分别的说明他们各自的特定。

## Unified Types

在Scala中，是没有java里面那些基础类型的，所有的Scala类型我们都可以称之为type，下面是一个类型层次结构的子集：

![](https://img-blog.csdnimg.cn/20191029173423218.png)

我们可以看到Any是所有类型的父类型，所有的类型都是直接或者间接继承Any来的。 Any提供了一些通用的方法比如：equals、hashCode和toString。 Any有两个直接的子类：AnyVal和AnyRef.

AnyVal表示的是值类型，它有9个预定义的非空的值类型分别是：Double、Float、Long、Int、Short、Byte、Char、Unit和Boolean。

其中Unit是一个比较特别的类型。可以把他看成java里面的void。因为Scala中所有的函数必须要有返回类型，当一个函数实在没有返回的时候，就用Unit吧。

AnyRef表示的是引用类型。所有的非值的类型都是引用类型。并且所有的用户自定义类型都是AnyRef类型的子类。在Java环境中，AnyRef相当于Java里面的java.lang.Object。

值类型可以按照下面的方式进行转换：

![](https://img-blog.csdnimg.cn/20191029215709503.png)

下面是转换的例子：

~~~scala
val x: Long = 987654321
val y: Float = x  // 9.8765434E8 (note that some precision is lost in this case)

val face: Char = '☺'
val number: Int = face  // 9786
~~~

Nothing是所有类型的子类，它通常被用来表示非正常终止的信号，比如抛出异常，程序退出等等。

Null是所有引用类型的子类型，Null主要是用来跟JVM交互使用的，通常不需要在Scala中使用到它。

## Classes

Classes就是类，和java中的类相似，它里面可以包含方法、常量、变量、类型、对象、特质、类等。

一个最简的类的定义就是关键字class+标识符，类名首字母应大写。如下所示：

~~~scala
class Family

val family = new Family
~~~

new关键字是用来创建类的实例。在上面的例子中，Family没有定义构造器，所以默认带有一个无参的默认的构造器。

* 构造器

那么怎么给类加一个构造器呢？ 

~~~scala
class Point(var x: Int, var y: Int) {

  override def toString: String =
    s"($x, $y)"
}

val point1 = new Point(2, 3)
point1.x  // 2
println(point1)  // prints (2, 3)
~~~

和其他的编程语言不同的是，Scala的类构造器定义在类的签名中：(var x: Int, var y: Int)。 这里我们还重写了AnyRef里面的toString方法。

构造器也可以拥有默认值：

~~~scala
class Point(var x: Int = 0, var y: Int = 0)

val origin = new Point  // x and y are both set to 0
val point1 = new Point(1)
println(point1.x)  // prints 1

~~~

主构造方法中带有val和var的参数是公有的。然而由于val是不可变的，所以不能像下面这样去使用。

~~~scala
class Point(val x: Int, val y: Int)
val point = new Point(1, 2)
point.x = 3  // <-- does not compile
~~~

不带val或var的参数是私有的，仅在类中可见。

~~~scala
class Point(x: Int, y: Int)
val point = new Point(1, 2)
point.x  // <-- does not compile
~~~


* 私有成员和Getter/Setter语法

Scala的成员默认是public的。如果想让其变成私有的，可以加上private修饰符，Scala的getter和setter语法和java不太一样，下面我们来举个例子：

~~~scala
class Point {

  private var _x = 0
  private var _y = 0
  private val bound = 100

  def x = _x
  def x_= (newValue: Int): Unit = {
    if (newValue < bound) _x = newValue else printWarning
  }

  def y = _y
  def y_= (newValue: Int): Unit = {
    if (newValue < bound) _y = newValue else printWarning
  }

  private def printWarning = println("WARNING: Out of bounds")
}

object Point {
  def main(args: Array[String]): Unit = {
    val point1 = new Point
    point1.x = 99
    point1.y = 101 // prints the warning
  }
}
~~~

我们定义了两个私有变量\_x, \_y, 同时还定义了他们的get方法x和y，那么相应的他们的set方法就是x\_和y\_, 在get方法后面加上下划线就可以了。

这里我们还定义了一个Point的伴生对象，用于启动main方法。有关伴生对象的概念我们后面会详细讲诉。

## Traits

特质 (Traits) 用于在类 (Class)之间共享程序接口 (Interface)和字段 (Fields)。 它们类似于Java 8的接口。 类和对象 (Objects)可以扩展特质，但是特质不能被实例化，因此特质没有参数。

* 定义Traits

最简化的特质就是关键字trait+标识符：

~~~sala
trait HelloWorld
~~~

特征作为泛型类型和抽象方法非常有用。

~~~sala
trait Iterator[A] {
  def hasNext: Boolean
  def next(): A
}
~~~

扩展 trait Iterator [A] 需要一个类型 A 和实现方法hasNext和next。

* 使用Traits

使用 extends 关键字来扩展特征。然后使用 override 关键字来实现trait里面的任何抽象成员：

~~~scala
trait Iterator[A] {
  def hasNext: Boolean
  def next(): A
}

class IntIterator(to: Int) extends Iterator[Int] {
  private var current = 0
  override def hasNext: Boolean = current < to
  override def next(): Int =  {
    if (hasNext) {
      val t = current
      current += 1
      t
    } else 0
  }
}


val iterator = new IntIterator(10)
iterator.next()  // returns 0
iterator.next()  // returns 1
~~~

* 子类型

和java一样，所有需要用到Traits的地方都可以用他的子类型代替。

~~~scala
import scala.collection.mutable.ArrayBuffer

trait Pet {
  val name: String
}

class Cat(val name: String) extends Pet
class Dog(val name: String) extends Pet

val dog = new Dog("Harry")
val cat = new Cat("Sally")

val animals = ArrayBuffer.empty[Pet]
animals.append(dog)
animals.append(cat)
animals.foreach(pet => println(pet.name))  // Prints Harry Sally
~~~

这里animals需要的是Pet类型，我们可以用dog和cat代替。









