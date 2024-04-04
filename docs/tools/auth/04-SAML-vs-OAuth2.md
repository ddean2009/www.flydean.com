---
slug: /04-SAML-vs-OAuth2
---

# 4. SAML和OAuth2这两种SSO协议的区别

# 简介

SSO是单点登录的简称，常用的SSO的协议有两种，分别是SAML和OAuth2。本文将会介绍两种协议的不同之处，从而让读者对这两种协议有更加深入的理解。

# SAML

SAML的全称是Security Assertion Markup Language， 是由OASIS制定的一套基于XML格式的开放标准，用在身份提供者（IdP）和服务提供者 (SP)之间交换身份验证和授权数据。

SAML的一个非常重要的应用就是基于Web的单点登录（SSO）。

在SAML协议中定义了三个角色，分别是principal：代表主体通常表示人类用户。identity provider (IdP)身份提供者和service provider (SP)服务提供者。

IdP的作用就是进行身份认证，并且将用户的认证信息和授权信息传递给服务提供者。

SP的作用就是进行用户认证信息的验证，并且授权用户访问指定的资源信息。

接下来，我们通过一个用SAML进行SSO认证的流程图，来分析一下SAML是怎么工作的。

![](https://img-blog.csdnimg.cn/20200917121937112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图中User Agent就是web浏览器，我们看一下如果用户想请求Service Provider的资源的时候，SAML协议是怎么处理的。

1. 用户通过User Agent请求Service Provider,比如：

~~~java
http://sp.flydean.com/myresource
~~~

SP将会对该资源进行相应的安全检查，如果发现已经有一个有效的安全上下文的话，SP将会跳过2-7步，直接进入第8步。

2. 如果在第一步的时候，SP并没有找到相应的有效安全上下文的话，则会生成对应的SAMLRequest，并将User Agent重定向到IdP：

~~~java
302 Redirect
Location: https://idp.flydean.com/SAML2/SSO/Redirect?SAMLRequest=request&RelayState=token
~~~

RelayState是SP维护的一个状态信息，主要用来防止CSRF攻击。

其中这个SAMLRequest是用Base64编码的&lt;samlp:AuthnRequest>，下面是一个samlp:AuthnRequest的例子：

~~~xml
  <samlp:AuthnRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="aaf23196-1773-2113-474a-fe114412ab72"
    Version="2.0"
    IssueInstant="2020-09-05T09:21:59Z"
    AssertionConsumerServiceIndex="0"
    AttributeConsumingServiceIndex="0">
    <saml:Issuer>https://sp.flydean.com/SAML2</saml:Issuer>
    <samlp:NameIDPolicy
      AllowCreate="true"
      Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient"/>
  </samlp:AuthnRequest>
~~~

为了安全起见，SAMLRequest还可以使用SP提供的签名key来进行签名。

3. User agent将会发送一个get请求到IdP的SSO server :

~~~shell
GET /SAML2/SSO/Redirect?SAMLRequest=request&RelayState=token HTTP/1.1
Host: idp.flydean.com
~~~

IdP收到这个AuthnRequest请求之后，将会进行安全验证，如果是合法的AuthnRequest，那么将会展示登录界面。

4. 用户可以输入用户名密码进行登录。登录成功之后，IdP将会返回一个XHTML form：

~~~xml
  <form method="post" action="https://sp.flydean.com/SAML2/SSO/POST" ...>
    <input type="hidden" name="SAMLResponse" value="response" />
    <input type="hidden" name="RelayState" value="token" />
    ...
    <input type="submit" value="Submit" />
  </form>
~~~

这个form中包含了SAMLResponse信息，SAMLResponse中包含了用户相关的信息。

同样的SAMLResponse也是使用Base64进行编码过的&lt;samlp:Response>。

~~~xml
<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="identifier_2"
    InResponseTo="identifier_1"
    Version="2.0"
    IssueInstant="2020-09-05T09:22:05Z"
    Destination="https://sp.flydean.com/SAML2/SSO/POST">
    <saml:Issuer>https://idp.flydean.com/SAML2</saml:Issuer>
    <samlp:Status>
      <samlp:StatusCode
        Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="identifier_3"
      Version="2.0"
      IssueInstant="2020-09-05T09:22:05Z">
      <saml:Issuer>https://idp.flydean.com/SAML2</saml:Issuer>
      <!-- a POSTed assertion MUST be signed -->
      <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">...</ds:Signature>
      <saml:Subject>
        <saml:NameID
          Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">
          3f7b3dcf-1674-4ecd-92c8-1544f346baf8
        </saml:NameID>
        <saml:SubjectConfirmation
          Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
          <saml:SubjectConfirmationData
            InResponseTo="identifier_1"
            Recipient="https://sp.flydean.com/SAML2/SSO/POST"
            NotOnOrAfter="2020-09-05T09:27:05Z"/>
        </saml:SubjectConfirmation>
      </saml:Subject>
      <saml:Conditions
        NotBefore="2020-09-05T09:17:05Z"
        NotOnOrAfter="2020-09-05T09:27:05Z">
        <saml:AudienceRestriction>
          <saml:Audience>https://sp.flydean.com/SAML2</saml:Audience>
        </saml:AudienceRestriction>
      </saml:Conditions>
      <saml:AuthnStatement
        AuthnInstant="2020-09-05T09:22:00Z"
        SessionIndex="identifier_3">
        <saml:AuthnContext>
          <saml:AuthnContextClassRef>
            urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
         </saml:AuthnContextClassRef>
        </saml:AuthnContext>
      </saml:AuthnStatement>
    </saml:Assertion>
  </samlp:Response>
~~~

我们可以看到samlp:Response中包含有saml:Assertion信息。

5. user agent 收到XHTML form之后将会提交该form给SP。

6. SP中的assertion consumer service将会处理这个请求，创建相关的安全上下文，并将user agent重定向到要访问的资源页面。

7. user agent再次请求SP资源。

8. 因为安全上下文已经创建完毕，SP可以直接返回相应的资源，不用再次到IdP进行认证。

我们可以看到上面的所有的信息交换都是由前端浏览器来完成的，在SP和IdP之间不存在直接的通信。

这种全部由前端来完成信息交换的方式好处就是协议流非常简单，所有的消息都是简单的GET或者POST请求。

如果为了提高安全性，也可以使用引用消息。也就是说IdP返回的不是直接的SAML assertion，而是一个SAML assertion的引用。SP收到这个引用之后，可以从后台再去查询真实的SAML assertion，从而提高了安全性。

## SAML的缺点

SAML协议是2005年制定的，在制定协议的时候基本上是针对于web应用程序来说的，但是那时候的web应用程序还是比较简单的，更别提对App的支持。

SAML需要通过HTTP Redect和HTTP POST协议来传递用户信息，并且通常是通过HTML FORM的格式来进行数据的提交的。如果应用程序并不是web应用，比如说是一个手机App应用。

这个手机APP应用的启动链接是 my-photos://authenticate ， 但是手机app可能并不能获取到Http POST的body内容。他们只能够通过URL来进行参数的传递。

这就意味着，在手机APP中不能够使用SAML。

当然，要想工作也可以，不过需要进行一些改造。比如通过第三方应用对POST消息进行解析，然后将解析出来的SAMLRequest以URL参数的形式传递给APP。

另一种方法就是使用OAuth2.

# OAuth2

因为Oauth2是在2012年才产生的。所以并没有那么多的使用限制。我们可以在不同的场合中使用OAuth2。

我们先来看一下OAuth2中授权的流程图：

![](https://img-blog.csdnimg.cn/20200914225501505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

一般来说OAuth2中有4个角色。

resource owner： 代表的是资源的所有者，可以通过提供用户名密码或者其他方式来进行授权。通常来是一个人。

resource server：代表的是最终需要访问到资源的服务器。比如github授权之后获取到的用户信息。

client： 用来替代resource owner来进行交互的客户端。

authorization server： 用来进行授权的服务器，可以生成相应的Access Token。

整个流程是这样的：

Client向resource owner发起一个授权请求，resource owner输入相应的认证信息，将authorization grant返回给client。

client再将获取到的authorization grant请求授权服务器，并返回access token。

client然后就可以拿着这个access token去请求resource server，最后获取到受限资源。

## OAuth2的缺点

OAuth2并没有指定Resource Server怎么和Authorization Server进行交互。也没有规定返回用户信息的内容和格式。这些都需要实现方自己去决定。

OAuth2默认是在HTTPS环境下工作的，所以并没有约定信息的加密方式。我们需要自己去实现。

最后，OAuth2是一个授权协议，而不是认证协议。对于这个问题，其实我们可以考虑使用OpenID Connect协议。因为OpenID Connect就是基于OAuth2实现的，并且添加了认证协议。

OpenID Connect简称为OIDC，已成为Internet上单点登录和身份管理的通用标准。 它在OAuth2上构建了一个身份层，是一个基于OAuth2协议的身份认证标准协议。

OAuth2实际上只做了授权，而OpenID Connect在授权的基础上又加上了认证。

OIDC的优点是：简单的基于JSON的身份令牌（JWT），并且完全兼容OAuth2协议。

# 两者的对比

在SAML协议中，SAML token中已经包含了用户身份信息，但是在OAuth2，在拿到token之后，需要额外再做一次对该token的校验。

但是另一方面，OAuth2因为需要再做一次认证，所以可以在 Authorization Server 端对token进行无效处理。

# CAS简介

做过SSO的应该都听说过CAS。CAS的全称是Central Authentication Service，是一个企业级的开源的SSO认证框架。

CAS内部集成了CAS1,2,3，SAML1,2，OAuth2,OpenID和OpenID Connect协议，非常的强大。我们会在后面的文章中介绍CAS的使用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
