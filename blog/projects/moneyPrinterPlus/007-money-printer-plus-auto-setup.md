---
title: 福利来了！MoneyPrinterPlus可以自动配置环境和自动运行了
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407041032551.png
description: 给小白用户提供一个方便的环境设置脚本和自动运行脚本，让不懂程序的人也能用上MoneyPrinterPlus
---

之前开源了MoneyPrinterPlus，可以实现批量混剪视频，一键生成视频和自动发布视频的功能。



但是经常会看到小伙伴在安装过程中遇到很多问题。所以这篇文章的目的就是告诉大家怎么使用MoneyPrinterPlus的自动环境配置工具和自动启动工具。



让小白用户也能用上这么好的AI工具。



都是满满的福利。



## 软件准备

当然，前提条件就是你需要下载MoneyPrinterPlus软件啦。 

下载地址： https://github.com/ddean2009/MoneyPrinterPlus

用得好的朋友，不妨给个star支持一下。



## 自动环境配置



### 前提条件

最新的软件里面有自动环境配置脚本。但是，我们需要两个前提。

第一，就是要下载python环境。

我们需要python 3.10+版本来保证程序的运行。



如果是windows，那么可以自行从python的官网下载对应的版本。解压到本地。

然后把python的路径添加到系统的path中去。



如果是mac，直接执行 brew install python@3.11

然后把python3.11链接到python命令：



```bash
ln -s /opt/homebrew/bin/python3.11  /opt/homebrew/bin/python
```



第二，我们需要安装ffmpeg。



如果你是windows，那么直接从ffmpeg的网站下载6.0版本解压缩到本地。 

然后把ffmpeg的路径添加到系统的path中去。



如果是mac， 直接执行 brew install ffmpeg即可。



### 运行自动环境设置脚本

有了前面的前提条件之后，现在就可以运行自动环境设置脚本了。



windows下直接双击setup.bat。

mac下，进入项目根目录，执行： sh setup.sh



你可以看到类似的下面的内容：

```txt
Switching to virtual Python environment.
this will take some time,please wait.....
python3.10 -m venv /Users/wayne/data/git/projects/hunjian/venv
Activate the virtual environment...
setup python dependencies...
Python version is 3.10.13 (main, Aug 24 2023, 12:59:26) [Clang 15.0.0 (clang-1500.0.40.1)]
ffmpeg版本为6.0，满足要求。
Installing python dependencies. This could take a few minutes as it downloads files.
If this operation ever runs too long, you can rerun this script in verbose mode to check.
Package version found: pip 23.2.1
Installing modules from requirements.txt...
```

这样，就是在安装对应的依赖环境了。

安装依赖环境可能有点慢，大家可以喝杯咖啡等待一下。

当你看到下面一段话的时候，就说明环境安装好了，接下来可以开始运行了。

```txt
Setup finished! Run sh start.sh to start.
```

## 自动启动脚本

自动启动脚本的运行前提是你之前使用了自动环境设置脚本来设置环境。



windows环境下，直接双击start.bat即可启动。



mac环境下，在项目根目录下面执行sh start.sh即可。



浏览器会自动打开MoneyPrinterPlus的首页。

![image-20240628153020140](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407041032551.png)



开始你的MoneyPrinterPlus之旅吧。













