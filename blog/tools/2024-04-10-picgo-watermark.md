---
slug: tools/picgo-watermark
title: 给picgo上传的图片加个水印
authors: flydean
tags: [图床, picgo,watermark]
keywords: [图床, picgo, 免费图床,水印,watermark,永久免费，markdown]
description: 怎么给picgo中的图片加水印,防止图片被盗用
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404101359146.png
---

之前给大家介绍了picgo和免费的图床神器。我们本可以开开心心的进行markdown写作了。



但是总是会有那么一些爬虫网站过来爬你的文章，还把你的文章标明是他们的原著。咋办呢？这里有一个好的办法就是把markdown中上传的图片加上自己的水印不就行了。



说干就干。接下来我会介绍如何在picgo中进行配置，给上传的图片加上水印。

<!-- truncate -->


## picgo水印插件 



当然要给picgo添加功能，第一首选就是去找找有没有对应的插件。



我们在picgo的插件设置中搜索：水印,然后点击。



很遗憾，你什么都找不到。那么是不是picgo没有水印插件呢？



当然不是。我们换个英文来搜索一下：watermark。 好了，一下出来了两个。



![image-20240410135940772](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404101359146.png)



那么我们到底应该装哪个呢？



别急，我们先点击两个插件的标题，会自动跳转到插件的主页。



他们的地址分别是： https://github.com/terwer/picgo-plugin-watermark-elec   和  https://github.com/fhyoga/picgo-plugin-watermark  



经过对比，我们可以看到picgo-plugin-watermark-elec是从picgo-plugin-watermark fork过来的。原始的picgo-plugin-watermark已经有3年没有更新了。



基于：最新的就是最好的这一基本原则。我们就选择picgo-plugin-watermark-elec来使用吧。 



回到PicGo中，我们点击安装，进行插件的安装。



安装需要点时间，我们多等一等。



安装好之后，我们进入他的配置页面：



![image-20240410151428537](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404101514965.png)





可以看到有字体文件路径，水印文字，水印文字颜色，字体大小，水印图片路径，水印位置和最小尺寸这几个选项需要填写。



1. 字体文件路径。E.g.`/Users/fonts/Arial-Unicode-MS.ttf`。

​	默认只支持英文水印，中文支持需要自行导入中文字体文件。

2. 水印文字。E.g.`hello world`

3. 水印文字的颜色，支持rgb和hex格式。E.g.`rgb(178,178,178)`、`#b2b2b2`

4. 字体大小，默认`14`

5. 水印图片路径。E.g.`/Users/watermark.png`，优先级大于文字

6. 位置，默认`rb`

   ```
   export enum PositionType {
     lt = "left-top",
     ct = "center-top",
     rt = "right-top",
     lm = "left-middle",
     cm = "center-middle",
     rm = "right-middle",
     lb = "left-bottom",
     cb = "center-bottom",
     rb = "right-bottom"
   }
   ```

7. 原图最小尺寸，小于这一尺寸不添加水印。E.g.200*200。

​	高度或宽度任何一个小于限制，都会触发。



按照你自己的习惯，我们可以设置好这些属性。



字体的话，最好设置一个中文字体，这样我们可以添加中文水印。



如果你是mac电脑，那么字体文件的路径在：/System/Library/Fonts/下面。 



这里我选择的是这个字体： /System/Library/Fonts/Hiragino Sans GB.ttc 



有人说，那么字体颜色在哪里选啊？



给大家推荐一个官方的颜色选择网站：



https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Color_picker_tool



等等，就在我配置好之后，再次上传图片的时候，发现了一个了不得的结论：图片上传居然失败了.....



没办法只好去检查一下日志：



>  [PicGo INFO] beforeTransformPlugins: watermark running 
>  [PicGo INFO] [PicGo Server] get the request {"list":["\/Users\/test\/Library\/Application Support\/typora-user-images\/image-20240410252432593.png"]} 
>  [PicGo INFO] [PicGo Server] upload files in list 
>  [PicGo INFO] Before transform 
>  [PicGo INFO] beforeTransformPlugins: watermark running 
>  [PicGo INFO] [PicGo Server] upload result  
>
> ------Error Stack Begin------
> Error: Unsupported OpenType signature ttcf
>     at parseBuffer (/Users/test/Library/Application Support/picgo/node_modules/opentype.js/src/opentype.js:204:15)
>     at Object.loadSync (/Users/test/Library/Application Support/picgo/node_modules/opentype.js/src/opentype.js:380:12)
>     at Function.Text2svg.loadSync (/Users/test/Library/Application Support/picgo/node_modules/text2svg/index.js:61:23)
>     at new Text2svg (/Users/test/Library/Application Support/picgo/node_modules/text2svg/index.js:18:23)
>     at Object.exports.generate (/Users/test/Library/Application Support/picgo/node_modules/logo.svg/lib/index.js:25:16)
>     at getSvg (/Users/test/Library/Application Support/picgo/node_modules/picgo-plugin-watermark-elec/lib/text2svg.js:34:22)
>     at Object.handle (/Users/test/Library/Application Support/picgo/node_modules/picgo-plugin-watermark-elec/lib/index.js:34:49)
>     at /Applications/PicGo.app/Contents/Resources/app.asar/node_modules/picgo/dist/index.cjs.js:1:20521
>     at Array.map (<anonymous>)
>     at je.handlePlugins (/Applications/PicGo.app/Contents/Resources/app.asar/node_modules/picgo/dist/index.cjs.js:1:20455)

好像是没有上传成功. 



从错误看来是ttcf也就是我们的字体文件有问题。



直觉是因为我的字体文件带了空格。换一个没有空格的，或者把字体改个名字。



再试一次，还是不行.....



然后研究一下了字体文件。发现其实是有两种格式的，一种是TTF，一种是TTC。



我们换成TTF再试一下，这次成功啦。



![image-20240410152432593](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404101539157.png)



看看水印是不是出来了？



## 总结



好了，现在我们已经成功的给Picgo加上水印了。那么朋友们，大家能从这个故事中学到什么呢？



当然是遇到问题的解决方法啦！事实上，如果上面的尝试都不成功的话，我的下一步计划是把插件切换到最开始fork之前的版本再试试。



