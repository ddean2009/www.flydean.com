---
title: 一键自动化博客发布工具,用过的人都说好(掘金篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405091805615.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到掘金上。
---

终于要讲解我们亲爱的掘金了。掘金是一个非常不错的平台。所以很多朋友会把博客发布到掘金上。

发布到掘金要填写的内容也比较多。今天给大家介绍一下如何用blog-auto-publishing-tools这个工具自动把博客发布到掘金平台上去。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## 掘金的实现

<!-- truncate -->

### 点击写文章按钮

要进入掘金的写文章页面，我们需要先点击掘金的发布文章按钮。

找到写文章按钮比较简单，我们直接通过class name定位到写文章按钮，点击即可。

```python
    # 写文章按钮
    write_btn = driver.find_element(By.CLASS_NAME, 'send-button')
    write_btn.click()
    time.sleep(2)  # 等待3秒
```

点击写文章按钮之后，会开启一个新的tab页面。

所以接下来我们需要切换到这个新的tab页面，然后等待输入文章标题的title出现。

切换tab可以调用driver.switch_to.window方法。

然后我们调用wait.until来等待新标签完成加载内容。

```python
    # 切换到新的tab
    driver.switch_to.window(driver.window_handles[-1])
    # 等待新标签页完成加载内容
    wait.until(EC.presence_of_element_located((By.XPATH, '//input[@placeholder="输入文章标题..."]')))
```

### 输入文章标题

掘金的文章标题没有id，所以我们只能通过xpth来定位。

```python
    # 文章标题
    title = driver.find_element(By.XPATH, '//input[@placeholder="输入文章标题..."]')
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 输入文章内容

从debug上来看，掘金的文章内容部分用的是CodeMirror这个富文本编辑工具。

CodeMirror的特点就是html内容会随着你的输入而动态变化。

所以这里我们不能拿到某个元素用send_keys方法，来输入文章内容。

![image-20240509180511628](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405091805615.png)

我们需要转变一下思路。

除了send_keys方法之外，我们还可以选择把文章内容拷贝到系统的剪贴板上，然后把鼠标定位到文章内容部分之后，再调用系统的粘贴命令把文章粘贴到指定的位置。

对，就这么干：

```python
    # 文章内容
    file_content = read_file_with_footer(common_config['content'])
    # 掘金比较特殊，不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    content = driver.find_element(By.XPATH, '//div[@class="CodeMirror-code"]//span[@role="presentation"]')
    content.click()
    # 模拟实际的粘贴操作（在某些情况下可能更合适）：
    action_chains = webdriver.ActionChains(driver)
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(15)  # 等待15秒 图片解析需要花比较长时间
```

这里要注意的是，掘金会尝试重新上传图片，如果你的图片内容比较多的话，需要耗费比较长的时间。

所以这里我sleep了15秒钟。

### 点击发布按钮

接下来就可以点击发布按钮了。

点击发布按钮之后，会有一个弹出框：

![image-20240509181037744](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405091810755.png)

这里我们可以填写类型，标签，封面，专栏，话题和摘要。接下来我们一个个来看看怎么实现。

### 文章分类

分类可以在class为category-list的div下面查找对应文字内容的category，如下所示：

```python
    # 分类
    category = juejin_config['category']
    if category:
        category_btn = driver.find_element(By.XPATH, f'//div[@class="form-item-content category-list"]//div[contains(text(), "{category}")]')
        category_btn.click()
        time.sleep(2)
```

### 添加标签

添加标签需要首先点击标签下拉框：

```python
 tag_btn = driver.find_element(By.XPATH, '//div[contains(@class,"byte-select__placeholder") and contains(text(), "请搜索添加标签")]')
 tag_btn.click()
```

然后需要在输入框里面输入你需要添加的标签，等标签出现在下拉框的时候，输入回车就可以选中了对应的标签了。

```python
# 使用复制粘贴的方式
        pyperclip.copy(tag)
        action_chains = webdriver.ActionChains(driver)
        action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
        # 从下拉框中选择对应的tag
        tag_element = driver.find_element(By.XPATH, f'//li[contains(@class,"byte-select-option") and contains(text(), "{tag}")]')
        tag_element.click()
        time.sleep(2)  # 等待3秒
```

注意，这里我们的输入比较好的方式就是使用复制粘贴，这样不需要定位到输入元素也可以进行。

### 设置文章封面

文章封面有一个input标签，所以我们可以使用selenium的上传图片功能来实现：

```python
    # 文章封面
    if 'image' in front_matter and front_matter['image']:
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        # 文件上传不支持远程文件上传，所以需要把图片下载到本地
        file_input.send_keys(download_image(front_matter['image']))
        time.sleep(2)
```

注意，这里的图片是在markdown文件的yaml front matter中设置的。如下所示：

![image-20240507154807745](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071548984.png)

### 收录至专栏

收录至专栏需要定位到专栏输入框，输入对应的专栏，然后回车即可。

```python
# 收录至专栏
    collections = juejin_config['collections']
    collection_button = driver.find_element(By.XPATH, '//div[contains(@class,"byte-select__placeholder") and contains(text(), "请搜索添加专栏，同一篇文章最多添加三个专栏")]')
    collection_button.click()
    for coll in collections:
        # 使用复制粘贴的方式
        pyperclip.copy(coll)
        action_chains = webdriver.ActionChains(driver)
        action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
        # 从下拉框中选择对应的tag
        coll_element = driver.find_element(By.XPATH, f'//li[contains(@class,"byte-select-option") and contains(text(), "{coll}")]')
        coll_element.click()
        time.sleep(2)  # 等待3秒
```

同样的，我们也使用的是复制粘贴的方法进行输入。

### 创作话题

话题跟专栏的实现方式类似，也是先定位，然后输入，之后回车选择。

代码如下所示:

```python
    # 创作话题
    topic = juejin_config['topic']
    if topic:
        topic_btn = driver.find_element(By.XPATH, '//div[contains(@class,"byte-select__placeholder") and contains(text(), "请搜索添加话题，最多添加1个话题")]')
        topic_btn.click()
        # 使用复制粘贴的方式
        pyperclip.copy(topic)
        action_chains = webdriver.ActionChains(driver)
        action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
        # 从下拉框中选择对应的tag
        topic_element = driver.find_element(By.XPATH, f'//li[@class="byte-select-option"]//span[contains(text(), "{topic}")]')
        topic_element.click()
        time.sleep(2)  # 等待3秒
```

这里也使用的是复制粘贴的方式。

### 设置摘要

摘要是一个textarea，我们通过xpath来定位它：

```python
    if summary:
        summary_ui = driver.find_element(By.XPATH, '//textarea[@class="byte-input__textarea"]')
        summary_ui.clear()
        summary_ui.send_keys(summary)
        time.sleep(2)  # 等待3秒
```

### 最终的发布

最后就是发布了。

```python
publish_button = driver.find_element(By.XPATH, '//button[contains(text(), "确定并发布")]')
publish_button.click()
```

同样的，我们通过xpath来定位到发布按钮。

## 总结

掘金相对而言实现是比较复杂的。大家可以仔细研究一下具体的实现细节。
