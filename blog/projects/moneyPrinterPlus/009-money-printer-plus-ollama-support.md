---
title: MoneyPrinterPlus全面支持本地Ollama大模型
authors: flydean
tags: [工具,AI,AIGC,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407151424830.png
description: 现在,MoneyPrinterPlus除了支持大模型厂商的服务之外，还可以接入本地的Ollama大模型了。
---

MoneyPrinterPlus现在支持批量混剪,一键AI生成视频，一键批量发布短视频这些功能了。

之前支持的大模型是常用的云厂商，比如OpenAI,Azure,Kimi,Qianfan,Baichuan,Tongyi Qwen, DeepSeek这些。

支持云厂商的原因是现在大模型使用基本都很便宜，并且大厂的稳定性，性能都比本地搭建要好很多。

但是很多小伙伴说还是希望接入本地的LLM模型。

所以，最近我对MoneyPrinterPlus进行了一些适配，最新版本已经支持Ollama了。

你可以在Ollama中接入你想要使用的大模型。

下面告诉大家如何在MoneyPrinterPlus中使用本地的Ollama模型。

## 软件准备

当然，前提条件就是你需要下载MoneyPrinterPlus软件啦。 

下载地址： https://github.com/ddean2009/MoneyPrinterPlus

用得好的朋友，不妨给个star支持一下。

## 安装Ollama

如果已经有Ollama的朋友可以直接跳过本节。

对于没有安装过Ollama的朋友，可以直接进入Ollama的官网： https://ollama.com/ 进行安装和下载。

现在Ollama支持windows，linux和Mac这三种操作系统。

我们以linux环境为例来讲解一下Ollama的安装。

在linux环境中，Ollama只需要执行下面的命令即可：

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

系统会自动下载Ollama的安装包，进行安装。



这样Ollama就安装好了。 

Ollama支持很多models，我们可以在他的 https://ollama.com/library 网站中查找需要的模型。

比较常用的像llama3,mistral, llama2-chinese等等。

我们可以使用 ollama list 来查看现有的模型。

如果要下载对应的模型，可以ollama pull llama3从Ollama的模型注册表中拉取指定的模型到本地。

然后使用 ollama run llama3 来运行对应的模型。

当然ollama还有一些其他的用法。这里就不多讲了，大家可以去看下ollama的文档。



ollama安装好之后，我们可以通过下面的命令来测试一下ollama的使用：

```shell
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt":"Why is the sky blue?"
}'
```

如果有返回，那么说明你的ollama是没有问题的。可以继续使用了。

## 在MoneyPrinterPlus中配置Ollama

我们启动MoneyPrinterPlus,点击左边的基本配置，在右边的LLM大模型配置项中，我们下拉选择Ollama。



![image-20240715142420621](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407151424830.png)



Ollama的配置需要设置两项。

第一项是Base Url，也就是调用Ollama的地址。

如果你的ollama在本地，就填：http://localhost:11434/

如果是在其他远程的机子上，就填：http://IP:11434/



需要注意的是，Ollama默认只会暴露端口给本机连接。
如果需要远程连接Ollama，还需要改下Ollama的配置：

```shell
vi /etc/systemd/system/ollama.service

在[Service]下面添加一下环境变量：
#配置远程访问
Environment="OLLAMA_HOST=0.0.0.0"
```

修改完之后重新load并重启ollama即可：

```shell
sudo systemctl daemon-reload 

sudo systemctl restart ollama
```



第二项是Ollama中的模型名字。

比如你用的是llama3,那么这里就填llama3就行了。



Ollama配置好之后，就可以进入AI视频区域：

在视频主题区输入你需要生成的视频主题，点击生成视频文案。



![image-20240715144309076](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202407151443554.png)



如果有文案生成，那么恭喜你，说明Ollama配置完成了。



接下来尽情使用MoneyPrinterPlus吧。



