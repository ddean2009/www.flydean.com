---
title: 一键自动化博客发布工具,用过的人都说好(cnblogs篇)
authors: flydean
tags: [工具,自动化,自动发布,程序那些事]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071718558.png
description: 使用一键自动化博客发布工具blog-auto-publishing-tools把博客发布到cnblogs上。
---

cnblogs和其他的博客平台相比会比较复杂，需要设置的项目也比较多一些，弄懂了cnblogs的实现方式，那么你应该对selenium的整个框架使用已经烂熟于心了。

除了正常的标题，内容，摘要之外，cnblogs还需要设置个人分类，合集，投稿选项，投稿至网站分类，tags标签等内容。

要填的东西比较多，比较复杂。接下来我们会一项项的介绍cnblogs的具体实现方式。

## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## cnblogs的实现

因为需要设置个人分类，合集，投稿选项，投稿至网站分类，tags标签等内容，所以我们需要在配置文件中提供这些内容。

配置文件在config/cnblogs.yaml中。

首先是个人分类和合集部分：

<!-- truncate -->

```yaml
# 个人分类  工具技巧 AIGC
categories:
  - 工具技巧

# 添加到合集: 工具技巧 AIGC
collections:
  - 工具技巧
```

这两个部分都是需要你自己提前在cnblogs中创建好的。否则你会找不到这些内容,对应的界面地址如下：

![image-20240507171326499](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071713544.png)

接下来是投顾至网站分类：

![image-20240507171845646](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071718558.png)

cnblogs的这些网站分类是直接用文字来说明的，所以我们需要在配置文件中再定义一个网站分类：

```yaml
topic: 开源研究
```

最后就是tag标签了，我们直接设置即可：

```yaml
tags:
  - 人工智能
  - aigc
  - openai
  - ai开发
  - 程序那些事
```

![image-20240507172029658](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071720067.png)

### 文章标题

不得不说cnblogs的实现就是正规，cnblogs几乎每个输入的标签都是带有ID的，所以我们实现起来特别的简单，这里要给cnblogs点个赞。

```python
    # 文章标题
    title = driver.find_element(By.ID, 'post-title')
    title.clear()
    if 'title' in front_matter['title'] and front_matter['title']:
        title.send_keys(front_matter['title'])
    else:
        title.send_keys(common_config['title'])
    time.sleep(2)  # 等待2秒
```

我们找到ID，直接调用send_keys方法即可。

### 文章内容

cnblogs的文章内容是一个textarea,也是带有ID的，所以我们直接根据ID获取即可：

```python
    # 文章内容
    file_content = read_file_with_footer(common_config['content'])
    content = driver.find_element(By.ID, 'md-editor')
    content.send_keys(file_content)
    time.sleep(5)  # 等待5秒
```

### 页面滚动

如果你观察cnblogs的页面，可以看到文章内容之后已经占满了整个屏幕，如果我们还需要继续处理后面的内容的话，就需要对页面进行一个滚动操作。

这里我们借用了ActionChains的scroll to element方法。

首先我们找到最下面的发布按钮，然后直接滚动到这个发布按钮即可。

```python
    # 滚轮滚到最下面的位置
    submit_button = driver.find_element(By.XPATH, '//button[@data-el-locator="publishBtn"]')
    ActionChains(driver) \
        .scroll_to_element(submit_button) \
        .perform()
    time.sleep(1)
```

### 个人分类

个人分类是一个下拉框。

![image-20240507173020475](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071730918.png)

他有一个比较特别的tag name叫做cnb-post-category-select。

所以我们可以通过这个tag name找到这个元素，然后点击他。

因为所有的要选择的元素都是在cnb-post-category-select这个tag内部的，所以我们调用post_category_select.find_element来查找它内部的input元素。

找到之后，我们输入个人分类，然后从下拉框中选择对应的个人分类tag，然后点击回车。

所有的个人分类都选择完毕之后，我们再次点击post_category_select，以关闭下拉框。

对应的代码如下：

```python
    # 个人分类
    categories = cnblogs_config['categories']
    if categories:
        post_category_select = driver.find_element(By.TAG_NAME, 'cnb-post-category-select')
        post_category_select.click()
        for category in categories:
            category_search = post_category_select.find_element(By.XPATH, '//nz-select-search/input')
            category_search.send_keys(category)
            time.sleep(1)
            category_select = post_category_select.find_element(By.XPATH, f'//nz-tree-node-title[contains(@title, "{category}")]/div')
            category_select.click()
            time.sleep(0.5)
        post_category_select.click()
    time.sleep(2)
```

### 添加到合集

添加到合集的实现方式跟个人分类有些类似。

![image-20240507173806856](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071738966.png)

默认情况下，添加到合集这个选项中的内容是隐藏的，所以我们需要首先点击这个选项头，让对应的选项露出来。

这里可以通过name来获取到这个元素。然后点击。

接下来就是通过text属性来查找collection_select中要选择的合集元素，然后点击他们。

> 注意，这里如果选择的是包含合集文字的span，如下所示。这个span是不可被点击的。
>
> 所以我们的解决办法就是找到它的父元素。
>
> 通过： collection_item.find_element(By.XPATH, '..') 来实现。
>
> 然后点击他的父元素即可。

![image-20240507174113523](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405071741336.png)

最终的实现代码如下：

```python
    # 添加到合集
    collections = cnblogs_config['collections']
    if collections:
        collection_select = driver.find_element(By.NAME, '添加到合集')
        collection_select.click()
        # print(collection_select.get_attribute('innerHTML'))
        for collection in collections:
            collection_item = collection_select.find_element(By.XPATH, f'//span[contains(@class,"item__text") and contains(text(), "{collection}")]')
            parent_element = collection_item.find_element(By.XPATH, '..')
            # print(parent_element.tag_name)
            parent_element.click()
            time.sleep(0.5)
    time.sleep(2)
```

### 投稿选项

投稿选项比较简单，直接通过ID选择即可：

```python
    # 投稿选项
    post_type = driver.find_element(By.ID, 'site-publish-site-home')
    post_type.click()
    time.sleep(2)
```

### 投顾至网站分类

网站分类的ID就是分类的名字，所以，我们可以下面代码来实现：

```python
    # 投顾至网站分类
    topic = cnblogs_config['topic']
    if topic:
        post_type_detail = driver.find_element(By.NAME, '投稿至网站分类')
        post_type_detail.click()
        topic_item = driver.find_element(By.ID, topic)
        topic_item.click()
    time.sleep(2)
```

### 摘要

摘要也是通过ID来获取的，代码如下：

```python
    # 摘要
    summary = common_config['summary']
    summary_item = driver.find_element(By.ID, 'summary')
    summary_item.send_keys(summary)
    time.sleep(2)
```

### tag标签

tag标签是一个输入框。所以我们先定位到这个输入框，然后输入tag，等待网站的tag列表出来之后，直接回车即可。

实现代码如下：

```python
    # tag标签
    tags = cnblogs_config['tags']
    if tags:
        tag_item = driver.find_element(By.ID, 'tags')
        tag_item.click()
        for tag in tags:
            tag_input = tag_item.find_element(By.TAG_NAME, 'input')
            tag_input.send_keys(tag)
            time.sleep(1)
            tag_input.send_keys(Keys.ENTER)
    time.sleep(2)
```

### 提交文章

最后就是提交文章啦，这个提交按钮需要根据xpath来获取：

```python
    # 提交文章
    if auto_publish:
        submit_button = driver.find_element(By.XPATH, '//button[@data-el-locator="publishBtn"]')
        submit_button.click()
```

## 总结

cnblogs的实现还是比较规范的，主要就是各项内容会比较多一些，需要耗费一些时间来实现。
