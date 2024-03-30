# 3. 函数式的Scala

Scala是一门函数式语言，接下来我们会讲一下几个概念：

* 高阶函数
* 方法嵌套
* 多参数列表
* 样例类
* 模式匹配
* 单例对象
* 正则表达式模式
* For表达式

## 高阶函数

高阶函数通常来讲就是函数的函数，也就是说函数的输出参数是函数或者函数的返回结果是函数。在Scala中函数是一等公民。

我们看一下Scala集合类（collections）的高阶函数map：

~~~scala
val salaries = Seq(20000, 70000, 40000)
val doubleSalary = (x: Int) => x * 2
val newSalaries = salaries.map(doubleSalary) // List(40000, 140000, 80000)
~~~

map接收一个函数为参数。所以map是一个高阶函数，map也可直接接收一个匿名函数，如下所示：

~~~scala
val salaries = Seq(20000, 70000, 40000)
val newSalaries = salaries.map(x => x * 2) // List(40000, 140000, 80000)
~~~

在上面的例子中，我们并没有显示使用x:Int的形式，这是因为编译器可以通过类型推断推断出x的类型，对其更简化的形式是：

~~~scala
val salaries = Seq(20000, 70000, 40000)
val newSalaries = salaries.map(_ * 2)
~~~

既然Scala编译器已经知道了参数的类型（一个单独的Int），你可以只给出函数的右半部分，不过需要使用_代替参数名（在上一个例子中是x）

### 强制转换方法为函数

如果你传入一个方法到高阶函数中，scala会将该方法强制转换成函数，如下所示：

~~~scala
case class WeeklyWeatherForecast(temperatures: Seq[Double]) {

  private def convertCtoF(temp: Double) = temp * 1.8 + 32

  def forecastInFahrenheit: Seq[Double] = temperatures.map(convertCtoF) // <-- passing the method convertCtoF
}
~~~

在这个例子中，方法convertCtoF被传入forecastInFahrenheit。这是可以的，因为编译器强制将方法convertCtoF转成了函数x => convertCtoF(x) （注: x是编译器生成的变量名，保证在其作用域是唯一的）。

## 方法嵌套

在Scala的方法中可以嵌套方法，如下所示：

~~~scala
 def factorial(x: Int): Int = {
    def fact(x: Int, accumulator: Int): Int = {
      if (x <= 1) accumulator
      else fact(x - 1, x * accumulator)
    }  
    fact(x, 1)
 }

 println("Factorial of 2: " + factorial(2))
 println("Factorial of 3: " + factorial(3))
~~~

程序输出为：

~~~scala
Factorial of 2: 2
Factorial of 3: 6
~~~

## 多参数列表

Scala和java不同的是他可以定义多个参数列表，下面是一个例子：

~~~scala
def foldLeft[B](z: B)(op: (B, A) => B): B
~~~

可以看到该方法定义了两个参数列表， z是初始值，op是一个二元运算，下面是它的一个调用：

~~~scala
val numbers = List(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
val res = numbers.foldLeft(0)((m, n) => m + n)
print(res) // 55
~~~

利用scala的类型推断，我们可以让代码更加简洁：

~~~scala
numbers.foldLeft(0)(_ + _)
~~~

## 样例类

case class主要用于不可变的数据。他们和普通类几乎是一样的。

~~~scala
case class Book(isbn: String)

val frankenstein = Book("978-0486282114")
~~~

实例化案例类的时候并不需要new关键字，因为case class有一个默认的apply方法来负责对象的创建。

在case class中，参数是public并且val的，这意味着case class的参数不可变：

~~~scala
case class Message(sender: String, recipient: String, body: String)
val message1 = Message("guillaume@quebec.ca", "jorge@catalonia.es", "Ça va ?")

println(message1.sender)  // prints guillaume@quebec.ca
message1.sender = "travis@washington.us"  // this line does not compile
~~~

这里message1.sender不能被重新赋值，因为他是val（不可变）的。

### 比较

case class的比较是按值比较的，而不是按引用：

~~~scala
case class Message(sender: String, recipient: String, body: String)

val message2 = Message("jorge@catalonia.es", "guillaume@quebec.ca", "Com va?")
val message3 = Message("jorge@catalonia.es", "guillaume@quebec.ca", "Com va?")
val messagesAreTheSame = message2 == message3  // true
~~~

虽然上面是不同的对象，但是因为他们的值相同，所以最后的比较是true。

### 拷贝

可以使用copy来做case class的浅拷贝。

~~~scala
case class Message(sender: String, recipient: String, body: String)
val message4 = Message("julien@bretagne.fr", "travis@washington.us", "Me zo o komz gant ma amezeg")
val message5 = message4.copy(sender = message4.recipient, recipient = "claire@bourgogne.fr")
message5.sender  // travis@washington.us
message5.recipient // claire@bourgogne.fr
message5.body  // "Me zo o komz gant ma amezeg"
~~~

## 模式匹配

scala中使用match关键字和case来做模式匹配，类似java中的switch。 

下面是一个简单的模式匹配的例子：

~~~scala
import scala.util.Random

val x: Int = Random.nextInt(10)

x match {
  case 0 => "zero"
  case 1 => "one"
  case 2 => "two"
  case _ => "other"
}
~~~

最后一个case _表示匹配其余所有情况。

match表达式是有值的，如下所示：

~~~scala
def matchTest(x: Int): String = x match {
  case 1 => "one"
  case 2 => "two"
  case _ => "other"
}
matchTest(3)  // other
matchTest(1)  // one
~~~

case也可以匹配case class， 如下所示：

~~~scala
abstract class Notification

case class Email(sender: String, title: String, body: String) extends Notification

case class SMS(caller: String, message: String) extends Notification

case class VoiceRecording(contactName: String, link: String) extends Notification

def showNotification(notification: Notification): String = {
  notification match {
    case Email(sender, title, _) =>
      s"You got an email from $sender with title: $title"
    case SMS(number, message) =>
      s"You got an SMS from $number! Message: $message"
    case VoiceRecording(name, link) =>
      s"you received a Voice Recording from $name! Click the link to hear it: $link"
  }
}
val someSms = SMS("12345", "Are you there?")
val someVoiceRecording = VoiceRecording("Tom", "voicerecording.org/id/123")

println(showNotification(someSms))  // prints You got an SMS from 12345! Message: Are you there?

println(showNotification(someVoiceRecording))  // you received a Voice Recording from Tom! Click the link to hear it: voicerecording.org/id/123

~~~

case后面还可以加if语句，我们称之为模式守卫。

~~~scala
def showImportantNotification(notification: Notification, importantPeopleInfo: Seq[String]): String = {
  notification match {
    case Email(sender, _, _) if importantPeopleInfo.contains(sender) =>
      "You got an email from special someone!"
    case SMS(number, _) if importantPeopleInfo.contains(number) =>
      "You got an SMS from special someone!"
    case other =>
      showNotification(other) // nothing special, delegate to our original showNotification function
  }
}
~~~

也可以只做类型匹配：

~~~scala
abstract class Device
case class Phone(model: String) extends Device {
  def screenOff = "Turning screen off"
}
case class Computer(model: String) extends Device {
  def screenSaverOn = "Turning screen saver on..."
}

def goIdle(device: Device) = device match {
  case p: Phone => p.screenOff
  case c: Computer => c.screenSaverOn
}
~~~

### 密封类

特质（trait）和类（class）可以用sealed标记为密封的，这意味着其所有子类都必须与之定义在相同文件中。

~~~scala
sealed abstract class Furniture
case class Couch() extends Furniture
case class Chair() extends Furniture

def findPlaceToSit(piece: Furniture): String = piece match {
  case a: Couch => "Lie on the couch"
  case b: Chair => "Sit on the chair"
}
~~~

## 单例对象

单例对象是一种特殊的类，可以使用关键字object来表示。单例对象是延时创建的，只有当他被第一次使用的时候才会创建。

~~~scala
package logging

object Logger {
  def info(message: String): Unit = println(s"INFO: $message")
}
~~~

单例对象的一个作用就是定义功能性方法，可以在任何地方被使用，如上例中的info方法。可以像如下的方式使用：

~~~scala
import logging.Logger.info

class Project(name: String, daysToComplete: Int)

class Test {
  val project1 = new Project("TPS Reports", 1)
  val project2 = new Project("Website redesign", 5)
  info("Created projects")  // Prints "INFO: Created projects"
}
~~~

### 伴生对象

伴生对象是指与某个类名相同的单例对象，类和它的伴生对象可以互相访问其私有成员。下面是一个伴生对象的例子：

~~~scala
import scala.math._

case class Circle(radius: Double) {
  import Circle._
  def area: Double = calculateArea(radius)
}

object Circle {
  private def calculateArea(radius: Double): Double = Pi * pow(radius, 2.0)
}

val circle1 = Circle(5.0)

circle1.area
~~~

伴生对象circle1可以访问类中定义的area.

注意：类和它的伴生对象必须定义在同一个源文件里。

## 正则表达式模式

在Scala中，可以使用.r方法将任意字符串变成一个正则表达式。如下所示：

~~~scala
import scala.util.matching.Regex

val numberPattern: Regex = "[0-9]".r

numberPattern.findFirstMatchIn("awesomepassword") match {
  case Some(_) => println("Password OK")
  case None => println("Password must contain a number")
}
~~~

你还可以使用括号来同时匹配多组正则表达式。

~~~scala
import scala.util.matching.Regex

val keyValPattern: Regex = "([0-9a-zA-Z-#() ]+): ([0-9a-zA-Z-#() ]+)".r

val input: String =
  """background-color: #A03300;
    |background-image: url(img/header100.png);
    |background-position: top center;
    |background-repeat: repeat-x;
    |background-size: 2160px 108px;
    |margin: 0;
    |height: 108px;
    |width: 100%;""".stripMargin

for (patternMatch <- keyValPattern.findAllMatchIn(input))
  println(s"key: ${patternMatch.group(1)} value: ${patternMatch.group(2)}")
~~~

## For表达式

在Scala中for循环是和yield一起使用的，他的形式是for (enumerators) yield e。 此处 enumerators 指一组以分号分隔的枚举器。这里的enumerator 要么是一个产生新变量的生成器，要么是一个过滤器。for 表达式在枚举器产生的每一次绑定中都会计算 e 值，并在循环结束后返回这些值组成的序列。 如下所示：

~~~scala
case class User(name: String, age: Int)

val userBase = List(User("Travis", 28),
  User("Kelly", 33),
  User("Jennifer", 44),
  User("Dennis", 23))

val twentySomethings = for (user <- userBase if (user.age >=20 && user.age < 30))
  yield user.name  // i.e. add this to a list

twentySomethings.foreach(name => println(name))  // prints Travis Dennis

~~~

下面是一个更加复杂的例子：

~~~scala
def foo(n: Int, v: Int) =
   for (i <- 0 until n;
        j <- i until n if i + j == v)
   yield (i, j)

foo(10, 10) foreach {
  case (i, j) =>
    println(s"($i, $j) ")  // prints (1, 9) (2, 8) (3, 7) (4, 6) (5, 5)
}

~~~

你可以在使用 for 表达式时省略 yield 语句。此时会返回 Unit。






