---
title: 一键自动化博客发布工具,用过的人都说好(简书篇)
authors: flydean
tags: [自动化工具,博客,自动发布]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404292318041.png 
---

好不容易写好了一篇博客，现在想要把它发布到各个平台上供大家一起欣赏？



然后一个网站一个网站打开要发布的博客站点，手动点创建文章，然后拷贝粘贴写的markdown文件。



甚至有些网站还不支持markdown格式，你还需要对格式进行转换。



每次重复这样的机械化工作，完全就是浪费生命。



现在不需要了，给大家推荐一个一键自动化博客发布工具，完全的一键操作，让你轻松告别手动发布博客的烦恼。



## 这个工具是什么

这个工具的全称叫做 blog-auto-publishing-tools博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools



在数字化时代，内容创作与传播的速度与广度对于个人或企业品牌的建设至关重要。然而，许多博客作者和内容创作者在发布内容时，面临着跨平台发布的繁琐与不便。每个平台都有其独特的发布规则和操作流程，手动发布不仅耗时耗力，而且容易因为重复劳动而出现错误。为了解决这一痛点，我开发了这款博客自动发布工具。

我的原则就是能自动的，绝不手动。

这款博客自动发布工具，旨在帮助用户实现一键式多平台发布。

用户只需在工具中编写或导入博客内容，选择想要发布的平台（如CSDN、简书、掘金、知乎、头条、51blog、腾讯云、阿里云等），点击发布按钮，即可将内容快速推送到各个平台。

只需要编写好Markdown格式的博客即可，同时能够根据各平台的规则自动调整格式，确保内容在不同平台上的展示效果一致。



## 支持的博客平台

目前这个工具已经支持下面这些平台：

-  支持简书
-  支持cnblogs
-  支持alicloud
-  支持51cto
-  支持infoq
-  支持掘金
-  支持oschina
-  支持segmentfault
-  支持头条
-  支持txcloud
-  支持知乎

应该已经覆盖了绝大部分的平台了。如果还有其他的平台，大家可以留言给我。



## 工具的实现方式

这个工具本质上是基于selenium这个自动化框架实现的。

通过模拟人工的点击操作，可以完成绝大多数需要人手工才能完成的工作。解放大家的双手。

另外这个自动化的实现方式有两种，一种是在运行程序的过程中启动一个浏览器。另外一种是依附到现有的浏览器上来操作现有浏览器的页面。

本工具选择的是依附到现有的浏览器上。

主要是因为有些博客平台需要用手机扫码二维码才能登录。比如阿里云，腾讯云等。所以在程序中很难模拟这种登录的过程。

> 为什么不直接调用博客平台的发博客的接口来实现？而是选择页面自动化这种实现方式？
>
> 因为博客平台的发博客接口需要传入很多数据，直接调用的话，很多内容是没法考虑到的，比如：标签，分类，封面等等。所以我觉得自动化工具帮大家填好内容了，大家只需要看一眼，点击发布就行了，这样更加方便，如果要进行修改的话也更加灵活。
>
> 当然，如果大家真的有需要实现接口发送，可以私信给我，我可以研究研究怎么实现。

## 工具的缺点

当然，这个工具虽然有诸多优点，可以自动填充，发送博客。

但是实话实话，缺点还是有的。

总结一下：selenium有的缺点它都有。比如，封面图片上传目前没法自动化，需要手动操作，或者不使用封面图片。

## 怎么使用

1. 目前这个工具是基于chrome的，所以你需要先下载一个chrome。

2. 然后就是下载和chrome配套的chrome Driver [Chrome Driver](https://googlechromelabs.github.io/chrome-for-testing/)。

3. chrome 以debug模式启动

```
chrome --remote-debugging-port=9222
```



在命令行你会看到类似下面的内容：

> DevTools listening on ws://127.0.0.1:9222/devtools/browser/d4d05dd2-5b74-4380-b02d-12baa123445

这行ws很重要，我们把它记下来。

4. 修改配置文件

修改config/common.yaml 里面的内容：

```yaml
# chrome driver地址
service_location: /Users/wayne/Downloads/work/chromedriver-mac-arm64/chromedriver
# chrome调试地址
debugger_address: localhost:9222/devtools/browser/4aab2b8b-112c-48a3-ba38-12baa123445
```



把service_location和debugger_address修改为你自己本机的配置。

```yaml
enable:
  csdn: True
  jianshu: True
  juejin: True
  segmentfault: True
  oschina: True
  cnblogs: True
  zhihu: True
  cto51: True
  infoq: True
  toutiao: True
  alicloud: True
  txcloud: True
```

这些按照你自己的需求开启。

5. 运行程序

运行open_all.py 可以自动打开所有的博客网站。

运行publish_all.py 可以自动发布博客内容。

> 切记，在发布博客之前，一定要先保证你的账号是登录状态，否则无法发送博客。

## 简书的实现

接下来我们会从最简单的简书开始，讲解一下具体的实现细节。

### 配置文件

首先是配置文件，这里我用的是yaml格式的配置文件。

里面配置了service_location， debugger_address 这些非常重要的东西。



因为不同的博客平台可能有不同的配置。所以这里我们为每个博客平台设置了一个单独的配置文件。

### 启动浏览器

这里使用的是append模式，append到当前打开的浏览器上面。所以我们需要提前以debug模式开启一个chrome浏览器。

这里我们使用的chrome浏览器。

```python
# 启动浏览器驱动服务
service = Service(common_config['service_location'])

# Chrome 的调试地址
debugger_address = common_config['debugger_address']

# 创建Chrome选项，重用现有的浏览器实例
options = Options()
options.page_load_strategy = 'normal'  # 设置页面加载策略为'normal' 默认值, 等待所有资源下载,
# options.page_load_strategy = 'eager' # 设置页面加载策略为'eager' 默认值, 不等待资源下载,
# options.page_load_strategy = 'none'  # 完全不会阻塞 WebDriver

options.add_experimental_option('debuggerAddress', debugger_address)

# 使用服务和选项初始化WebDriver
driver = webdriver.Chrome(service=service, options=options)
```

主要就是在启动chrome的时候，需要选择service和options。

### 发布博客

启动好浏览器，接下来就可以发布博客了。

首先我们打开简书的首页：

```python
    # 打开新标签页并切换到新标签页
    driver.switch_to.new_window('tab')

    # 浏览器实例现在可以被重用，进行你的自动化操作
    driver.get(jianshu_config['site'])
    time.sleep(2)  # 等待2秒
```

`driver.switch_to.new_window` 确保我们是在新的tab页打开的简书首页。通过调用driver.get方法，我们可以打开简书的首页。

接下来就是需要点击写文章按钮。

要点击文章按钮，首先需要找到这个按钮。

怎么找到它呢？

熟悉selenium的朋友一定知道怎么用的，这里我给不熟悉的朋友介绍一下，在chrome浏览器中找到要定位的元素，右键选择检查，就可以找到了。

```python
    # 写文章按钮
    write_btn = driver.find_element(By.CLASS_NAME, 'write-btn')
    write_btn.click()
    time.sleep(2)  # 等待3秒
```

 这里我们通过class name来查找发布文章的按钮。

![image-20240429231837646](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404292318041.png)



selenium中可以通过class,xpath,tag,id等类型进行元素的定位和查找。

id是最简的，因为id是全局唯一的，你只需要找到对应id即可。

tag和class往往会有很多个，不是很好定位。这个时候就需要用到xpath定位了。

xpath定位很强大，但是也比较复杂，接下来我们会在实际的案例中进行总结。



点击写文章，我们会跳转到新的写文章的界面，在简书中，左边是文集区，中间是文章区，右边是发布文章区：

![image-20240429233421885](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404292334175.png)



接下我们要做的就是点击左边的文集，然后点击中间的文章，最后在最右边发布文章。

在点击左边的文集之前，需要先切换到最新打开的tab页面：

```python
    # 切换到新的tab
    driver.switch_to.window(driver.window_handles[-1])
    # 等待新标签页完成加载内容
    wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, 'li'), '日记本'))
```

然后我们做一个等待，等待日记本这几个字出现再进行下面的操作。

接下来就是点击要选择的文集：

```python
    # 找到要发表的文集
    # 使用XPath表达式查找元素
    article_collection = jianshu_config['article_collection']
    li_element = driver.find_element(By.XPATH, f'//li[@title="{article_collection}"]')
    li_element.click()
    time.sleep(2)  # 等待3秒
```

这里通过xpath来找到要发表的文集。

> 这里的article_collection是写在配置文件里面的，需要修改为你自己的文集，否则程序会报错

点击新建文章按钮：

```python
    # 点击新建文章按钮
    new_article_btn = driver.find_element(By.CLASS_NAME, 'fa-plus-circle')
    new_article_btn.click()
    time.sleep(2)  # 等待3秒
```

找到文章内容，然后通过send_keys方法，把内容填写到content里面:

```java
    # 文章内容
    content = driver.find_element(By.ID, 'arthur-editor')
    file_content = read_file_with_footer(common_config['content'])
    content.clear()
    content.send_keys(file_content)
    time.sleep(2)  # 等待3秒
```

> 注意，这里我单独添加了一个footer内容，也就是自定义的文章尾部，方便大家做一些特殊的操作。

最后是找到文章的标题框：

```python
    # 文章标题
    title = driver.find_element(locate_with(By.TAG_NAME, "input").above({By.ID: "arthur-editor"}))
    title.clear()
    title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

> 简书的这个标题框不太好找，使用xpath很难定位，所以这里使用了一个小技巧：
>
> 先定位到它附近的arthur-editor，然后调用selenium的above命令，找到在他上面的input tag。

![image-20240429234936105](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404292349799.png)

这个定位非常巧妙，大家可以学习一下。

然后就是发布按钮了：

```python
    # 发布按钮
    publish_button = driver.find_element(By.XPATH, '//a[@data-action="publicize"]')

    publish_button.click()
```

是不是一切都做完了呢？

并不是。

如果你的markdown里面有图片的话，很可能出现异常，说是有图片未上传成功。

那么我们需要定位到弹窗窗口的确定按钮，再点击发布按钮一次。

```python
# 检查弹窗
        alert = wait.until(EC.text_to_be_present_in_element((By.XPATH, '//div[@role="document"]'), '有图片未上传成功'))
        if alert:
            ok_button = driver.find_element(locate_with(By.TAG_NAME, "button").near({By.XPATH: '//div[@role="document"]'}))
            ok_button.click()
            time.sleep(2)
            print("Alert accepted")
            # 重新发布一次
            publish_button.click()
        else:
            print("No alert found")
```

## 总结

好了，自动发布到简书的任务就完成了。

总结一下，简书其实还是比较简单的，因为没有各种tag，也没有封面图片。就是博客内容对图片识别效果不太好。
