---
title: 一键自动化博客发布工具,用过的人都说好(公众号篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405191102525.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到公众号篇上。
---

之前收到很多朋友的要求，说是需要一个公众号的自动发布工具。

现在，它来了。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## 公众号的实现

因为公众号每隔一段时间就会登录失效，所以在使用自动发布公众号之前，一定要确保你的公众号是登录状态。

否则没办法自动发布公众号消息。

<!-- truncate -->

### 登录到首页

如果你已经登录过公众号，那么可以直接访问https://mp.weixin.qq.com/， 这样会直接跳转到公众号的后台发布界面。

### 点击图文消息

到了首页之后，我们就可以点击图文消息这个按钮，开始我们的创作了。

![image-20240519110216544](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405191102525.png)

公众号的图文消息实现的比较复杂。我们只能通过xpath来定位到这个元素。

```python
    # 点击图文消息
    pic_and_article_button = driver.find_element(By.XPATH, '//div[@class="new-creation__menu-item"]//div[@class="new-creation__menu-title" and contains(text(), "图文消息")]')
    pic_and_article_button.click()
    time.sleep(1)
```

点击之后，就会跳转到公众号创作页面。

所以，我们需要切换一下tab：

```python
    # 切换到新的tab
    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(1)
```

### 输入标题

公众号的标题是带有title id的，所以我们可以直接通过id来获取。

```python
    # 文章标题
    title = driver.find_element(By.ID, 'title')
    title.clear()
    if 'title' in front_matter['title'] and front_matter['title']:
        title.send_keys(front_matter['title'])
    else:
        title.send_keys(common_config['title'])
    time.sleep(2)  # 等待3秒
```

### 输入作者

公众号的作者也是带有author id的。

这里有两种方法来配置作者ID，第一种，也是推荐的一种就是把作者，title，图片等信息写到markdown文件的YAML Front Matter中，如下所示：

![image-20240507154807745](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071548984.png)

第二种就是在mpweixin自己的配置文件中设置author这个字段。

两种都可以，但是我个人推荐第一种。

实现代码如下：

```python
    # 文章作者
    author = driver.find_element(By.ID, 'author')
    if 'authors' in front_matter and front_matter['authors']:
        author.send_keys(front_matter['authors'])
    else:
        author.send_keys(mpweixin_config['author'])
    time.sleep(1)
```

### 文章内容

说实话，我不知道腾讯到底是怎么想的，这里的文章内容居然是一个嵌入的iframe：

![image-20240519111141051](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405191111391.png)

说不上为什么，但是总是感觉怪怪的。

不过没关系，我们还是能够实现。

当然，这种就不能像传统方式那样来设置内容了。

我们只能使用拷贝粘贴的方式。

另外，微信公众号不能识别markdown，所以我们必须把markdown转换成为html。

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
    content_file_html = convert_md_to_html(content_file, False)
    get_html_web_content(driver, content_file_html)
    time.sleep(2)  # 等待2秒
    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(1)  # 等待1秒
    # 不能用元素赋值的方法，所以我们使用拷贝的方法
    cmd_ctrl = Keys.COMMAND if sys.platform == 'darwin' else Keys.CONTROL
    action_chains = webdriver.ActionChains(driver)
    # 点击内容元素
    content_element = driver.find_element(By.ID, 'edui1_contentplaceholder')
    ActionChains(driver).click(content_element).perform()
    time.sleep(1)
    # 模拟实际的粘贴操作
    action_chains.key_down(cmd_ctrl).send_keys('v').key_up(cmd_ctrl).perform()
    time.sleep(3)  # 等待5秒 不需要进行图片解析
```

### 添加封面

公众号的这个添加封面比较复杂，目前我还没找到它对应的input上传tag。所以这个功能展示就没实现。

### 原创声明

一般来说，大家应该都是原创的。

所以原创声明这个功能我实现了。

首先我们需要点击原创这个label：

```python
        original_statement = driver.find_element(By.ID, 'js_original')
        original_statement.click()
```

然后在弹出的对话框中点击确认按钮：

```python
        ## 点击确认按钮
        confirm_button = driver.find_element(By.XPATH, '//div[@class="weui-desktop-dialog"]//div[@class="weui-desktop-btn_wrp"]//button[contains(text(), "确定")]')
        confirm_button.click()
```

### 开启赞赏

只有声明原创之后才能开启赞赏。

所以我们把赞赏放在和原创声明一起。

同样的，赞赏需要点击赞赏的按钮，这里可以通过id来获得：

```python
        # 赞赏
        zhanshang_button = driver.find_element(By.ID, 'js_reward_setting_area')
        zhanshang_button.click()
```

然后在弹出的对话框中，点击确认按钮：

```python
        ## 点击确认按钮
        confirm_button = driver.find_element(By.XPATH, '//div[@class="reward-setting-dialog__footer"]//div[@class="weui-desktop-btn_wrp"]//button[contains(text(), "确定")]')
        confirm_button.click()
```

### 设置合集

然后需要设置的应该就是合集了。

合集我们需要先找到合集的可以点击的区域：

![image-20240519130700907](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405191307247.png)

```python
        tag_button = driver.find_element(By.XPATH, '//div[@id="js_article_tags_area"]//div[contains(@class,"js_article_tags_label")]/span[text()="未添加"]')
        ActionChains(driver).move_to_element(tag_button).perform()
        time.sleep(1)
        ActionChains(driver).click(tag_button).perform()
        time.sleep(1)
```

这里不能用tag_button.click方法，会直接报错。

所以我们可以用ActionChains来模拟鼠标的点击操作。

在弹出框中，我们找到tag input，一个个输入，然后点击回车：

```python
        # 输入标签
        tag_input = driver.find_element(By.XPATH,
                                        '//span[@class="weui-desktop-form-tag__area"]//input[@placeholder="输入后按回车分割"]')
        for tag in tags:
            tag_input.send_keys(tag)
            time.sleep(1)
            tag_input.send_keys(Keys.ENTER)
            time.sleep(1)
```

最后，点击确认按钮：

```python
# 点击确定按钮
        confirm_button = driver.find_element(By.XPATH, '//div[@class="weui-desktop-btn_wrp"]//button[contains(text(), "确定")]')
        confirm_button.click()
```

### 最后的发布

好了，终于到了最后的发布时候了，找到按钮点击即可：

```python
confirm_button = driver.find_element(By.ID, 'js_send')
confirm_button.click()
```

在弹出框中再点一次确认：

```python
send_button = driver.find_element(By.XPATH, '//div[@class="weui-desktop-btn_wrp"]/button[text()="发表"]')
send_button.click()
```

## 总结

公众号的基本功能完成了，实际上还有一些细节内容并没有实现。因为我觉得通常情况下没啥用。

大家如果有需要的话，可以告诉我。

