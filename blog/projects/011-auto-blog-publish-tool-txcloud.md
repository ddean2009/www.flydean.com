---
title: 一键自动化博客发布工具,用过的人都说好(腾讯云篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405092114691.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到腾讯云上。
---

之前说过blog-auto-publishing-tools的实现方式是连到现有的浏览器中，而不是使用内置的浏览器。

其中一个很大程度的原因是像腾讯云这种博客发布平台几乎每天都需要重新登录一次，登录还需要手机扫码。所以自动化实现起来非常复杂。

所以，我们需要一个已经登录好的浏览器，来实现自动化功能。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## 腾讯云的实现

<!-- truncate -->



### 切换到markdown编辑器

腾讯云有两个编辑器，一个是markdown，一个是富文本。

这个两个选项是没法设置的，我感觉是随机的，所以我们需要一个机制来保证我们现在是在markdown编辑器中。

![image-20240509211357943](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405092114691.png)

可以看到这个切换到富文本编辑器是一个div，里面包含了一个img和一个a标签。

我们可以通过判断a标签中的文字来确定现在是在富文本编辑器中，还是在markdown编辑器中。

实现方式如下：

```python
    # 切换到markdown编辑器
    a_switch = driver.find_element(By.XPATH, '//div[@class="col-editor-switch"]//a')
    # 获取a元素的文本内容
    text_content = a_switch.text
    if text_content == '切换到Markdown编辑器':
        a_switch.click()
    time.sleep(2)
```

拿到元素之后，获取他的text，然后判断text的内容。

### 文章标题

腾讯云的文章标题是一个textarea，我们可以通过placeholder来定位到这个元素：

```python
    # 文章标题
    title = driver.find_element(By.XPATH, '//textarea[@placeholder="请输入标题"]')
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 文章内容

腾讯云的文章内容编辑器是一个叫做monaco-editor的东西。

这种编辑器会根据文章内容，动态变化html的内容。所以对于这种编辑器来说，我们需要使用到拷贝粘贴的方法。

```python
# 文章内容 markdown版本, 腾讯云不能有引流链接
    file_content = read_file(common_config['content'])
    # 用的是CodeMirror,不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    action_chains = webdriver.ActionChains(driver)
    content = driver.find_element(By.XPATH, '//div[contains(@class,"draft-markdown-editor")]//div[@class="view-line"]')
    content.click()
    time.sleep(2)
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待3秒
```

粘贴的时候需要定位到文章编辑器的位置，点击一下，然后才能进行粘贴。

### 发布文章

接下来就可以点击发布文章按钮了。

```python
    # 发布文章
    send_button = driver.find_element(By.XPATH, '//button[contains(@class, "c-btn") and contains(text(),"发布")]')
    send_button.click()
    time.sleep(2)
```

点击发布按钮之后，会在侧边栏弹出一个对话框，如下所示：

![image-20240509214834483](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405092148341.png)

这里可以选择文章来源，文章分类，文章标签和自定义关键字这些内容。

### 文章来源

文章来源我们就选择原创了，文章来源是一个input，我们可以使用下面的方法来定位：

```python
    # 文章来源
    source = driver.find_element(By.XPATH, '//ul[@class="com-check-list"]/li/label/span[contains(text(),"原创")]')
    source.click()
    time.sleep(2)
```

### 文章分类

文章分类比较复杂点。

我们需要先点击文章分类下拉框，然后在输入框中输入要设置的文章分类。

实现代码如下：

```python
        article_type_select = driver.find_element(By.XPATH, '//section[@class="col-editor-sidebar publish"]//div[@class="tea-dropdown col-editor-classify is-expanded"]/div')
        article_type_select.click()
        time.sleep(1)
        article_type_element = driver.find_element(By.XPATH,f'//div[@class="tea-dropdown-box"]//ul//li//label//span[text()="{article_type}"]')
        article_type_element.click()
        time.sleep(1)
```



### 文章标签

文章标签需要选择标签输入框，然后根据设置好的标签内容，输入到输入框中，然后回车即可：

```python
        tag_label = driver.find_element(By.XPATH,
                                        '//div[@class="com-2-tag-cont"]/label[contains(text(),"搜索并选择合适的标签")]')
        tag_input = tag_label.find_element(By.XPATH, '../input[@class="com-2-tag-input"]')
        for tag in tags:
            tag_input.send_keys(tag)
            time.sleep(1)
            tag_input.send_keys(Keys.ENTER)
            time.sleep(1)
```

### 关键词

自定义关键词和文章标签的实现方式很类似，也是先找到自定义关键词框，点击，然后输入，最后回车即可：

```python
        keyword_label = driver.find_element(By.XPATH, '//div[@class="com-2-tag-cont"]/label[contains(text(),"最多5个关键词")]')
        keyword_input = keyword_label.find_element(By.XPATH, '../input[@class="com-2-tag-input"]')
        for keyword in keywords:
            keyword_input.send_keys(keyword)
            time.sleep(1)
            keyword_input.send_keys(Keys.ENTER)
            time.sleep(1)
```

### 专栏

腾讯云的专栏是一个个的checkbox，我们可以通过他的具体内容来选择：

```python
        zhuanlan_element = driver.find_element(By.XPATH, f'//span[@class="col-editor-create-name" and contains(text(),"{zhuanlan}")]')
        zhuanlan_element.click()
```

### 封面图片

腾讯云的封面图片是一个input，带有id的，所以实现起来比较简单：

```python
        file_input = driver.find_element(By.ID, "editor-upload-input")
        # 文件上传不支持远程文件上传，所以需要把图片下载到本地
        file_input.send_keys(download_image(front_matter['image']))
        time.sleep(2)
```

### 最后的发布按钮

最后就是发布按钮了：

```python
        publish_button = driver.find_element(By.XPATH, '//div[contains(@class,"block c-btn") and contains(text(),"确认发布")]')
        publish_button.click()
```

我们通过包含的text来选择。

## 总结

腾讯云的选项比较多，实现起来也比较复杂。

