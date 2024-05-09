---
title: 一键自动化博客发布工具,用过的人都说好(infoq篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405072103237.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到infoq上。
---

infoq的博客发布界面也是非常简洁的。首页就只有基本的标题，内容和封面图片，所以infoq的实现也相对比较简单。

一起来看看吧。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## infoq的实现

接下来我会带领大家一步步实现infoq的博客自动发布。

<!-- truncate -->

### 上传封面

infoq的上传封面底层是一个input标签：

![image-20240507210315786](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405072103237.png)



这个是可以通过selenium来实现的。

我们先找到这个input标签，然后调用send_keys即可实现图片的上传：

```python
    # 上传封面
    if 'image' in front_matter and front_matter['image']:
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        # 文件上传不支持远程文件上传，所以需要把图片下载到本地
        file_input.send_keys(download_image(front_matter['image']))
        time.sleep(2)
```

这里要注意的是，要上传的封面是放在markdown的最上面yaml front matter里面的。

如图所示：

![image-20240507154807745](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071548984.png)



另外要注意的是，因为博客的上传功能只支持本地上传，所以如果你的image是远程地址的话，需要先把远程图片现在到本地，然后再用本地图片来上传。

下载图片到本地的代码这里就不写了。

感兴趣的朋友可以直接去看我的代码。

### 文章标题

infoq的文章标题没有ID，这样的话我们就需要通过xpath来定位文章标题。

一般来说标题的地方都有placeholder，所以我们可以通过xpath来定位到标题：

```python
    # 文章标题
    title = driver.find_element(By.XPATH, '//input[@placeholder="请输入标题"]')
    title.clear()
    if 'title' in front_matter['title'] and front_matter['title']:
        title.send_keys(front_matter['title'])
    else:
        title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 文章内容

之前有提到segmentfault和oschina用的是codemirror，而infoq用的是ProseMirror。

这种动态富文本编辑器会根据你的输入动态修改html内容。所以没办法像textArea那样直接获取元素之后设置他的内容。

这里我们只能采用拷贝粘贴的方式来设置。

怎么定位到文章内容框呢？

因为我们现在刚刚输入完文章标题。所以只需要输入两次tab键就可以把鼠标定位到文章内容输入框了。

所以，我们的代码如下：

```python
# 文章内容 markdown版本
    file_content = read_file_with_footer(common_config['content'])
    # 用的是CodeMirror,不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    action_chains = webdriver.ActionChains(driver)
    # tab
    action_chains.key_down(Keys.TAB).key_up(Keys.TAB).perform()
    time.sleep(2)
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待3秒
```

### 点发布文章按钮

点击发布文章按钮，这个比较简单，直接根据class的名字获取到对应的元素即可：

```python
    # 发布文章
    send_button = driver.find_element(By.XPATH, '//div[contains(@class, "submit-btn")]')
    send_button.click()
    time.sleep(2)
```

### 设置摘要

点完发布文章按钮，会出现一个弹出框，在弹出框里面可以设置摘要和标签等信息。

摘要部分是一个textarea，我们可以通过xpath的方式定位到它：

```python
    if summary:
        summary_input = driver.find_element(By.XPATH, '//div[@class="summary"]/textarea')
        summary_input.clear()
        summary_input.send_keys(summary)
    time.sleep(2)
```

### 设置标签

标签是一个input，这里我们也是通过xpath来定位：

```python
    if tags:
        for tag in tags:
            tag_input = driver.find_element(By.XPATH, '//div[@class="search-tag"]//input')
            tag_input.send_keys(tag)
            time.sleep(1)
            tag_input.send_keys(Keys.ENTER)
```

在设置标签的过程中，每设置完成一个，我们就按一下回车，接下来就可以设置下一个标签了。

非常的方便。

### 最后的提交

最后的最后，我们就可以真正的点击提交按钮了。

```python
    if auto_publish:
        publish_button = driver.find_element(By.XPATH, '//div[@class="dialog-footer-buttons"]/div[contains(text(),"确定")]')
        publish_button.click()
```

这个提交按钮不是很好定位，我们只能通过div的class和text来找到提交按钮。

## 总结

infoq的界面看起来比较简单，但是实现过程中还是有一些要注意的事项。



大家在实现的过程中需要留意。
