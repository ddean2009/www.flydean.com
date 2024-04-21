---

slug: tools/greate-picgo
title: 来了，永久免费的图床服务
authors: flydean
tags: [图床, picgo]
keywords: [图床, picgo, 免费图床,vscode,typora,永久免费，markdown]
description: 永久免费的图床服务，使用picgo和smms服务
image: https://mmbiz.qpic.cn/mmbiz_png/cgBQ3XFy0lp2sFjhDIhzdCv2Bdy9NNbMHtPziczLCEgr9a4wGGEGkIO7CpUtwzRD0XHPdAic2xd8J0Gn59blHotg/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1
---



前前后后也写了很多博客和文章了，作为一个资深的markdown用户，我是非常喜欢markdown的简洁语法，可以让我在不太关注于文字格式的前提下，获得比较好的阅读和排版体验。



但是用markdown语法也有一个坏处，就是在向markdown中使用图片的时候就有点麻烦了。



如果你使用的是vscode或者typora,在使用图片的时候只有两种方法，第一就是用外链图片，你需要先找到这个图片的url地址，然后再使用markdown语法把这个图片嵌入。



第二种方法就是把图片拷贝到本地，然后在markdown中做本地图片的引用。本地图片引用虽然比较简单，但是你这篇文章就没办法在各个公共平台进行传播了。



之前我都是用的csdn的图床服务，但是每次都需要手动获取图片的url，非常的麻烦。



那么有没有什么好的办法可以简单，快速的在markdown中使用图床服务呢？



今天给大家介绍一个非常强大的软件picgo和对应的免费图床服务。

<!-- truncate -->

## PICGO

Picgo是一个用于快速上传图片并获取图片 URL 链接的工具。 



它的下载地址在这里：`https://github.com/Molunerfinn/PicGo`



它的界面大概是长这个样子:

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210858573.png" alt="图片" style="zoom:33%;" />

可以分为上传区，相册，图床设置，PicGO设置和插件设置这几个部分。



在上传区，我们可以通过拖拽图片，或者剪贴板拷贝和URL拷贝的方式来上传图片。



图片上传好之后，会自动把对应的格式拷贝到系统的剪贴板上，比如你选择了markdown格式，那么等图片上传完毕之后，直接在对应的markdown文本中粘贴即可。



当然，你也可以选择html或者其他的格式。



相册就是之前你上传过的图片列表。



先看下图床，在PocGo设置中，目前支持腾讯云，SMMS，七牛云，又拍云，阿里云，gitlab和Imgur这几种图床：

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210858121.png" alt="图片" style="zoom:33%;" />



如果你想稳定的话，那么就选腾讯云或者阿里云。其实价格也不贵。



如果你想免费的话，就选择SMMS。每个账号有5G的免费额度，还是很不错的，一般来说对于个人的博客图片完全够了。如果空间满了，换个账号再注册一个。



关于SMMS的注册和使用，我们之后再说。



### 插件

现在来介绍一下PicGo的高级服务：插件。



你可以在这个地址`https://github.com/PicGo/Awesome-PicGo` 找到很多PicGo的插件，可以扩展很多功能。



这里要介绍的是一个图片压缩插件：叫做 picgo-plugin-compress:`https://github.com/JuZiSang/picgo-plugin-compress`。



你在PicGO的插件设置部分，输入compress，点击搜索就可以找到它了：



<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210858074.png" alt="图片" style="zoom:33%;" />

点击安装之后，就可以对这个插件进行配置了。

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210858869.png" alt="图片" style="zoom:33%;" />

这个插件目前支持三种压缩方式。



其中tinypng 是无损压缩，但是需要上传到tinypng。



imagemin压缩过程不需要经过网络，但是图片会有损耗。



image2webp 本地有损压缩，支持 GIF 格式有损压缩。但是有些图床不支持 webp 图片格式，会上传失败。



这里我们就选imagemin就行了。 



选择压缩方式之后，下次我们再上传图片的时候，就可以开启压缩了。



在PicGo的日志里面，我们可以看到下面的日志：



```
2024-04-04 19:39:36 [PicGo INFO] 图片信息:{"fileName":"image-20240404193936680.png","extname":".png"} 
2024-04-04 19:39:36 [PicGo INFO] imagemin 压缩开始 
2024-04-04 19:39:36 [PicGo INFO] 获取本地图片 
2024-04-04 19:39:37 [PicGo INFO] imagemin 压缩完成 
```

好了PicGo软件就介绍到这里。



## 免费的图床服务

谈到免费，大家肯定会想到最著名的github。没错，你可以在github上上传任何东西，他也是一个很好的免费图床服务器。但是由于一些不可描述的原因，基本上在国内很难使用上github的服务，如果你把图片放在github上，很有可能会导致别人看不到这个图片。



当然，现在付费的腾讯云或者阿里云其实也不贵。



如果一定要免费的话，我们可以选择smms图床服务。



smms的官方网站是https://sm.ms/ , 如果内地用户访问不了的话，它也提供了一个额外的网站，叫做： https://smms.app/。 



注册之后，在User--》DashBoard中,可以找到API Token。

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859405.png" alt="图片" style="zoom:33%;" />





把它填到PicGO的图床设置里面即可：

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859755.png" alt="图片" style="zoom:33%;" />

## 在Vscode中使用PicGo

有了PicGo，我们可以在vscode中进行配置，然后实现拷贝图像自动上传到图床的功能。

首先在vscode的插件中找到这个PicGo的插件。

<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859676.png" alt="图片" style="zoom:33%;" />

在设置部分，我们可以看到可以设置很多支持的图床配置。



这里我们选择Smms，把之前的key填上去就行了。



<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859258.png" alt="图片" style="zoom:33%;" />



记得要在Current中选择smms。



<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859430.png" alt="图片" style="zoom:50%;" />

VScode中不同操作系统的自动上传方式是不同的，大家可以参考我的图自行取用。

## 在Typora中使用PicGo

除了vscode，Typora也是一个非常优秀的markdown工具。我们也可以在Typora中设置PicGo.



具体的，在Typora的图像设置部分，在插入图片时选择上传图片。在上传服务选择PicGo.app:



<img src="https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404210859576.png" alt="图片" style="zoom:33%;" />

好了，设置完成了，你只需要在Typora中复制粘贴对应的图片，图片就会自动上传到服务器上，然后转换成对应的markdown格式啦。



## 总结

好啦，今天的无限图床的分享就到这里了，喜欢的小伙伴记得点赞关注哦！

本文链接:[greate-picgo](http://www.flydean.com/blog/tools/greate-picgo)





