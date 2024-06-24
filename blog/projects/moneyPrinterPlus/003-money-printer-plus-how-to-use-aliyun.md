---
title: MoneyPrinterPlus:AI自动短视频生成工具-阿里云配置详解
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201658230.png
description: 详细介绍如何使用在MoneyPrinterPlus中配置使用阿里云语音服务，实现AI自动短视频生成。
---

MoneyPrinterPlus是一个很好的自动短视频生成工具，虽然是一个非常好的工具，但是有些小伙伴可能不太清楚具体应该如何配置才能让它跑起来。

因为MoneyPrinterPlus依赖一些具体的配置信息，所以还是很有必要给大家讲解清楚如何进行配置。

项目已开源，代码地址：https://github.com/ddean2009/MoneyPrinterPlus



## 阿里云的具体配置

MoneyPrinterPlus在生成视频过程中需要进行一些语音合成和语音识别工作。

为了保证最后生成视频的质量，所以我们会用到一些云厂商提供的语音合成和语音识别服务。

这里以阿里云为例，来讲解如何进行阿里云语音的配置。

### 获取阿里云的access key和Secret

首先我们到阿里云的官网上去注册一个账号，在右上角主账号的下方，会有一个accessKey管理。



![image-20240616212456323](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162124097.png)

点击这个accesskey管理，会进入一个管理页面：



![image-20240620164930498](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201649359.png)





点击创建accessKey就创建好了accesskey和Secret。



大家把这两个数据保存下来。我们后面在MoneyPrinterPlus中会用到这两个值。



### 开通智能语音服务

然后我们通过下面的链接进入到阿里云的智能语音服务页面：

https://nls-portal.console.aliyun.com/

如果没有开通的话，可以点击开通。

现在里面大部分的服务都是免费试用的。

当然，如果收费的话应该也不是很贵。

在全部项目中，点击创建项目：

![image-20240620165258320](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201653134.png)

创建一个新的项目，记住这个项目的appkey。我们在后面的配置中需要用到这个值。



接下来点击左边的服务管理与开通，在语音识别tab中选择录音文件识别（极速版），右边操作---》升级为商用版。

因为录音文件识别（极速版）没有免费试用版本，所以这里一定要升级成商用版本。否则后面使用可能会报错。



![image-20240620165407063](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201654194.png)

在语音合成tab页面，需要开通语音合成和长文本语音合成功能。

因为阿里云基础的语音合成服务只能合成小于300字的语音，如果大于300字，则需要用到长文本语音合成服务。

![image-20240620165541480](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201655047.png)

上面三项一定需要开通。切记切记。



### 在MoneyPrinterPlus中配置

启动我们的项目，在web页面点击最左边的基础配置，找到右边的配置音频库信息，选择Ali。

填入我们之前保存的Access Key ID ,Access Key Secret和App Key。

回车后，这样我们的配置就保存了。

![image-20240620165818526](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406201658230.png)

## 其他的配置

### 资源库

资源库指的是我们从哪里获取视频或者图片信息，这里目前提供了两个资源提供方，分别是pexels和pixabay。

大家任意选择一个即可。

以pexels为例，我们登入pexels官网 https://www.pexels.com/zh-cn/ ，注册一个账号。

在图片和视频API里面，可以查看自己的api密钥。

![image-20240616211609578](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162116765.png)

查看自己的API密钥：

![image-20240616211719443](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406162117120.png)



把这个API密钥记下来，拷贝到MoneyPrinterPlus的配置即可。

![image-20240620170029227](/Users/wayne/Library/Application Support/typora-user-images/image-20240620170029227.png)

### 大模型配置

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



