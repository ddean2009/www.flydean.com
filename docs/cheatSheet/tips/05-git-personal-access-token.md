---
slug: /05-git-personal-access-token
---

# 8. 使用账号密码来操作github? NO!

# 简介

最近在更新github文件的时候，突然说不让更新了，让我很是困惑，原因是在2021年8月13号之后，github已经不让直接使用账号名密码来登录了，必须使用personal access token。今天给大家讲解一下怎么对这个token进行缓存。

# 背景介绍

github为了安全性考虑，在2020年7月就准备对所有需要使用身份认证的git命令切换成基于令牌的身份验证。并且从2021年8月13日开始，在 GitHub.com上对Git操作进行身份验证时将不再接受帐户密码。

这个改动只对使用用户名密码进行github交互的用户受影响。如果你使用的是SSH，或者之前就使用的是令牌，或者使用的是GitHub Desktop，那么不会有任何影响。

github做出这个决定主要是对于安全的考虑，明文的密码很容易被泄露，如果换成有时限的token，即使泄露了影响也会非常有限。

并且可以为同一个github账号根据不同的使用途径，生成不同的token，并且随时都可以控制token的有效状态和不同token代表的权限。最大限度的保证账号的安全性。

生成的token可随时撤销，并且令牌的随机性更高，不容易被暴力破解。

# 创建令牌

令牌，英文名叫做token，个人访问令牌英文简写为PAT。它是一种使用密码对 GitHub 进行身份验证的替代方法。

你可以将token看做是密码，不过这个token具有权限和有效时间的限制。同时为了安全起见，GitHub 会自动删除一年内未使用的个人访问令牌。 为了保证令牌的安全性，我们强烈建议为个人访问令牌添加过期时间。 

要使用令牌首先需要创建令牌。怎么创建令牌呢？

首先登录github.com,在我的账号下方，选择settings:

![](https://img-blog.csdnimg.cn/3630b565d2d84e20bb74e4cda091d8cf.png)

然后在左侧边栏中，点击开发人员设置:

![](https://img-blog.csdnimg.cn/8595d0c584ca45efa5a2e35c06cced45.png)

然后选择左边的个人访问令牌:

![](https://img-blog.csdnimg.cn/a90c23b239c74ed0892d4fc4f6772dbd.png)

点击生成令牌按钮，就可以生成令牌了。

![](https://img-blog.csdnimg.cn/6e6a1fe83fdc4ffbb0b5b2759a5f63c1.png)

在创建过程中，我们需要输入和选择一些数据：

![](https://img-blog.csdnimg.cn/95a81f4b36fa43c8837de9354cbaf437.png)

比如我们需要给这个token起个名字，用来区分不同的使用场景，还要选择一个过期时间，为了安全起见，这个过期时间不要太长。

最后，就是token对应的权限了，如果你只是对repository进行操作，选择repo即可。

这样一个令牌就创建好了。

> 注意，创建好的令牌需要及时保存，因为后续也不能再从网页上查看该令牌的内容。令牌的保存需要和密码的保存一样注意安全。

# 使用令牌

上面我们提到了，令牌就相当于密码，比如我们在拷贝一个需要密码的repository使用输入你的用户名和token就可以正常操作了。

```
$ git clone https://github.com/username/repo.git
Username: your_username
Password: your_token
```

但是如果每次都需要输入密码就太麻烦了。下面讲解一下怎么在git中缓存令牌。事实上令牌跟密码是等价的，在git中缓存密码的方式同样适用于缓存令牌。

# 缓存令牌

通过设置credential.helper的缓存方式，可以对密码进行缓存。

通常来说有两种方式，一种是cache，一种是store。

cache是将密码放在内存中一段时间，密码不会存放在磁盘中，过一段时间会自动从内存中清除。

通过使用下面的命令，可以开启cache：

```
git config --global credential.helper cache
```

对于store来说，它接收一个文件的路径，用来存储密码文件。默认存放的路径是~/.git-credentials，可以通过指定--file来修改：

```
git config --global credential.helper 'store --file /data/git/.git-credentials'
```

如果你使用的mac系统，mac提供了一个osxkeychain的东西，可以将密码存储到你的系统用户的钥匙串中。这种方式更加优雅，首先密码是加密保存的，另外其管理起来也非常方便，还有可视化的界面。

当然你也可以从命令行将github的存储密码进行删除：

```
$ git credential-osxkeychain erase
host=github.com
protocol=https
> [Press Return]
```

如果你在windows机子上，那么可以安装一个叫做““Git Credential Manager for Windows”的工具，它是一个和osxkeychain类似的东西。

# 使用GCM

上面介绍的存储方法都已经过时了，现在github推荐使用Git Credential Manager Core (GCM Core) 来对你的客户端凭证进行管理。

通过使用GCM Core，根本不需要创建和储存PAT，全部都有GCM Core来代表你进行管理。

怎么安装GCM呢？下面是在mac上安装的过程：

首先安装git：

```
brew install git
```

然后安装GCM Core：

```
$ brew tap microsoft/git
$ brew install --cask git-credential-manager-core
```

在下次你clone需要使用身份验证的HTTPS URL时，Git将会提示你使用浏览器窗口登录，通过授权OAuth应用程序，实现GCM Core对凭证的管理功能。

成功通过身份验证后，你的凭据将存储在macOS钥匙串中，并且每次克隆HTTPS URL时都会使用钥匙串中的凭证。 Git不会要求你再次在命令行中键入凭据，除非你更改凭据。

GCM Core同样可以在windows和linux环境下使用。

# 总结

通过生成新的token，并更换现有的缓存密码，最终我的github又可以重新提交了，赞！











