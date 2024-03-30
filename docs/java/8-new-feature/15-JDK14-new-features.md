---
slug: /JDK14-new-features
---

# 15. 一览为快，JDK14的新特性

虽然JDK13在今年的9月17号才发布，但是丝毫不会影响到下一个版本JDK14的开发工作。听说官方定的新功能马上就要官宣了，我们这里不妨来提前推断一下。

在9月17号的发布中，Oracle提到了switch表达式的功能预计会在JDK14中最终确定。在我的之前的文章中我已经提到了，在JDK12和JDK13中switch表达式都是作为一个实验性的语法来推出的，经过三个版本的迭代，switch表达式的正式推出该是顺理成章的事情了。

同时也会包含一个JDK Enhancement Proposal (JEP)的更新：java的mapped byte buffers 将会支持non-volatile memory（NVM）。 这样将会允许FileChannel创建出指向NVM的MappedByteBuffer实例。

NVM使程序员可以跨程序来构建和更新程序状态，而不会产生输入和输出操作通常需要的大量复制或转移成本。 这对于交易程序而言尤其重要。 因此，此JEP的主要目标是确保客户端可以连贯且有效地从Java程序访问和更新NVM。

另外一个目标就是使用JDK内部API Unsafe来实现这个功能，这样可以提供给除了MappedByteBuffer以外的其他想提交到NVM的类使用。它还提供了使用现有API来追踪在NVM映射上的缓冲区的功能，从而进行监督和管理。

按照Oracle的计划，经过6个月的发布周期，JDK14将会在2020年的三月份发布。 JDK14将是一个non-LTS（非长期支持版本），只会支持6个月。

如果你感兴趣，可以从https://jdk.java.net/14/ 上下载其预览版本。 

have fun !

