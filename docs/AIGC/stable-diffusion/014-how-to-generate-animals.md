---
title: 什么?这动物图片可以上国家地理?
description: 众所周知,能上国家地理的照片肯定是好照片,那么我们能不能用SD做出类似国家地理地理风格图片呢？一起来看看吧
authors: flydean
tags: [stable diffusion,AI,程序那些事,AI绘画]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232118414.png
---

stable difussion中大部分的模型都是关于人的,今天交给大家一些不一样的:如何生成动物图片。在这篇文章中我们将会学到如何生成逼真的动物，可爱的动物，还有幻想中的动物。

## 准备工作

当然前提是你需要一个SD的软件，你可以用本地的SD webUI或者云端的SD环境，全都是可以的。



## 真实的动物



由于目标是生成逼真的摄影图像，因此你需要包含关键字“photo”。

提示应该像这样开始

> photo of 

### 主题

首先，你需要选择你的主题。例如：

>Dog 狗,Cat 猫,Pig 猪,Lion 狮子,Deer 鹿,Monkey 猴子,Elephant 大象,Horse 马,Bear 熊

### 场景

场景控制背景和周围环境。由于关联效应，如果不添加场景关键字，通常会得到野生动物的自然栖息地。

> 森林, Forest；海滩, Beach；山脉, Mountain Range；河流, River；沙漠, Desert；公园, Park；田野, Field；城堡, Castle；宫殿, Palace；冰川, Glacier；瀑布, Falls；湖泊, Lake；花园, Garden；洞穴, Cave；雪地, Snowfield；火山, Volcano；热带雨林, Tropical Rainforest；草原, Prairie；市区, Urban Area；乡村, Countryside

### 灯光

灯光对图像的外观有很大影响。良好的灯光使图像变得有趣。

> 氛围灯, Mood Lighting；情绪灯, Moody Lighting；工作室灯光, Studio Lighting；壁角灯, Cove Lighting；柔和照明, Soft Lighting；硬朗照明, Hard Lighting；伦勃朗灯光, Rembrandt Lighting；体积光, Volumetric Lighting；生物光, Bioluminescence；电影灯光, Cinematic Lighting；双色灯光, Bisexual Lighting；逆光, Back Lighting

### 其他

使用类似于生成真实人物的关键字。例如：

> dslr,ultra quality,film grain,8K UHD



当然，提示词并不是越多越好，使用过多可能会导致解剖结构不佳。

下面的一些关键词可以增加野生动物的美感：

> - National Geographic Wildlife photo of the year
> - The American Landscape Contest
> - Wildlife photography contest

### 模型

我们应该选择一些真实的模型，比如：

> - Realistic Vision
> - Dreamlike Photoreal

### 真实动物图像示例

以下是一些用于生成逼真图像的示例提示。随意使用或重新混合。

模型： Realistic Vision v60B1

提示：

> National Geographic Wildlife photo of the year, photograph, Dutch angle shot of a Giant (tiger:1.1) , complex Low Contrast background, Fall, Very wide view, Contemporary, Hopeless, masterpiece, Superflat, Side lighting, still, Kodak Tri-X 400, F/14, Folded Wires, ethereal magical atmosphere

否定提示：

> spring, painting, abstract, camera, anime, cartoon, sketch, 3d, render, illustration, simplistic, minimalism, plain, simple, modern, ordinary, mundane, cropped, worst quality, low quality, poorly drawn, low resolution,

![image-20240423184010614](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404231840987.png)

模型： Realistic Vision v60B1

提示：

>National Geographic Wildlife photo of the year, photograph, extreme wide shot of a (panda of Past:1.1) with Crow skin, Deeply Thoughtful, Raining, Bokeh, Manic, dtx, rim light, Orton effect, Phase One XF IQ4 150MP, F/5, BW, fairy tale, rainbow swirl, beautiful

否定提示：

>modern, ordinary, mundane, painting, abstract, camera, anime, cartoon, sketch, 3d, render, illustration, sharp, focus, ugly, gritty,

![image-20240423185019232](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404231850463.png)



提示：

> National Geographic Wildlife photo of the year, photograph, Fluffy elephant, Sharp and in focus, Tranquil, Breakcore, Sunlight, High Shutter Speed, dslr, Selective focus, Technicolor, HDR, RAW photo, realism

反向提示：

> Negative prompt: painting, (abstract:1.3), camera, anime, cartoon, sketch, 3d, render, illustration, bokeh, blurry, blur, simple, plain, unrealistic, impressionistic, low resolution, surrealism,

![image-20240423185708615](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404231857998.png)



## 可爱的动物

### 简单描述

如果你只是想生成一些可爱的动物图片，那么包含“cute”一词的非常简单的提示就可以了。选择一个模型来实现某种风格。

型号： DreamShaper

提示：

> a cute cat



![image-20240423200011196](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232000652.png)

### 更进一步

你还可以添加关键字以使用相同的模型进一步修改样式。

提示：

>photograph, crowded blossoms, intricate details, side view shot of a (a cute cat:1.3) - British Shorthair Cat hybrid, simple background, Sharp and in focus, Cel shaded, Fantasy, exquisite, moody lighting, Cinematic, Ilford HP5, F/5, Calotype, (electric indigo and dark yellow:0.7) , Pixabay

否定提示：

>  simplistic, minimalism, plain, cropped, worst quality, low quality, poorly drawn, low resolution, painting, abstract, camera, anime, cartoon, sketch, 3d, render, illustration, gothic, monochromatic, ugly, gritty, bright, sunny, light, vibrant, colorful, industrial, mechanical, geometric patterns, bokeh, blurry, blur, surrealism, ornate, complicated, highly detailed, cluttered, disordered, messy, noisy, maximalism, realism, photorealism, modern, ordinary, mundane,

![image-20240423195855028](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404231958965.png)



### 矢量风格

如果想要绘制矢量风格的图片，那么可以加上关键字vector

Prompt：

> a Intellectual wolf, whole body, Anthropomorphic, portrait, highly detailed, colorful, illustration, smooth and clean vector curves, no jagged lines, vector art, smooth

反向提示词:

> cluttered, disordered, messy, noisy, full body shot, photograph, photorealism, simplistic, minimalism, plain, simple, dark, moody, night, monochromatic, washed out, realism, frame, watermark,

![image-20240423210609479](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232106371.png)

### 更特别的图片

除了使用基本的描述词之外，你还可以使用一些lora来创造特别样子的动物图片。



比如这种可爱的拟人风格。

lora：Round world chubby little animals doll toys

提示词：

> Fat cute wolf,with a belly,in the forest,snow,\<lora:20240130-1706578549277:1>,



![image-20240423203124063](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232031997.png)



还有做成面包形状的动物：

Lora:CSTB v1

提示词：

> \<lora:CSTB_v1:0.6>,lying,food,no humans,animal,looking up,painting (medium),animal focus,bread,food focus,still life,wolf,

![image-20240423204327431](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232043887.png)



机械风的动物：

Lora: Animal Mecha

提示词：

> best quality,masterpiece,highres,original,extremely detailed wallpaper,perfect lighting,extremely detailed CG,\<lora:add_detail:0.3>,perfect_photography.txt,\<lora:Animal_mecha:0.8>,animal mecha,cyborg,wolf face,

![image-20240423205132808](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232051889.png)



人形风格的：

Lora:animal modal

提示词：

> ((low contrast)),animalrizz ,\<lora:animal_model:0.5>, ((((wolf)))) (Captain America:1.3),Blonde hair,solo focus,muscular,(((Blue suit))),Helmet,Blue eyes,Avengers logo,Cityscape,Super soldier,Patriotism,{{{Master piece:1.3}}},{{{realistic}}},{{cinematic lighting}},{{{perfect anatomy:1.3}}, handsome man, {{extremely detailed}}},long eyelashes,{{perfect face}},{{perfect eyes}} refined,{soft lighting},{{cool}},(detailed body),(Masterpiece)),(((best quality))),( full body:1.4),good anatomy,short hair,heroic features,tall,fit,large chest,((highly detailed features)),(((very detailed face))),noble features,intricate,(depth of field),dynamic lighting,highly detailed body,detailed features,4k,textured,1 man,looking at viewer,Captain America logo,Star on his chest,Red and white stripes on his suit,Dark night sky,Moonlight,New York City,Heroic,Brave,



![image-20240423211816225](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404232118414.png)



## 写在最后

现在你已经熟悉了一些生成动物图片的技术，你可以使用这些技术在Stable Diffusion中生成你想要的动物图像.

但是任何技术生成的图像都可能是不完美的，所以你需要做的就是使用img2img来进行进一步的修改。

