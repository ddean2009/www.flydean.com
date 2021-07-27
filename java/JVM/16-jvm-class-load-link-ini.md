JVM详解之:类的加载链接和初始化

## 简介

有了java class文件之后，为了让class文件转换成为JVM可以真正运行的结构，需要经历加载，链接和初始化的过程。

这三个过程是怎么工作的呢？在本文中你将会找到答案。

## 加载

JVM可以分为三大部分，五大空间和三大引擎，要讲起来也不是特别复杂，先看下面的总体的JVM架构图。

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上面的图中，我们可以看到JVM中有三大部分，分别是类加载系统，运行时数据区域和Execution Engine。

加载就是根据特定名称查找类或者接口的二进制表示，并根据此二进制表示来创建类和接口的过程。

### 运行时常量池

我们知道JVM中有一个方法区的区域，在JDK8中，方法区的实现叫做元空间。这个元空间是存放在本地内存中的。

方法区中存放着每个class对应的运行时常量池。

当类或者接口创建的时候，就会通过class文件中定义的常量池来构建运行时常量池。

运行时常量池中有两种类型，分别是symbolic references符号引用和static constants静态常量。

其中静态常量不需要后续解析，而符号引用需要进一步进行解析处理。

静态常量分为两个部分：String常量和数字常量。

String常量是对String对象的引用，是从class中的CONSTANT_String_info结构体构建的。

数字常量是从class文件中的CONSTANT_Integer_info, CONSTANT_Float_info, CONSTANT_Long_info和 CONSTANT_Double_info 构建的。

符号引用也是从class中的constant_pool中构建的。

对class和interface的符号引用来自于CONSTANT_Class_info。

对class和interface中字段的引用来自于CONSTANT_Fieldref_info。

class中方法的引用来自于CONSTANT_Methodref_info。

interface中方法的引用来自于CONSTANT_InterfaceMethodref_info。

对方法句柄的引用来自于CONSTANT_MethodHandle_info。

对方法类型的引用来自于CONSTANT_MethodType_info。

对动态计算常量的符号引用来自于CONSTANT_MethodType_info。

对动态计算的call site的引用来自于CONSTANT_InvokeDynamic_info。

### 类加载器

类是怎么创建的呢？类的创建可以是由其他类调用该类的初始化方法来创建，也可以通过反射来创建。

类其实又可以分为两种，一种是数组类，一种是非数组类。

对于非数组类，因为他们有相应的二进制表示，所以是通过类加载器加载二进制表示来创建的。

而对于数组类，因为他们没有外部的二进制表示，所以数组类是由java虚拟机创建的。

java虚拟机中的类加载器又有两种，一种是虚拟机提供的引导类加载器，一种是用户自定义的类加载器。

如果是用户自定的类加载器，那么应该是ClassLoader的一个实现。用户自定义类加载器主要是为了扩展java虚拟机的功能，以支持动态加载并创建类。

## 链接

链接是为了让类或者接口可以被java虚拟机执行，而将类或者接口并入虚拟机运行时状态的过程。

链接具体的工作包括验证和准备类或者接口。而解析这个类或者接口中的符号引用是链接过程中的可选部分。

如果java虚拟机选择在用到类或者接口中的符号引用时才去解析他们，这叫做延迟解析。

如果java虚拟机在验证类的时候就解析符号引用，这就叫做预先解析。

### 验证

验证主要是为了保证类和接口的二进制表示的结构正确性。

如果类或者接口的二进制表示不满足相应的约束，则会抛出VerifyError异常。

### 准备

准备主要是创建类或者接口的静态字段，并使用默认值来初始化这些字段。

### 解析

解析是指根据运行时常量池中的符号引用来动态决定其具体值的过程。

在执行java虚拟机指令：

anewarray,checkcat, getfield, getstatic, instanceof, invokedynamic, invokeinterface, invokespecial, invokestatic, invokevirtual, ldc, ldc_w, multianewarray, new , putfield和putstatic这些指令的时候，都会去将符号引用指向运行时常量池，从而需要对符号引用进行解析。

解析可以分为类和接口的解析，字段解析，普通方法的解析，接口方法解析，方法类型和方法句柄解析，调用点限定符解析这几种。

## 初始化

类或者接口的初始化是指执行类或者接口的初始化方法&lt;clinit>。

只有下面的几种情况，类或者接口才会被初始化：

1. 执行需要引用类或者接口的java虚拟机指令（new,getstatic, putstatic, invokestatic）的时候。
2. 初次调用java.lang.invoke.Methodhandle实例的时候。
3. 调用类库中的某些反射方法的时候。
4. 对类的某个子类进行初始化的时候。
5. 被选定为java虚拟机启动时候的初始类的时候。

## 总结

class文件经过加载，链接和初始化之后，就可以提供给JVM在运行时使用了。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！


