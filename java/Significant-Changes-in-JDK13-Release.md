JDK13的六大重要新特性

## JDK13的六大重要特性
JDK13在9月17号全球首发了，Oracle JDK 13通过改善Java SE平台和JDK的性能，稳定性和安全性来提高开发人员的生产力。这次的JDK13包含了5个JEP(Java Enhancement Proposals)和一个Unicode 12.1的支持总共6大主要新特性。下面我们一一详细说明。

* 支持Unicode 12.1
* 动态CDS归档（Dynamic CDS Archiving）
* java.net.Socket和java.net.ServerSocket API的重新实现
* ZGC的增强
* 文本块（预览语言功能）
* switch表达式（预览语言功能）

## 支持Unicode 12.1

java.lang.Character支持12.1级别的Unicode字符数据库，其中12.0自11.0起增加了554个字符，总共137,928个字符。 这些增加的内容包括4个新脚本，总共150个脚本，以及61个新表情符号字符。 自12.0起，12.1正好加一个字符，即U+32FF （SQUARE ERA NAME REIWA）。

java.text.Bidi和java.text.Normalizer类分别支持12.0级Unicode标准附件＃9和＃15。

java.util.regex软件包支持基于Unicode标准附件＃29的12.0级的扩展字素集群

## 动态CDS归档（Dynamic CDS Archiving）

相对于默认CDS存档，在HotSpot中使用AppCDS归档应用程序类可提供额外的启动时间和内存优势。但是，当前需要三步过程才能将AppCDS用于Java应用程序：

1. 进行一次或多次试运行以创建class列表
2. 将创建的class列表转储存档
3. 然后和该存档一起运行
   
此外，此过程仅适用于仅使用内置类加载器的应用程序。使用用户自定义的类加载器的应用程序使用起来并不容易，目前在HotSpot中仅仅是实验性的支持。

通过命令行选项启用的动态归档将通过消除试运行（上面的步骤1）来简化AppCDS的使用，并将有效，统一地支持内置类加载器和用户定义的类加载器。

此JEP的后续增强功能可以在应用程序的第一次运行期间执行自动存档生成。这将消除显式的存档创建步骤（上面的步骤2）。 从而让CDS / AppCDS的使用变得完全透明和自动。

该动态归档支持以下类型：

* 当成功映射两个存档时，支持静态基本存档（默认CDS存档）+动态存档
* 当无法映射动态存档时，仅静态基本存档
  
当前，动态存档要求将默认CDS存档用作基本存档。如果无法在运行时映射和使用基本层归档，则将自动禁用顶层动态归档。

怎么使用？

如果指定了-XX：ArchiveClassesAtExit选项，则当应用程序退出时，将动态创建共享档案。

动态生成的存档是在与运行的JDK映像打包在一起的默认系统存档的顶部创建的。 将为每个应用程序生成一个单独的顶层存档文件。 用户可以将动态档案名称的文件名指定为-XX：ArchiveClassesAtExit选项的参数。 例如，以下命令创建hello.jsa：

％bin / java -XX：ArchiveClassesAtExit = hello.jsa -cp hello.jar Hello

要使用此动态存档运行同一应用程序：
％bin / java -XX：SharedArchiveFile = hello.jsa -cp hello.jar Hello

## java.net.Socket和java.net.ServerSocket API的重新实现

java.net.Socket和java.net.ServerSocket API将所有套接字操作委托给java.net.SocketImpl，这是自JDK 1.0起已经存在的服务提供程序接口（SPI）机制。内置的实现称为“普通”实现，由非公开的PlainSocketImpl通过支持类SocketInputStream和SocketOutputStream实施。 

PlainSocketImpl由其他两个JDK内部实现扩展，这些实现支持通过SOCKS和HTTP代理服务器的连接。默认情况下，使用基于SOCKS的SocketImpl创建Socket和ServerSocket（有时是延迟的）。在ServerSocket的情况下，使用SOCKS实现是一个古怪的事情，可以追溯到对JDK 1.4中的代理服务器连接的实验性（并且自从删除以来）支持。

新的实现NioSocketImpl替代了PlainSocketImpl。它被开发为易于维护和调试。它与新I / O（NIO）实现共享相同的JDK内部基础结构，因此不需要自己的本机代码。它与现有的缓冲区高速缓存机制集成在一起，因此不需要将线程堆栈用于I / O。它使用java.util.concurrent锁而不是同步方法，以便将来可以在fibers上很好地使用。在JDK 11中，大多数NIO SocketChannel和其他SelectableChannel实现都是在实现相同目标的情况下重新实现的。

## ZGC的增强

ZGC当前不会uncommit并将内存返回给操作系统，即使该内存已经使用了很长时间也是如此。 对于所有类型的应用程序和环境，尤其是那些关注内存占用的应用程序和环境，此行为都不是最佳的。

HotSpot中的其他垃圾收集器（例如G1和Shenandoah）如今都提供了此功能，ZGC也将添加这个样的功能。

ZGC堆由一组称为ZPages的堆区域组成。每个ZPage与可变数量的已提交堆内存关联。当ZGC压缩堆时，ZPage被释放并插入到页面缓存ZPageCache中。页面缓存中的ZPage已准备好重用以满足新的堆分配，在这种情况下，它们将从缓存中删除。页面缓存对于性能至关重要，因为提交和取消提交内存是昂贵的操作。

页面缓存中的ZPages集合表示堆中未使用的部分，这些部分可能尚未提交并返回给操作系统。因此，可以通过简单地从页面缓存中清除一组精心选择的ZPage，然后取消提交与这些页面关联的内存来取消提交内存。页面缓存已经使ZPage保持最近使用（LRU）的顺序，并按大小（小，中和大）进行了分隔，因此退出ZPage和取消提交内存的机制相对简单。挑战在于设计策略，该策略决定何时该从缓存中逐出ZPage。

一个简单的策略是拥有一个超时或延迟值，该值指定ZPage在退出之前可以在页面缓存中停留多长时间。此超时将具有一些合理的默认值，并带有命令行选项来覆盖它。 Shenandoah GC使用这样的策略，默认值为5分钟，并使用命令行选项-XX：ShenandoahUncommitDelay = &lt;milliseconds>覆盖默认策略。

类似于上述政策的一项政策可能会相当有效。但是，也可以设想更复杂的策略，而不涉及添加新的命令行选项。例如，启发式算法根据GC频率或其他一些数据找到合适的超时值。我们最初将使用-XX：ZUncommitDelay = &lt;seconds>选项提供一个简单的超时策略，然后再提供一种更复杂的策略（如果找到）。

uncommit功能将默认启用。但是无论策略决定了什么，ZGC都不应uncommit内存，以使堆低于其最小大小（-Xms）。这意味着，如果以最小堆大小（-Xms）等于最大堆大小（-Xmx）启动JVM，则会有效禁用取消提交功能。也将提供选项-XX：-ZUncommit以显式禁用此功能。

最后，Linux / x64上的ZGC使用tmpfs或hugetlbfs文件来备份堆。Uncommitting这些文件使用的内存需要具有FALLOC_FL_PUNCH_HOLE支持的fallocate（2），该支持最早出现在Linux 3.5（tmpfs）和4.3（hugetlbfs）中。在较旧的Linux内核上运行时，ZGC应该继续像以前一样工作，但禁用了uncommit功能。

## 文本块（预览语言功能）

文本块是一个预览语言功能，可能会在后面的版本进行修改或者删除。

文本块是一种多行字符串文字，它避免了大多数转义序列的需要，以一种可预测的方式自动设置字符串的格式，并在需要时使开发人员可以控制格式。 这是JDK 13中的预览语言功能。

**HTML example**

传统方式：

~~~java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
~~~

文本块方式：

~~~java
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
~~~

**SQL example**

传统方式：

~~~java
String query = "SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`\n" +
               "WHERE `CITY` = 'INDIANAPOLIS'\n" +
               "ORDER BY `EMP_ID`, `LAST_NAME`;\n";
~~~

文本块方式：

~~~java
String query = """
               SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
               WHERE `CITY` = 'INDIANAPOLIS'
               ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
~~~

## switch表达式（预览语言功能）

扩展switch使其可以用作语句或表达式，从而使两种形式都可以使用：
传统的case ...：labels（需要break）或新case ...->labels（不需要break） ，还有另一个新语句，用于从switch表达式产生值。 这些更改将简化日常编码。 这是JDK 13中的预览语言功能。

原始写法：

~~~java
switch (day) {
    case MONDAY:
    case FRIDAY:
    case SUNDAY:
        System.out.println(6);
        break;
    case TUESDAY:
        System.out.println(7);
        break;
    case THURSDAY:
    case SATURDAY:
        System.out.println(8);
        break;
    case WEDNESDAY:
        System.out.println(9);
        break;
}
~~~

最新写法：

~~~java
switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> System.out.println(6);
    case TUESDAY                -> System.out.println(7);
    case THURSDAY, SATURDAY     -> System.out.println(8);
    case WEDNESDAY              -> System.out.println(9);
}
~~~

switch 表达式，用于返回值：

~~~java
int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
    case WEDNESDAY              -> 9;
};
~~~

