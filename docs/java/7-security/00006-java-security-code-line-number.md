---
slug: /java-security-code-line-number
---

# 6. java安全编码指南之:Number操作

# 简介

java中可以被称为Number的有byte，short，int，long，float，double和char，我们在使用这些Nubmer的过程中，需要注意些什么内容呢？一起来看看吧。

# Number的范围

每种Number类型都有它的范围，我们看下java中Number类型的范围：

![](https://img-blog.csdnimg.cn/20200723162527397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

考虑到我们最常用的int操作，虽然int的范围够大，但是如果我们在做一些int操作的时候还是可能超出int的范围。

超出了int范围会发送什么事情呢？看下面的例子：

~~~java
    public void testIntegerOverflow(){
        System.out.println(Integer.MAX_VALUE+1000);
    }
~~~

运行结果：-2147482649。

很明显Integer.MAX_VALUE+1000将会超出Integer的最大值范围，但是我们没有得到异常提醒，反而得到了一个错误的结果。

正确的操作是如果我们遇到了Overflow的问题，需要抛出异常：ArithmeticException。

怎么防止这种IntegerOverflow的问题呢？一般来讲，我们有下面几种方式。

* 第一种方式：在做Integer操作之前，进行预判断是否超出范围：

举个例子：

~~~java
    static final int safeAdd(int left, int right) {
        if (right > 0 ? left > Integer.MAX_VALUE - right
                : left < Integer.MIN_VALUE - right) {
            throw new ArithmeticException("Integer overflow");
        }
        return left + right;
    }
~~~

上面的例子中，我们需要进行两个整数相加操作，在相加之前，我们需要进行范围的判断，从而保证计算的安全性。

* 第二种方式：使用Math的addExact和multiplyExact方法：

Math的addExact和multiplyExact方法已经提供了Overflow的判断，我们看下addExact的实现：

~~~java
    public static int addExact(int x, int y) {
        int r = x + y;
        // HD 2-12 Overflow iff both arguments have the opposite sign of the result
        if (((x ^ r) & (y ^ r)) < 0) {
            throw new ArithmeticException("integer overflow");
        }
        return r;
    }
~~~

看下怎么使用：

~~~java
    public int addUseMath(int a, int b){
        return Math.addExact(a,b);
    }
~~~

* 第三种方式：向上转型

既然超出了Integer的范围，那么我们可以用范围更大的long来存储数据。

~~~java
    public static long intRangeCheck(long value) {
        if ((value < Integer.MIN_VALUE) || (value > Integer.MAX_VALUE)) {
            throw new ArithmeticException("Integer overflow");
        }
        return value;
    }

    public int addUseUpcasting(int a, int b){
        return (int)intRangeCheck((long)a+(long)b);
    }
~~~

上面的例子中，我们将a+b转换成了两个long相加，从而保证不溢出范围。

然后进行一次范围比较，从而判断相加之后的结果是否仍然在整数范围内。

* 第四种方式：使用BigInteger

我们可以使用BigInteger.valueOf(a)将int转换成为BigInteger，再进行后续操作：

~~~java
    public int useBigInteger(int a, int b){
        return BigInteger.valueOf(a).add(BigInteger.valueOf(b)).intValue();
    }
~~~

# 区分位运算和算数运算

我们通常会对Integer进行位运算或者算数运算。虽然可以进行两种运算，但是最好不要将两种运算同时进行，这样会造成混淆。

比如下面的例子：

~~~java
x += (x << 1) + 1;
~~~

上面的例子是想做什么呢？其实它是想将3x+1的值赋给x。

但是这样写出来让人很难理解，所以我们需要避免这样实现。

再看下面的一个例子：

~~~java
    public void testBitwiseOperation(){
        int i = -10;
        System.out.println(i>>>2);
        System.out.println(i>>2);
        System.out.println(i/4);
    }
~~~

本来我们想做的是将i除以4，结果发现只有最后一个才是我们要的结果。

我们来解释一下，第一个i>>>2是逻辑右移，将会把最左边的填充成0,所以得出的结果是一个正值1073741821。

第二个i>>2是算数右移，最左边的还是会填充成1，但是会向下取整，所以得出结果是-3.

直接使用i/4，我们是向上取整，所以得出结果是-2.

# 注意不要使用0作为除数

我们在使用变量作为除数的时候，一定要注意先判断是否为0.

# 兼容C++的无符号整数类型

在java中只有16位的char表示的是无符号整数，而int实际上表示的是带符号的整数。

而在C或者C++中是可以直接表示无符号的整数的，那么，如果我们有一个32位的无符号整数，该怎么用java来处理呢？

~~~java
    public int readIntWrong(DataInputStream is) throws IOException {
        return is.readInt();
    }
~~~

看上面的例子，我们从Stream中读取一个int值，如果是一个32位的无符号整数，那么读出来int就变成了有符号的负整数，这和我们的期望是相符的。

考虑一下，long是64位的，我们是不是可以使用long来表示32位的无符号整数呢？

~~~java
    public long readIntRight(DataInputStream is) throws IOException{
        return is.readInt() & 0xFFFFFFFFL; // Mask with 32 one-bits
    }
~~~

看上面的例子，我们返回的是long，如果将32位的int转换成为64位的long，会自动根据符号位进行补全。

所以这时候我们需要和0xFFFFFFFFL进行mask操作，将高32位重置为0.

# NAN和INFINITY

在整型运算中，除数是不能为0的，否则直接运行异常。但是在浮点数运算中，引入了NAN和INFINITY的概念，我们来看一下Double和Float中的定义。

~~~java
public static final double POSITIVE_INFINITY = 1.0 / 0.0;
public static final double NEGATIVE_INFINITY = -1.0 / 0.0;
public static final double NaN = 0.0d / 0.0;
~~~

~~~java
public static final float POSITIVE_INFINITY = 1.0f / 0.0f;
public static final float NEGATIVE_INFINITY = -1.0f / 0.0f;
public static final float NaN = 0.0f / 0.0f;
~~~

1除以0就是INFINITY，而0除以0就是NaN。

接下来，我们看一下NAN和INFINITY的比较：

~~~java
public void compareInfinity(){
    System.out.println(Double.POSITIVE_INFINITY == Double.POSITIVE_INFINITY);
    }
~~~

运行结果是true。

~~~java
    public void compareNaN(){
        System.out.println(Double.NaN == Double.NaN);
    }
~~~

运行结果是false。

可以看到NaN和NaN相比是false。

那么我们怎么比较NaN呢？

别急，Double提供了一个isNaN方法，我们可以这样使用：

~~~java
System.out.println(Double.isNaN(Double.NaN));
~~~

接下来我们看一个在代码中经常会用到的一个Double解析：

~~~java
    public void incorrectParse(String userInput){
        double val = 0;
        try {
            val = Double.valueOf(userInput);
        } catch (NumberFormatException e) {
        }
        //do something for val
    }
~~~

这段代码有没有问题？咋看下好像没有问题，但是，如果我们的userInput是NaN，Infinity，或者-Infinity，Double.valueOf是可以解析得到结果的。

~~~java
    public void testNaN(){
        System.out.println(Double.valueOf("NaN"));
        System.out.println(Double.valueOf("Infinity"));
        System.out.println(Double.valueOf("-Infinity"));
    }
~~~

运行输出：

~~~java
NaN
Infinity
-Infinity
~~~

所以，我们还需要额外去判断NaN和Infinity：

~~~java
public void correctParse(String userInput){
        double val = 0;
        try {
            val = Double.valueOf(userInput);
        } catch (NumberFormatException e) {
        }
        if (Double.isInfinite(val)){
            // Handle infinity error
        }

        if (Double.isNaN(val)) {
            // Handle NaN error
        }
        //do something for val
    }
~~~

# 不要使用float或者double作为循环的计数器

考虑下面的代码：

~~~java
for (float x = 0.1f; x <= 1.0f; x += 0.1f) {
  System.out.println(x);
}
~~~

上面的代码有什么问题呢？

我们都知道java中浮点数是不准确的，但是不一定有人知道为什么不准确。

这里给大家解释一下，计算机中所有与的数都是以二进制存储的，我们以0.6为例。

0.6转成为二进制格式是乘2取整，0.6x2=1.2，取整剩余0.2，继续上面的步骤0.2x2=0.4，0.4x2=0.8,0.8x2=1.6,取整剩余0.6，产生了一个循环。

所以0.6的二进制格式是.1001 1001 1001 1001 1001 1001 1001 ... 无限循环下去。

所以，有些小数是无法用二进制精确的表示的，最终导致使用float或者double作为计数器是不准的。

# BigDecimal的构建

为了解决float或者Double计算中精度缺失的问题，我们通常会使用BigDecimal。

那么在使用BigDecimal的时候，请注意一定不要从float构建BigDecimal，否则可能出现意想不到的问题。

~~~java
    public void getFromFloat(){
        System.out.println(new BigDecimal(0.1));
    }
~~~

上面的代码，我们得到的结果是：0.1000000000000000055511151231257827021181583404541015625。

这是因为二进制无法完美的展示所有的小数。

所以，我们需要从String来构建BigDecimal：

~~~java
    public void getFromString(){
        System.out.println(new BigDecimal("0.1"));
    }
~~~

# 类型转换问题

在java中各种类型的Number可以互相进行转换：

比如：

* short to byte or char
* char to byte or short
* int to byte, short, or char
* long to byte, short, char, or int
* float to byte, short, char, int, or long
* double to byte, short, char, int, long, or float

或者反向：

* byte to short, int, long, float, or double
* short to int, long, float, or double
* char to int, long, float, or double
* int to long, float, or double
* long to float or double
* float to double

从大范围的类型转向小范围的类型时，我们要考虑是否超出转换类型范围的情况：

~~~java
    public void intToByte(int i){
        if ((i < Byte.MIN_VALUE) || (i > Byte.MAX_VALUE)) {
            throw new ArithmeticException("Value is out of range");
        }
        byte b = (byte) i;
    }
~~~

比如上面的例子中，我们将int转换成为byte，那么在转换之前，需要先判断int是否超出了byte的范围。

同时我们还需要考虑到精度的切换，看下面的例子：

~~~java
    public void intToFloat(){
        System.out.println(subtraction(1111111111,1111111111));
    }

    public int subtraction(int i , float j){
        return i - (int)j;
    }
~~~

结果是多少呢？

答案不是0，而是-57。

为什么呢？

因为这里我们做了两次转换，第一次从1111111111转换到float，float虽然有32位，但是只有23位是存放真正的数值的，1位是符号位，剩下的8位是指数位。

所以从1111111111转换到float发送了精度丢失。

我们可以把subtraction方法修改一下，首先判断float的范围，如果超出了23bit的表示范围，则说明发送了精度丢失，我们需要抛出异常：

~~~java
    public int subtraction(int i , float j){
        System.out.println(j);
        if ((j > 0x007fffff) || (j < -0x800000)) {
            throw new ArithmeticException("Insufficient precision");
        }
        return i - (int)j;
    }
~~~

当然还有一种办法，我们可以用精度更高的double来做转换，double有52位来存放真正的数据，所以足够了。

~~~java
    public int subtractionWithDouble(int i , double j){
        System.out.println(j);
        return i - (int)j;
    }
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
















