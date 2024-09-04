---
title: After Detailer让图像自动修复
description: After Detailer（简称adetailer）是一个Stable Diffusion的自动Web-UI扩展，它能够自动化修复图像中的不完整部分，例如模糊的人脸等常见问题。
authors: flydean
tags: [stable diffusion,AI,程序那些事,AI绘画]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407021513554.png
---



After Detailer（简称adetailer）是一个Stable Diffusion的自动Web-UI扩展，它能够自动化修复图像中的不完整部分，例如模糊的人脸等常见问题。在这篇文章中，你将了解它的工作原理、如何使用它，以及一些常见的使用场景。

## 软件

当然前提是你需要一个SD的软件，你可以用本地的SD webUI或者云端的SD环境，全都是可以的。

## 安装After Detailer扩展

1. 正常启动AUTOMATIC1111 Web-UI。

2. 导航到**扩展**页面。

3. 点击**从URL安装**标签。

4. 在**扩展的git仓库URL**字段中输入以下URL。

`https://github.com/Bing-su/adetailer`

5. 等待安装完成的确认消息。

6. 重启Web-UI。

![image-20240702151334743](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407021513554.png)

## 怎么修复人脸

After Detailer的主要作用是做人脸修复，那么在没有After Detailer之前，我们是怎么做人脸修复的呢？

### 生成小尺寸人脸的问题

假设你生成了一个人的全身像。这里假设你使用的是v1模型，不应该设置过高的分辨率（超过512像素太多）。否则，你会得到重复的人像。

模型：majicmixRealistic_v7

提示：

```txt
anime style, 2d, fantasy anime detailed illustration, Grindhouse,  1girl, she is very Ghostly and Macho, with copper skin, she is dressed in Sweatpants, she has [Croatian|Punks] hair, at Sunset, 
```

尺寸：512×768

你会得到下面的图片：

![image-20240702183001873](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407021830378.png)

由于人脸小且分辨率低，覆盖人脸的像素不多。VAE没有足够的像素生成一个好的人脸。所以人脸是模糊的。

你通常会使用**Send to inpaint**按钮将图像发送到Inpainting。

![image-20240702183119840](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407021831570.png)



在**Inpaint**标签中，围绕模糊的人脸画一个遮罩。



使用以下设置：

- 遮罩模式：**Inpaint masked**

- 遮罩内容：**Original**

- Inpaint区域：**Only masked**

- 去噪强度：**0.5**

点击**Generate**。

![image-20240702183344778](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407021833339.png)



你会看到人脸被很好地修复了。inpaint area选择 **only masked**选项特别重要，因为它使用整个分辨率（512×768）重新生成遮罩区域。实际上，它以更高的分辨率重新生成了人脸，然后将其缩放回原始分辨率。这就是为什么人脸现在看起来好多了。

### 使用After Detailer自动Inpaint

After Detailer自动化了这个过程以及更多。它使用**面部识别模型**来**检测人脸**并**自动创建Inpaint遮罩**。



然后扩展执行Inpaint，只处理遮罩区域，就像你手动处理一样。



所以它本质上是一个节省时间的扩展。

## 使用After Detailer

### 在Txt2img中使用

要在txt2img中使用After Detailer，请展开ADetailer。

选择**Enable ADetailer**。

在**ADetailer model**下拉菜单中选择**face_yolo8n.pt**模型。

![image-20240702201412632](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022014665.png)



现在你就可以使用aDetailer的基本功能了。

点击**Generate**。你会得到以下图像。

![image-20240702201612675](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022016885.png)

可能你得到的人脸图片和手动Inpaint不完全一样，那是因为绘制的遮罩区域是不同的。



### 在img2img中使用

你还可以在使用图像到图像转换时使用After Detailer。这样做的好处是你可以同时**恢复人脸**并为整个图像**添加细节**。

在txt2img页面上，把之前的图片使用**Send to img2img**按钮将图像发送到img2img页面。

将img2img的去噪强度设置为一个较低的值,这样我们可以保持一个较低的重绘幅度。

在**ADetailer**部分启用After Detailer。

点击**Generate**。生成图片。

我们可以对比一下两张图片的效果，可以看到重绘后的图片添加了更多的细节。

![image-20240702202812881](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022028691.png)



当然，你也可以通过调整**去噪强度**来控制添加的细节级别。

同样的，你还可以在**inpaint**标签中使用ADetailer。

## ADetailer参数解释

现在你知道了aDetailer的基本功能，现在让我们看一下，Adetailer的一些额外参数。

### 检测模型

在ADetailer模型下拉菜单中选择检测模型。可以看到下面几个模型，模型分为几个不同的组：



![image-20240702203123933](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022031550.png)



**Face_xxxx**：检测并重绘人脸

**Hand_xxxx**：检测并重绘手

**Person_xxxx**：检测并重绘整个人

**Mediapipe_face_xxxxx**：检测并重绘人脸



**最有用的模型是face_yolo和person_yolo模型**。

YOLO的全称是（You Only Look Once）模型擅长检测人脸和物体，在Inpaint中工作得很好。



然而，因为需要更多的像素来Inpaint整个人，所以使用人脸模型时人脸的细节并没有那么多。

通常不建议Inpaint一个大区域。如果你有像这样的图像，你最好手动一个接一个地Inpaint脚、裙子等。



**Mediapipe_face**有时有效有时无效。所以不太建议使用他们。



**手模型**用于重绘手。但不要对此抱太大希望，因为Stable Diffusion仍然不擅长绘制手，无论它重绘多少次。



最后，你可能会想知道YOLO 8n和8s模型之间的区别。8n模型更快，但比8s模型小约3倍（因此功能较弱）。8n模型的效果不错。但是如果After Detailer难以检测到人脸，请切换到8s模型。

最后，每次你可以使用多达两个检测模型。只需切换到**2nd**标签并选择一个额外的模型。

![image-20240702205550611](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022055723.png)



因为我们同时选择了人脸和手部模型，所以现在它会检测到人脸，然后是手。然后它依次修复两者。

### 使用Inpaint提示

在inpaint中使用prompt可以通过prompt来改变检测到的人脸部分。具体的提示部分如下所示：

![image-20240702210226366](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022102358.png)



这里我们使用了之前讲到的prompt的技巧，我们想让脸呈现的是Joe biden和川建国同志的混合面孔，所以我们的prompt可以这样写：

```txt
[Joe biden: donald trump: 0.5]
```



通过调整**Inpaint去噪强度**来调整效果。现在你得到了新的混合外观！

![image-20240702210421795](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022104577.png)



要注意的是，这里的提示词还可以包含LoRA。如果你想要某些特定的face，那么可以尝试使用lora来实现。

### Detection

一般来说，我们不需要改变detection的值。因为默认的值已经工作的很好了。

![image-20240702210734923](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022107248.png)

**检测模型置信度阈值**：如果你注意的话，在检测人脸的过程中，会呈现一个数字。这个数字叫做**置信度分数**。

0.8意味着模型有80%的信心认为这是一个人脸。阈值是所需的最低置信度分数。如果你设置为0.9，置信度分数为0.8的人脸将不被视为人脸。保持在0.3的低值。如果你有检测人脸的问题，请降低它。如果检测到太多，请增加它。



**遮罩最小/最大区域比率**：允许的检测遮罩的最小和最大区域。例如，如果你将最小区域比率设置为0.1，Adetailer将拒绝遮罩小于图像大小10%的检测。如果你检测到不需要的小物体，请增加最小值。

### 遮罩预处理

![image-20240702210933969](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022109577.png)



这些值通常不需要更改。

这些是在Inpaint之前移动和调整遮罩大小的。为了获得最佳结果，你可以在**设置** > **ADetailer**中启用“保存遮罩预览”，每个检测都会保存一个遮罩预览图像。这样我们可以通过保存下来的遮罩预览图像来了解遮罩是如何改变的。



**遮罩x/y偏移**：以像素为单位在x/y方向上移动遮罩。

**遮罩腐蚀(-) / 膨胀(+)**：减小/扩大遮罩。

**遮罩合并模式**：**无**：分别Inpaint每个遮罩。**合并**：合并遮罩然后Inpaint。**合并并反转**：Inpaint未遮罩的区域。

### Inpainting

![image-20240702211254397](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022112733.png)

Inpainting部分中最重要的设置是**Inpaint去噪强度**。它控制自动Inpaint中使用的去噪强度。增加以进行更多更改。减少以进行较小的更改。

**Inpaint only masked** 表示是否只inpaint mask部分。

你可以修改Inpaint中的图像**宽度**，**高度**，**CFG比例和采样步数**。但默认值就可以了。

### 使用ControlNet与ADetailer

ControlNet是一个不可或缺的工具，可以精确控制图像生成。如果你不熟悉controlNet，请参考我之前写的controlnet的文章。要在ADetailer中使用ControlNet，你必须首先在AUTOMATIC1111上安装ControlNet。

然后，你可以在最后一部分中选择ControlNet模型。

![image-20240702213232926](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407022132361.png)

#### ControlNet Openpose

使用ControlNet Openpose模型可以用相同的姿势Inpaint人物。



例如，如果没有启用任何ControlNet并且去噪强度很高的时候，姿势可能会以与整体图像不一致的方式改变。

启用**ControlNet Openpose**后，女孩的姿势在Inpaint后保持不变。

#### ControlNet Tile

启用ControlNet Tile可以使Inpaint更好地遵循原始图像。

**如果你想让Inpaint更好的贴合原始图像，请启用ControlNet Tile。**

#### ControlNet inpaint

ControlNet **inpaint**模型（**control_xxxx_inpaint**）与**global_inpaint_harmonious**预处理器**可以提高Inpaint区域与图像其余部分之间的一致性**。

当你想将Inpaint去噪强度设置得很高时，请使用**global_inpaint_harmonious**。稍微调整值或更改种子以获得不同的生成。

#### ControlNet Line art

ControlNet line art让Inpaint过程遵循原始图像的一般轮廓。

如果你想让Inpaint的图像遵循原始内容的轮廓，请使用ControlNet line art。

## 何时使用ADetailer

ADetailer中没有什么是你不能手动完成的。ADetailer只是下面一些步骤的自动化：

- 将图像发送到Inpaint

- 创建Inpaint遮罩

- 设置ControlNet（可选）

- 生成Inpaint

使用此扩展的最有价值的方面是自动化，以便你可以使用相同的设置创建**多个图像**。这在手动工作流程中是繁琐的。

## 技巧

当使用ADetailer与img2img时，有两个去噪强度需要设置。

img2img的去噪强度为整个图像设置值。

ADetailer中的Inpaint去噪强度为Inpaint设置去噪强度。

你还可以在设置> ADetailer中选择保存检测模型的结果。它将保存一个额外的图像，其中包含检测区域和置信度分数。
