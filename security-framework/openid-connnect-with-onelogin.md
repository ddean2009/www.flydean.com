在onelogin中使用OpenId Connect Authentication Flow

# 简介

onelogin是一个优秀的SSO(Single Sign-On)服务提供商，我们可以借助onelogin的服务，轻松构建SSO程序。

之前我们也讲过了，构建SSO的通用协议一般有两种，OpenID connect和SAML。今天我们将会通过一个具体的例子来讲解一下怎么在onelogin中使用OpenID connect中的Authentication Flow来进行SSO认证。

# OpenId Connect和Authentication Flow简介

OpenID Connect是构建在OAuth 2.0协议之上的。它允许客户端基于授权服务器或者身份提供商（IdP）来进行用户的身份认证，并获取到用户的基本信息。

OpenID Connect提供了RESTful HTTP API，并使用Json作为数据的传递格式。

我们可以很容易的使用onelogin作为Identity Provider (IdP)来进行SSO认证。

今天我们要讲的是如何使用onelogin来实现Authentication Flow。我们知道OpenId Connect 有很多种模式。

今天介绍的是Authorization Code模式。

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

# onelogin的配置工作

如果需要在我们的应用程序中使用onelogin，需要做一些配置工作。我们来具体看一下。

首先我们需要在onelogin中注册一个账号。

注册onelogin是免费的，可以配置3个app和25个用户。做测试使用是足够了。

注册的流程就不多讲了。注册完毕之后，我们就可以在onelogin中创建app了。 

在applications tab，我们要使用openid connect,那么就搜索oidc：

![](https://img-blog.csdnimg.cn/20201017121028207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到onelogin可以支持多种OIDC的连接协议。既然是onelogin的界面，当然选onelogin的连接了。

![](https://img-blog.csdnimg.cn/20201017125945187.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

输入应用程序的名字，点击save。

在configuration一栏中，redirect URL输入： http://localhost:3000/oauth/callback 

这个是认证完之后，跳转回我们自己的app的URL。

![](https://img-blog.csdnimg.cn/20201017130718373.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

然后转到SSO栏，拷贝client ID 和 client Security,修改认证方式为POST

![](https://img-blog.csdnimg.cn/20201017131148451.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

> 如果你还想创建新的user或者给user设置权限，可以自行探索onelogin的高级功能。

# 使用应用程序连接onelogin

这里我们选择onelogin提供的官方server的例子 ：  https://github.com/onelogin/onelogin-oidc-node/blob/master/1.%20Auth%20Flow/

我们下载下来该程序，将 .env.sample 重命名为 .env 

修改里面的变量，主要是OIDC_CLIENT_ID，OIDC_CLIENT_SECRET，SUBDOMAIN和OIDC_REDIRECT_URI这4个值，都是我们在onelogin做配置的时候设置的：

~~~js
SUBDOMAIN=flydean-dev
OIDC_CLIENT_ID=a3446600-f263-0138-3235-122333243433
OIDC_CLIENT_SECRET=**********
OIDC_REDIRECT_URI=http://localhost:3000/oauth/callback
~~~

然后运行npm intall; npm start 启动nodejs服务即可。

官方的例子是使用的nodejs+express框架和Passport-OpenIdConnect模块来和onelogin进行交互的。

我们看下交互的流程。

1. 用浏览器打开http://localhost:3000，进入app的主页面：

![](https://img-blog.csdnimg.cn/20201017152329264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

2. 点login将会跳转到onelogin的授权登录页面：

![](https://img-blog.csdnimg.cn/20201017154127334.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们看下网络请求：

![](https://img-blog.csdnimg.cn/20201017154347828.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到，前面几个状态码都是302，重定向。

从localhost:3000的login页面重定向到：

~~~js
https://flydean-dev.onelogin.com/oidc/2/auth?response_type=code&client_id=a3446600-f263-0138-3235-064d76eee9d3178911&redirect_uri=http://localhost:3000/oauth/callback&scope=openid profile&state=ohC1Fi0n0YTDELBtNmePDGvb
~~~

大家可以看到，这个重定向添加了oidc协议中需要添加的参数，比如respnse_type=code代表的是使用Authorization Code模式。而client_id就是我们配置的client id。 redirect_uri也是配置的返回链接。

scope表示认证范围，state是一个唯一标记，用来防刷。

然后又重定向到：

~~~js
https://flydean-dev.onelogin.com/trust/openid-connect/v2?client_id=a3446600-f263-0138-3235-064d76eee9d3178911&grant=cbec20f1-f1d8-4733-9a6f-e98471edfc13
~~~

这一步是onelogin校验了上一步传来的参数，然后进行的再次跳转。

然后又重定向到：

~~~js
https://flydean-dev.onelogin.com/login
~~~

这是自定义域名的登录页面。

~~~js
https://flydean-dev.onelogin.com/login2/?return=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmkiOiJodHRwczovL2ZseWRlYW4tZGV2Lm9uZWxvZ2luLmNvbS90cnVzdC9vcGVuaWQtY29ubmVjdC92Mj9jbGllbnRfaWQ9YTM0NDY2MDAtZjI2My0wMTM4LTMyMzUtMDY0ZDc2ZWVlOWQzMTc4OTExXHUwMDI2Z3JhbnQ9Y2JlYzIwZjEtZjFkOC00NzMzLTlhNmYtZTk4NDcxZWRmYzEzIiwibm90aWZpY2F0aW9uIjp7Im1lc3NhZ2UiOiJDb25uZWN0aW5nIHRvICoqT3BlbklkIENvbm5lY3QgKE9JREMpKioiLCJpY29uIjoiY29ubmVjdGlvbiIsInR5cGUiOiJpbmZvIn0sImlzcyI6Ik1PTk9SQUlMIiwiYXVkIjoiQUNDRVNTIiwiZXhwIjoxNjAyOTIwNjM0LCJwYXJhbXMiOnt9LCJtZXRob2QiOiJnZXQifQ.hoUjh18mehtBSCINkoGOSDwJFHDBBl_nn47RMSizPfw
~~~

然后onelogin对参数进行加密处理，返回了大家能够看到的页面。

3. 输入我们的用户名密码

![](https://img-blog.csdnimg.cn/20201017155326288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

点击继续。

4. 认证成功后，调整到用户信息页面

![](https://img-blog.csdnimg.cn/20201017155506230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们可以看到内部也是经历了一系列的转发调用工作：

![](https://img-blog.csdnimg.cn/2020101715574347.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们需要关心的是下面的callback：

~~~js
http://localhost:3000/oauth/callback?code=2PVdwgQkNip883hql_ub9w3Byug&state=ohC1Fi0n0YTDELBtNmePDGvb
~~~

可以看到在callback中，我们获取到了code,后面可以使用这个code和onelogin进行交互。

5. 点击profile，我们将会尝试从onelogin获取到用户的信息

![](https://img-blog.csdnimg.cn/2020101716023079.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们关注下请求的链接：

~~~js
http://localhost:3000/users/profile
~~~

这一步实际上会在后台通过code去请求onelogin的用户信息。

# 程序中的关键步骤

这个官方的认证程序是用nodejs和express构建的，认证框架主要用的是 passport 和 passport-openidconnect。

我们看下关键代码。

passport配置使用onelogin：

~~~js
// Configure the OpenId Connect Strategy
// with credentials obtained from OneLogin
passport.use(new OneLoginStrategy({
  issuer: baseUri,
  clientID: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  authorizationURL: `${baseUri}/auth`,
  userInfoURL: `${baseUri}/me`,
  tokenURL: `${baseUri}/token`,
  callbackURL: process.env.OIDC_REDIRECT_URI,
  passReqToCallback: true
},
function(req, issuer, userId, profile, accessToken, refreshToken, params, cb) {

  console.log('issuer:', issuer);
  console.log('userId:', userId);
  console.log('accessToken:', accessToken);
  console.log('refreshToken:', refreshToken);
  console.log('params:', params);

  req.session.accessToken = accessToken;

  return cb(null, profile);
}));
~~~

从上面代码中可以看到，拿到accessToken之后，是存放在session中的。

使用session存储认证信息：

~~~js
app.use(session({
  secret: 'secret squirrel',
  resave: false,
  saveUninitialized: true
}))
~~~

login的逻辑操作：

~~~js
app.get('/login', passport.authenticate('openidconnect', {
  successReturnToOrRedirect: "/",
  scope: 'profile'
}));
~~~

callback的逻辑操作：

~~~js
app.get('/oauth/callback', passport.authenticate('openidconnect', {
  callback: true,
  successReturnToOrRedirect: '/users',
  failureRedirect: '/'
}))
~~~

获取用户profile操作：

~~~js
router.get('/profile', function(req, res, next) {
  request.get(
    `https://${ process.env.SUBDOMAIN }.onelogin.com/oidc/2/me`,   
    {
    'auth': {
      'bearer': req.session.accessToken
    }
  },function(err, respose, body){

    console.log('User Info')
    console.log(body);

    res.render('profile', {
      title: 'Profile',
      user: JSON.parse(body)
    });

  });
});
~~~

使用session中的accessToken来获取用户的信息。

# 总结

一个简单的SSO程序就搭建完成了。通过passport模块来获取accessToken信息，并存储在session中。

passport模块支持很多种Strategy，包括openID,Local,BrowserID,Facebook,Google,Twitter等。我们可以使用它来适配不同的认证服务。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！



















