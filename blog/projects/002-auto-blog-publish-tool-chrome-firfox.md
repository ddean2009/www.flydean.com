---
title: 一键自动化博客发布工具,chrome和firfox详细配置
authors: flydean
tags: [自动化工具,博客,自动发布]
image: https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405041206516.png
---

blog-auto-publishing-tools博客自动发布工具现在已经可以同时支持chrome和firefox了。

很多小伙伴可能对于如何进行配置和启动不是很了解，今天带给大家一个详细的保姆教程，只需要跟着我的步骤一步来就可以无障碍启动了。



## 前提条件

前提条件当然是先下载 blog-auto-publishing-tools这个博客自动发布工具,地址如下：https://github.com/ddean2009/blog-auto-publishing-tools

## chrome配置

现在的主流浏览器肯定是chrome无疑了。所以我们首先聊一聊如何实现对chrome浏览器的支持。

### 使用selenium正常启动chrome浏览器

selenium本身就自带对chrome的支持，所以在selenium中使用chrome也是一个非常简单的事情。

1. 首先你需要下载安装chrome。

2. 然后使用pip来安装selenium:

```bash
pip install selenium
```

3. 你需要从[ChromeDriver下载页面](https://googlechromelabs.github.io/chrome-for-testing/)下载与你的Chrome浏览器版本相对应的ChromeDriver。确保你下载的是与你的操作系统和Chrome版本相匹配的版本。
4. 然后就可以在代码中使用了：

```python
from selenium import webdriver  
  
# 指定ChromeDriver的路径  
driver_path = '/path/to/your/chromedriver'  # 替换为你的ChromeDriver路径  
  
# 创建一个新的Chrome浏览器实例  
driver = webdriver.Chrome(executable_path=driver_path)  
  
# 访问一个网站  
driver.get('http://www.example.com')  
  
# ... 在这里执行你的Selenium操作 ...  
  
# 关闭浏览器  
driver.quit()
```

简单是简单，但是这样做的缺点是每次都需要下载一个新的，内置的chrome浏览器，所以在国内的网络环境下，很多人以为是程序被卡死了。

实际上并不是，只是网络慢而已。

事实上，我们已经已经在使用chrome了，为什么不能attach到现有的chrome上运行selenium呢？

### 使用selenium连接到现有的chrome浏览器

这是blog-auto-publishing-tools正在做事情。

> 优点: 这样做的优点有两个。
>
> 第一就是不需要重新下载chrome浏览器。
>
> 第二就是可以借助现有浏览器的登录态，不需要每次都在程序中重新登录。因为有些网站的登录条件是很复杂的。比如腾讯云，你需要时不时的进行手机扫码才能登录。

我们的步骤如下：

1. 下载并安装 [Chrome](https://www.google.com/chrome/)。
2. 下载chrome Driver [Chrome Driver](https://googlechromelabs.github.io/chrome-for-testing/)。
3. chrome 以debug模式启动

如果是mac电脑，那么可以先给chrome设置一个alias

```bash
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
```
以debug模式启动

```bash
chrome --remote-debugging-port=9222
```
> !!!! 注意！！！
> chrome启动之后，一定要新开一个空白tab页，或者随便打开一个网站，否则后面的selenium可能会出现假死的情况

在命令行你会看到类似下面的内容：

>DevTools listening on ws://127.0.0.1:9222/devtools/browser/d4d05dd2-5b74-4380-b02d-12baa123445
> 

这行ws很重要，我们把它记下来。

如果你是windows，那么在chrome的快捷方式后面加上 --remote-debugging-port=9222 参数。

![image-20240503190824756](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405031908055.png)



启动chrome，输入chrome://version 检测 --remote-debugging-port=9222 是否出现在页面上。

![image-20240503190854471](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405031908887.png)



然后输入：

> http://localhost:9222/json/version

获得 webSocketDebuggerUrl：



![image-20240503190939248](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405031909990.png)



4. 修改配置文件

修改config/common.yaml 里面的内容：

```yaml
# chrome driver地址
service_location: /Users/wayne/Downloads/work/chromedriver-mac-arm64/chromedriver
# chrome调试地址
debugger_address: localhost:9222/devtools/browser/4aab2b8b-112c-48a3-ba38-12baa123445
```

把service_location和debugger_address修改为你自己本机的配置。



> 你也可以使用简单版本的 debugger_address: localhost:9222
>
> 我在windows环境下测试过是可以连接的。
>
> 在mac环境下有时可以连接，有时候不能连接，大家可以自行测试。

这样，使用下面的代码就可以连接到现有的chrome了：

```python
    # 启动浏览器驱动服务
    service = selenium.webdriver.chrome.service.Service(common_config['service_location'])
    # Chrome 的调试地址
    debugger_address = common_config['debugger_address']
    # 创建Chrome选项，重用现有的浏览器实例
    options = selenium.webdriver.chrome.options.Options()
    options.page_load_strategy = 'normal'  # 设置页面加载策略为'normal' 默认值, 等待所有资源下载,
    options.add_experimental_option('debuggerAddress', debugger_address)
    # 使用服务和选项初始化WebDriver
    driver = webdriver.Chrome(service=service, options=options)
```

## firefox配置

除了chrome之外，用的最多的应该就是firefox了。

所以blog-auto-publishing-tools也提供了对firefox的支持。

### 使用selenium正常启动firefox浏览器

要常规使用firefox，你需要下面几部：

1. 下载并安装 [Firefox](https://www.mozilla.org/en-US/firefox/new/)。

2. 下载[**geckodriver**](https://github.com/mozilla/geckodriver/releases) 驱动.下载与你的Firefox浏览器版本相对应的geckodriver。确保你下载的是与你的操作系统和Firefox版本相匹配的版本。

3. 在代码中使用：

```python
from selenium import webdriver  
  
# 指定geckodriver的路径  
driver_path = '/path/to/your/geckodriver'  # 替换为你的geckodriver路径  
  
# 创建一个新的Firefox浏览器实例  
driver = webdriver.Firefox(executable_path=driver_path)  
  
# 访问一个网站  
driver.get('http://www.example.com')  
  
# ... 在这里执行你的Selenium操作 ...  
  
# 关闭浏览器  
driver.quit()
```

同样的，因为网络问题，所以这种方式在国内的环境中会很慢。

我们看看另外一种方式。

### 使用selenium连接到现有的firefox浏览器

1. 下载并安装 [Firefox](https://www.mozilla.org/en-US/firefox/new/)。

2. 下载[**geckodriver**](https://github.com/mozilla/geckodriver/releases) 驱动.下载与你的Firefox浏览器版本相对应的geckodriver。确保你下载的是与你的操作系统和Firefox版本相匹配的版本。

3. 在firefox的启动命令之后加上： ` -marionette -start-debugger-server 2828`

![image-20240504120509315](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405041205192.png)

> 注意，这里的端口一定要是2828,不能自定义。

这时候你如果打开firefox,就会看到导航栏变成了红色，表示你已经启动了远程调试模式。

![image-20240504120607831](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202405041206516.png)

输入`about:config`

可以看到marionette.port的端口就是2828。

4. 修改配置文件

修改config/common.yaml 里面的内容：

```yaml
# firefox driver地址
service_location: "D:\\downloads\\geckodriver-v0.34.0-win32\\geckodriver.exe"
```

把driver_type修改为firefox。

```python
#driver_type: "chrome"
driver_type: "firefox"
```

接下来就可以在程序中使用了:

```python
 # 启动浏览器驱动服务
    service = selenium.webdriver.firefox.service.Service(common_config['service_location'],
                                                         service_args=['--marionette-port', '2828',
                                                                       '--connect-existing'])
    # 创建firefox选项，重用现有的浏览器实例
    options = selenium.webdriver.firefox.options.Options()
    options.page_load_strategy = 'normal'  # 设置页面加载策略为'normal' 默认值, 等待所有资源下载,
    driver = webdriver.Firefox(service=service, options=options)
```

## 总结

我在mac上测试了chrome，在windows上同时测试了chrome和firefox。都是可以用的。大家有问题可以私信我。
