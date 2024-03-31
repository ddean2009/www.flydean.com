---
slug: /07-keycloak-saml-wildfly
---

# 7. 在wildfly中使用SAML协议连接keycloak

# 简介

我们知道SSO的两个常用的协议分别是SAML和OpenID Connect,我们在前一篇文章已经讲过了怎么在wildfly中使用OpenID Connect连接keycloak,今天我们会继续讲解怎么使用SAML协议连接keycloak。

# OpenID Connect和SAML

OpenID Connect简称OIDC，是一个基于OAuth2协议的认证框架。为什么要基于OAuth2框架呢？因为OAuth2协议只是一个授权协议，它是不完备的，并且也没有指明具体的实现方式。所以这一切都由 OpenID Connect来填补。

OpenID Connect同时包含了认证和授权，并且使用Json Web Token（JWT）来进行消息的传递。

一般来说OpenID Connect有两种使用场景，第一种场景是某个应用程序请求keycloak来帮它认证一个用户。该应用程序并不存储这个用户的认证信息。所以用户需要在keycloak中进行登录，登录成功之后keycloak会返回应用程序一个identity token 和  access token。

identity token主要包含用户的基本信息，包括用户名，邮箱和一些其他的信息。access token主要包含的是用户的访问权限信息，比如说用户的角色等。应用程序可以通过使用access token来判断用户到底可以访问应用程序的哪些资源。

还有一种场景就是client想去访问远程服务的资源，这种情况下client可以先从keycloak中获取到access token，然后使用这个access token去远程服务中请求资源。远程服务器收到了这个请求之后，会去验证这个access token，然后根据token去获取相应的信息。

SAML 2.0是基于XML的认证协议，它是在OIDC之前产生的，所以会比OIDC成熟，但是相应的也会比OIDC复杂。

SAML使用XML在应用程序和认证服务器中交换数据，同样的SAML也有两种使用场景。

第一种场景是某个应用程序请求keycloak来帮它认证一个用户。该应用程序并不存储这个用户的认证信息。所以用户需要在keycloak中进行登录，登录成功之后keycloak会返回应用程序一个XML文件，这个文件里面包含了一个叫做SAML assertion的东西，里面存的是用户的信息，同时这个XML文件中还包含了用户的权限信息，应用程序可以根据这个信息来对程序进行访问工作。

还有一种场景就是client想去访问远程服务的资源，这种情况下client可以先从keycloak中获取到SAML assertion，然后使用这个SAML assertion去远程服务中请求资源。

所以总结起来，一般情况下是推荐是用OIDC的，因为它比较简单和多平台支持性更强。使用SAML的场景主要考虑的是SAML的成熟性，或者说公司中已经在使用了SAML了。

# SAML的工作流程

在SAML协议中定义了三个角色，分别是principal：代表主体通常表示人类用户。identity provider (IdP)身份提供者和service provider (SP)服务提供者。

IdP的作用就是进行身份认证，并且将用户的认证信息和授权信息传递给服务提供者。

SP的作用就是进行用户认证信息的验证，并且授权用户访问指定的资源信息。

根据请求方式有redirect和post的不同，使用SAML来进行SSO认证有通常有三种方式，我们这里介绍最简单的一种叫做SP redirect request; IdP POST response：

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

# 在keycloak中使用SAML

接下来，我们看下怎么在keycloak中配置使用SAML协议。

我们通过./standalone.sh -Djboss.socket.binding.port-offset=100启动keycloak服务器。访问 http://localhost:8180/auth/admin 可以进入到admin console界面。

> 注意，这里为了和本地应用程序的默认端口8080区别，我们添加了一个-Djboss.socket.binding.port-offset=100参数，让keycloak的端口从8080变成了8180。

输入我们创建的admin用户名和密码，就可以登录到keycloak的admin界面。

这里需要为SAML应用创建一个新的client。

点击clients-> create 输入Client ID和Client Protocol: saml，点击save即可创建新的client。

![](https://img-blog.csdnimg.cn/20201023140820916.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

成功创建client之后，假设我们要部署的应用程序名叫做app-profile-saml，则需要添加下面的信息：

Valid Redirect URIs: http://localhost:8080/app-profile-saml/*

Base URL: http://localhost:8080/app-profile-saml/

Master SAML Processing URL: http://localhost:8080/app-profile-saml/saml

Force Name ID Format: ON

![](https://img-blog.csdnimg.cn/20201023141139411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

点保存即可。

接下来我们需要点击mappers，创建一些用户信息和token claims的映射信息，从而能够在saml的请求中包含这些用户信息。

为了简单起见，我们选择默认的Protocol Mapper：

![](https://img-blog.csdnimg.cn/20201023141530759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

最后一步，我们需要配置adapter。

点击installation，选择Keycloak SAML Adapter keycloak-saml.xml， 点击下载。

将下载下来的keycloak-saml.xml进行修改：

将 logoutPage="SPECIFY YOUR LOGOUT PAGE!" 修改为 /index.jsp 

将 entityID="saml-test" 中的entityID修改为我们设置的entityID

将keycloak-saml.xml拷贝到我们应用程序的config/目录下。这里我们使用官方的应用程序，大家可以在 https://github.com/keycloak/keycloak-quickstarts/tree/latest/app-profile-saml-jee-jsp  进行下载。

在下一节，我们将会详细讲解这个应用程序的功能和结构。

# 准备wildfy和应用程序

我们从wildfly官网下载wildfly应用程序之后，还需要到keycloak中下载wildfly Client Adapters。 

这里因为我们使用的是SAML，所以需要下载 keycloak-saml-wildfly-adapter-dist-11.0.2.zip。

下载完毕之后，将其拷贝到wildfly根目录，解压即可。

解压adapter,解压之后，进入wildfly/bin目录，运行：

~~~shell
./jboss-cli.sh --file=adapter-elytron-install-offline.cli
~~~

即可安装完毕。

安装完毕之后，记得启动wildfly应用程序。

接下来可以编译我们的应用程序了：

~~~sh
cd app-profile-saml-jee-jsp 
mvn clean wildfly:deploy 
~~~

即可将我们的应用程序部署到wildfly中。

先看下应用的运行情况，访问 http://localhost:8080/app-profile-saml/ 

点击login，可以看到跳转到了keycloak的登录页面：

![](https://img-blog.csdnimg.cn/20201023161602656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

输入用户命名密码之后就会跳转到profile.jsp页面，从而展示用户的profile信息。

简单讲解一下应用程序的工作流程。

应用程序主要有两个页面，一个是index，一个是profile。在index页面会去检测用户是否登录。如果未登录，可以点击登录按钮，跳转到登录页面。

输入用户名和密码进行校验之后，keycloak会返回一个SAMLResponse给应用程序，应用程序通过assertion consumer service将会处理这个请求，创建相关的安全上下文，并将user agent重定向到要访问的资源页面。


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







