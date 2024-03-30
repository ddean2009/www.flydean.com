# 4. Scala的静态类型

Scala是静态类型的，它拥有一个强大的类型系统，静态地强制以安全、一致的方式使用抽象，我们通过下面几个特征来一一说明：

* 泛类型
* 型变
* 类型上界
* 类型下界
* 内部类
* 抽象类型
* 复合类型
* 自类型
* 隐式参数
* 隐式转换
* 多态方法
* 类型推断

通过这些特性，为安全可重用的编程抽象以及类型安全的扩展提供了强大的基础。

## 泛类型

和java一样，Scala也有泛型的概念，在scala里面泛型是使用方括号 [] 来接受类型参数的。通常使用字母A来作为参数标志符，当然你也可以使用其他任意的参数名称。

~~~scala
class Stack[A] {
  private var elements: List[A] = Nil
  def push(x: A) { elements = x :: elements }
  def peek: A = elements.head
  def pop(): A = {
    val currentTop = peek
    elements = elements.tail
    currentTop
  }
}
~~~

要使用一个泛类型，将一个具体的类型替换掉A即可。
~~~scala
val stack = new Stack[Int]
stack.push(1)
stack.push(2)
println(stack.pop)  // prints 2
println(stack.pop)  // prints 1
~~~

上面的例子中，实例对象接收整型值，如果该类型有子类型，子类型也是可以传入的。

~~~scala
class Fruit
class Apple extends Fruit
class Banana extends Fruit

val stack = new Stack[Fruit]
val apple = new Apple
val banana = new Banana

stack.push(apple)
stack.push(banana)
~~~

## 型变

型变主要是针对泛类型来说的，用来表示这种复杂类型的相关性。型变主要有协变，逆变和不变三种情况。在类型系统中使用型变允许我们在复杂类型之间建立直观的连接，而缺乏型变则会限制类抽象的重用性。

~~~scala
class Foo[+A] // A covariant class
class Bar[-A] // A contravariant class
class Baz[A]  // An invariant class
~~~

### 协变

协变使用+A来表示。对于某些类 class List[+A]，使 A 成为协变意味着对于两种类型 C 和 D，如果 C 是 D 的子类型，那么 List[C] 就是 List[D] 的子类型。 这允许我们使用泛型来创建非常有用和直观的子类型关系。

~~~scala
abstract class Animal {
  def name: String
}
case class Cat(name: String) extends Animal
case class Dog(name: String) extends Animal
~~~

上面的例子中类型 Cat 和 Dog 都是 Animal 的子类型。那么
List[Cat]和List[Dog]都是List[Animal]的子类。

下面看下协变的应用：

~~~scala
object CovarianceTest extends App {
  def printAnimalNames(animals: List[Animal]): Unit = {
    animals.foreach { animal =>
      println(animal.name)
    }
  }

  val cats: List[Cat] = List(Cat("Whiskers"), Cat("Tom"))
  val dogs: List[Dog] = List(Dog("Fido"), Dog("Rex"))

  printAnimalNames(cats)
  // Whiskers
  // Tom

  printAnimalNames(dogs)
  // Fido
  // Rex
}
~~~

在上面的例子中，方法 printAnimalNames 将接受动物列表作为参数，并且逐行打印出它们的名称。 如果 List[A] 不是协变的，最后两个方法调用将不能编译，这将严重限制 printAnimalNames 方法的适用性。

### 逆变

逆变和协变相反，使用-A来表示。对于某个类 class Writer[-A] ，使 A 逆变意味着对于两种类型 C 和 D，如果 C 是 D 的子类型，那么 Writer[D] 是 Writer[C] 的子类型。

考虑一下的例子：

~~~scala
abstract class Printer[-A] {
  def print(value: A): Unit
}
~~~

我们定义两个printer：

~~~scala
class AnimalPrinter extends Printer[Animal] {
  def print(animal: Animal): Unit =
    println("The animal's name is: " + animal.name)
}

class CatPrinter extends Printer[Cat] {
  def print(cat: Cat): Unit =
    println("The cat's name is: " + cat.name)
}
~~~

如果 Printer[Cat] 知道如何在控制台打印出任意 Cat，并且 Printer[Animal] 知道如何在控制台打印出任意 Animal，那么 Printer[Animal] 也应该知道如何打印出 Cat 就是合理的。 反向关系不适用，因为 Printer[Cat] 并不知道如何在控制台打印出任意 Animal。 因此，如果我们愿意，我们应该能够用 Printer[Animal] 替换 Printer[Cat]，而使 Printer[A] 逆变允许我们做到这一点。

~~~scala
object ContravarianceTest extends App {
  val myCat: Cat = Cat("Boots")

  def printMyCat(printer: Printer[Cat]): Unit = {
    printer.print(myCat)
  }

  val catPrinter: Printer[Cat] = new CatPrinter
  val animalPrinter: Printer[Animal] = new AnimalPrinter

  printMyCat(catPrinter)
  printMyCat(animalPrinter)
}
~~~

### 不变

默认情况下，Scala中的泛型类是不变的。这意味着虽然Cat是Animal的子类，但是`Container[Cat]`和`Container[Animal]`之间没有任何关系。

## 类型上界

像`T <: A`这样声明的类型上界表示类型变量T应该是类型A的子类。下面是个例子：

~~~scala
abstract class Animal {
 def name: String
}

abstract class Pet extends Animal {}

class Cat extends Pet {
  override def name: String = "Cat"
}

class Dog extends Pet {
  override def name: String = "Dog"
}

class Lion extends Animal {
  override def name: String = "Lion"
}

class PetContainer[P <: Pet](p: P) {
  def pet: P = p
}

val dogContainer = new PetContainer[Dog](new Dog)
val catContainer = new PetContainer[Cat](new Cat)

// this would not compile
val lionContainer = new PetContainer[Lion](new Lion)
~~~

类PetContainer接受一个必须是Pet子类的类型参数P。因为Dog和Cat都是Pet的子类，所以可以构造PetContainer[Dog]和PetContainer[Cat]。但在尝试构造PetContainer[Lion]的时候会得到下面的错误信息：

~~~scala
type arguments [Lion] do not conform to class PetContainer's type parameter bounds [P <: Pet]
~~~

这是因为Lion并不是Pet的子类。

## 类型下界

类型下界和类型上界相反，B >: A 表示类型参数 B 或抽象类型 B 是类型 A 的超类型。

下面看个它使用的例子：

~~~scala
trait Node[+B] {
  def prepend(elem: B): Node[B]
}

case class ListNode[+B](h: B, t: Node[B]) extends Node[B] {
  def prepend(elem: B): ListNode[B] = ListNode(elem, this)
  def head: B = h
  def tail: Node[B] = t
}

case class Nil[+B]() extends Node[B] {
  def prepend(elem: B): ListNode[B] = ListNode(elem, this)
}
~~~

这个例子会在编译的时候报错。因为方法 prepend 中的参数 elem 是协变的 B 类型。

在scala中函数的参数类型是逆变的，而返回类型是协变的。

要解决这个问题，我们需要将方法 prepend 的参数 elem 的型变翻转。 我们通过引入一个新的类型参数 U 来实现这一点，该参数具有 B 作为类型下界。

~~~scala
trait Node[+B] {
  def prepend[U >: B](elem: U): Node[U]
}

case class ListNode[+B](h: B, t: Node[B]) extends Node[B] {
  def prepend[U >: B](elem: U): ListNode[U] = ListNode(elem, this)
  def head: B = h
  def tail: Node[B] = t
}

case class Nil[+B]() extends Node[B] {
  def prepend[U >: B](elem: U): ListNode[U] = ListNode(elem, this)
}
~~~

这样就可以了。

## 内部类

内部类就是class里面的class，在java里面，内部类被看成是外部类的成员。但是在scala中内部类是和外部类的对象进行绑定的。这意味着即使是同一个外部类的不同对象，其包含的内部类是不同类型的。 我们举个例子：

~~~scala
class Graph {
  class Node {
    var connectedNodes: List[Node] = Nil
    def connectTo(node: Node) {
      if (!connectedNodes.exists(node.equals)) {
        connectedNodes = node :: connectedNodes
      }
    }
  }
  var nodes: List[Node] = Nil
  def newNode: Node = {
    val res = new Node
    nodes = res :: nodes
    res
  }
}
~~~

这里connectedNodes 中存储的所有节点必须使用同一个 Graph 的实例对象的 newNode 方法来创建。

~~~scala
val graph1: Graph = new Graph
val node1: graph1.Node = graph1.newNode
val node2: graph1.Node = graph1.newNode
val node3: graph1.Node = graph1.newNode
node1.connectTo(node2)
node3.connectTo(node1)
~~~

这里三个node都是graph1.Node类型。如果是非graph1.Node类型则无法编译成功。

~~~scala
val graph1: Graph = new Graph
val node1: graph1.Node = graph1.newNode
val node2: graph1.Node = graph1.newNode
node1.connectTo(node2)      // legal
val graph2: Graph = new Graph
val node3: graph2.Node = graph2.newNode
node1.connectTo(node3)      // illegal!
~~~

那如果想达到和java中内部内中一样的效果，不区分路径该怎么办呢？使用Graph#Node即可。

~~~scala
class Graph {
  class Node {
    var connectedNodes: List[Graph#Node] = Nil
    def connectTo(node: Graph#Node) {
      if (!connectedNodes.exists(node.equals)) {
        connectedNodes = node :: connectedNodes
      }
    }
  }
  var nodes: List[Node] = Nil
  def newNode: Node = {
    val res = new Node
    nodes = res :: nodes
    res
  }
}
~~~

## 抽象类型

抽象类型通常用T来表示，用在特质和抽象类中，表示实际类型可以由具体的实现类来确认：

~~~scala
trait Buffer {
  type T
  val element: T
}
~~~

通过抽象类来扩展这个特质后，就可以添加一个类型上边界来让抽象类型T变得更加具体。

~~~scala
abstract class SeqBuffer extends Buffer {
  type U
  type T <: Seq[U]
  def length = element.length
}
~~~


## 复合类型

复合类型很简单，表示多个类型的交集，用with来表示。

假设我们定义了两个traits：

~~~scala
trait Cloneable extends java.lang.Cloneable {
  override def clone(): Cloneable = {
    super.clone().asInstanceOf[Cloneable]
  }
}
trait Resetable {
  def reset: Unit
}
~~~

假如我们需要接受一个对象它即可以是Cloneable又可以是Resetable，那么可以这样定义：

~~~scala
def cloneAndReset(obj: Cloneable with Resetable): Cloneable = {
  //...
}
~~~

## 自类型

自类型的意思是在一个trait中可以使用另外一个trait中定义的属性而不必去继承它。

要在特质中使用自类型，写一个标识符，跟上要混入的另一个特质，以及 =>（例如 someIdentifier: SomeOtherTrait =>）。

~~~scala
trait User {
  def username: String
}

trait Tweeter {
  this: User =>  // 重新赋予 this 的类型
  def tweet(tweetText: String) = println(s"$username: $tweetText")
}

class VerifiedTweeter(val username_ : String) extends Tweeter with User {  // 我们混入特质 User 因为 Tweeter 需要
	def username = s"real $username_"
}

val realBeyoncé = new VerifiedTweeter("Beyoncé")
realBeyoncé.tweet("Just spilled my glass of lemonade")  // 打印出 "real Beyoncé: Just spilled my glass of lemonade"
~~~

因为我们在特质 trait Tweeter 中定义了 this: User =>，现在变量 username 可以在 tweet 方法内使用。 这也意味着，由于 VerifiedTweeter 继承了 Tweeter，它还必须混入 User（使用 with User）。

## 隐式参数

隐式参数由 implicit 关键字标记，在方法调用的时候，scala会去尝试获取正确的隐式类型值。

Scala查找参数的位置有两个地方：

* 首先查找可以直接访问的隐式定义和隐式参数。
* 然后，它在所有伴生对象中查找与隐式候选类型相关的有隐式标记的成员。

下面的例子定义了两个隐式类型，stringMonoid和intMonoid。

~~~scala
abstract class Monoid[A] {
  def add(x: A, y: A): A
  def unit: A
}

object ImplicitTest {
  implicit val stringMonoid: Monoid[String] = new Monoid[String] {
    def add(x: String, y: String): String = x concat y
    def unit: String = ""
  }
  
  implicit val intMonoid: Monoid[Int] = new Monoid[Int] {
    def add(x: Int, y: Int): Int = x + y
    def unit: Int = 0
  }
  
  def sum[A](xs: List[A])(implicit m: Monoid[A]): A =
    if (xs.isEmpty) m.unit
    else m.add(xs.head, sum(xs.tail))
    
  def main(args: Array[String]): Unit = {
    println(sum(List(1, 2, 3)))       // uses IntMonoid implicitly
    println(sum(List("a", "b", "c"))) // uses StringMonoid implicitly
  }
}
~~~

在 main 方法中我们调用了 sum 方法两次，并且只传入参数 xs。 Scala 会在上例的上下文范围内寻找隐式值。 第一次调用 sum 方法的时候传入了一个 List[Int] 作为 xs 的值，这意味着此处类型 A 是 Int。 隐式参数列表 m 被省略了，因此 Scala 将查找类型为 Monoid[Int] 的隐式值。 

intMonoid 是一个隐式定义，可以在main中直接访问。 并且它的类型也正确，因此它会被自动传递给 sum 方法。

第二次调用 sum 方法的时候传入一个 List[String]，这意味着此处类型 A 是 String。 与查找 Int 型的隐式参数时类似，但这次会找到 stringMonoid，并自动将其作为 m 传入。

## 隐式转换

简单点讲，隐式转换就是当需要的时候，将某个类型S转换到另外一个类型T。这是通过定义隐式函数来确定的。

下面提供了一个隐式方法 List[A] => Ordered[List[A]] 的例子。

~~~scala
import scala.language.implicitConversions

implicit def list2ordered[A](x: List[A])
    (implicit elem2ordered: A => Ordered[A]): Ordered[List[A]] =
  new Ordered[List[A]] { 
    //replace with a more useful implementation
    def compare(that: List[A]): Int = 1
  }
~~~

如果需要Ordered[List[A]] 而你传入List[A]的时候，scala会自动去寻找隐式的类型转换方法。

下面是一个从scala.Int到java.lang.Integer的转换：

~~~scala
import scala.language.implicitConversions

implicit def int2Integer(x: Int) =
  java.lang.Integer.valueOf(x)
~~~

## 多态方法

Scala中多态是通过类型和值的参数化来实现的。 如下所示：

~~~scala
def listOfDuplicates[A](x: A, length: Int): List[A] = {
  if (length < 1)
    Nil
  else
    x :: listOfDuplicates(x, length - 1)
}
println(listOfDuplicates[Int](3, 4))  // List(3, 3, 3, 3)
println(listOfDuplicates("La", 8))  // List(La, La, La, La, La, La, La, La)
~~~

上例中第一次调用方法时，我们显式地提供了类型参数 [Int]。 因此第一个参数必须是 Int 类型，并且返回类型为 List[Int]。

上例中第二次调用方法，表明并不总是需要显式提供类型参数。 编译器通常可以根据上下文或值参数的类型来推断。 在这个例子中，"La" 是一个 String，因此编译器知道 A 必须是 String。

## 类型推断

Scala 编译器通常可以推断出表达式的类型，因此你不必显式地声明它。

~~~scala
val businessName = "Montreux Jazz Café"
~~~

编译器可以发现 businessName 是 String 类型。

你也可以省略方法返回类型：

~~~scala
def squareOf(x: Int) = x * x
~~~

编译器可以推断出方法的返回类型为 Int，因此不需要明确地声明返回类型。

当调用 多态方法 或实例化 泛型类 时，也不必明确指定类型参数。 Scala 编译器将从上下文和实际方法的类型/构造函数参数的类型推断出缺失的类型参数。

看下面两个例子：

~~~scala
case class MyPair[A, B](x: A, y: B)
val p = MyPair(1, "scala") // type: MyPair[Int, String]

def id[T](x: T) = x
val q = id(1)              // type: Int
~~~

编译器使用传给 MyPair 参数的类型来推断出 A 和 B 的类型。对于 x 的类型同样如此。



