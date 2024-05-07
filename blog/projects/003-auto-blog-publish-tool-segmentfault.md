---
title: 一键自动化博客发布工具,用过的人都说好(segmentfault篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405061040404.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到segmentfault上。
---

segmentfault是我在这些平台中看过界面最为简洁的博客平台了。

今天就以segmentfault为例，讲讲在blog-auto-publishing-tools中的实现原理。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## segmentfault的实现

接下来我们手把手看看具体在segmentfault的自动化是如何实现的。

<!-- truncate -->

### segmentfault的配置文件

在config目录下面，你会找到一个segmentfault.yaml的文件，这个就是segmentfault的配置文件了。

内容很简单，如下所示：

```yaml
site: https://segmentfault.com/write

tags:
  - 人工智能
  - aigc
  - openai
  - ai开发
```

里面主要是两个内容，site是segmentfault的博客编写页面。

tags是你的博客的一些标签，可以自行设置。

> 这里要注意的是，segmentfault中的标签并不能随意写，你需要选择segmentfault中已有的标签才可以。

### segmentfault的实现逻辑

所有的发布器都在publisher目录下，在下面你可以找到segmentfault_publisher这个专门给segmentfault的发布器。

首先我们需要打开新的tab，然后切换到segmentfault的博客发布页面：

```python
    # 打开新标签页并切换到新标签页
    driver.switch_to.new_window('tab')
    # 浏览器实例现在可以被重用，进行你的自动化操作
    driver.get(segmentfault_config['site'])
    time.sleep(2)  # 等待2秒
```

### 处理标题

进入发布页面，我们看看页面的一些结构，首先是标题。

标题比较简单，自带了ID：

![image-20240506104029630](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405061040404.png)

所以我们可以直接使用find_element by ID直接获得title的input，然后调用send_keys方法，把title的内容输入进去。

如下所示：

```python
    # 文章标题
    title = driver.find_element(By.ID, 'title')
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 处理内容

接下来我们看看内容这一块。如果进入调试模式，你会看到segmentfault的内容部分不是一个简单的textarea，而是使用了CodeMirror这个开源的在线代码编辑工具。

![image-20240506104412339](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405061044973.png)

这个CodeMirror的代码内容是会随着你的输入不断进行变化的。

那么我们怎么才能把鼠标定位到CodeMirror的代码块中进行内容输入呢？

这里我们有一个小技巧。

如果你进入segmentfault写博客的首页，你会发现鼠标默认是定位在『请输入标题』这个标题栏的部分。

接下来如果我们连续输入三次tab键，鼠标就会定位到CodeMirror内容编辑框了。

然后我们只需要使用复制粘贴功能，把markdown的内容粘贴到内容框即可完成内容的输入。

以下是代码实现：

```python
    # 文章内容
    file_content = read_file_with_footer(common_config['content'])
    # segmentfault比较特殊，用的是CodeMirror,不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    # 三次tab按钮，让光标定位到内容窗口：
    action_chains = webdriver.ActionChains(driver)
    for i in range(3):
        action_chains.key_down(Keys.TAB).key_up(Keys.TAB).perform()
        time.sleep(1)

    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待3秒
```

实际上在操作中，你会发现使用tab键定位之后，拷贝是拷贝不进去的。

所以上面的方法其实是不可行的。我们仍然需要定位到文章内容部分.....

我们仔细看看内容编辑部分，可以看到在CodeMirror-code下面有一个span的role=presentation，就它了，我们使用xpath来定位，代码如下所示：

```python
 # 文章内容
    file_content = read_file_with_footer(common_config['content'])
    # segmentfault比较特殊，用的是CodeMirror,不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    action_chains = webdriver.ActionChains(driver)
    # 三次tab按钮，让光标定位到内容窗口：
    for i in range(3):
        action_chains.key_down(Keys.TAB).key_up(Keys.TAB).perform()
        time.sleep(1)

    # 找到初始的内容描述文字
    content = driver.find_element(By.XPATH, '//div[@class="CodeMirror-code"]//span[@role="presentation"]')
    content.click()
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待3秒
```

### 处理标签

标题，内容都有了，接下来就是标签处理了。

![image-20240506110505887](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405061105856.png)

segmentfault的标签处理逻辑：

1. 点击添加标签按钮
2. 在搜索标签框输入要添加的标签
3. 回车即可。
4. 如果有多个标签，重复2-3这两步。

所以我们可以得到下面的代码：

```python
    # 添加标签
    tag_button = driver.find_element(By.ID, 'tags-toggle')
    tag_button.click()
    tag_input = driver.find_element(By.XPATH, '//input[@placeholder="搜索标签"]')
    for tag in segmentfault_config['tags']:
        tag_input.send_keys(tag)
        tag_input.send_keys(Keys.ENTER)
        time.sleep(2)
    time.sleep(2)
```

### 点击发布文章按钮

点击发布文章按钮之后，会有一个下拉弹窗框，让你选择封面，文章类型，发布到，定时发布和注明版权这些东西。

发布文章按钮很简单，直接根据ID查找即可：

```python
    # 发布按钮
    publish_button = driver.find_element(By.ID, 'publish-toggle')
    publish_button.click()
    time.sleep(2)
```

### 设置封面

正常情况下设置封面需要点击设置封面按钮，然后从本地选择一个封面图片上传。

这样就比较麻烦了。我们直接从markdown的front matter中读取imge的地址，上传到网站上。

事实上，除了image之外，title，tags，description 都会优先从markdown的front matter中去会获取。这样就不用每次去修改配置文件了。

```yaml
title: 一键自动化博客发布工具,用过的人都说好(segmentfault篇)
authors: flydean
tags: [自动化工具,博客,自动发布]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405061040404.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到segmentfault上。
```

上传封面的代码如下：

```python
    # 设置封面
    if front_matter['image']:
        file_input = driver.find_element(By.XPATH, "//input[type='file']")
        file_input.send_keys(front_matter['image'])
        time.sleep(2)
```

### 设置版权

```python
    # 版权
    copy_right = driver.find_element(By.ID, 'license')
    copy_right.click()
    time.sleep(2)
```

版权设置比较简单，直接找到对应的ID即可。

### 最终发布

最后找到发布按钮就可以发布了。

```python
    # 确认发布
    if auto_publish:
        confirm_button = driver.find_element(By.ID, 'sureSubmitBtn')
        confirm_button.click()
```

