---
title: MoneyPrinterPlus:AI自动短视频生成工具,赚钱从来没有这么容易过
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121351010.png
description: MoneyPrinterPlus使用AI大模型技术,一键批量生成各类短视频。一键混剪短视频，批量生成短视频不是梦。自动把视频发布到抖音,快手,小红书,视频号上。
---






这是一个轻松赚钱的项目。

短视频时代，谁掌握了流量谁就掌握了Money!

所以给大家分享这个经过精心打造的MoneyPrinterPlus项目。

它可以：使用AI大模型技术,一键批量生成各类短视频。

它可以：一键混剪短视频，批量生成短视频不是梦。

它可以：自动把视频发布到抖音,快手,小红书,视频号上。

赚钱从来没有这么容易过! 

项目地址： https://github.com/ddean2009/MoneyPrinterPlus



# 实例展示

这个项目可以轻松实现各类视频的生成，横屏的是，竖屏的，正方形的。只有你想不到的没有它做不到的。

<table>
<thead>
<tr>
<th align="center">竖屏</th>
<th align="center">横屏</th>
<th align="center">正方形</th>
</tr>
</thead>
<tr>
<td align="center"><video  src="https://github.com/ddean2009/MoneyPrinterPlus/assets/13955545/d96e5e50-cfe7-4f55-a0db-75f3ac28b39f"></video></td>
<td align="center"><video  src="https://github.com/ddean2009/MoneyPrinterPlus/assets/13955545/714b122d-d857-4132-bdd3-9f07c9aa787b"></video></td>
<td align="center"><video  src="https://github.com/ddean2009/MoneyPrinterPlus/assets/13955545/2ec748c2-8145-4178-ae48-a3114290addd"></video></td>
</tr>
</table>

# 使用方法

## 环境要求

- Python 3.10+
- ffmpeg 6.0+
- LLM api key
- Azure语音api key

> 切记！！！！！ 一定要安装好ffmpeg,并把ffmpeg路径添加到环境变量中。

## 安装

1. 确保你有Python 3.10+的运行环境。如果是windows, 请确保安装了python路径已经添加到了PATH中。
2. 确保你有ffmpeg 6.0+的运行环境。如果是windows, 请确保安装了ffmpeg路径已经添加到了PATH中。没有安装ffmpeg的朋友，请通过 https://ffmpeg.org/ 来安装对应的版本。
3. 如果python和ffmpeg环境都有了。那么就可以通过pip安装依赖包了。

```bash
pip install -r requirements.txt
```

## 运行

使用下面命令运行程序:

```bash
streamlit run gui.py
```

在日志文件中可以看到程序运行的日志信息。

里面有浏览器的地址，可以通过浏览器打开这个地址来访问程序。

打开之后，你会看到下面的界面：

![image-20240612135131890](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121351010.png)



左侧目前有三项配置， 分别是基本配置，AI视频和混剪视频(开发中)。

### 基本配置

#### 1. 资源库

目前所有的资源都来自于pexels（www.pexels.com）, **Pexels** 是世界上著名的免费图片，视频素材网站。

大家需要到pexels上注册一个key来实现API调用。



>  后续会陆续添加其他资源库。如（pixabay.com，videvo.net，videezy.com 等）
>
>

#### 2. 音频库

目前文字转语音和语音识别功能使用的是Azure的cognitive-services服务。

大家需要到  https://speech.microsoft.com/portal  这里注册一个key。

Azure对新用户是1年免费的。费用也是比较便宜。

>  后续会添加本地语音识别大模型。但是文字转语音还是微软的服务最为优秀。

![image-20240612135624840](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121356171.png)

#### 3. LLM大模型

大模型区目前支持Moonshot,openAI和Azure openAI三种。

> 推荐使用Moonshot。
>
> 会陆续添加市面上其他流行的大模型。

![image-20240612140227679](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121402690.png)



Moonshot API获取地址： https://platform.moonshot.cn/



## AI视频

基本配置设置完毕之后。就可以进入到AI视频了。

### 生成视频文案

首先，我们给一个关键词，然后用大模型生成视频文案：



![image-20240612140441201](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121404609.png)



可以选择视频的文案语言，视频时长。

如果大家对视频文案和关键词不满意的话，可以手动修改。

### 视频配音和背景音乐

![image-20240612140547283](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121405554.png)

可以选择配音的语言和配音的语音。

还支持配音语速调节。

> 后续会支持语音试听功能。

背景音乐放在项目的bgmusic文件夹中。

目前里面只有两个背景音乐。大家可以自行添加自己需要的背景应用。

### 视频配置

视频配置区，大家可以选择视频的布局，视频帧率，视频尺寸。

视频片段最小长度和最大长度。

还可以开启视频转场效果。目前支持30+转场效果。

![image-20240612140830765](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121408177.png)

> 后续会添加使用本地视频资源功能。

### 字幕配置

字幕文件位于项目根目录的fonts文件夹。

目前支持宋体和苹方两个字体集合。

![image-20240612141000542](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121410773.png)

可以选择字幕位置，字幕颜色，字幕边框颜色和字幕边框宽度。

### 生成视频

最后，就可以点击生成视频生成视频了。

会在页面上列出具体的步骤名称和进度。

![image-20240612141446057](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121414629.png)

生成视频完成后，视频会显示在最下方，大家直接可以播放观看效果。

![image-20240612141532280](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202406121415214.png)



# 未完待续

当然，现在这个项目还在继续开发阶段，欢迎大家提出宝贵建议、

