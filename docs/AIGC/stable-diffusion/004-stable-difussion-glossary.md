
# Stable Diffusion中的常用术语解析

对于很多初学者来说，会对Stable Diffusion中的很多术语感到困惑，当然你不是唯一的那个。



在这篇文章中，我将会讲解几乎所有你在Stable Diffusion中需要了解的关键术语。搞懂了这些术语，使用stable diffusion起来就会事半功倍。

## 4x-Ultrasharp

4x-Ultrasharp是一款流行的人工智能图像增强工具，能够生成高清晰度的图像。它在Stable Diffusion的图像放大方面用的非常多。

## AI upscaler

AI upscaler是一种采用人工智能技术的模型，能够在放大图像的同时增强图像细节。
## Ancestral sampler

Ancestral sampler是一种在图像采样过程中向图像添加噪音的技术。它们被称为随机采样器，因为它们的采样结果具有一定的随机性。通常在它们的名称中会包含一个独立的字母“a”，比如说Euler a。
## AnimateDiff

AnimateDiff是一种stable diffusion的文本到视频的技术。它采用了一个运动控制模型来影响Stable diffusion模型，从而生成一个以运动为序列的图像视频。这种方法可以帮助用户更直观地理解文本内容，并且为用户提供了一种全新的视觉体验。在实际应用中，AnimateDiff可以用于制作教育视频、科技演示等多种场景，为用户带来更加生动和有趣的学习体验。
## Anything v3

Anything v3是一款备受赞誉的动漫风格Stable diffusion模型。它是Stable diffusionv1.5模型的一个版本。这个模型以其稳定性和扩散效果而闻名，被广泛应用于计算机图形学和动画制作领域。如果您正在寻找一个稳定且高效的扩散模型，Anything v3将是您的不二选择。
## AUTOMATIC1111

AUTOMATIC1111是一个备受欢迎的开源社区开发的Stable diffusion用户界面。该项目最初由名为AUTOMATIC1111的用户发起。官方项目名称是Stable diffusion Web UI。
## Civitai

Civitai是一个专注于Stable diffusion模型的网站，拥有大量的资源。您可以使用AUTOMATIC1111扩展Civitai Helper来方便地进行下载。

与Hugging Face相比，Civitai更专注于Stable diffusion模型。在这里，您可以找到许多用户生成的图像资源。
## CFG scale

分类器自由指导Classifier-Free Guidance（CFG）规模控制了在txt2img和img2img中应该遵循prompt的程度。CFG scale的大小直接影响了生成图像时对输入文本的理解程度。



较大的CFG scale意味着模型有更大的自由度来根据输入文本进行图像生成，而较小的CFG scale则会更加严格地遵循输入文本的提示。



通过调整CFG规模，我们可以更好地控制模型在生成图像时的创造性和准确性。

## Checkpoint model

Checkpoint model是对Stable diffusion模型更精确的称呼。它用于区分LoRA、textual inversion和Lycoris。

## ComfyUI

ComfyUI 是基于节点的用户界面，由 Stable Diffusion 开发。它深受高级 Stable Diffusion 用户的喜爱。
## ControlNet

ControlNet是一个神经网络，通过引入额外的条件来控制图像的生成过程。



它可以用来调整人体姿势和图像构图。这标志着Stable diffusion领域的一个重大突破。

## DDIM

Denoising Diffusion Implicit Models (DDIM) 是第一个用于解决扩散模型的取样器之一。



DDIM是首个用于处理扩散模型的采样器之一。它采用了一种全新的方法来处理噪音和模糊，旨在提高模型的精确度和稳定性。



DDIM的出现为解决扩散模型提供了全新的可能性，为计算机技术领域带来了新的突破。通过DDIM，我们能够更加有效地处理扩散模型，为计算机技术的发展带来更多可能性。

## Deforum

Deforum是一个利用Stable diffusion技术生成视频的工具。



这是一种能够有效减少视频抖动和模糊的技术，通过Deforum工具，用户可以轻松地生成高质量、稳定的视频内容。



无论是在拍摄运动场景还是在拍摄手持镜头下的视频，Deforum都能够帮助用户轻松实现稳定的视频生成。同时，Deforum工具还支持多种视频格式输出，用户可以根据自己的需求选择最适合的视频格式进行输出。

## Denoiser/Noise predictor

在Stable diffusion模型中，denoiser扮演着核心角色。它在每个采样步骤中对噪声图像进行预测，并通过采样方法将其从图像中减去。
## Denoising strength

Denoising strength对图像在img2img过程中的变化程度进行了控制。它的取值范围是从0到1。当取值为0时，表示图像没有发生变化；当取值为1时，表示输入图像完全改变。



我们可以通过调节降噪强度来控制图像转换的效果。

## Diffusion

Diffusion是一种人工智能图像生成方法，它从随机图像开始，逐渐去除噪音，直到生成清晰图像。这种方法受到了物理学中扩散过程的朗之万动力学公式的启发。
## DPM-Solver

**Diffusion Probability Model Solver** (DPM-Solver) 是一个新的采样器算法。

## Dreambooth

Dreambooth是一种训练技术，用于修改checkpoint model。只需5张图片，您就可以使用它将一个人或一个风格注入模型中。



Dreambooth模型需要在提示中有一个*触发关键词*来触发注入的主题或风格。



Dreambooth技术的特点包括：
- 只需少量的图片即可实现模型修改
- 可以轻松注入不同的主题或风格
- 提供了触发关键词来帮助用户控制注入效果

## 指数移动平均（EMA）

指数移动平均（EMA）是指在Stable diffusion模型中，它表示最近训练步骤的平均权重，而不是最后一个训练步骤。




checkpoint model通常使用EMA权重来提高稳定性。EMA在计算机技术领域中被广泛应用，有助于提高模型的稳定性和可靠性。

## Embedding

Embedding是textual inversion的产物，是一种用于修改图像的小文件。



通过在提示或负面提示中嵌入相关的关键词，可以实现对图像的修改。



在Stable diffusion中，embedding被用作prompt的编码版本，它在去噪器的交叉注意力层中使用，以影响AI图像的生成。
## Extension

Extension是用来增强 AUTOMATIC1111 WebUI 的功能。举例来说，ControlNet 就是通过扩展功能来实现的。通过扩展功能，用户可以更加灵活地定制和使用 AUTOMATIC1111 WebUI，满足不同的需求和场景。扩展功能的引入为系统的功能拓展提供了更多可能性，让 AUTOMATIC1111 WebUI 变得更加强大和多样化。
## Euler

Euler是扩散模型的最简单的采样方法。它是一种常见的数值计算方法，用于解决微分方程模型。在计算机科学和工程领域中，Euler被广泛应用于模拟和预测系统的行为。它的优势在于简单易懂，适用于各种类型的扩散模型。
## Face ID

Face ID是一个利用InsightFace提取准确人脸特征的IP适配器模型。该模型以这些特征作为条件生成高度准确的自定义人脸图像。
## Fooocus

Fooocus是一款Stable Diffusion软件，设计简洁易用。它专注于提升用户体验，并且在提示和图像生成方面表现出色。更重要的是，它是免费且开源的。
## Heun

Heun是一种用于采样的数值计算方法。它是对Euler方法的改进，能够更准确地预测系统的演化。



然而，与Euler方法相比，Heun方法在每一步中需要两次对噪音进行预测，因此计算速度比较慢，大约是Euler方法的两倍。这种方法在某些特定情况下可能会被用于解决复杂的计算问题。

## Hugging Face

Hugging Face是一个网站，专门用来托管大量AI模型。除此之外，他们还开发了一些工具，帮助用户更方便地运行和托管这些模型。与Civitai相比，Hugging Face覆盖了所有类型的AI模型，而不仅仅是Stable diffusion模型。
## Hypernetwork

Hypernetwork是一种小型的神经网络，用于改进U-net噪声预测器的交叉注意力模块。它类似于LoRAs和嵌入，都是用于修改检查点模型的小型模型文件的技术。
## InstantID

InstantID是一个利用ControlNet和IP适配器的模型，用于快速复制和美化人脸图像。



InstantID模型利用先进的ControlNet技术和IP适配器，能够快速、精准地复制和美化人脸图像。
## IP-adapter

IP适配器是一种利用图像作为输入来控制图像生成的技术。它被用于生成与输入图像类似的图像。
## Karras Noise Schedule

Karras Noise Schedule是Karras论文提出的一种噪声调度方法。
## K-diffusion/K-sampler

K-diffusion/K-sampler是一种采样方法，是由Katherine Crowson在她的k-diffusion GitHub仓库中实现的。



这种采样方法是用来处理图像生成的技术，它可以帮助我们在图像生成过程中更有效地获得所需的样本。通过K-diffusion/K-sampler，我们可以更好地控制图像的生成过程，使得生成的图像更加符合我们的预期。

## Latent diffusion

Latent diffusion是指在潜在的空间中发生的扩散过程。
## LCM LoRA

潜在一致性模型（LCM）是一种新型的Stable diffusion模型。



LCM LoRA是一种经过LCM方法训练的LoRA。这种LoRA可以与任何检查点模型一起使用，以加快生成速度。

## 潜在扩散模型（LDM）

The latent Diffusion Model 潜在扩散模型（LDM）是一种人工智能模型，它能够在潜在空间中执行扩散。

## LMS

The Linear Multi Step method 线性多步法是一种用于解决常微分方程的方法。它旨在通过巧妙地利用先前时间步的值来提高精度。在AUTOMATIC1111中，线性多步法是其中一种可用的取样方法之一。

## LoRA

LoRA（Low-rank Adaptation）是一种用于修改checkpoint model的方法，使用一个名为LoRA的小文件。它们用于修改风格或为检查点模型添加特殊效果。
## Lycoris

Lycoris是LoRA的升级版。它具有更多的检查点模型部分，因此更加灵活。你可以像训练LoRA一样训练Lycoris。

## ModelScope

ModelScope是一个强大的文本到视频的转换模型，它能够根据输入的文本内容生成精彩纷呈的短视频剪辑。这个模型的应用领域非常广泛，可以用于影视制作、广告营销、教育培训等多个领域。

### 特点

- **高效快速**：ModelScope采用先进的算法和技术，能够快速而高效地将文本转换为视频，大大节省了制作视频的时间成本。
- **个性定制**：用户可以根据自己的需求定制文本内容和视频风格，让生成的视频更加符合个性化需求。
- **多场景应用**：无论是商业宣传、新闻报道还是教学辅助，ModelScope都能够胜任，为用户提供多种场景下的视频生成解决方案。

### 应用场景

- **影视制作**：制片人可以利用ModelScope将剧本中的对话和情节快速转化为视频，方便制作过程中的预览和讨论。
- **广告营销**：市场营销人员可以利用ModelScope将产品特点和宣传语快速转化为视频广告，吸引更多的消费者关注。
- **教育培训**：教育机构可以利用ModelScope将教学内容转化为生动有趣的视频，增强学生的学习体验和记忆效果。

ModelScope的出现，为文本到视频的转换提供了全新的解决方案，极大地丰富了视频制作的可能性。
## Negative embedding

Negative embedding是指在计算机领域中使用的一种嵌入技术，用于传递负面的提示或信息。这种技术通常被应用于各种机器学习和自然语言处理的任务中，以帮助系统更好地理解和处理负面情感或含义。负向嵌入的应用范围非常广泛，可以在情感分析、舆情监控和其他相关领域中发挥重要作用。
## Negative Prompt

Negative Prompt是指向文本到图像AI模型输入的文本，用于描述您不希望在图像中出现的内容。
## Noise schedule

Noise schedule是指在采样过程中确定图像应该具有多少噪声的过程。它代表了采样器试图达到的预期噪声水平。
## Prompt

Prompt是指如何描述文本输入到图像人工智能模型的过程，以及描述你期望在输出图像中看到的内容。

## Prompt schedule

Prompt schedule是用在给定采样步骤中使用的提示。Stable diffusion允许每个采样步骤中的prompt都是不同的。
## Regional prompter

Regional prompter是一种实用的扩展，它可以让您为图像的不同部分指定不同的提示信息。这个功能可以帮助用户更轻松地理解图像内容，并且提供更丰富的用户体验。想象一下，在一张包含多个人物的图片中，您可以为每个人物添加独特的提示，让用户可以更方便地了解每个人物的信息。这种个性化的提示功能可以大大提升用户对图片的交互体验。
## Sampling Method/Sampler

采样方法或采样器是Stable diffusion中用来去除图像噪音的技术。它可能会对渲染速度产生影响，并对最终图像产生微妙的影响。
## Sampling steps

Sampling steps指的是采样器进行离散化降噪时所经过的步骤数量。步骤数量的增加会提高结果的质量，但也会增加处理时间。建议将步骤设置至少为20。
## SD.Next

SD.Next是一个免费的开源Stable diffusion软件，可以在您的计算机本地安装。它是基于AUTOMATIC1111开发的，许多AUTOMATIC1111的扩展也可以与SD.Next兼容并且可以同时使用。
## SDXL

SDXL代表Stable Diffusion XL。它是一个带有本地分辨率为1024×1024的Stable Diffusion模型，比Stable Diffusion v1.5高出4倍。
## SDXL Turbo

SDXL Turbo是经过Turbo训练方法训练的SDXL模型。它能够将图像生成时间缩短约3倍。

## Stable Diffusion

Stable Diffusion是指将自然语言输入转换为图像的文本到图像人工智能模型。它采用了具有frozen language encoder的潜在扩散模型。
## Stable diffusion v1.4

Stable diffusion v1.4 是Stable diffusion模型的首个正式版本，于2022年8月正式发布。该版本默认图像尺寸为512×512像素，为用户提供了更加稳定和高效的扩散模型体验。
## Stable diffusion v1.5

Stable diffusion v1.5 是在 v1.4 的基础上进行了一些改进。虽然改进的细节并不十分明显，但用户们已经开始广泛使用 v1.5。新版本的默认图片尺寸为 512×512 像素，带来了更好的视觉体验。这个改进为用户带来了更加流畅的使用体验，并且在性能方面也有所提升。
## Stable diffusion v2

Stable diffusion v2 是 v1 模型的升级版，拥有更大的画面尺寸，达到了 768×768。该模型在遵循提示方面更加严格，使得提示更加具有挑战性。v2 模型有两个版本：v2 和 v2.1。

然而，随着时间的推移，v2 模型逐渐被用户遗忘，目前使用它们的人数非常有限。
## Stable diffusion XL

Stable diffusion XL 是一个全新的Stable diffusion模型，相比Stable diffusion v1.5 模型，它能够生成更高质量、更大尺寸的图片。这意味着用户可以获得更加清晰、更具有影响力的图像。这一更新将为用户带来更好的使用体验，为他们的工作和创作提供更多可能性。

## Stable Zero123

Stable Zero123是一种可靠的扩散模型，能够生成物体的全新视角或3D模型。
## Textual inversion

Textual inversion是一种在检查点模型中注入自定义主题或风格的方法。它通过创建一个新的关键字来施加影响，生成的结果被称为嵌入。这个嵌入是一个小型文件。

与Dreambooth、LoRA和LyCORIS相比，Textual inversion不会对检查点模型进行修改，因此其影响较小。
## 文字转图片 (txt2img)

文字转图片是指将文字提示转换成图片的过程。这项技术可以让用户将文字信息转化为视觉形式，使得信息更加直观和易于理解。例如，在设计中，可以将文本标题转换为吸引人的图片，增加页面的吸引力和可读性。另外，文字转图片还可以应用在验证码生成、海报设计、个性化图片制作等多个领域。

## Trigger keyword

在Dreambooth模型的训练中，我们使用关键词来触发特定的操作。你需要在使用Dreambooth修改的检查点模型的提示符中使用trigger关键字。
## 变分自编码器（VAE）

变分自编码器（VAE）是一种神经网络，被用来在图像的像素空间和潜在空间之间进行转换。它是一种强大的工具，能够有效地学习和表示图像的特征，为图像处理和生成提供了新的可能性。
## U-Net

U-Net是一种神经网络，用于在每个采样步骤中预测噪音。它在Stable diffusion模型中扮演着重要的角色。一些微调方法，如LoRA和超网络，的原理就是修改U-Net。

## UniPC

UniPC(Unified Predictor-Corrector)是一种全新的采样器。受到ODE求解器的预测-校正方法的启发，它能够在经过5-10步之后生成高质量的图像。
## Upscaler

Upscaler通常利用插值算法来增加图像的像素数量，从而使图像变得更加清晰。常见的插值算法包括双线性插值、双三次插值等，它们能够有效地增加图像的分辨率，提高图像的质量。
