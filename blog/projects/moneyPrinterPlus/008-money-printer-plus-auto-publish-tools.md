---
title: 重磅来袭!MoneyPrinterPlus一键发布短视频到视频号,抖音,快手,小红书上线了
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407101042103.png
description: 一键发布短视频到视频号,抖音,快手,小红书，MoneyPrinterPlus解放你的双手。

---

MoneyPrinterPlus开源有一段时间了，已经实现了批量短视频混剪，一键生成短视频等功能。



有些小伙伴说了，我批量生成的短视频能不能一键上传到视频号,抖音,快手,小红书这些视频平台呢？答案是必须可以。



下面上干货。



## 软件准备

当然，前提条件就是你需要下载MoneyPrinterPlus软件啦。 

下载地址： https://github.com/ddean2009/MoneyPrinterPlus

用得好的朋友，不妨给个star支持一下。批量上传功能在v3.0版本已经支持了。



## 工作原理

自动发布工具的本质上是基于selenium这个自动化框架实现的。

通过模拟人工的点击操作，可以完成绝大多数需要人手工才能完成的工作。解放大家的双手。

另外这个自动化的实现方式有两种，一种是在运行程序的过程中启动一个浏览器。另外一种是依附到现有的浏览器上来操作现有浏览器的页面。

本工具选择的是依附到现有的浏览器上。

主要是因为有些视频平台需要用手机扫码二维码才能登录。所以在程序中很难模拟这种登录的过程。

## 前提条件

目前自动发布支持chrome和firfox两种浏览器。大家根据需要自行选择一种即可。

### 1. chrome配置

现在的主流浏览器肯定是chrome无疑了。所以我们首先聊一聊如何实现对chrome浏览器的支持。

1. 首先你需要下载安装[Chrome](https://www.google.com/chrome/)，记住你的版本号，你可以从chrome官网上下载chrome，也可以从这个页面去下载 [ChromeDriver下载页面](https://googlechromelabs.github.io/chrome-for-testing/)。

2. 你需要从[ChromeDriver下载页面](https://googlechromelabs.github.io/chrome-for-testing/)下载与你的Chrome浏览器版本相对应的ChromeDriver。确保你下载的是与你的操作系统和Chrome版本相匹配的版本。

下载完毕之后，把chromeDriver解压到本地目录，目录的路径最好不要带中文。不能保证能正常运行。

3. chrome 以debug模式启动

如果是mac电脑，那么可以先给chrome设置一个alias

```bash
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
```

以debug模式启动chrome。

```bash
chrome --remote-debugging-port=9222
```

如果你是windows，可以在chrome的桌面快捷方式，右键目标中添加：

```txt
--remote-debugging-port=9222
```



![image-20240710103643535](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407101036374.png)

然后双击即可以debug模式打开chrome。

### 2. firefox配置

除了chrome之外，用的最多的应该就是firefox了。

所以我们也提供了对firefox的支持。



要想使用firefox，你需要下面几步：

1. 下载并安装 [Firefox](https://www.mozilla.org/en-US/firefox/new/)。

2. 下载[**geckodriver**](https://github.com/mozilla/geckodriver/releases) 驱动.下载与你的Firefox浏览器版本相对应的geckodriver。确保你下载的是与你的操作系统和Firefox版本相匹配的版本。

   下载完毕之后，把geckodriver解压到本地目录，目录的路径最好不要带中文。不能保证能正常运行。

3. 以debug模式启动firefox:

   和chrome类似，我们在firefox的启动命令之后加上： ` -marionette -start-debugger-server 2828`

![image-20240504120509315](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405041205192.png)

> 注意，这里的端口一定要是2828,不能自定义。

这时候你如果打开firefox,就会看到导航栏变成了红色，表示你已经启动了远程调试模式。

![image-20240504120607831](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405041206516.png)

输入`about:config`

可以看到marionette.port的端口就是2828。



## 开始使用

如果你是刚刚下载MoneyPrinterPlus, 那么推荐你使用傻瓜方式安装运行。

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

### 运行自动启动脚本

自动启动脚本的运行前提是你之前使用了自动环境设置脚本来设置环境。



windows环境下，直接双击start.bat即可启动。



mac环境下，在项目根目录下面执行sh start.sh即可。



浏览器会自动打开MoneyPrinterPlus的首页。

![image-20240710104233733](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407101042103.png)

点击左边的视频自动发布工具，可以看到视频自动发布工具的页面。

你可以选择驱动类型。chrome还是firefox。

驱动位置就是之前下载的chromedirver或者geckodriver的位置。

视频内容所在目录，就是你想要发布的视频目录。

当你修改视频目录之后，会自动列出视频目录里面的视频文件和文本文件。

其中视频文件就是你要发布的视频内容。

文本文件是什么呢？

文本文件是和视频配套的文字内容。

举个例子， 我想要发布一个关于唐诗的视频到网站上，那么对应的文本文件内容如下：



```txt
王维：酬郭给事
洞门高阁霭馀辉，桃李阴阴柳絮飞。
禁里疏钟官舍晚，省中啼鸟吏人稀。
晨摇玉佩趋金殿，夕奉天书拜琐闱。
强欲从君无那老，将因卧病解朝衣。
```

> 大家记住，第一行一定是视频的标题。
>
> 其他行的内容，大家自由决定。

然后我们看下面的页面：

![image-20240710104725552](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407101047908.png)

视频网站配置应该很直白了，上过幼儿园的朋友应该都能懂。

标题前缀：如果你需要额外给视频标题添加一些前缀，可以在这里设置。

合集名称：有些视频网站需要选择合集。这里就是合集的名字。（程序不会帮你创建合集，你需要自己提前在网站上创建。）

视频标签：很好理解了，就是标签，用空格分割。

快手还有一个额外的领域配置。

你可以选择是否开启抖音，快手，视频号或者小红书。

### 环境检测

接下来就可以准备发布视频了。

但是在发布之前，你可以点一下环境检测。

如果自动打开了我的主页，那么就说明你的环境配置是没问题的。接下来就可以发布视频了。

### 发布视频

因为所有的视频网站都需要登录。所以在点击发布视频按钮之前，你需要打开对应的网站，登录你的账号先。

如果你的账号都登录完毕了，点击发布视频按钮吧。

开启你的自由之旅。

运行的界面大概如下：

![image-20240710105336580](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407101053683.png)



## 总结

好了，自动发布功能就讲到这里。开源不易，大家点个赞吧。

