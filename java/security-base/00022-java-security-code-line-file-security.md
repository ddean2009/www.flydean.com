java安全编码指南之:文件和共享目录的安全性

# 简介

java程序是跨平台的，可以运行在windows也可以运行在linux。但是平台不同，平台中的文件权限也是不同的。windows大家经常使用，并且是可视化的权限管理，这里就不多讲了。

本文主要讲讲linux下面的文件的权限和安全性问题，并且探讨一下如何在java程序中考虑文件的安全性。

# linux下的文件基本权限

chmod是linux下面的权限管理命令，我们可以通过chmod来对文件的权限进行修改。

普通文件的权限有三种，rwx分别是读，写和执行。再加上三个用户分组：owner，group，other 我们可以很方便的使用三个0-7的数字来表示一个文件的权限。

举个例子，我们创建一个文件：

~~~shell
touch test.log
~~~

看一下默认的文件权限：

~~~shell
ll test.log
-rw-r--r--  1 flydean  wheel     0B  8 16 10:36 test.log
~~~

默认的文件权限是644，也就是说owner权限是读写，group权限是读，其他权限是读。

我们可以使用chmod命令对其进行修改，比如：

~~~shell
chmod 777 test.log
ll test.log
-rwxrwxrwx  1 flydean  wheel     0B  8 16 10:36 test.log
~~~

可以看出权限被修改成为777。

# linux文件的特殊权限

讲完普通权限，我们接下来讲一下linux文件中的特殊权限。

## Set UID 和 Set GID

考虑一个常用的修改密码的例子，修改密码调用的是/usr/bin/passwd,看下这个文件的权限：

~~~shell
ll /usr/bin/passwd
-rwsr-xr-x. 1 root root 27832 Jun 10  2014 /usr/bin/passwd
~~~

可以看到有个很奇怪的s权限。这个s是什么意思呢？s实际是x的变种，是一种特殊的可执行权限。

特殊在哪里呢？passwd是修改用户的密码，密码文件实际上是存放在 /etc/shadow中的。

我们看下/etc/shadow的权限：

~~~shell
ll /etc/shadow
---------- 1 root root 707 Jan  2  2020 /etc/shadow
~~~

/etc/shadow的owner是root，只有root才权限强行写入这个文件。

那么问题来了，普通用户调用passwd是怎么修改的/etc/shadow呢？

这就是s的妙用，s表示Set UID，简称为SUID，这个UID表示User的ID，而User表示这个程序（/usr/bin/passwd）的拥有者（root），那么我们在调用passwd的过程时候，就会暂时拥有passwd owner的权限，也就是root权限。

> 注意，SUID只能用在二进制文件中，它是对x权限的一个替换，并且SUID对目录是无效的。

同样的，我们也可以给group设置UID权限，也就是Set GID。

不同的是SGID可以使用在文件和目录两个地方。

用在文件中是和SUID一样的，用在目录中的意思是在该目录中所建的文件或目录的用户组都和该目录的用户组是一样的。

## Sticky Bit

Sticky Bit表示的是特殊的other权限，用t来表示。

/tmp目录就是一个Sticky Bit的例子：  drwxrwxrwt  。

SBit对目录的作用是：“在具有SBit的目录下，用户若在该目录下具有w及x权限，则当用户在该目录下建立文件或目录时，只有文件拥有者与root才有权力删除”

这个特性就是为了保护我们在共享目录下的文件不被别人删除。

## SUID/SGID/SBIT权限设置

怎么设置这些权限呢？

普通权限我们是用3个数字来表示的，我们可以在3个数字之前再加上一个数字表示SUID/SGID/SBIT权限。

和普通权限一样，我们用4来表示SUID，2表示SGID，1表示SBIT。

举个例子：

~~~shell
touch test
chmod 6755 test
ll test
-rwsr-sr-x 1 crawler crawler 0 Aug 16 11:43 test
~~~

> 注意，有时候我们会遇到大写的S与T的情况，这种情况出现在user、group以及others都没有x这个可执行的标志，所以大写的S和T表示为空。

# 文件隐藏属性

有些linux系统提供了chattr命令来设置文件隐藏属性。

我们看下chattr的使用：

~~~shell
Usage: chattr [-RVf] [-+=aAcCdDeijsStTu] [-v version] files...
~~~

参数：

+ ： 增加某个特殊参数，其他原本存在的参数不动。

- ： 删除某个特殊参数，其他原本存在的参数不动。

= ： 设置一定，且仅有后面接的参数

A ： 当设置了A属性时，这个文件（或目录）的存取时间atime（access）将不可被修改，可避免例如手提电脑有磁盘I/O错误的情况发生。

S ： 这个功能有点类似sync.就是将数据同步写入磁盘中。可以有效地避免数据流失。

a ： 设置a之后，这个文件将只能增加数据，而不能删除，只有root才能设置这个属性。

c ： 这个属性设置之后，将会自动将此文件“压缩”，在读取的时候将会自动解压缩，但在存储的时候，将会先进行压缩后再存储（对于大文件有用）。

d ： 当执行dump（备份）程序的时候，设置d属性将可使该文件（或目录）具有转储功效。

i ： i的作用很大。它可以让一个文件“不能被删除、改名、设置连接，也无法写入或新增数据”。对于系统安全性有相当大的帮助。

j ： 当使用ext3文件系统格式时，设置j属性将会使文件在写入时先记录在journal中。但是，当文件系统设置参数为data=journalled时，由于已经设置日志了，所以这个属性无效。

s ： 当文件设置了s参数时，它将会从这个硬盘空间完全删除。

u ： 与s相反，当使用u来设置文件时，则数据内容其实还存在磁盘中，可以用来还原删除。

# 特殊文件

linux中还有一些特殊的文件，比如链接文件和设备文件。

在处理链接文件的时候，我们需要注意判断链接文件的真实指向。

而设备文件我们需要注意不合理的授权访问。

# java中在共享目录中使用文件要注意的问题

共享目录中因为所有人都有操作文件的权限，所以，我们需要特别注意在java中共享目录中文件的操作。

根据java的规范， java.nio.channels.FileLock可以用来表示文件的锁定。

通常来讲，锁定有两种，一种是排他锁，一种是共享锁。

共享锁可防止其他同时运行的程序获取重叠的排他锁，但确实允许它们获取重叠的共享锁。排他锁可防止其他程序获取任一类型的重叠锁。

共享锁支持来自多个进程的并发读取访问；独占锁支持独占写访问。

但是，加锁是否真正的阻塞其他程序对该文件的访问，实际是取决于操作系统。

在使用中，我们需要对用户用户传入的文件进行一些必要的校验，比如是否是常规文件：

~~~java
String filename = /* Provided by user */;
Path path = new File(filename).toPath();
try {
  BasicFileAttributes attr = Files.readAttributes(
      path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);

  // Check
  if (!attr.isRegularFile()) {
    System.out.println("Not a regular file");
    return;
  }
  // Other necessary checks

  // Use
  try (InputStream in = Files.newInputStream(path)) {
    // Read file
  };
} catch (IOException x) {
  // Handle error
}
~~~

上面的例子中，我们通过获取File的属性，来判断这个属性是否regularFile,注意，我们在读取文件属性的时候，传入了一个LinkOption.NOFOLLOW_LINKS，表示的是不要follow链接。

虽然我们首先判断了file的权限，然后再对其进行操作，但是上面的例子还是会有问题的。因为存在时间差的问题，如果恶意用户在判断之后将文件替换成了恶意的链接文件，就会出现问题。

# 安全目录

为了保证用户的文件操作安全性，我们引入一个安全目录的概念，所谓安全目录就是目录除了用户本身和超级管理员之外，没有其他用户的写访问权限，并且给定文件的父目录不会被除了系统管理员之外的其他任何用户删除或重命名。

在下方的源码链接中，我提供了一个查看安全目录的class，大家可以自行查看。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！










