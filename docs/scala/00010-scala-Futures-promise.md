# 10. Scala中的一步操作

在scala中可以方便的实现异步操作，这里是通过Future来实现的，和java中的Future很相似，但是功能更加强大。

## 定义返回Future的方法

下面我们看下如何定义一个返回Future的方法：

~~~scala
println("Step 1: Define a method which returns a Future")
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
def donutStock(donut: String): Future[Int] = Future {
  // assume some long running database operation
  println("checking donut stock")
  10
}
~~~

注意这里需要引入scala.concurrent.ExecutionContext.Implicits.global， 它会提供一个默认的线程池来异步执行Future。

## 阻塞方式获取Future的值

~~~scala
  println("\nStep 2: Call method which returns a Future")
  import scala.concurrent.Await
  import scala.concurrent.duration._
  val vanillaDonutStock = Await.result(donutStock("vanilla donut"), 5 seconds)
  println(s"Stock of vanilla donut = $vanillaDonutStock")
~~~

donutStock() 是异步执行的，我们可以使用Await.result() 来阻塞主线程来等待donutStock()的执行结果。

下面是其输出：

~~~scala

Step 2: Call method which returns a Future
checking donut stock
Stock of vanilla donut = 10
~~~

## 非阻塞方式获取Future的值

我们可以使用Future.onComplete() 回调来实现非阻塞的通知：

~~~scala
println("\nStep 2: Non blocking future result")
import scala.util.{Failure, Success}
donutStock("vanilla donut").onComplete {
  case Success(stock) => println(s"Stock for vanilla donut = $stock")
  case Failure(e) => println(s"Failed to find vanilla donut stock, exception = $e")
}
Thread.sleep(3000)
~~~

`Future.onComplete()` 有两种可能情况，Success 或者 Failure，需要引入： `import scala.util.{Failure, Success}`。 

## Future链

有时候我们需要在获得一个Future之后再继续对其进行操作，有点类似于java中的管道，下面看一个例子：

~~~scala
println("\nStep 2: Define another method which returns a Future")
def buyDonuts(quantity: Int): Future[Boolean] = Future {
  println(s"buying $quantity donuts")
  true
}
~~~

上面我们又定义了一个方法，用来接收donutStock（）的返回值，然后再返回一个`Future[Boolean]` 。 

我们看下使用flatmap该怎么链接他们：

~~~scala
println("\nStep 3: Chaining Futures using flatMap")
val buyingDonuts: Future[Boolean] = donutStock("plain donut").flatMap(qty => buyDonuts(qty))
import scala.concurrent.Await
import scala.concurrent.duration._
val isSuccess = Await.result(buyingDonuts, 5 seconds)
println(s"Buying vanilla donut was successful = $isSuccess")
~~~

同样的，我们还可以使用for语句来进行链接：

~~~scala

println("\nStep 3: Chaining Futures using for comprehension")
for {
  stock     <- donutStock("vanilla donut")
  isSuccess <- buyDonuts(stock)
} yield println(s"Buying vanilla donut was successful = $isSuccess")

Thread.sleep(3000)
~~~

## flatmap VS map

map就是对集合中的元素进行重映射，而flatmap则会将返回的值拆散然后重新组合。 下面举个直观的例子：

~~~scala
val buyingDonuts: Future[Boolean] = donutStock("plain donut").flatMap(qty => buyDonuts(qty))
~~~

flatMap返回的值是`Future[Boolean]`。

~~~scala
val buyingDonuts: Future[Future[Boolean]] = donutStock("plain donut").Map(qty => buyDonuts(qty))
~~~

map返回的值是`Future[Future[Boolean]]`。 


## Future.sequence() VS Future.traverse() 

如果我们有很多个Future，然后想让他们并行执行，则可以使用 Future.sequence() 。 

~~~scala
println(s"\nStep 2: Create a List of future operations")
val futureOperations = List(
  donutStock("vanilla donut"),
  donutStock("plain donut"),
  donutStock("chocolate donut")
)

println(s"\nStep 5: Call Future.sequence to run the future operations in parallel")
val futureSequenceResults = Future.sequence(futureOperations)
futureSequenceResults.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

Future.traverse() 和Future.sequence() 类似， 唯一不同的是，Future.traverse()可以对要执行的Future进行操作，如下所示：

~~~scala
println(s"\nStep 3: Call Future.traverse to convert all Option of Int into Int")
val futureTraverseResult = Future.traverse(futureOperations){ futureSomeQty =>
  futureSomeQty.map(someQty => someQty.getOrElse(0))
}
futureTraverseResult.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

## Future.foldLeft  VS Future reduceLeft

foldLeft 和 reduceLeft 都是用来从左到右做集合操作的，区别在于foldLeft可以提供默认值。看下下面的例子：

~~~scala
println(s"\nStep 3: Call Future.foldLeft to fold over futures results from left to right")
val futureFoldLeft = Future.foldLeft(futureOperations)(0){ case (acc, someQty) =>
  acc + someQty.getOrElse(0)
}
futureFoldLeft.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}

~~~

输出结果：

~~~scala

Step 3: Call Future.foldLeft to fold over futures results from left to right
Results 20
~~~

~~~scala
println(s"\nStep 3: Call Future.reduceLeft to fold over futures results from left to right")
val futureFoldLeft = Future.reduceLeft(futureOperations){ case (acc, someQty) =>
  acc.map(qty => qty + someQty.getOrElse(0))
}
futureFoldLeft.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

输出结果：

~~~scala
Step 3: Call Future.reduceLeft to fold over futures results from left to right
Results Some(20)
~~~

##  Future firstCompletedOf

firstCompletedOf在处理多个Future请求时，会返回第一个处理完成的future结果。

~~~scala
println(s"\nStep 3: Call Future.firstCompletedOf to get the results of the first future that completes")
val futureFirstCompletedResult = Future.firstCompletedOf(futureOperations)
futureFirstCompletedResult.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

## Future zip VS zipWith

zip用来将两个future结果组合成一个tuple. zipWith则可以自定义Function来处理future返回的结果。

~~~scala
println(s"\nStep 3: Zip the values of the first future with the second future")
val donutStockAndPriceOperation = donutStock("vanilla donut") zip donutPrice()
donutStockAndPriceOperation.onComplete {
  case Success(results) => println(s"Results $results")
  case Failure(e)       => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

输出值：

~~~scala

Step 3: Zip the values of the first future with the second future
checking donut stock
Results (Some(10),3.25)
~~~

使用zipwith的例子：

~~~scala
println(s"\nStep 4: Call Future.zipWith and pass-through function qtyAndPriceF")
val donutAndPriceOperation = donutStock("vanilla donut").zipWith(donutPrice())(qtyAndPriceF)
donutAndPriceOperation.onComplete {
  case Success(result) => println(s"Result $result")
  case Failure(e)      => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

输出结果：

~~~scala
Step 4: Call Future.zipWith and pass-through function qtyAndPriceF
checking donut stock
Result (10,3.25)
~~~

## Future andThen

andThen后面可以跟一个自定义的PartialFunction，来处理Future返回的结果， 如下所示：

~~~scala
println(s"\nStep 2: Call Future.andThen with a PartialFunction")
val donutStockOperation = donutStock("vanilla donut")
donutStockOperation.andThen { case stockQty => println(s"Donut stock qty = $stockQty")}
~~~

输出结果：

~~~scala
Step 2: Call Future.andThen with a PartialFunction
checking donut stock
Donut stock qty = Success(10)
~~~

## 自定义threadpool

上面的例子中， 我们都是使用了scala的全局ExecutionContext: scala.concurrent.ExecutionContext.Implicits.global.
同样的，我们也可以自定义你自己的ExecutionContext。下面是一个使用java.util.concurrent.Executors的例子：

~~~scala
  println("Step 1: Define an ExecutionContext")
  val executor = Executors.newSingleThreadExecutor()
  implicit val ec = scala.concurrent.ExecutionContext.fromExecutor(executor)



  println("\nStep 2: Define a method which returns a Future")
  import scala.concurrent.Future
  def donutStock(donut: String): Future[Int] = Future {
    // assume some long running database operation
    println("checking donut stock")
    10
  }



  println("\nStep 3: Call method which returns a Future")
  val donutStockOperation = donutStock("vanilla donut")
  donutStockOperation.onComplete {
    case Success(donutStock)  => println(s"Results $donutStock")
    case Failure(e)           => println(s"Error processing future operations, error = ${e.getMessage}")
  }

  Thread.sleep(3000)
  executor.shutdownNow()
~~~

## recover() recoverWith()  and fallbackTo（）

这三个方法主要用来处理异常的，recover是用来从你已知的异常中恢复，如下所示：

~~~scala
println("\nStep 3: Call Future.recover to recover from a known exception")
donutStock("unknown donut")
  .recover { case e: IllegalStateException if e.getMessage == "Out of stock" => 0 }
  .onComplete {
    case Success(donutStock)  => println(s"Results $donutStock")
    case Failure(e)           => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

recoverWith()和recover（）类似，不同的是他的返回值是一个Future。 

~~~scala
println("\nStep 3: Call Future.recoverWith to recover from a known exception")
donutStock("unknown donut")
  .recoverWith { case e: IllegalStateException if e.getMessage == "Out of stock" => Future.successful(0) }
  .onComplete {
    case Success(donutStock)  => println(s"Results $donutStock")
    case Failure(e)           => println(s"Error processing future operations, error = ${e.getMessage}")
}

~~~

fallbackTo（）是在发生异常时，去调用指定的方法：

~~~scala
println("\nStep 3: Call Future.fallbackTo")
val donutStockOperation = donutStock("plain donut")
  .fallbackTo(similarDonutStock("vanilla donut"))
  .onComplete {
    case Success(donutStock)  => println(s"Results $donutStock")
    case Failure(e)           => println(s"Error processing future operations, error = ${e.getMessage}")
}
~~~

## promise

熟悉ES6的同学可能知道，promise是JS在ES6中引入的新特性，其主要目的是将回调转变成链式调动。 

当然scala的promise和ES6的promise还是不一样的，我们看下scala中promise是怎么用的：

~~~scala
  println("Step 1: Define a method which returns a Future")
  import scala.concurrent.ExecutionContext.Implicits.global
  def donutStock(donut: String): Int = {
    if(donut == "vanilla donut") 10
    else throw new IllegalStateException("Out of stock")
  }


  println(s"\nStep 2: Define a Promise of type Int")
  val donutStockPromise = Promise[Int]()



  println("\nStep 3: Define a future from Promise")
  val donutStockFuture = donutStockPromise.future
  donutStockFuture.onComplete {
    case Success(stock) => println(s"Stock for vanilla donut = $stock")
    case Failure(e)     => println(s"Failed to find vanilla donut stock, exception = $e")
  }



  println("\nStep 4: Use Promise.success or Promise.failure to control execution of your future")
  val donut = "vanilla donut"
  if(donut == "vanilla donut") {
    donutStockPromise.success(donutStock(donut))
  } else {
    donutStockPromise.failure(Try(donutStock(donut)).failed.get)
  }



  println("\nStep 5: Completing Promise using Promise.complete() method")
  val donutStockPromise2 = Promise[Int]()
  val donutStockFuture2 = donutStockPromise2.future
  donutStockFuture2.onComplete {
    case Success(stock) => println(s"Stock for vanilla donut = $stock")
    case Failure(e)     => println(s"Failed to find vanilla donut stock, exception = $e")
  }
  donutStockPromise2.complete(Try(donutStock("unknown donut")))
~~~

上面例子中我们使用了 `Promise.success`， `Promise.failure`， `Promise.complete()` 来控制程序的运行。 









