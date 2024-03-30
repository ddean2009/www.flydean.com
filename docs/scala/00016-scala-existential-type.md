# 16. Scala的存在类型

存在类型也叫existential type，是对类型做抽象的一种方法。可以在你不知道具体类型的情况下，就断言该类型存在。

存在类型用_来表示，你可以把它看成java中的？。 

下面是存在类型的具体例子：

简写|完整形式|描述
-|-|-
`Seq[_]`|`Seq[T] forSome {type T}`|T 可以是Any 的任意子类
`Seq[_ <: A]`|`Seq[T] forSome {type T <: A}`|T 可以是A（在某处已经定义了）的任意子类
`Seq[_ >: Z <: A]`|`Seq[T] forSome {type T >: Z <: A}`|T 可以是A 的子类且是Z 的超类


上面的表格以常用的Seq为例，列举了存在类型的例子。

那么为什么会需要存在类型呢？ 

如果我们有一个`List[A]`,我们需要两个版本的double函数，一个版本接受`List[Int]`并返回新的`List[Int]*2`，另外一个版本接受`List[String]`， 并通过对整数调用toInt，将字符串转换为Int，然后调用第一个版本的double函数。

我们可能会这样写：

~~~scala
object Doubler {
def double(seq: Seq[String]): Seq[Int] = double(seq map (_.toInt))
def double(seq: Seq[Int]): Seq[Int] = seq map (_*2)
}
~~~

上面的程序看起来是没问题的，但是编译却失败。

~~~scala
Error:(3, 7) double definition:
def double(seq: Seq[String]): Seq[Int] at line 12 and
def double(seq: Seq[Int]): Seq[Int] at line 13
have same type after erasure: (seq: Seq)Seq
def double(seq: Seq[Int]): Seq[Int] = seq map (_*2)
~~~

问题就在于编译过程中的类型擦除，也就是在编译成字节码过后，定义的泛类型将会被删除。那么最后Seq[String]和Seq[Int]都会被编译成Seq，最终导致两个方法拥有同样的参数列表，最终编译报错。

既然有类型擦除的问题，那么我们考虑定义一个double方法，在double方法内部进行类型的判断：

~~~scala
object Doubler {
  def double(seq: Seq[_]): Seq[Int] = seq match {
    case Nil => Nil
    case head +: tail => (toInt(head) * 2) +: double(tail)
  }

  private def toInt(x: Any): Int = x match {
    case i: Int => i
    case s: String => s.toInt
    case x => throw new RuntimeException(s"Unexpected list element $x")
  }
}
~~~

为什么我们需要使用Seq[_]呢？ 我们看一下Seq类型的定义：

~~~scala
type Seq[+A] = scala.collection.Seq[A]
~~~

从定义我们知道，Seq类型一定是需要一个类型参数的，如果我们这样写：

~~~scala
  def double(seq: Seq): Seq[Int] = seq match {
    case Nil => Nil
    case head +: tail => (toInt(head) * 2) +: double(tail)
  }
~~~

则会编译出错，因为tail是`Seq[A]`类型的，但是double需要一个Seq类型。

使用`Seq[_]`表示，`Seq[T] forSome {type T}`。虽然我不知道Seq里面具体是哪种类型，但是肯定是有类型的。

可以对比一下`java.util.List[_ <: A]` 的表达式在结构上与Java 的表达式`java.util.List<? extends A>`的类似之处。

你会在scala代码中看到很多`Seq[_]`的代码，存在类型的主要目的是为了兼容java代码。



