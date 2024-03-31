---
slug: /06-jetbrains-fleet
---

# 9. JetBrains又出神器啦!Fleet,体验飞一般的感觉

# 简介

java开发的同学可能对于JetBrains这家公司并不陌生，因为JetBrains号称拥有世界上最好的JAVA开发工具IDEA。确实IDEA非常好用，它满足了一个java开发者所有的梦想。

当然JetBrains还提供了其他语言的开发神器，PyCharm,PhpStrom,WebStorm等等。只要跟开发工作有关的，都能在JetBrains的全家桶中找到。

这么好用的神器自然是价格不菲，但是JetBrains特意为学生党推出了免费的licence版本，非常的人性化。

现在JetBrains又准备推出一款编辑器Fleet，这款编辑器到底是做什么的呢？它有什么优点呢？一起来看看吧。

# 从eclipse到Fleet

还记得最开始接触java的时候，还是从JAVA的命令行开始的。编写完代码之后，首先用javac命令将代码编译成字节码，然后再使用java命令去运行。虽然java是世界上第二好用的语言，但是这种手动编译运行的方式实在让人头痛。

后来有一天，听同学介绍，发现了eclipse这个工具。当时实在是惊为天人！它是如此的强大，颠覆了我对IDE的认知。

> 当然，我始终认为IDE做的最好的是微软出的Visual Studio,简直是包罗万象，可惜那时候Visual Studio只支持微软自己的C#和.net平台，无奈只好放弃。

eclipse又好用又免费，加上品类繁多的各种插件，DIY一个符合自己口味的IDE不在话下。

所以那时候在开发之余的另外一个爱好就是反复安装eclipse的各种插件，体验不一样的乐趣。

后来在工作中，一开始也是使用eclipse，不过eclipse作为一个纯开源项目，也暴露出来了它的短板，就是第三方插件比较混乱，在使用中往往有这样那样的bug。

然后有同事给安利了IDEA，说实话最开始的IDEA是很丑的，并且IDEA对项目的组织方式更加松散，更像是对一个个文件的管理而不是项目，所以我仍然坚持使用eclipse。

那么，是什么让我产生了从eclipse到IDEA的转换呢？

记得，那是一个夏天，天还还很蓝。我像往常一样点进eclipse的官网，看一下是否有最新的版本可以升级。

本来没报什么希望，结果还真的有，这个版本就是eclipse che,居然是一个web版的开发工具，号称是下一代eclipse。

难道eclipse以后就只能在web端使用了吗？浏览器的体验有没有本地开发工具这样丝滑呢？

虽然我很担心，但是抱着试一试的态度，还是按照官方的文档，尝试安装eclipse che。

安装过程很痛苦，使用过程更加痛苦。不知道是我机子系统的问题还是它的文档没有写明白，我硬是没有能够用eclipse che来开发一个项目。

eclipse che本意是将开发环境搬到云上，奈何那时候的技术和思想有点太超前了,于是成功把我劝退了。

接下来就从eclipse切换到IDEA，进行了多年的开发。后面再也没有去关注过eclipse和eclipse che的发展。

在写这篇文章的时候，我特意去看了下，原来Eclipse本地的IDE还在，它的最新版本是2021‑12，eclipse che也发展到了7.0版本，并且开始支持Kubernetes-Native。

但是，一切都回不到过去了。

既然eclipse已经过去了，我们再聊一下IDEA。

说实话，作为一款付费的软件，IDEA在使用上的确比eclipse强。最好用的java开发IDE不是白吹的。

当然，为了支持IDEA这么强大的特性，就需要占用大量的系统内存。IDEA动不动就1G-2G完全不成问题。

那么有没有轻量级的开发工具呢？当然有。

所谓开发工具，就是支持代码高亮，编译代码这些功能的工具，记事本之类的这里就不提了。

那时候有两个工具可以使用，一个是atom，一个是微软的vs code。

两者都是轻量级的开发工具，都支持插件的扩展。我也都用了，最后还是选择了微软的vs code。虽然没有具体进行比较，但是感觉微软的更加稳定，功能性方面更好。

既然已经有了微软vscode这样的强大又简洁的轻量级开发工具，那么Fleet凭什么认为大家会选择它呢？

这是一个好问题。我们细细道来。

# Fleet的特性

Fleet最大的优势就是背靠jetbrains这颗大树，有了IDEA等一众开发工具的加持，大家很难不相信Fleet的品质。

换用jetbrains的话来说，他们花了20年的知识和经验来编写开发工具，并且Fleet底层使用的是IntelliJ的代码处理引擎,所以Fleet是足够可信的。

当然，有了保证还是不够的，我们需要知道Fleet到底有那些特性。

![](https://img-blog.csdnimg.cn/24d08b6b2c664eb6b59623223c540a53.png)

先看下Fleet的主界面。非常的简洁漂亮。自带了git和history。

Fleet支持自动完成,重构，跳转，debug等所有IDE应该支持的特性。

目前Fleet支持的语言有JAVA，kotlin,python,go,javaScript,Rust,TypeScript和JSON。其他的语言如PHP，C++,C#,HTML正在开发中。

看到这里，我们可能还有疑问，这些特性好像其他的轻量级IDE都有呀，那么Fleet的特色在哪里呢？

分布式！没错，是分布式！

Fleet的架构是分布式的，Fleet 并不关心您的项目是在本地、在容器中还是在千里之外的另一个国家。 通过提供虚拟化文件系统，Fleet 可以同样出色地处理本地和远程项目。

Fleet有三种工作模式，分别是Editor mode,Smart mode,Distributed mode.

对于editor mode来说，一切都是本地的，所以它提供的功能和特性比较有限：

![](https://img-blog.csdnimg.cn/a9dc3e79b0e9424eb0829c2ad9db8508.png)

在Smart mode中,可以提供一些高级的特性，比如项目和上下文感知代码完成、定义和用法的导航、动态代码质量检查和快速修复等。这些特性不是一个轻量级的Fleet能够完成的，所以需要额外的Language Servers和Code engine来处理，如下图所示：

![](https://img-blog.csdnimg.cn/fed3af101c4849b1befe6bedf1b8aff6.png)


什么叫做Distributed mode呢？就是把这些Language Servers和Code engine统一放到云上或者docker容器中，本地的Fleet只作为客户端和远程服务器进行连接即可：

![](https://img-blog.csdnimg.cn/74750959a7924c42a7216f60ac63943f.png)

这样的分布式也同时可以实现多用户协同合作的功能。

个人感觉，Fleet可能是eclipse che的高级版本。敬请期待。

# JetBrains Space

另外，jetBrains还把Fleet和JetBrains Space进行结合。

你可以把JetBrains Space看做是一个远程的工作环境，可以免去了本地搭建工作环境的烦恼。

# 总结

Fleet这么好用，那么怎么下载呢？很抱歉，Fleet暂时无法下载，你必须到Fleet的官网上去申请，听说名额有限，赶紧行动起来吧。


