---
title: 一键自动化博客发布工具,用过的人都说好(阿里云篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071608020.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到阿里云上。
---

阿里云有个开发者社区，入驻过的朋友可能想要把自己的博客发布到阿里云社区上。

今天我来介绍一下blog-auto-publishing-tools自动发布博客到阿里云的实现原理。

阿里云的博客发布界面比较简单，只有标题，正文，摘要，关联试用产品，发布子社区，文章图片这几个选项。

一起来看看如何实现吧。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## 阿里云的实现

因为阿里云的博客发布界面比较简单，只有标题，正文，摘要，关联试用产品，发布子社区，文章图片这几个选项。

其中标题，正文，摘要和文章图片这几个是必须的。

关联试用产品，和发布子社区并不是刚需，所以这两个目前选择默认值即可。

如果有感兴趣的朋友可以自行实现这两个功能。

所以在config/alicloud.yaml中，我们只需要配置阿里云的发文地址即可：

```yaml
site: https://developer.aliyun.com/article/new#/
```

有同学要问了，标题，正文，摘要和文章图片在哪里配置呢？

在最新的工具实现中，有两种方式来设置这些值。

<!-- truncate -->

1. 第一种方式

第一种方式是在config/common.yaml中：

```yaml
# 文章的标题
title: 一键自动化博客发布工具,用过的人都说好(阿里云篇)
# 文章的内容
content: /Users/wayne/Downloads/blogthings/blogs/blog/projects/004-auto-blog-publish-tool-oschina.md
# 文章的摘要
summary: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到阿里云上。
```

这种是最基本的方式。

2. 第二种方式

如果你的markdown文件中已经包含了title和summary这些信息，那么你就不需要再重复在common.yaml中再写一次了。

这种方式，你需要把title和summary(对应的是description)，写到markdown文件的YAML Front Matter中，如下所示：

![image-20240507154807745](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071548984.png)

这样，在程序中会优先读取markdown文件中的YAML Front Matter，免去你重复设置的烦恼。

### 设置封面图片

封面图片就是在上图的image中设置的。

这里image是一个网络图片链接。一般来说博客的图片上传中上传的图片需要是一张本地的图片。

不过不要担心，这个工具已经实现了自动把远程图片转换成本地图片再上传的整套过程。

大家只管设置即可。

不过能够设置封面图片的前提是博客网站的上传图片是一个input标签。

可惜的是阿里云的上传是一个button，并没有input，所以目前来说阿里云是没有办法通过这个工具来自动上传封面图片的。

> 这个功能，后续再优化，看看有没有实现的可能。

![image-20240507160825718](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071608020.png)

### 设置标题

阿里云的标题比较简单，直接通过ID获取，或者通过下面的XPATH来获取，设置：

```python
    # 文章标题
    title = driver.find_element(By.XPATH, '//input[@placeholder="请填写标题"]')
    title.clear()
    if 'title' in front_matter['title'] and front_matter['title']:
        title.send_keys(front_matter['title'])
    else:
        title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 设置正文

阿里云的正文是一个textarea，不像之前的oschina和segmentfault用的是codemirror，那种动态的代码风格。

所以设置正文就比较简单了，我们直接拿到textarea，调用send_keys就行了：

```python
    # 文章内容 markdown版本
    file_content = read_file_with_footer(common_config['content'])
    content = driver.find_element(By.XPATH, '//div[@class="editor"]//textarea[@class="textarea"]')
    content.send_keys(file_content)
    time.sleep(3)  # 等待3秒
```

### 设置摘要

阿里云的摘要也是一个textarea，我们可以用类似设置正文的方式来设置摘要：

```python
    # 摘要
    if 'description' in front_matter['description'] and front_matter['description']:
        summary = front_matter['description']
    else:
        summary = common_config['summary']
    if summary:
        summary_input = driver.find_element(By.XPATH, '//div[@class="abstractContent-box"]//textarea[@placeholder="请填写摘要"]')
        summary_input.send_keys(summary)
```

### 发布博客

所有的内容都设置好了，接下来我们就可以点击发布博客按钮了。

```python
    # 发布
    if auto_publish:
        publish_button = driver.find_element(By.XPATH, '//div[@class="publish-fixed-box-btn"]/button[contains(text(),"发布文章")]')
        publish_button.click()
```

## 总结

阿里云的博客发布界面还是中规中矩的，没有太多特殊的地方，除了上传封面没有使用input标签之外，其他都还是挺常规的用法。
