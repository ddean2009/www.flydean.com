JVM详解之:java class文件的密码本

## 简介

一切的一切都是从javac开始的。从那一刻开始，java文件就从我们肉眼可分辨的文本文件，变成了冷冰冰的二进制文件。

变成了二进制文件是不是意味着我们无法再深入的去了解java class文件了呢？答案是否定的。

机器可以读，人为什么不能读？只要我们掌握java class文件的密码表，我们可以把二进制转成十六进制，将十六进制和我们的密码表进行对比，就可以轻松的解密了。

下面，让我们开始这个激动人心的过程吧。

## 一个简单的class

为了深入理解java class的含义，我们首先需要定义一个class类：

~~~java
public class JavaClassUsage {

    private int age=18;

    public void inc(int number){
        this.age=this.age+ number;
    }
}
~~~

很简单的类，我想不会有比它更简单的类了。

在上面的类中，我们定义了一个age字段和一个inc的方法。

接下来我们使用javac来进行编译。

IDEA有没有？直接打开编译后的class文件，你会看到什么？

没错，是反编译过来的java代码。但是这次我们需要深入了解的是class文件，于是我们可以选择 view->Show Bytecode：

![](https://img-blog.csdnimg.cn/20200615232536371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

当然，还是少不了最质朴的javap命令：

~~~java
 javap -verbose JavaClassUsage
~~~

对比会发现，其实javap展示的更清晰一些，我们暂时选用javap的结果。

编译的class文件有点长，我一度有点不想都列出来，但是又一想只有对才能讲述得更清楚，还是贴在下面：

~~~java
public class com.flydean.JavaClassUsage
  minor version: 0
  major version: 58
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Fieldref           #8.#9          // com/flydean/JavaClassUsage.age:I
   #8 = Class              #10            // com/flydean/JavaClassUsage
   #9 = NameAndType        #11:#12        // age:I
  #10 = Utf8               com/flydean/JavaClassUsage
  #11 = Utf8               age
  #12 = Utf8               I
  #13 = Utf8               Code
  #14 = Utf8               LineNumberTable
  #15 = Utf8               LocalVariableTable
  #16 = Utf8               this
  #17 = Utf8               Lcom/flydean/JavaClassUsage;
  #18 = Utf8               inc
  #19 = Utf8               (I)V
  #20 = Utf8               number
  #21 = Utf8               SourceFile
  #22 = Utf8               JavaClassUsage.java
{
  public com.flydean.JavaClassUsage();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: aload_0
         5: bipush        18
         7: putfield      #7                  // Field age:I
        10: return
      LineNumberTable:
        line 7: 0
        line 9: 4
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  this   Lcom/flydean/JavaClassUsage;

  public void inc(int);
    descriptor: (I)V
    flags: ACC_PUBLIC
    Code:
      stack=3, locals=2, args_size=2
         0: aload_0
         1: aload_0
         2: getfield      #7                  // Field age:I
         5: iload_1
         6: iadd
         7: putfield      #7                  // Field age:I
        10: return
      LineNumberTable:
        line 12: 0
        line 13: 10
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  this   Lcom/flydean/JavaClassUsage;
            0      11     1 number   I
}
SourceFile: "JavaClassUsage.java"
~~~

## ClassFile的二进制文件

慢着，上面javap的结果好像并不是二进制文件！

对的，javap是对二进制文件进行了解析，方便程序员阅读。如果你真的想直面最最底层的机器代码，就直接用支持16进制的文本编译器把编译好的class文件打开吧。

你准备好了吗？

来吧，展示吧！

![](https://img-blog.csdnimg.cn/2020061608593763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图左边是16进制的class文件代码，右边是对16进制文件的适当解析。大家可以隐约的看到一点点熟悉的内容。

是的，没错，你会读机器语言了！

## class文件的密码本

如果你要了解class文件的结构，你需要这个密码本。

如果你想解析class文件，你需要这个密码本。

学好这个密码本，走遍天下都......没啥用！

下面就是密码本，也就是classFile的结构。

~~~java
ClassFile {
    u4             magic;
    u2             minor_version;
    u2             major_version;
    u2             constant_pool_count;
    cp_info        constant_pool[constant_pool_count-1];
    u2             access_flags;
    u2             this_class;
    u2             super_class;
    u2             interfaces_count;
    u2             interfaces[interfaces_count];
    u2             fields_count;
    field_info     fields[fields_count];
    u2             methods_count;
    method_info    methods[methods_count];
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

其中u2，u4表示的是无符号的两个字节，无符号的4个字节。

java class文件就是按照上面的格式排列下来的，按照这个格式，我们可以自己实现一个反编译器（大家有兴趣的话，可以自行研究）。

我们对比着上面的二进制文件一个一个的来理解。

### magic

首先，class文件的前4个字节叫做magic word。

看一下十六进制的第一行的前4个字节：

~~~java
CA FE BA BE 00 00 00 3A 00 17 0A 00 02 00 03 07 
~~~

0xCAFEBABE就是magic word。所有的java class文件都是以这4个字节开头的。

来一杯咖啡吧，baby！

多么有诗意的画面。

### version

这两个version要连着讲，一个是主版本号，一个是次版本号。

~~~java
00 00 00 3A
~~~

![](https://img-blog.csdnimg.cn/20200615235345167.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

对比一下上面的表格，我们的主版本号是3A=58，也就是我们使用的是JDK14版本。

### 常量池 

接下来是常量池。

首先是两个字节的constant_pool_count。对比一下，constant_pool_count的值是：

~~~java
00 17
~~~

换算成十进制就是23。也就是说常量池的大小是23-1=22。

> 这里有两点要注意，第一点，常量池数组的index是从1开始到constant_pool_count-1结束。
> 
> 第二点，常量池数组的第0位是作为一个保留位，表示“不引用任何常量池项目”，为某些特殊的情况下使用。

接下来是不定长度的cp_info：constant_pool[constant_pool_count-1]常量池数组。

常量池数组中存了些什么东西呢？

字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。

具体的constant_pool中存储的常量类型有下面几种：

![](https://img-blog.csdnimg.cn/20200616085115439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

每个常量都是以一个tag开头的。用来告诉JVM，这个到底是一个什么常量。

好了，我们对比着来看一下。在constant_pool_count之后，我们再取一部分16进制数据：

![](https://img-blog.csdnimg.cn/20200616090131493.png)

上面我们讲到了17是常量池的个数，接下来就是常量数组。

~~~java
0A 00 02 00 03
~~~

首先第一个字节是常量的tag， 0A=10，对比一下上面的表格，10表示的是CONSTANT_Methodref方法引用。

CONSTANT_Methodref又是一个结构体，我们再看一下方法引用的定义：

~~~java
CONSTANT_Methodref_info {
    u1 tag;
    u2 class_index;
    u2 name_and_type_index;
}
~~~

从上面的定义我们可以看出，CONSTANT_Methodref是由三部分组成的，第一部分是一个字节的tag，也就是上面的0A。

第二部分是2个字节的class_index，表示的是类在常量池中的index。

第三部分是2个字节的name_and_type_index，表示的是方法的名字和类型在常量池中的index。

先看class_index，0002=2。

常量池的第一个元素我们已经找到了就是CONSTANT_Methodref，第二个元素就是跟在CONSTANT_Methodref后面的部分，我们看下是什么：

~~~java
07 00 04
~~~

一样的解析步骤，07=7，查表，表示的是CONSTANT_Class。

我们再看下CONSTANT_Class的定义：

~~~java
CONSTANT_Class_info {
    u1 tag;
    u2 name_index;
}
~~~

可以看到CONSTANT_Class占用3个字节，第一个字节是tag，后面两个字节是name在常量池中的索引。

00 04 = 4， 表示name在常量池中的索引是4。

然后我们就这样一路找下去，就得到了所有常量池中常量的信息。

这样找起来，眼睛都花了，有没有什么简单的办法呢？

当然有，就是上面的javap -version， 我们再回顾一下输出结果中的常量池部分：

~~~java
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Fieldref           #8.#9          // com/flydean/JavaClassUsage.age:I
   #8 = Class              #10            // com/flydean/JavaClassUsage
   #9 = NameAndType        #11:#12        // age:I
  #10 = Utf8               com/flydean/JavaClassUsage
  #11 = Utf8               age
  #12 = Utf8               I
  #13 = Utf8               Code
  #14 = Utf8               LineNumberTable
  #15 = Utf8               LocalVariableTable
  #16 = Utf8               this
  #17 = Utf8               Lcom/flydean/JavaClassUsage;
  #18 = Utf8               inc
  #19 = Utf8               (I)V
  #20 = Utf8               number
  #21 = Utf8               SourceFile
  #22 = Utf8               JavaClassUsage.java
~~~

以第一行为例，直接告诉你常量池中第一个index的类型是Methodref，它的classref是index=2，它的NameAndType是index=3。

并且直接在后面展示出了具体的值。

### 描述符

且慢，在常量池中我好像看到了一些不一样的东西，这些I，L是什么东西？

这些叫做字段描述符：

![](https://img-blog.csdnimg.cn/20200616092347300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图是他们的各项含义。除了8大基础类型，还有2个引用类型，分别是对象的实例，和数组。

### access_flags

常量池后面就是access_flags：访问描述符，表示的是这个class或者接口的访问权限。

先上密码表：

![](https://img-blog.csdnimg.cn/20200616092924600.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

再找一下我们16进制的access_flag:

![](https://img-blog.csdnimg.cn/2020061609304082.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

没错，就是00 21。 参照上面的表格，好像没有21，但是别怕：

21是ACC_PUBLIC和ACC_SUPER的并集。表示它有两个access权限。

### this_class和super_class

接下来是this class和super class的名字，他们都是对常量池的引用。

~~~java
00 08 00 02
~~~

this class的常量池index=8， super class的常量池index=2。

看一下2和8都代表什么：

~~~java
   #2 = Class              #4             // java/lang/Object
   #8 = Class              #10            // com/flydean/JavaClassUsage
~~~

没错，JavaClassUsage的父类是Object。

> 大家知道为什么java只能单继承了吗？因为class文件里面只有一个u2的位置，放不下了！

### interfaces_count和interfaces[]

接下来就是接口的数目和接口的具体信息数组了。

~~~java
00 00
~~~

我们没有实现任何接口，所以interfaces_count=0，这时候也就没有interfaces[]了。

### fields_count和fields[]

然后是字段数目和字段具体的数组信息。

这里的字段包括类变量和实例变量。

每个字段信息也是一个结构体：

~~~java
field_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

字段的access_flag跟class的有点不一样：

![](https://img-blog.csdnimg.cn/20200616121749390.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里我们就不具体对比解释了，感兴趣的小伙伴可以自行体验。

## methods_count和methods[]

接下来是方法信息。

method结构体：

~~~java
method_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

method访问权限标记：

![](https://img-blog.csdnimg.cn/20200616122004356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## attributes_count和attributes[]

attributes被用在ClassFile, field_info, method_info和Code_attribute这些结构体中。

先看下attributes结构体的定义：

~~~java
attribute_info {
    u2 attribute_name_index;
    u4 attribute_length;
    u1 info[attribute_length];
}
~~~

都有哪些attributes, 这些attributes都用在什么地方呢？

![](https://img-blog.csdnimg.cn/20200616123053552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

其中有六个属性对于Java虚拟机正确解释类文件至关重要，他们是：
ConstantValue，Code，StackMapTable，BootstrapMethods，NestHost和NestMembers。

九个属性对于Java虚拟机正确解释类文件不是至关重要的，但是对于通过Java SE Platform的类库正确解释类文件是至关重要的，他们是：

Exceptions，InnerClasses，EnclosingMethod，Synthetic，Signature，SourceFile，LineNumberTable，LocalVariableTable，LocalVariableTypeTable。

其他13个属性，不是那么重要，但是包含有关类文件的元数据。



## 总结

最后留给大家一个问题，java class中常量池的大小constant_pool_count是2个字节，两个字节可以表示2的16次方个常量。很明显已经够大了。

但是，万一我们写了超过2个字节大小的常量怎么办？欢迎大家留言给我讨论。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



















