---
slug: /02-openid-connect-startup
---

# 2. SSO的通用标准OpenID Connect

# 简介

OpenID Connect简称为OIDC，已成为Internet上单点登录和身份管理的通用标准。 它在OAuth2上构建了一个身份层，是一个基于OAuth2协议的身份认证标准协议。

OAuth2实际上只做了授权，而OpenID Connect在授权的基础上又加上了认证。

OIDC的优点是：简单的基于JSON的身份令牌（JWT），并且完全兼容OAuth2协议。

今天我们将会介绍一下OIDC的具体原理。

# OpenID Connect是什么

OpenID Connect发布于2014年，是建立在OAuth 2.0协议之上的简单身份层，它允许客户端基于授权服务器或身份提供商（IdP）进行的身份验证来验证最终用户的身份，并获得用户的相关信息。 

OpenID Connect提供了RESTful HTTP API，并使用Json作为数据的传递格式。

之前我们讲到了基于XML格式的SAML协议，而OpenID Connect因为其更加简洁的数据交换格式，被越来越多的应用使用，已经成为事实上的标准。

我们看一下OpenID connect的基本流程：

![](https://img-blog.csdnimg.cn/20200917223346156.png)

1. RP(client)发送一个认证请求到 OpenID Provider（OP）。

2. OP对End User进行认证并获得相应的授权。

3. OP返回一个ID Token或者access Token给RP。

4. RP使用access token向UserInfo Endpoint请求用户信息。

5. UserInfo Endpoint返回相应的用户信息给RP。

# ID Token

ID Token就像是一个用户的身份证，它是以JWT格式存在的，并且由OP进行签名，保证它的安全性。

获取ID Token的方式就是向OP发送认证请求。

因为ID Token是以JWT格式存在的，JWT可以分为三个部分，分别是Header，Payload和Signature。

这里我们主要关注一下Payload的json内容：

~~~json
{
  "sub"       : "alice",
  "iss"       : "https://openid.flydean.com",
  "aud"       : "client-12345",
  "nonce"     : "n-0S6_WzA2Mj",
  "auth_time" : 1311280969,
  "acr"       : "c2id.loa.hisec",
  "iat"       : 1311280970,
  "exp"       : 1311281970
}
~~~
* sub = Subject Identifier：必须。iss提供的EU的唯一标识；最长为255个ASCII个字符；
* iss = Issuer Identifier：必须。提供认证信息者的唯一标识。一般是Url的host+path部分；
* aud = Audience(s)：必须。标识ID-Token的受众。必须包含OAuth2的client_id；
* nonce：RP发送请求的时候提供的随机字符串，用来减缓重放攻击，也可以来关联ID-Token和RP本身的Session信息。
* auth_time = AuthenticationTime：EU完成认证的时间。如果RP发送认证请求的时候携带max_age的参数，则此Claim是必须的。
* acr = Authentication Context Class Reference：可选。表示一个认证上下文引用值，可以用来标识认证上下文类。
* iat = Issued At Time：必须。JWT的构建的时间。
* exp = Expiration time：必须。ID-Token的过期时间；

上面的是ID Token的标准Claims。

# 请求ID Token

现在我们知道了ID Token是什么，那么在OpenID Connect的RP客户端如何请求一个ID Token呢？

虽然OpenID Connect并未指定应如何实际验证用户身份，这取决于提供者来决定。但是我们通常由Web浏览器来执行认证步骤。

浏览器将用户重定向到认证服务器的认证窗口，用户输入用户名和密码之后，通过OAuth 2.0协议请求ID token。 

使用OAuth 2.0来获取ID Token有3种方式：

1. Authorization Code模式

![](https://img-blog.csdnimg.cn/20200915093456233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

Authorization Code流程的步骤如下：

客户端准备身份认证请求，请求里包含所需要的参数

客户端发送请求到授权服务器

授权服务器对最红用户进行身份认证

授权服务得最终用户的统一/授权

授权服务器把最终用户发送回客户端，同时带着授权码

客户端使用授权码向Token端点请求一个响应

客户端接收到响应，响应的Body里面包含在和ID Token和Access Token

客户端验证ID Token，并获得用户的一些身份信息

2. 隐式授权

![](https://img-blog.csdnimg.cn/20200915095620721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图就是一个隐式授权的例子，和Authorization Code模式不同的是，认证服务器返回的是一个access token片段，只有这个片段，我们是无法得到access token的。

这里我们需要额外请求一次client resource服务器，服务器将会返回一个script脚本，通过这个脚本，我们对access token片段进行解析，得到最终的access token。

3. 混合模式

混合模式比较少用到，它是前面两种模式的混合，它允许从前端和后端分别获取token值。

# ID Token可以做什么

那么我们拿到请求得到的ID Token可以做什么事情呢？

1. 无状态session，通过将token存储在浏览器的cookie中，我们可以实现轻量级的无状态会话。

服务器端不需要存储会话信息，我们只需要在服务器端对token进行验证即可。

2. 可以将token传递给第三方，因为token本身并不是敏感信息，所以我们可以将token传递给其他应用程序或者后端服务。

3. 令牌交互，我们可以通过ID Token去IdP服务器中请求access token，从而起到了交互token的目的。

# Open Connect认证码授权的例子

这里我们举一个使用认证码授权获取到ID token的例子。

1. RP通过重定向到OpenID Provider的OAuth 2.0认证终端，来初始化一个用户认证。

下面是一个重定向的例子：

~~~java
HTTP/1.1 302 Found
Location: https://openid.flydean.com/login?
          response_type=code
          &scope=openid
          &client_id=s6BhdRkqt3
          &state=af0ifjsldkj
          &redirect_uri=https%3A%2F%2Fclient.flydean.com%2Fcb
~~~

* response_type：因为我们是认证码模式，这里选择code

* scope：openid表示请求的是openid。

* client_id：RP的client id，OP通过这个client_id来识别是否是可识别的RP。可以提前注册或者提前约定。

* state：RP生成的一个状态标准，主要为了防止攻击。

* redirect_uri：认证完毕之后，跳转的链接。

在OP端，将会检测是否已经存在一个有效的用户session，否则将会弹出用户登录界面，让用户登录。

![](https://img-blog.csdnimg.cn/20200918110108569.png)

登录成功之后，client将会重定向到redirect_uri，并带上认证码：

~~~java
HTTP/1.1 302 Found
Location: https://client.flydean.com/cb?
          code=SplxlOBeZQQYbYS6WxSbIA
          &state=af0ifjsldkj
~~~

2. 使用code获取ID token

上面返回的code只是一个中间产物，RP需要将code提交给OP换取ID token。

这次我们直接使用一个后端的POST请求：

~~~java
POST /token HTTP/1.1
Host: openid.flydean.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

grant_type=authorization_code
 &code=SplxlOBeZQQYbYS6WxSbIA
 &redirect_uri=https%3A%2F%2Fclient.flydean.com%2Fcb
~~~

* grant_type:authorization_code表示是授权码格式
* code就是上面一步获得的code
* redirect_uri是callback url

如果成功，OP会返回一个JSON对象，带有ID token, access token 或者 refresh token:

~~~java
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ.ewogImlzc
    yI6ICJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwKICJzdWIiOiAiMjQ4Mjg5
    NzYxMDAxIiwKICJhdWQiOiAiczZCaGRSa3F0MyIsCiAibm9uY2UiOiAibi0wUzZ
    fV3pBMk1qIiwKICJleHAiOiAxMzExMjgxOTcwLAogImlhdCI6IDEzMTEyODA5Nz
    AKfQ.ggW8hZ1EuVLuxNuuIJKX_V8a_OMXzR0EHR9R6jgdqrOOF4daGU96Sr_P6q
    Jp6IcmD3HP99Obi1PRs-cwh3LO-p146waJ8IhehcwL7F09JdijmBqkvPeB2T9CJ
    NqeGpe-gccMg4vfKjkM8FcGvnzZUN4_KSP0aAp1tOJ1zZwgjxqGByKHiOtX7Tpd
    QyHE5lcMiKPXfEIQILVq0pc_E2DzL7emopWoaoZTF_m0_N0YzFC6g6EJbOEoRoS
    K5hoDalrcvRYLSrQAZZKflyuVCyixEoV9GfNQC3_osjzw2PAithfubEEBLuVVk4
    XUVrWOLrLl0nx7RkKU8NXNHq-rvKMzqg"
  "access_token": "SlAV32hkKG",
  "token_type": "Bearer",
  "expires_in": 3600,
}
~~~

其中ID token的格式是JWT。

# User Info

我们获取到的ID token里面已经包含了一些非常有用的claims信息。

事实上ID Token还可以包含其他的user info信息：

比如name，profile，picture，email，gender，birthdate，phone_number，address等等有用的信息。

我们可以在token请求的时候添加上额外的scope：

~~~java
HTTP/1.1 302 Found
Location: https://openid.flydean.com/login?
          response_type=code
          &scope=openid%20email
          &client_id=s6BhdRkqt3
          &state=af0ifjsldkj
          &redirect_uri=https%3A%2F%2Fclient.flydean.com%2Fcb
~~~

比如上面的例子中，我们添加了额外的email信息，那么OP将会在token中加入email选项。

比如：

~~~json
{
   "sub"                     : "alice",
   "email"                   : "alice@wonderland.net",
   "email_verified"          : true,
   "name"                    : "Alice Adams",
   "given_name"              : "Alice",
   "family_name"             : "Adams",
   "phone_number"            : "+86 18888888888",
   "profile"                 : "https://flydean.com/users/alice"
}
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！













