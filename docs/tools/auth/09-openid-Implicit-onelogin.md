---
slug: /09-openid-Implicit-onelogin
---

# 9. 在onelogin中使用OpenId Connect Implicit Flow

# 简介

onelogin支持多种OpenId Connect的连接模式，上一篇文章我们讲到了使用openId的Authentication Flow，今天我们将会讲解一下如何使用Implicit Flow。

# OpenId Implicit Flow

Implicit Flow也叫做隐式授权

![](https://img-blog.csdnimg.cn/20200915095620721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图就是一个隐式授权的例子，和Authorization Code模式不同的是，认证服务器返回的是一个access token片段，只有这个片段，我们是无法得到access token的。

这里我们需要额外请求一次client resource服务器，服务器将会返回一个script脚本，通过这个脚本，我们对access token片段进行解析，得到最终的access token。

在隐式授权模式，一般用在app或者websites没有后台逻辑的情况。也就是说所有的授权都是在前端完成的。

尤其对于那种单页面应用来说，隐式授权模式特别有用。

我们再看一下在onelogin中的隐式授权流程：

![](https://img-blog.csdnimg.cn/2020101722362387.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

1. 用户尝试建立和你的client app的连接，这个请求将会重定向到onelogin，并且带上配置的唯一client_id。

2. onelogin将会对用户信息进行认证和授权。

3. 授权过后的用户信息将会以id_token (JWT)的形式，传递给onelogin中配置的回调地址。

4. client app使用onelogin的public key对id_token进行校验，如果一切ok，那么将会建立好连接。

我们考虑下隐式授权模式的安全性。

在隐式授权模式下，client app需要从onelogin获取到公钥，然后使用这个公钥去解析onelogin返回的id_token。

虽然恶意用户可能获取到client_id和onelogin的公钥，但是返回的id_token只会发给配置好的callback地址，所以仍然是安全的。

# 创建onelogin的配置

虽然我们在前面的文章中在onelogin中创建了一个app，因为callback的不同，我们这里新创建一个app。

填上我们的callback地址： http://localhost:3000

其他的和之前的配置保持一致。

我们看下最新的SSO配置：

![](https://img-blog.csdnimg.cn/20201017231842995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这里我们需要保存最新的client_ID,因为不是Authentication Flow模式，我们不需要用到client_secret。

注意这里的两个Issuer URLs，这里存储的是onelogin的配置信息。

# 页面的运行和请求流程

我们从onelogin的官网例子中下载隐式授权的单页面应用。

https://github.com/onelogin/onelogin-oidc-node/tree/master/2.%20Implicit%20Flow

在javascript/main.js中修改OIDC的配置：

~~~js
const ONELOGIN_CLIENT_ID = '90a0e970-f2b6-0138-6171-0a5535c40b31178911';
const ONELOGIN_SUBDOMAIN = 'flydean-dev';
~~~

然后运行npm install;npm start来启动这个单页面的应用程序。

![](https://img-blog.csdnimg.cn/20201017233052129.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

点击login按钮,将会跳转到onelogin的登录界面：

![](https://img-blog.csdnimg.cn/20201017234553578.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

输入用户名密码，我们会跳回localhost页面。

这里我们会调用 	https://flydean-dev.onelogin.com/oidc/2/certs  去拿到onelogin的公钥。

通过个这个公钥和返回的id_token，就可以拿到用户的信息。

![](https://img-blog.csdnimg.cn/20201018001559190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

# 关键代码

因为是单页面应用，所有的请求其实都是通过JS来执行的。我们看下系统的关键代码。

为了使用openid协议，这里的例子使用了oidc-client.min.js，通过这个客户端来进行openid协议的连接工作。

下面是页面的openid connect配置信息：

~~~js
var settings = {    
    authority: 'https://' + ONELOGIN_SUBDOMAIN + '.onelogin.com/oidc/2',
    client_id: ONELOGIN_CLIENT_ID,
    redirect_uri: window.location.origin,
    response_type: 'id_token token',
    scope: 'openid profile',

    filterProtocolClaims: true,
    loadUserInfo: true
};
~~~

有了这些配置信息，我们就可以创建oidc的manager：

~~~js
var mgr = new Oidc.UserManager(settings);
~~~

关键代码很简单，点击login的时候，需要进行页面跳转到onelogin进行授权登录：

~~~js
function redirectToLogin(e) {
  e.preventDefault();

  mgr.signinRedirect({state:'some data'}).then(function() {
      console.log("signinRedirect done");
  }).catch(function(err) {
      console.log(err);
  });
}
~~~

授权完成之后，跳转回本机页面之后，需要校验回调信息，并从该信息中解析出用户的信息，并展示在页面上：

~~~js
function processLoginResponse() {
  mgr.signinRedirectCallback().then(function(user) {
      console.log("signed in", user);

      document.getElementById("loginResult").innerHTML = '<h3>Success</h3><pre><code>' + JSON.stringify(user, null, 2) + '</code></pre>'

  }).catch(function(err) {
      console.log(err);
  });
}
~~~

所有的逻辑都封装在oidc-client.min.js，对程序员非常友好。
    
# 总结

以上就是在onelogin中使用OpenId Connect Implicit Flow的基本思路和流程。希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！








