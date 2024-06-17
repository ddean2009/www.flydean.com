---
title: MoneyPrinterPlus:AI自动短视频生成工具,详细使用教程
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162108034.png
description: 详细介绍如何使用MoneyPrinterPlus:AI自动短视频生成工具,一键批量生成各类短视频。一键混剪短视频。
---

MoneyPrinterPlus是一款使用AI大模型技术,一键批量生成各类短视频,自动批量混剪短视频,自动把视频发布到抖音,快手,小红书,视频号上的轻松赚钱工具。

之前有出过一期基本的介绍，但是后台收到有些小伙伴说，不知道如何使用。

今天我将会手把手的详细介绍如何使用MoneyPrinterPlus快速生成短视频。



## 前提准备

1. 首先需要下载MoneyPrinterPlus工具。开源地址如下：https://github.com/ddean2009/MoneyPrinterPlus

2. 因为这个工具依赖于ffmpeg工具，所以你需要下载安装ffmpeg工具。

​	ffmpeg工具下载地址： https://ffmpeg.org/ 

​	安装完之后，需要把ffmpeg添加到系统路径中。

​	如果你在命令行中输入ffmepg得到类似下面的结果：

```bash
ffmpeg version 6.0 Copyright (c) 2000-2023 the FFmpeg developers
  built with Apple clang version 15.0.0 (clang-1500.0.40.1)
  configuration: --prefix=/opt/homebrew/Cellar/ffmpeg/6.0-with-options_4 --enable-shared --cc=clang --host-cflags= --host-ldflags='-Wl,-ld_classic' --enable-gpl --enable-libaom --enable-libdav1d --enable-libmp3lame --enable-libopus --enable-libsnappy --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --enable-demuxer=dash --enable-opencl --enable-audiotoolbox --enable-videotoolbox --enable-neon --disable-htmlpages --enable-libopenjpeg --enable-librsvg
```

​	那么恭喜你，ffmpeg工具安装好了。否则的话还是要检查一下ffmpeg工具是否安装好。

3. 系统依赖python环境，你需要包装至少安装python 3.10版本。

   同样的，你也需要把python添加到系统路径中。

   如果你在命令行中输入python得到下面的结果：

   ```bash
   Python 3.11.5 (main, Sep 11 2023, 08:31:25) [Clang 14.0.6 ] on darwin
   Type "help", "copyright", "credits" or "license" for more information.
   >>>
   ```

   那么恭喜你python环境安装好了。

## 安装项目

有了上面的前提准备工作，接下来就可以安装MoneyPrinterPlus工具了。 

运行下面的命令，将会把MoneyPrinterPlus拷贝到你的本地目录。

```bash
git clone https://github.com/ddean2009/MoneyPrinterPlus
```

进入MoneyPrinterPlus目录，运行安装必须的依赖：

```bash
pip install -r requirements.txt
```

然后运行：

```bash
streamlit run gui.py
```

会自动开启浏览器，进入MoneyPrinterPlus界面。

![image-20240616210820039](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162108034.png)

## 基本配置

首先我们点击左边的基本配置，这里需要配置一些我们需要用到的资源信息。

1. 资源库

资源库指的是我们从哪里获取视频或者图片信息，这里目前提供了两个资源提供方，分别是pexels和pixabay。

大家任意选择一个即可。

以pexels为例，我们登入pexels官网 https://www.pexels.com/zh-cn/ ，注册一个账号。

在图片和视频API里面，可以查看自己的api密钥。

![image-20240616211609578](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162116765.png)

查看自己的API密钥：

![image-20240616211719443](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162117120.png)



把这个API密钥记下来，拷贝到MoneyPrinterPlus的配置即可。

2. 音频库

音频库目前支持微软云和阿里云两个平台。后面会添加腾讯云。

因为有些小伙伴注册微软云不太方便，所以这里特意介绍一下阿里云怎么设置。

首先注册个阿里云账号，然后开通智能语音交互服务：

https://nls-portal.console.aliyun.com/

在全部项目---》点击创建项目，项目类型选择：语音识别 + 语音合成 + 语音分析即可。

然后你就会看到项目appkey，把这个appkey记录下来。后面需要用到。

![image-20240616212039562](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162120894.png)



另外，在项目总览部分，需要开通下面这几个服务：

分别是录音文件识别（极速版），语音合成，和长文本语音合成。

如果你要转换的文字内容不超过300个字的话，可以选择不开通长文本语音合成。 



![image-20240616212319682](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162123709.png)



这样阿里云的语音服务已经开启成功了。

切记录音文件识别（极速版）没有免费版本，一定要升级到商业版。

![image-20240617170539878](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406171705894.png)

接下来到账号的AccessKey管理中创建一个新的AccessKey。记住对应的AccessKey ID 和 AccessKey Secret。 

![image-20240616212456323](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162124097.png)

有了上面三个内容，就可以填写到MoneyPrinterPlus的配置里面了。



![image-20240616211913847](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162119522.png)

接下来就是大模型配置了。

目前支持Moonshot,openAI,Azure openAI,Baidu Qianfan, Baichuan,Tongyi Qwen, DeepSeek这些。

国内要用的话推荐Moonshot（最近发现moonshot不太稳定，大家可以考虑Baichuan或者DeepSeek）。 

同样的到Moonshot开发者平台上注册一个key：https://platform.moonshot.cn/ 填入对应的配置即可。



![image-20240616212642905](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162126626.png)

## AI短视频生成

有了基础配置之后，就可以点击左边的AI视频进入AI视频生成页面。

1. LLM视频文案生成

在视频主题区输入你需要生成的视频主题，然后点击生成视频文案。

程序会自动使用大模型生成对应的视频文案和视频文案关键字：

![image-20240616220713534](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162207402.png)

如果你对视频文案或者关键字不满意，可以手动进行修改。



2. 视频配音区

在视频配音区可以选择配音语言和对应的配音语言，目前支持100+配音语言。

还可以选择不同的配音语速，以支持不同使用场景。

![image-20240616220840076](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162208006.png)

如果你对配音不太确定，可以点击试听声音试听对应的配音语音。



3. 背景音乐

背景音乐放在项目下的bgmusic目录下面，你可以自行添加背景音乐文件到该文件夹下面。

![image-20240616221041774](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162210686.png)

可以选择是否开启背景音乐，和默认的背景音乐音量。



4. 视频配置区

视频配置区可以选择视频布局：竖屏，横屏或者方形。

可以选择视频帧率，视频的尺寸。

还可以选择每个视频片段的最小长度和最大长度。

最最重要的，还可以开启视频转场特效。目前支持30+视频转场特效。

![image-20240616221116997](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162211618.png)



5. 字幕配置

如果你需要字幕，那么可以点击开启字幕选项，可以设置字幕字体，字幕字体的大小和字幕颜色等。

如果你不知道怎么设置，选择默认即可。

![image-20240616221242812](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162212891.png)



6. 最后的视频生成

最后点击生成视频按钮即可生成视频。

页面会有相应的进度提醒。

![image-20240616221712173](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162217977.png)

最后生成的视频会展示在页面最下面，大家可以自行播放。



