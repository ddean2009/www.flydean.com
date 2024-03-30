# 13. 深入理解协变和逆变

在之前的文章中我们简单的介绍过scala中的协变和逆变，我们使用+ 来表示协变类型；使用-表示逆变类型；非转化类型不需要添加标记。

假如我们定义一个class C[+A] {} ,这里A的类型参数是协变的，这就意味着在方法需要参数是C[AnyRef]的时候，我们可以是用C[String]来代替。

同样的道理如果我们定义一个class C[-A] {}, 这里A的类型是逆变的，这就意味着在方法需要参数是C[String]的时候，我们可以用C[AnyRef]来代替。

>注意：变异标记只有在类型声明中的类型参数里才有意义，对参数化的方法没有意义，因为该标记影响的是子类继承行为，而方法没有子类。例如List.map 方法的简化签名：

~~~scala
sealed abstract class List[+A] ... { // 忽略了混入的trait
...
def map[B](f: A => B): List[B] = {...}
...
}
~~~

>这里方法map的类型参数B是不能使用变异标记的，如果你修改其变异标记，则会返回编译错误。

## 函数的参数和返回值

现在我们讨论scala中函数参数的一个非常重要的结论：**函数的参数必须是逆变的，而返回值必须是协变的**

为什么呢？

接下来我们考虑scala内置的带一个参数的函数类型Function1,其简化的定义如下:

~~~scala
trait Function1[-T1, +R] extends AnyRef { self =>
  /** Apply the body of this function to the argument.
   *  @return   the result of function application.
   */
  def apply(v1: T1): R

...

  override def toString() = "<function1>"
}
~~~

我们知道类似 A=>B 的形式在scala中是可以自动被转换为Function1的形式。

~~~scala
scala> var f: Int=>Int = i=>i+1
f: Int => Int = <function1>
~~~

实际上其会被转换成为如下的形式：

~~~scala
val f: Int => Int = new Function1[Int,Int] {
def apply(i: Int): Int = i + 1
}
~~~

假如我们定义了三个class 如下：

~~~scala
class CSuper { def msuper() = println("CSuper") } 
class C extends CSuper { def m() = println("C") }
class CSub extends C { def msub() = println("CSub") }
~~~

我们可以定义如下几个f:

~~~scala
var f: C => C = (c: C) => new C // ➋
f = (c: CSuper) => new CSub // ➌
f = (c: CSuper) => new C // ➍
f = (c: C) => new CSub // ➎
f = (c: CSub) => new CSuper // ➏ 编译错误!
~~~

根据Function1[-T1, +R]的定义，2-5可以通过编译，而6会编译失败。

怎么理解6呢？ 这里我们要区分两个概念，函数的定义类型和函数的运行类型。

这里f的定义类型是 C=>C。 当f = (c: CSub) => new CSuper时，它的实际apply方法就是：

~~~scala
def apply(i: CSub): CSuper = new CSuper
~~~

CSub=>CSuper就是f的运行类型。

在apply中可以能调用到CSub特有的方法，例如：msub（），而返回的CSuper又缺少了C中的方法 m()。

如果用户在调用该f的时候，还是按照定义的类型传入C，并且期待返回的值是C时候，就会发生错误。 因为实际的类型是按照传入CSub和返回CSuper来定义的。

如果实际的函数类型为（x:CSuper）=> Csub，该函数不仅可以接受任何C 类值作为参数，也可以处理C 的父类型的实例，或其父类型的其他子类型的实例（如果存在的话）。所以，由于只传入C 的实例，我们永远不会传入超出f 允许范围外的参数。从某种意义上说，f 比我们需要的更加“宽容”。

同样，当它只返回Csub 时，这也是安全的。因为调用方可以处理C 的实例，所以也一定可以处理CSub 的实例。在这个意义上说，f 比我们需要的更加“严格”。

如果函数的参数使用了协变，返回值使用了逆变则会编译失败：

~~~scala
scala> trait MyFunction2[+T1, +T2, -R] {
| def apply(v1:T1, v2:T2): R = ???
| }
<console>:37: error: contravariant type R occurs in covariant position
in type (v1: T1, v2: T2)R of method apply
def apply(v1:T1, v2:T2): R = ???
^
<console>:37: error: covariant type T1 occurs in contravariant position
in type T1 of value v1
def apply(v1:T1, v2:T2): R = ???
^
<console>:37: error: covariant type T2 occurs in contravariant position
in type T2 of value v2
def apply(v1:T1, v2:T2): R = ???
^
~~~

## 可变类型的变异

上面我们讲的情况下，class的参数化类型是不可变的，如果class的参数类型是可变的话，会是什么样的情况呢？ 

~~~scala
scala> class ContainerPlus[+A](var value: A)
<console>:34: error: covariant type A occurs in contravariant position
in type A of value value_=
class ContainerPlus[+A](var value: A)
^
scala> class ContainerMinus[-A](var value: A)
<console>:34: error: contravariant type A occurs in covariant position
in type => A of method value
class ContainerMinus[-A](var value: A)
~~~

通过上面的例子，我们也可以得到一个结论，**可变参数化类型是不能变异的**。

假如可变参数是协变的ContainerPlus[+A]，那么对于：
~~~scala
val cp: ContainerPlus[C]=new ContainerPlus(new CSub)
~~~

定义的类型是C,但是运行时类型是CSub,如果需要对类型变量重新赋值时就会遇到将C赋值给CSub的情况，会出现编译错误。

如果可变参数是逆变的ContainerPlus[-A]，那么对于：
~~~scala
val cm: ContainerMinus[C] = new ContainerMinus(new CSuper)
~~~

定义的类型是C，但是运行时类型是CSuper，那么对于期望的返回类型是C，但是实际返回类型是CSuper，也会发生错误。

所以可变参数化类型是不能变异的。













