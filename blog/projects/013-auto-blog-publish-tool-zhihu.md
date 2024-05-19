---
title: 一键自动化博客发布工具,用过的人都说好(知乎篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405102138991.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到知乎上。
---

我们已经学习了很多自动化的知识了，接下来让我们看看在blog-auto-publishing-tools中是如何实现自动发送博文到知乎的。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## 知乎的实现

知乎的字段不是太多，算是中规中矩。但是有些实现还是需要一些技巧的。一起来看看吧。

<!-- truncate -->

### 设置标题

知乎的标题是一个textarea,可以看到知乎的textarea有class,placeholder这些属性。class后面的那一长串是自动生成的。

所以可以使用的字段就只有placeholder这个属性了。

![image-20240510213849893](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405102138991.png)

所以，我们可以这样来定位标题字段：

```python
    # 文章标题
    title = driver.find_element(By.XPATH, '//textarea[contains(@placeholder, "请输入标题")]')
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 设置内容

知乎的内容部分也是动态的，通过调试可以看到，好像是用的是一个叫做DraftEditor的东西（不太确定）。

基本上和之前讲过的CodeMirror是类似的东西。

如果你看过我之前的文章，那么就可以知道类似这种动态的标签，我们可以使用拷贝和粘贴的方法来实现内容的输入。

另外，知乎是不支持markdown格式的。

> 虽然知乎有个识别markdown格式的东西，但是如果你试过就会发现，markdown在知乎并不好使。

所以，我们在拷贝之前，需要把markdown格式转换成为html格式。

网上有很多把markdown转换成html的工具，其中一个比较出名的就是pandoc。

pandoc的功能很强大，可以转换很多格式的文本。

对于markdown转换成html，可以使用下面的命令：

```bash
 pandoc -f markdown -t html5 input.md -o output.html
```

当然为了拷贝出来的样式好看一些，这里我还添加了css文件。

实现方法都写在了convert_md_to_html方法里面了。

感兴趣的朋友可以去看看。

最后我们的实现代码如下：

```python
# 文章内容 html版本
    content_file = common_config['content']
    # 注意，zhihu 不能识别转换过后的代码块格式
    content_file_html = convert_md_to_html(content_file)
    get_html_web_content(driver, content_file_html)
    time.sleep(2)  # 等待2秒
    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(1)  # 等待1秒
    # 不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    action_chains = webdriver.ActionChains(driver)
    # 点击内容元素
    content_element = driver.find_element(By.XPATH, '//div[@class="DraftEditor-editorContainer"]//div[@class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]')
    content_element.click()
    time.sleep(2)
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待5秒 不需要进行图片解析
```

解释下实现的逻辑。

convert_md_to_html是把markdown转换成了html。

get_html_web_content是在新的web tab中打开这个html文件，然后使用系统的复制功能把html内容拷贝到剪贴板上。

然后再定位到要粘贴的位置，使用系统的粘贴功能把内容粘贴到内容框中。

### 设置封面

很棒的是知乎的的上传封面有一个input标签，如下所示：

![image-20240517234037280](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405172340069.png)

所以我们可以使用selenium的input上传功能，来上传封面。 

封面数据可以写到markdown文件的YAML Front Matter中，如下所示：

![image-20240507154807745](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071548984.png)

具体的实现代码如下：

```python
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        # 文件上传不支持远程文件上传，所以需要把图片下载到本地
        file_input.send_keys(download_image(front_matter['image']))
        time.sleep(2)
```

### 投稿至问题

说实话，这个我真的不知道怎么实现，因为每个文章对应的问题是不一样的。

所以这个作为待解决的问题。如果有朋友希望我实现这个功能，可以跟我说。

### 文章话题

知乎这个文章话题实现起来比较困难。

因为知乎会自动给你文件打上话题。如果要自定义话题的话，需要先删除已有的话题，然后再添加上自己的话题。

这个这里就不实现了。

### 专栏收录

专栏当然要收录在自己的专栏里面啦。

所以我们需要点击发布到专栏按钮。

还好，知乎的的专栏按钮是有一个id的。

```python
    # 专栏收录
    pubish_panel = driver.find_element(By.ID, 'PublishPanel-columnLabel-1')
    pubish_panel.click()
```

### 最后的发布

最后就是确认发布了。我们找到最后的发布按钮，点击即可。

```python
        confirm_button = driver.find_element(By.XPATH, '//button[contains(text(), "发布")]')
        confirm_button.click()
```

