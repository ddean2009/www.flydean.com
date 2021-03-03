集合在程序中是非常有用的，只有用好集合才能真正感受到该语言的魅力。在scala中集合主要在三个包里面：scala.collection， scala.collection.immutable和scala.collection.mutable。 

scala中引入不可变集合是为了方便程序的使用并减少在程序中的未知风险。如果一个集合被定义为不可变的，那么我们在使用的过程中就可以指定该集合是不会变化的，可以放心使用。

我们看下这三个包的层次结构：

scala.collection的层次结构如下：

![](https://docs.scala-lang.org/resources/images/tour/collections-diagram-213.svg)

scala.collection.immutable的层次结构如下：

![](https://docs.scala-lang.org/resources/images/tour/collections-immutable-diagram-213.svg)

scala.collection.mutable的层次结构如下：

![](https://docs.scala-lang.org/resources/images/tour/collections-mutable-diagram-213.svg)

接下来我们通过两个HashMap的例子来看一下immutable和mutable的使用。 

## mutable HashMap

我们看下怎么定义一个mutable hashMap :

~~~scala

  import scala.collection.mutable.HashMap
  println("\nStep 1: How to initialize a HashMap with 3 elements")
  val hashMap1: HashMap[String, String] = HashMap(("PD","Plain Donut"),("SD","Strawberry Donut"),("CD","Chocolate Donut"))
  println(s"Elements of hashMap1 = $hashMap1")

  println("\nStep 2: How to initialize HashMap using key -> value notation")
  val hashMap2: HashMap[String, String] = HashMap("VD"-> "Vanilla Donut", "GD" -> "Glazed Donut")
  println(s"Elements of hashMap2 = $hashMap2")

~~~

怎么取出HashMap中的值：

~~~scala
  println("\nStep 3: How to access elements of HashMap by specific key")
  println(s"Element by key VD = ${hashMap2("VD")}")
  println(s"Element by key GD = ${hashMap2("GD")}")
~~~

怎么改变hashMap：

~~~scala
  println("\nStep 4: How to add elements to HashMap using +=")
  hashMap1 += ("KD" -> "Krispy Kreme Donut")
  println(s"Element in hashMap1 = $hashMap1")



  println("\nStep 5: How to add elements from a HashMap to an existing HashMap using ++=")
  hashMap1 ++= hashMap2
  println(s"Elements in hashMap1 = $hashMap1")



  println("\nStep 6: How to remove key and its value from HashMap using -=")
  hashMap1 -= "CD"
  println(s"HashMap without the key CD and its value = $hashMap1")
~~~

怎么定义一个空的HashMap：

~~~scala
  println("\nStep 7: How to initialize an empty HashMap")
  val emptyMap: HashMap[String,String] = HashMap.empty[String,String]
  println(s"Empty HashMap = $emptyMap")
~~~

## immutable HashMap

看一下怎么定义一个immutable HashMap：

~~~scala
  import scala.collection.immutable.HashMap
  println("Step 1: How to initialize a HashMap with 3 elements using Tuples of key and value")
  val hashMap1: HashMap[String, String] = HashMap(("PD","Plain Donut"),("SD","Strawberry Donut"),("CD","Chocolate Donut"))
  println(s"Elements of hashMap1 = $hashMap1")



  println("\nStep 2: How to initialize HashMap using key -> value notation")
  val hashMap2: HashMap[String, String] = HashMap("VD"-> "Vanilla Donut", "GD" -> "Glazed Donut")
  println(s"Elements of hashMap2 = $hashMap2")
~~~

获取HashMap中的值：

~~~scala
  println("\nStep 3: How to access elements in HashMap by specific key")
  println(s"Element by key VD = ${hashMap2("VD")}")
  println(s"Element by key GD = ${hashMap2("GD")}")
~~~

我们再看一下怎么对集合进行操作，注意因为是immutable HashMap所以所有的操作都会返回一个新的HashMap：

~~~scala
  println("\nStep 4: How to add elements to HashMap using +")
  val hashMap3: HashMap[String, String] = hashMap1 + ("KD" -> "Krispy Kreme Donut")
  println(s"Element in hashMap3 = $hashMap3")



  println("\nStep 5: How to add two HashMaps together using ++")
  val hashMap4: Map[String, String] = hashMap1 ++ hashMap2
  println(s"Elements in hashMap4 = $hashMap4")



  println("\nStep 6: How to remove key and its value from HashMap using -")
  val hashMap5: Map[String, String] = hashMap4 - ("CD")
  println(s"HashMap without the key CD and its value = $hashMap5")

~~~



