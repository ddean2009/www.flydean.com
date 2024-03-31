---
slug: /07-git-largefile
---

# 10. Github又悄悄升级了,这次的变化是大文件的存储方式

# 简介

github是大家常用的代码管理工具，也被戏称为世界上最大的程序员交友网站，它的每次升级都会影响很多用户。在我的个人github网站上，之前在做JAVA NIO demo的时候上传了一个自制的大文件，最近对这个项目进行了一些修改，但是却上传不上github网站了，查看报错的原因，就是说项目中有一个大文件无法上传，现在github提供了一个叫做Git Large File Storage (LFS)的工具来替换github中的大文件。

那么什么是LFS，我们应该怎么使用LFS呢？一起来看看吧。

# LFS和它的安装

LFS的全称是Git Large File Storage,可以将库中的大文件存储在远程服务器比如GitHub.com或者GitHub Enterprise上，在库中保存的是指向这些大文件的链接。

LFS安装起来比较简单，在mac上可以使用下面的brew命令：

```
brew install git-lfs
```

安装完毕之后，需要把LFS和你的git账号关联起来：

```
git lfs install
```

> 注意lfs需要git版本>= 1.8.2

接下来我们就可以愉快的使用LFS了。

# LFS的使用

为了模拟github上的大文件，我们可以在github上创建一个新的repository,然后执行下面的命令添加对应的内容：

```
git init .
echo Hello World > README.md
git add README.md
git commit -m "Initial commit"
```

上面的代码提交到github上肯定没有问题。

为了测试大文件，我们可以使用dd命令创建一个256M的大文件如下：

```
dd if=/dev/urandom of=test.bin bs=1024 count=262144
```

在最新版本的github中，这个文件肯定是上传不上去的，那么我们应该怎么使用LFS呢？

lfs提供了下面的help命令：

```
$ git lfs help <command>
$ git lfs <command> -h
```

这里我们需要使用的是git lfs track命令如下：

```
git lfs track '*.bin'
```

上面的例子我们使用的是通配符来匹配所有以bin结尾的文件。

当然，如果你想匹配上面的test.bin文件，也可以直接这样使用：

```
git lfs track 'test.bin'
```

这个命令的目的就是使用lfs来跟踪这些bin文件。你也可以使用track命令来列出所有被lfs的跟踪路径：

```
git lfs track

Listing tracked paths
    *.bin (.gitattributes)
```

我们可以使用下面的命令来查看lsf具体的跟踪文件：

```
git lfs ls-files
```

但是因为你还没有commit上面创建的bin文件，所以这里是看不到的。

这些lfs的trace信息是存储在项目根目录下的.gitattributes中的。

我们需要一并提交这个.gitattributes文件，以便所有checkout这个库的用户都可以知晓这个lfs服务。

当我们把所有的文件都提交之后，再使用`git lfs ls-files`命令，可以看到类似下面的内容：

```
d05241dd24b * test.bin
```

说明这个文件已经添加到了lfs中。

# 从LFS中删除文件


上面我们讲解了如何将文件添加到LFS中进行跟踪，如果我们不想使用LFS而是使用传统的git来管理文件该怎么办呢？

lfs提供了untrack的命令，它是和track相反的命令如下：

```
git lfs untrack "*file-type"
```

在untrack之后，还要记得从git cache中删除这个文件：

```
git rm --cached "*file-type"
```

然后重新添加这个文件到git，commit然后提交即可：

```
git add "*file-type"
git commit -m "restore "*file-type" to git from lfs"
```

# 从LFS中拉取代码

从LFS中拉取代码和传统的普通的git拉取代码是一致的，直接使用git clone命令即可：

```
git clone https://github.com/username/test_repo.git destination_dir
```

# 转换历史数据到LFS

有时候我们的文件已经在repository中了，比如很多历史提交的文件，我们想要将其转换称为LFS存储该怎么办呢？

lfs提供了一个migrate命令，用来进行文件的转存。

```
git lfs migrate
```

要想使用migrate命令，需要安装 Git LFS v2.2.1版本以上。

比如我们想要migrate所有的bin文件，可以这样写：

```
git lfs migrate import --include="*.bin"
```

上面的命令只针对的是本地的branch，如果要migrate远程的branch，可以添加一个--include-ref参数，如下所示：

```
git lfs migrate import --include="*.bin" --include-ref=refs/heads/master 
```

然后强制提交库即可：

```
git push --force
```

最后，上面的命令虽然将历史的git objects 转换成了 lfs objects，但是本地的.git文件中并没有变化，所以还需要执行下面的命令对.git文件夹进行清理：

```
git reflog expire --expire-unreachable=now --all
git gc --prune=now
```

# 总结

如果你没有使用大文件，那么你不会用到lfs，如果你项目中有大文件，那么就参考这篇文章吧。






