---
title: MoneyPrinterPlus:AI自动短视频生成工具-腾讯云配置详解
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250924635.png
description: 详细介绍如何使用在MoneyPrinterPlus中配置使用腾讯云语音服务，实现AI自动短视频生成。
---

MoneyPrinterPlus可以使用大模型自动生成短视频，其中的语音合成和语音识别部分需要借助于一些第三发云厂商的语音服务。

很多小伙伴可能不知道应该如何配置，这里给大家提供一个详细的腾讯云语音服务的配置教程。

项目已开源，代码地址：https://github.com/ddean2009/MoneyPrinterPlus



## 腾讯云的具体配置

MoneyPrinterPlus在生成视频过程中需要进行一些语音合成和语音识别工作。

为了保证最后生成视频的质量，所以我们会用到一些云厂商提供的语音合成和语音识别服务。

这里腾讯云为例，来讲解如何进行腾讯云语音的配置。

### 获取腾讯云的access ID和Secret Key

首先我们到腾讯云的官网上去注册一个账号，在最上面的搜索框， 我们输入访问密钥，在下面的控制台入口，点击访问密钥，即可进入腾讯云的访问密钥控制台。



![image-20240625092440010](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250924635.png)



在API密钥管理部分，点击右边的新建密钥，即可生成APPID,SecretID和SecretKey这三个值。



![image-20240625092559083](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250926388.png)





大家把这三个数据保存下来。我们后面在MoneyPrinterPlus中会用到这三个值。



### 开通智能语音服务

同样的，我们在最上面的搜索框中输入语音合成，点击下方的控制台入口--》语音合成按钮，进入到语音合成界面。



![image-20240625092812098](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250928280.png)



进入语音合成界面之后，我们找到左边的语音合成资源包，点击领取免费资源包，这样可以领取免费的语音合成资源。



![image-20240625093019426](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250930029.png)

如果你的资源包用完了，没关系， 我们点击左下角的语音合成设置，开通后付费服务即可。



![image-20240625093133476](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250931618.png)



同样的，对于语音识别功能，我们同样可以领取免费的语音识别资源包。

如果资源包不够用的话，可以在语音识别设置中开通后付费服务。



![image-20240625093246850](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250932073.png)

这样，我们在腾讯云的语音合成和语音识别服务就开通好了。

### 在MoneyPrinterPlus中配置

启动我们的项目，在web页面点击最左边的基础配置，找到右边的配置音频库信息，选择Tencent。

填入我们之前保存的Access Key ID ,Access Key Secret和App Key。

回车后，这样我们的配置就保存了。

![image-20240625093454529](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406250935558.png)

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



