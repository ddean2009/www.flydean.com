---
title: 一键自动化博客发布工具,用过的人都说好(oschina篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405062258801.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到oschina上。
---

oschina和segmentfault一样，界面非常的清爽。

界面上除了必须的标题,内容之外，还有文章专辑和推广专区这几个选项。

一起来看看在blog-auto-publishing-tools中，是如何实现自动发布到oschina的吧。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## oschina的实现

接下来我们手把手看看具体在oschina的自动化是如何实现的。

### oschina的配置文件

除了title和content之外，oschina还需要一个文章专辑和推广专区：

![image-20240506225816971](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405062258801.png)

所以我们的配置文件大概是这样的：

```yaml
site: https://my.oschina.net/flydean/blog/write
#专辑
collection: 程序那些事
#推广专区:45	Llama中文社区
  #44	ChatGPT
  #43	非结构化数据
  #28	大前端
  #27	开发技能
  #10	数据库
  #9	云计算
  #17	飞桨专区
  #16	OpenHarmony专区
  #19	开源治理
  #46	银河麒麟专区
  #14	程序人生
  #26	软件架构
  #15	行业趋势
  #11	硬件 & IoT
  #8	AI & 大数据
  #39	昇思MindSpore
  #35	OpenVINO 中文社区
  #42	摸鱼专区
  #41	OneOS
  #40	华为开发者联盟
  #38	PostgreSQL
  #37	Linux基金会开源软件大学
  #36	OSCTraining
  #34	EdgeX 中文社区
  #31	鲲鹏专区
  #30	openEuler
  #25	信息安全
  #24	运维
  #23	软件测试
  #22	网络技术
  #21	游戏开发
  #20	多媒体处理
  #13	DevOps
  #6	区块链
topic: 开发技能
```

其中collection是你自己创建的文章集合。

topic是oschina中自带的topic，你只需要从中间选择一个即可。

### oschina的实现代码

所有的发布器都在publisher目录下，在下面你可以找到oschina_publisher这个专门给oschina的发布器。

首先我们需要打开新的tab，然后切换到oschina的博客发布页面：

### 填充文章内容

先看下页面上文章内容的信息：

![image-20240506230435279](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405062304764.png)

可以看到oschina使用的也是CodeMirror这个开源的代码编辑工具。

这个工具不同于传统的text或者textArea，他里面的元素是随着你的输入动态变化的，所以这里很难像传统的页面一样直接使用send_keys来填充内容。

那么我们怎么向CodeMirror输入内容呢？

既然send_keys不行，我们可以换一个思路，比如借助系统自带的复制和粘贴功能。

首先定位到内容的输入位置，然后把要输入的内容粘贴进去即可。

```python
    # 文章内容
    file_content = read_file_with_footer(common_config['content'])
    # 用的是CodeMirror,不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    # 将要粘贴的文本内容复制到剪贴板
    pyperclip.copy(file_content)
    action_chains = webdriver.ActionChains(driver)

    # 找到初始的内容描述文字
    content = driver.find_element(By.XPATH, '//div[@class="CodeMirror-code"]//span[@role="presentation"]')
    content.click()
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待3秒
```

定位元素，我们是找到CodeMirror-code class下面的role=presentation的span即可。

这里，我们使用的是xpath定位。

然后使用ActionChains来模拟系统的粘贴操作。

### 填充文章的标题

标题部分比较简单，他有一个name字段：

![image-20240506232051687](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405062320198.png)

所以我们可以这样来使用：

```python
    # 文章标题
    title = driver.find_element(By.NAME, 'title')
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 文章专辑

接下来，我们点击发布文章按钮之后，就会显示一个弹出框。

这里我们需要填入文章专辑。

![image-20240506225816971](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405062258801.png)

文章专辑需要分两步走。

第一步是点击下拉框：

```python
category_select = driver.find_element(By.XPATH, '//div[contains(@class, "selection dropdown catalog-select")]')
category_select.click()
```

这里通过xpath来定位下拉框。

第二步是从下拉框选择对应的文章专辑：

```python
select_element = category_select.find_element(By.XPATH, f'//div[contains(text(), "{collection}")]')
select_element.click()
```

同样的，我们使用xpath的contains来获取到text中包含有要选择专辑名字的列表。

### 推广专区

推广专区和文章专辑很类似，都是一个下拉框。

同样的，我们先点击下拉框：

```python
topic_select = driver.find_element(By.XPATH, '//div[contains(@class, "selection dropdown groups")]')
topic_select.click()
```

然后选择对应的推广专区：

```python
topic_item = topic_select.find_element(By.XPATH, f'//div[contains(text(), "{topic}")]')
topic_item.click()
```

### 发布按钮

最后一步，就可以点击发布按钮发布了：

```python
confirm_button = driver.find_element(By.XPATH, '//div[contains(@class,"submit button effective-button")]')
confirm_button.click()
```

## 总结

这样我们对于oschina的自动发布就完成了。oschina相对而言比较简单，甚至没有封面上传:-)
