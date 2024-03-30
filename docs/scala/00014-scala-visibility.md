# 14. 可见性规则

和java很类似，scala也有自己的可见性规则，不同的是scala只有private和protected关键字，没有public关键字，同时scala还提供了更加细粒度的访问控制如protected[scope]和private[scope]。

## public

scala中默认的访问权限就是public，这意味着在scala中没有可见性关键字的声明体，他的访问权限就是public，是具有公有可见性的。这与Java不同，Java 语言中默认的“公有”可见性只对包可见（即包内私有）。

我们看一个例子：

~~~scala
package scopeA {
class PublicClass1 {
val publicField = 1
class Nested {
val nestedField = 1
}
val nested = new Nested
}
class PublicClass2 extends PublicClass1 {
val field2 = publicField + 1
val nField2 = new Nested().nestedField
}
}
package scopeB {
class PublicClass1B extends scopeA.PublicClass1
class UsingClass(val publicClass: scopeA.PublicClass1) {
def method = "UsingClass:" +
" field: " + publicClass.publicField +
" nested field: " + publicClass.nested.nestedField
}
}
~~~

我们可以看到PublicClass1和它的内部类Nested的字段是公有可以访问的。

## Protected

所有使用protected 关键字声明的成员只对该定义类型可见，包括
相同类型的其他实例以及所有的继承类型。

我们看一个例子：

~~~scala
package scopeA {
  class ProtectedClass1(protected val protectedField1: Int) {
    protected val protectedField2 = 1

    def equalFields(other: ProtectedClass1) =
      (protectedField1 == other.protectedField1) &&
      (protectedField2 == other.protectedField2) &&
      (nested == other.nested)


    class Nested {
      protected val nestedField = 1
    }

    protected val nested = new Nested
  }

  class ProtectedClass2 extends ProtectedClass1(1) {
    val field1 = protectedField1
    val field2 = protectedField2
    val nField = new Nested().nestedField  // ERROR
  }

  class ProtectedClass3 {
    val protectedClass1 = new ProtectedClass1(1)
    val protectedField1 = protectedClass1.protectedField1 // ERROR
    val protectedField2 = protectedClass1.protectedField2 // ERROR
    val protectedNField = protectedClass1.nested.nestedField // ERROR
  }

  protected class ProtectedClass4

  class ProtectedClass5 extends ProtectedClass4
  protected class ProtectedClass6 extends ProtectedClass4
}

package scopeB {
  class ProtectedClass4B extends scopeA.ProtectedClass4 // ERROR
}
~~~

由于ProtectedClass2 继承了Protected1 类，因此ProtectedClass2 能访问ProtectedClass1中定义的受保护成员。不过，ProtectedClass2 无法访问protectedClass1.nested 对象中受保护的nestedField 成员。同时，ProtectedClass3 类也无法访问它使用的ProtectedClass1实例中的受保护成员。

最后，由于ProtectedClass4 被声明为protected 类，其对scopeB 包内的对象不可见。

## private

私有（private）可见性将实现细节完全隐藏起来，即便是继承类的实现者也无法访问这些细节。声明中包含了private 关键字的所有成员都只对定义该成员的类型可见，该类型的其他实例也能访问这些成员。

>注意，虽然private的继承者无法访问成员，但是包含该字段的类型的其他实例也可以访问这些成员。

举个例子：

~~~scala

package scopeA {
  class PrivateClass1(private val privateField1: Int) {
    private val privateField2 = 1

    def equalFields(other: PrivateClass1) =
      (privateField1 == other.privateField1) &&
      (privateField2 == other.privateField2) &&
      (nested == other.nested)

    class Nested {
      private val nestedField = 1
    }

    private val nested = new Nested
  }

  class PrivateClass2 extends PrivateClass1(1) {
    val field1 = privateField1  // ERROR
    val field2 = privateField2  // ERROR
    val nField = new Nested().nestedField // ERROR
  }

  class PrivateClass3 {
    val privateClass1 = new PrivateClass1(1)
    val privateField1 = privateClass1.privateField1 // ERROR
    val privateField2 = privateClass1.privateField2 // ERROR
    val privateNField = privateClass1.nested.nestedField // ERROR
  }

  private class PrivateClass4

  class PrivateClass5 extends PrivateClass4  // ERROR
  protected class PrivateClass6 extends PrivateClass4 // ERROR
  private class PrivateClass7 extends PrivateClass4
}

package scopeB {
  class PrivateClass4B extends scopeA.PrivateClass4  // ERROR
}

~~~

其他的都很好解释， 请注意，**equalFields 方法可以访问其他实例中定义的私有成员**。

## scoped private 和 scoped protected

除了普通的public，private和protected这三种可见性外，scala还提供了范围内的可见性： scoped private 和 scoped protected。 scala的范围有this，package和具体的某个类型。

简单点讲范围内的可见性就是在范围内保持该可见性的特性。

我们可以比较一下上面我们在讲private和proteced可见性的时候，两者在范围内（class，package）的表现是一样的，是可以替换的，只有在继承方面有差异。

我们先看一下继承的差异性：

~~~scala
package scopeA {
  class Class1 {
    private[scopeA]   val scopeA_privateField = 1
    protected[scopeA] val scopeA_protectedField = 2
    private[Class1]   val class1_privateField = 3
    protected[Class1] val class1_protectedField = 4
    private[this]     val this_privateField = 5
    protected[this]   val this_protectedField = 6
  }

  class Class2 extends Class1 {
    val field1 = scopeA_privateField    
    val field2 = scopeA_protectedField  
    val field3 = class1_privateField     // ERROR
    val field4 = class1_protectedField  
    val field5 = this_privateField       // ERROR
    val field6 = this_protectedField  
  }
}

package scopeB {
  class Class2B extends scopeA.Class1 {
    val field1 = scopeA_privateField     // ERROR
    val field2 = scopeA_protectedField  
    val field3 = class1_privateField     // ERROR
    val field4 = class1_protectedField  
    val field5 = this_privateField       // ERROR
    val field6 = this_protectedField  
  }
}
~~~

scope private/protected只能在该scope内部满足private/protected条件时候才能访问，这样就提供了更加细粒度的控制。

其中this scope是最严格的可见性，它表明可见性限制的字段只能在当前的scope或者type范围之内。

~~~scala
package scopeA {
class PrivateClass1(private[this] val privateField1: Int) {
private[this] val privateField2 = 1
def equalFields(other: PrivateClass1) =
(privateField1 == other.privateField1) && // 错误
(privateField2 == other.privateField2) && // 错误
(nested == other.nested) // 错误
class Nested {
private[this] val nestedField = 1
}
private[this] val nested = new Nested
}
class PrivateClass2 extends PrivateClass1(1) {
val field1 = privateField1 // 错误
val field2 = privateField2 // 错误
val nField = new Nested().nestedField // 错误
}
class PrivateClass3 {
val privateClass1 = new PrivateClass1(1)
val privateField1 = privateClass1.privateField1 // 错误
val privateField2 = privateClass1.privateField2 // 错误
val privateNField = privateClass1.nested.nestedField // 错误
}
}
~~~

我们先看一下类型范围的private[this], 因为其是特定类型范围内，所以equalFields方法会编译错误，其无法被其他实例所访问。

除此之外，使用private[this] 修饰的类成员的可见性与未指定作用域范围的private 可见性一致。

再看一下包范围内的private[this] ：

~~~scala
package scopeA {
private[this] class PrivateClass1
package scopeA2 {
private[this] class PrivateClass2
}
class PrivateClass3 extends PrivateClass1 // 错误
protected class PrivateClass4 extends PrivateClass1 // 错误
private class PrivateClass5 extends PrivateClass1
private[this] class PrivateClass6 extends PrivateClass1
private[this] class PrivateClass7 extends scopeA2.PrivateClass2 // 错误
}
package scopeB {
class PrivateClass1B extends scopeA.PrivateClass1 // 错误
}
~~~

在相同包中，无法成功地为一个private[this] 类型声明public 或protected 子类，你只能为其声明private 和private[this] 子类。与此同时，由于PrivateClass2 的可见性被限定在scopeA2 作用域内，因此你无法在scopeA2 作用域外声明其子类。

同理，在与scopeA2无关的scopeB 作用域内使用PrivateClass1 声明类同样会失败。

我们再看下private[T] 的可见性，其中T 代表了某一类型

~~~scala
package scopeA {
  class PrivateClass1(private[PrivateClass1] val privateField1: Int) {
    private[PrivateClass1] val privateField2 = 1

    def equalFields(other: PrivateClass1) =
      (privateField1 == other.privateField1) &&
      (privateField2 == other.privateField2) &&
      (nested  == other.nested)

    class Nested {
      private[Nested] val nestedField = 1
    }

    private[PrivateClass1] val nested = new Nested
    val nestedNested = nested.nestedField   // ERROR
  }

  class PrivateClass2 extends PrivateClass1(1) {
    val field1 = privateField1  // ERROR
    val field2 = privateField2  // ERROR
    val nField = new Nested().nestedField  // ERROR
  }

  class PrivateClass3 {
    val privateClass1 = new PrivateClass1(1)
    val privateField1 = privateClass1.privateField1  // ERROR
    val privateField2 = privateClass1.privateField2  // ERROR
    val privateNField = privateClass1.nested.nestedField // ERROR
  }
}
~~~

由于可见性类型为private[PrivateClass1] 的成员对其他同类型实例可见， 因此equalFields 能够通过解析。

我们再看看包级的可见性：

~~~scala
package scopeA {
  private[scopeA] class PrivateClass1

  package scopeA2 {
    private [scopeA2] class PrivateClass2
    private [scopeA]  class PrivateClass3
  }

  class PrivateClass4 extends PrivateClass1
  protected class PrivateClass5 extends PrivateClass1
  private class PrivateClass6 extends PrivateClass1
  private[this] class PrivateClass7 extends PrivateClass1

  private[this] class PrivateClass8 extends scopeA2.PrivateClass2 // ERROR
  private[this] class PrivateClass9 extends scopeA2.PrivateClass3
}

package scopeB {
  class PrivateClass1B extends scopeA.PrivateClass1 // ERROR
}
~~~

现在我们无法在scopeA2 作用域外将PrivateClass2 子类化。不过由于PrivateClass3 被声明为private[ScopeA] 类型，因此我们可以在scopeA 作用域内能将PrivateClass3 子类化。

再看看放在类型里面的包级可见性：

~~~scala
package scopeA {
  class PrivateClass1(private[this] val privateField1: Int) {
    private[this] val privateField2 = 1

    def equalFields(other: PrivateClass1) =
      (privateField1 == other.privateField1) && // ERROR
      (privateField2 == other.privateField2) && // ERROR
      (nested == other.nested)   // ERROR

    class Nested {
      private[this] val nestedField = 1
    }

    private[this] val nested = new Nested
  }

  class PrivateClass2 extends PrivateClass1(1) {
    val field1 = privateField1  // ERROR
    val field2 = privateField2  // ERROR
    val nField = new Nested().nestedField  // ERROR
  }

  class PrivateClass3 {
    val privateClass1 = new PrivateClass1(1)
    val privateField1 = privateClass1.privateField1  // ERROR
    val privateField2 = privateClass1.privateField2  // ERROR
    val privateNField = privateClass1.nested.nestedField // ERROR
  }
}
~~~

如果我们试图从某个与scopeA 无关的包scopeB 中访问scopeA 时，或者当我们尝试从嵌套包scopeA2 中访问成员变量时，便会出现错误。







