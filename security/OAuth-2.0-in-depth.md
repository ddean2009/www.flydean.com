OAuth 2.0认证框架详解

# 简介

在现代的网站中，我们经常会遇到使用OAuth认证的情况，比如有一个比较小众的网站，需要用户登录，但是直接让用户注册就显得非常麻烦，用户可能因为这个原因而流失，那么该网站可以使用OAuth认证，借助于github或者其他的第三方认证网站来进行用户认证，从而避免了用户注册的步骤。

当然，很可能在第三方网站上认证之后，还需要在本网站填写一些必要的信息进行绑定，比如手机号，用户名等等。

但是这比单纯的注册要方便太多了，也容易让用户接受。

今天，我们将要讲解一下OAuth 2.0认证框架的构成，希望大家能够喜欢。

# OAuth的构成

在传统的CS模式的认证系统中，如果我们想要借助第三方系统来访问受限的资源，第三方系统需要获取到受限资源服务器的用户名和密码，才能进行对资源服务器的访问，很显然这个是非常不安全的。

在OAuth2中，我们是怎么做的呢？

我们先来看一下OAuth2中认证的流程图：

![](https://img-blog.csdnimg.cn/20200914225501505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

一般来说OAuth2中有4个角色。

resource owner： 代表的是资源的所有者，可以通过提供用户名密码或者其他方式来进行授权。通常来是一个人。

resource server：代表的是最终需要访问到资源的服务器。比如说要登录的网站。

client： 用来替代resource owner来进行认证的客户端。

authorization server： 用来进行认证的服务器，可以生成相应的Access Token。

整个流程是这样的：

Client向resource owner发起一个认证请求，resource owner输入相应的认证信息，将authorization grant返回给client。

client再将获取到的authorization grant请求认证服务器，并返回access token。

client然后就可以拿着这个access token去请求resource server，最后获取到受限资源。

# refresh Token

为了安全起见，access token总是有过期时间的，那么如果token过期了怎么办呢？

具体的办法就是refresh Token :

我们看一下refresh token的流程图：

![](https://img-blog.csdnimg.cn/20200914231713295.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

前面的A，B，C，D和之前的讲到的流程是一致的。

如果接下来访问资源的时候，access token过期了，那么client会再次向认证服务发出refresh token的请求。

然后认证服务器会再次返回新的access token.

# Authorization Code模式

上面我们讲到的模式中，Client会保存Authorization Grant信息，并通过这个信息来去认证服务器请求Access Token。

Client直接保存Authorization Grant信息，并和认证服务器进行通信，这对client会有一定的安全限制。

如果是在web环境中，client是借助user-agent(web浏览器)来进行访问的该如何处理呢？

这里向大家介绍一个Authorization Code模式。

![](https://img-blog.csdnimg.cn/20200915093456233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

Client通过User-Agent发起请求，并附带跳转链接。当提供了用户的认证信息之后，认证服务器返回的不是token而是authorization code,拿到这个code之后，client可以通过这个code来获取access Token或者refresh Token。

上面的认证流程图我们可以通过一个具体的例子来说明，resource owner就是我们自己。 Resource Server是我们需要访问的服务器，比如 www.flydean.com, Authorization Server是第三方的认证服务器，比如github。而User-Agent就是浏览器。

好了，我们开始具体流程的讲解：

比如我想访问 www.flydean.com，但是需要登录，这个时候就跳转到github的登录界面，我们输入github的用户名密码，github会返回一个Authorization Code到我们的服务器比如 www.flydean.com/?code=code, client拿到这个code之后，会去后台请求github,去验证这个code的合法性，如果code合法，则github会返回access token的信息，client后面就可以通过access token去请求资源服务器资源了。

举一个具体的access token返回值的例子：

~~~shell
     HTTP/1.1 200 OK
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "access_token":"2YotnFZFEjr1zCsicMWpAA",
       "token_type":"example",
       "expires_in":3600,
       "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
       "example_parameter":"example_value"
     }
~~~

# 隐式授权

在上面我们讲到的几个模式中，client都需要直接和认证服务器进行通信，从而获取到access Token，有没有什么方式可以不需要client和认证服务器直接通信就可以得到access token呢？

接下来我们讲一下隐式授权。


![](https://img-blog.csdnimg.cn/20200915095620721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图就是一个隐式授权的例子，和Authorization Code模式不同的是，认证服务器返回的是一个access token片段，只有这个片段，我们是无法得到access token的。

这里我们需要额外请求一次client resource服务器，服务器将会返回一个script脚本，通过这个脚本，我们对access token片段进行解析，得到最终的access token。

# Resource Owner 授权密码认证

这种模式一般出现在resource owner非常信任client的情况下。

我们先看一下流程图：

![](https://img-blog.csdnimg.cn/20200915103435461.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这种模式实际上相当于用户将密码交给client保管，由client使用保存好的用户名密码向认证服务器请求资源。

# Client 认证授权

这种模式下，client本身是有一定的授权范围的，可以通过client认证授权，直接获取到认证服务器的access token。

![](https://img-blog.csdnimg.cn/20200915103640988.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

# github的OAuth2认证流程

上面讲的通用流程中，其实很多角色都可以合并的。

接下来我们具体讲解一下如何使用github的OAuth2进行认证。

要使用github的OAuth2，需要首先在github中进行OAuth服务的注册。

![](https://img-blog.csdnimg.cn/20200915110002734.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

点击注册按钮，输入相应的信息，我们就可以完成注册了。

![](https://img-blog.csdnimg.cn/20200915110107121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这里比较重要的就是callback url，我们会通过这个callback url来传递认证信息。

注册成功之后，你会得到一个Client ID和Client Secret。

github的认证步骤分为三个部分：

## 用户跳转到github的认证页面进行认证

在这一部分中，我们需要跳转到github的认证页面：

~~~shell
https://github.com/login/oauth/authorize
~~~

上面是跳转页面的链接，这个链接可以接下面几个参数：

client_id： 必须的参数，是我们上面注册app得到的client id。

redirect_uri： 可选参数，如果不设定，则会使用注册的时候提供的callback uri。

login：可选参数，指定具体的认证用户名。

scope：github中权限的范围。

state： 是一个随机数，用来防止cross-site攻击。

allow_signup： 是否允许在认证的时候注册。

看一下跳转的页面：

![](https://img-blog.csdnimg.cn/20200915111343525.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

## 用户跳转回要访问的资源页面

当用户授权之后，就会调整到callback页面，并带上code:

~~~shell
http://www.flydean.com/login?code=b14a2dd57f11b2310f42
~~~

应用程序拿到code之后，通过调用下面的请求来获取access token：

~~~shell
POST https://github.com/login/oauth/access_token
~~~

这个post请求需要带上client_id，client_secret，code这三个必须的参数，还可以带上两个可选的参数redirect_uri和state。

默认情况下，我们会获取到下面的响应信息：

~~~shell
access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer
~~~

## 应用程序拿到access token获取到github用户信息

有了access token之后，我们需要将token放到请求head中，去请求用户信息：

~~~shell
Authorization: token OAUTH-TOKEN
GET https://api.github.com/user
~~~

# 总结

OAuth2是一个非常常用的协议，也非常的方便，建议大家可以在自己的网站中使用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
