scala的参数

scala的参数有两大特点：

* 默认参数值
* 命名参数

## 默认参数值

在Scala中，可以给参数提供默认值，这样在调用的时候可以忽略这些具有默认值的参数。

~~~scala
def log(message: String, level: String = "INFO") = println(s"$level: $message")

log("System starting")  // prints INFO: System starting
log("User not found", "WARNING")  // prints WARNING: User not found
~~~

注意从Java代码中调用时，Scala中的默认参数则是必填的（非可选），如：

~~~scala
// Point.scala
class Point(val x: Double = 0, val y: Double = 0)
~~~

~~~java
// Main.java
public class Main {
    public static void main(String[] args) {
        Point point = new Point(1);  // does not compile
    }
}
~~~

## 命名参数

当调用方法时，实际参数可以通过其对应的形式参数的名称来标记：

~~~scala
def printName(first: String, last: String): Unit = {
  println(first + " " + last)
}

printName("John", "Smith")  // Prints "John Smith"
printName(first = "John", last = "Smith")  // Prints "John Smith"
printName(last = "Smith", first = "John")  // Prints "John Smith"
~~~

注意使用命名参数时，顺序是可以重新排列的。 但是，如果某些参数被命名了，而其他参数没有，则未命名的参数要按照其方法签名中的参数顺序放在前面。

~~~scala
printName(last = "Smith", "john") // error: positional after named argument
~~~


