# 15. Scala的自定义类型标记

Scala中有很多千奇百怪的符号标记，看起来是那么的独特，就像是一杯dry martini...好像黑夜中的萤火虫,那么耀眼,那么出众。

好了言归正传，这一篇文章我们会讲一下Scala中的自定义类型标记，通过自定义类型标记可以将this指向额外的类型期望。

我们先看一个观察者模式的例子：

~~~scala
abstract class SubjectObserver {                                     
  type S <: Subject    // <1>                                              
  type O <: Observer   // <2>

  trait Subject {                                                    
    private var observers = List[O]()  // <3>

    def addObserver(observer: O) = observers ::= observer

    def notifyObservers() = observers.foreach(_.receiveUpdate(this)) // <4>
  }

  trait Observer {                                                   
    def receiveUpdate(subject: S) // <5>
  }
}
~~~

分析下上面的例子，我们在一个类中同时定义了Subject和Observer， 因为Subject和Observer是trait，而不是一个世纪的类型，所以我们又定义了Subject和Object为S和O的类型上界，这就意味着S和O分别是Subject和Object的子类型。

在4的位置,notifyObservers需要通知存储在Subject中的observers，调用Observer的receiveUpdate方法。

receiveUpdate需要接受一个具体的子类型S，但是4的位置receiveUpdate(this)中传递的参数是this即Subject，这样会导致编译失败。

那么如果我们想实现在Subject中传递S类型的实例怎么办？这时候就可以使用到自定义类型标记了。

我们看下面改造的例子：

~~~scala
abstract class SubjectObserver {
  type S <: Subject
  type O <: Observer

  trait Subject {
    self: S =>         // <1>                                              
    private var observers = List[O]()

    def addObserver(observer: O) = observers ::= observer

    def notifyObservers() = observers.foreach(_.receiveUpdate(self)) // <2>
  }

  trait Observer {
    def receiveUpdate(subject: S): Unit
  }
}
~~~

变化的点在1和2，位置1定义了一个自定义类型标记，它说明了两个意思：

1. self指向了this
2. self是S类型的实例

在2中，我们直接传入self就行了，这里self也可以换做其他的字面量。

下面我们看下怎么使用这个类：

~~~scala
case class Button(label: String) {                                  
  def click(): Unit = {}   // <1>
}

object ButtonSubjectObserver extends SubjectObserver {               
  type S = ObservableButton  // <2>
  type O = Observer

  class ObservableButton(label: String) extends Button(label) with Subject {
    override def click() = {
      super.click()
      notifyObservers()
    }
  }
}

import ButtonSubjectObserver._

class ButtonClickObserver extends Observer {                 
 val clicks = new scala.collection.mutable.HashMap[String,Int]()    // <3>

  def receiveUpdate(button: ObservableButton): Unit = {
    val count = clicks.getOrElse(button.label, 0) + 1
    clicks.update(button.label, count)
  }
}
~~~

我们需要定义一个Object继承SubjectObserver， 并在它的内部再定义两个class实现相应的trait。

看下我们如何给S和O赋值：

~~~scala
  type S = ObservableButton  // <2>
  type O = Observer
~~~

现在一个观察者模式就完成了。这个例子中我们使用自类型标记来解决使用抽象类型成员时带来的问题。

下面我们再举一个更复杂一点的例子：

~~~scala
trait Persistence { def startPersistence(): Unit }                   // <1>
trait Midtier { def startMidtier(): Unit }
trait UI { def startUI(): Unit }

trait Database extends Persistence {                                 // <2>
  def startPersistence(): Unit = println("Starting Database")  
}
trait BizLogic extends Midtier {
  def startMidtier(): Unit = println("Starting BizLogic")  
}
trait WebUI extends UI {
  def startUI(): Unit = println("Starting WebUI")  
}

trait App { self: Persistence with Midtier with UI =>                // <3>
  
  def run() = {
    startPersistence()
    startMidtier()
    startUI()
  }
}

object MyApp extends App with Database with BizLogic with WebUI      // <4>
                                                                     
MyApp.run  
~~~

我们定义了一个三层的应用程序，然后在App中调用他们。

在App中我们这样定义自定义类型：

~~~scala
self: Persistence with Midtier with UI => 
~~~

意思是App的实例应该是Persistence，Midtier和UI的子类型。

所以在定义App对象的时候就必须要这样定义：

~~~scala
object MyApp extends App with Database with BizLogic with WebUI  
~~~

使用自类型标记实际上与使用继承和混入等价（除了没有定义self 以外）：

~~~scala
trait App extends Persistence with Midtier with UI {
def run = { ... }
}
~~~

也有一些特殊情况下，自类型标记的行为不同于继承。但在实践中，这两种方法可以相互替换使用。

事实上，这两种方法表达了不同的意图。刚刚展示的基于继承的实现表明应用程序是Persistence、Midtier 和UI 的一个子类型。与此相反，自类型标记则更加明确地表示其行为的组合是通过混入实现的。














