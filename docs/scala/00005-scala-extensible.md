# 5. 可扩展的scala

Scala是扩展的，Scala提供了一种独特的语言机制来实现这种功能：

* 隐式类： 允许给已有的类型添加扩展方法
* 字符串插值： 可以让用户使用自定义的插值器进行扩展

## 隐式类

隐式类是在scala 2.10中引入的，隐式类指的是用implicit关键字修饰的类。在对应的作用域内，带有这个关键字的类的主构造函数可用于隐式转换。

下面举个例子：

~~~scala
object Helpers {
  implicit class IntWithTimes(x: Int) {
    def times[A](f: => A): Unit = {
      def loop(current: Int): Unit =
        if(current > 0) {
          f
          loop(current - 1)
        }
      loop(x)
    }
  }
}

~~~

这里我们定义了一个隐式类IntWithTimes， 它有一个接收Int类型的构造函数，和一个times方法。那么当我们将这个类引入到我们自己的作用域时，Int类型就拥有了新的times方法：

~~~scala
scala> import Helpers._
import Helpers._

scala> 5 times println("HI")
HI
HI
HI
HI
HI
~~~

### 限制条件

隐式类有以下限制条件：

1. 只能在别的trait/类/对象内部定义。

~~~scala
    object Helpers {
       implicit class RichInt(x: Int) // 正确！
    }
    implicit class RichDouble(x: Double) // 错误！
~~~

2. 构造函数只能携带一个非隐式参数

~~~scala
implicit class RichDate(date: java.util.Date) // 正确！
 implicit class Indexer[T](collecton: Seq[T], index: Int) // 错误！
 implicit class Indexer[T](collecton: Seq[T])(implicit index: Index) // 正确！
~~~

3. 在同一作用域内，不能有任何方法、成员或对象与隐式类同名,注意：这意味着隐式类不能是case class。

~~~scala
object Bar
implicit class Bar(x: Int) // 错误！

val x = 5
implicit class x(y: Int) // 错误！

implicit case class Baz(x: Int) // 错误！
~~~


## 字符串插值

所谓字符串插值就是将变量引用直接插入处理过的字面字符中。 这是在scala2.10.0版本引入的。

~~~scala
val name="James"
println(s"Hello,$name")//Hello,James
~~~

在上例中， s”Hello,$name” 是待处理字符串字面，编译器会对它做额外的工作。待处理字符串字面通过“号前的字符来标示（例如：上例中是s）。

Scala 提供了三种创新的字符串插值方法：s,f 和 raw.

### s 字符串插值器

在任何字符串前加上s，就可以直接在串中使用变量了。你已经见过这个例子：

~~~scala
val name="James"
println(s"Hello,$name")//Hello,James 
~~~

此例中，$name嵌套在一个将被s字符串插值器处理的字符串中。插值器知道在这个字符串的这个地方应该插入这个name变量的值，以使输出字符串为Hello,James。使用s插值器，在这个字符串中可以使用任何在处理范围内的名字。

字符串插值器也可以处理任意的表达式。例如：

~~~scala
println(s"1+1=${1+1}") 将会输出字符串1+1=2。任何表达式都可以嵌入到${}中。
~~~

### f 插值器

在任何字符串字面前加上 f，就可以生成简单的格式化串，功能相似于其他语言中的 printf 函数。当使用 f 插值器的时候，所有的变量引用都应当后跟一个printf-style格式的字符串，如%d。看下面这个例子：

~~~scala
val height=1.9d
val name="James"
println(f"$name%s is $height%2.2f meters tall")//James is 1.90 meters tall f 插值器是类型安全的。如果试图向只支持 int 的格式化串传入一个double 值，编译器则会报错。例如：

val height:Double=1.9d

scala>f"$height%4d"
<console>:9: error: type mismatch;
 found : Double
 required: Int
           f"$height%4d"
              ^ f 插值器利用了java中的字符串数据格式。这种以%开头的格式在 [Formatter javadoc] 中有相关概述。如果在具体变量后没有%，则格式化程序默认使用 %s（串型）格式。
~~~

### raw 插值器

除了对字面值中的字符不做编码外，raw 插值器与 s 插值器在功能上是相同的。如下是个被处理过的字符串：

~~~scala
scala>s"a\nb"
res0:String=
a
b 这里，s 插值器用回车代替了\n。而raw插值器却不会如此处理。

scala>raw"a\nb"
res1:String=a\nb 当不想输入\n被转换为回车的时候，raw 插值器是非常实用的。
~~~

### 自定义插值器

在Scala中，所有处理过的字符串字面值都进行了简单编码转换。任何时候编译器遇到一个如下形式的字符串字面值：id"string content" 它都会被转换成一个StringContext实例的call(id)方法。这个方法在隐式范围内仍可用。只需要简单得 建立一个隐类，给StringContext实例增加一个新方法，便可以定义我们自己的字符串插值器。如下例：

~~~scala

implicit class JsonHelper(val sc:StringContext) extends AnyVal{
  def json(args:Any*):JSONObject=sys.error("TODO-IMPLEMENT")
}

def giveMeSomeJson(x:JSONObject):Unit=...

giveMeSomeJson(json"{name:$name,id:$id}") 
~~~

在这个例子中，我们试图通过字符串插值生成一个JSON文本语法。隐类 JsonHelper 作用域内使用该语法，且这个JSON方法需要一个完整的实现。只不过，字符串字面值格式化的结果不是一个字符串，而是一个JSON对象。

当编译器遇到`”{name:$name,id:$id”}”`，它将会被重写成如下表达式：

~~~scala
new StringContext("{name:",",id:","}").json(name,id)
~~~

隐类则被重写成如下形式：

~~~scala
new JsonHelper(new StringContext("{name:",",id:","}")).json(name,id)
~~~

所以，JSON方法可以访问字符串的原生片段而每个表达式都是一个值。



