---
slug: /03-python-numpy-scalar
---

# 3. NumPy之:标量scalars



# 简介

Python语言中只定义了特定数据类的一种类型（比如只有一种整数类型，一种浮点类型等）。在不需要关注计算机中数据表示方式的普通应用程序中，这样做很方便。但是，对于科学计算来说，我们需要更加精确的控制类型。

在NumPy中，引入了24种新的Python scalar类型用于更加准确的描述数据。这些类型都是可以直接在NumPy中的数组中使用的，所以也叫Array scalar类型。

本文将会详细讲解这24种scalar类型。

# scalar类型的层次结构

先看一个张图，看下scalar类型的层次结构：

![](https://img-blog.csdnimg.cn/20201215221627763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上面实线方框括起来的，就是scalar类型。 这些标量类型，都可以通过 `np.type`来访问，比如：

~~~python
In [130]: np.intc
Out[130]: numpy.int32
~~~

细心的小伙伴可能要问了，这不对呀，实线方框括起来的只有22中类型，还有两个类型是什么？

还有两个是代表整数指针的  `intp` 和 `uintp` 。

> 注意，array scalars 类型是不可变的。

我们可以isinstance来对这些数组标量来进行层次结构的检测。

例如，如果val是数组标量对象，则isinstance（val，np.generic）将返回True。如果val是复数值类型，则isinstance（val，np.complexfloating）将返回True。

# 内置Scalar类型

我们用下面的表来展示内置的Scalar类型和与他们相对应的C类型或者Python类型。最后一列的字符代码是类型的字符表示，在有些情况比如构建dtype中会使用到。

## boolean

| 类型    | 描述                    | 字符代码 |
| :------ | :---------------------- | :------- |
| `bool_` | compatible: Python bool | `'?'`    |
| `bool8` | 8 bits                  |          |

## Integers

| 类型       | 描述                          | 字符代码 |
| ---------- | ----------------------------- | -------- |
| `byte`     | compatible: C char            | `'b'`    |
| `short`    | compatible: C short           | `'h'`    |
| `intc`     | compatible: C int             | `'i'`    |
| `int_`     | compatible: Python int        | `'l'`    |
| `longlong` | compatible: C long long       | `'q'`    |
| `intp`     | large enough to fit a pointer | `'p'`    |
| `int8`     | 8 bits                        |          |
| `int16`    | 16 bits                       |          |
| `int32`    | 32 bits                       |          |
| `int64`    | 64 bits                       |          |

## Unsigned integers

| 类型        | 描述                          | 字符代码 |
| ----------- | ----------------------------- | -------- |
| `ubyte`     | compatible: C unsigned char   | `'B'`    |
| `ushort`    | compatible: C unsigned short  | `'H'`    |
| `uintc`     | compatible: C unsigned int    | `'I'`    |
| `uint`      | compatible: Python int        | `'L'`    |
| `ulonglong` | compatible: C long long       | `'Q'`    |
| `uintp`     | large enough to fit a pointer | `'P'`    |
| `uint8`     | 8 bits                        |          |
| `uint16`    | 16 bits                       |          |
| `uint32`    | 32 bits                       |          |
| `uint64`    | 64 bits                       |          |

## Floating-point numbers

| 类型        | 描述                     | 字符代码 |
| ----------- | ------------------------ | -------- |
| `half`      |                          | `'e'`    |
| `single`    | compatible: C float      | `'f'`    |
| `double`    | compatible: C double     |          |
| `float_`    | compatible: Python float | `'d'`    |
| `longfloat` | compatible: C long float | `'g'`    |
| `float16`   | 16 bits                  |          |
| `float32`   | 32 bits                  |          |
| `float64`   | 64 bits                  |          |
| `float96`   | 96 bits, platform?       |          |
| `float128`  | 128 bits, platform?      |          |

## Complex floating-point numbers

| 类型         | 描述                          | 字符代码 |
| ------------ | ----------------------------- | -------- |
| `csingle`    |                               | `'F'`    |
| `complex_`   | compatible: Python complex    | `'D'`    |
| `clongfloat` |                               | `'G'`    |
| `complex64`  | two 32-bit floats             |          |
| `complex128` | two 64-bit floats             |          |
| `complex192` | two 96-bit floats, platform?  |          |
| `complex256` | two 128-bit floats, platform? |          |

## Python 对象

| 类型      | 描述              | 字符代码 |
| --------- | ----------------- | -------- |
| `object_` | any Python object | `'O'`    |

> 对于数组中的对象类型`object_`来说，存储的数据其实是Python对象的引用，所以说他们的对象类型必须一致。
>
> 虽然存储的是引用，但是在取值访问的时候，返回的就是对象本身。

可以看到对于数字类型来说，int,uint,float,complex,后面可以跟上具体的数组，表示特定的长度。

**intp** 和 **uintp** 是两个指向整数的指针。

有些类型和Python自带的类型基本上是等价的，事实上这些类型就是继承自Python自带的类型：

| Array scalar type | Related Python type       |
| :---------------- | :------------------------ |
| `int_`            | `IntType` (Python 2 only) |
| `float_`          | `FloatType`               |
| `complex_`        | `ComplexType`             |
| `bytes_`          | `BytesType`               |
| `unicode_`        | `UnicodeType`             |

有一个特例就是bool_ ，它和Python的 **BooleanType** 非常类似，但并不是继承自**BooleanType**。因为Python的**BooleanType** 是不允许被继承的。并且两者底层的数据存储长度也是不一样的。

> 虽然在Python中bool是int的子类。但是在NumPy中 bool_  并不是  `int_` 的子类，**bool_** 甚至不是一个number 类型。

> 在Python 3 中， `int_`  不再继承 Python3 中的`int`了，因为`int`不再是一个固定长度的整数。

> NumPy 默认的数据类型是 **float_**。

## 可变长度数据类型

下面的三种数据类型长度是可变的，

| 类型       | 描述                           | 字符代码 |
| ---------- | ------------------------------ | -------- |
| `bytes_`   | compatible: Python bytes       | `'S#'`   |
| `unicode_` | compatible: Python unicode/str | `'U#'`   |
| `void`     |                                | `'V#'`   |

字符代码中的 # 表示的是数字。

> 上面描述的字符代码，为了和Python的其他模块进行兼容，比如struct ，需要进行下面适当的修正：
>
>  `c -> S1`, `b -> B`, `1 -> b`, `s -> h`, `w -> H`, 和 `u -> I`.

---

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
