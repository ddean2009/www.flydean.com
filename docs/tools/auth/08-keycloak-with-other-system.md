---
slug: /08-keycloak-with-other-system
---

# 8. keycloak和自研系统的集成

# 简介

keycloak是一个非常强大的权限认证系统，我们使用keycloak可以方便的实现SSO的功能。虽然keycloak底层使用的wildfly，并且提供了非常方便的Client Adapters和各种服务器进行对接，比如wildfly，tomcat，Jetty等。

之前我们也介绍了keycloak如何通过OpenID Connect和SAML协议和wildfly应用进行集成。虽然集成起来非常方便，但是一切都是一个黑盒子，我们并不知道具体的工作原理，今天我们来点实际的，看下keycloak如何和各类自建的系统进行集成。

# 接入前的前置准备

在接入各种应用之前，需要在keycloak中做好相应的配置。一般来说需要使用下面的步骤：

1. 创建新的realm:

![](https://img-blog.csdnimg.cn/20201023224512124.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

一般来说，为了隔离不同类型的系统，我们建议为不同的client创建不同的realm。当然，如果这些client是相关联的，则可以创建在同一个realm中。

2. 创建新的用户：

![](https://img-blog.csdnimg.cn/2020102322475575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

用户是用来登录keycloak用的，如果是不同的realm，则需要分别创建用户。

3. 添加和配置client：

![](https://img-blog.csdnimg.cn/20201023225028406.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这一步是非常重要的，我们需要根据应用程序的不同，配置不同的root URL，redirect URI等。

还可以配置mapper和scope信息。

最后，如果是服务器端的配置的话，还需要installation的一些信息。

有了这些基本的配置之后，我们就可以准备接入应用程序了。

> 注意，一般来说我们创建的client protocol是openid-connect，这是因为SAML只适用于web程序，并且比较复杂。

# SPA单体页面接入keycloak

如果我们是SPA的单体页面，该怎么接入keycloak呢？

页面接入keycloak需要使用keycloak-js这个js客户端。我们直接在页面上引入这个js客户端即可使用了。

先看一下keycloak-js是怎么创建的：

~~~js
import * as Keycloak from 'keycloak-js';
let initOptions = {
  url: 'http://127.0.0.1:8080/auth', realm: 'keycloak-demo', clientId: 'app-vue', onLoad: 'login-required'
}

let keycloak = Keycloak(initOptions);
~~~

Keycloak客户端的初始化可以接受4个参数，url表示的是keycloak的server url，realm是我们在第一阶段创建的realm,clientId也是在第一阶段创建client时候填的id，最后一个onLoad参数表示的是加载时候执行的action。

有了keycloak的这些配置之后，我们就是可以对其进行初始化了：

~~~js
keycloak.init({ onLoad: initOptions.onLoad }).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    Vue.$log.info("Authenticated");

    new Vue({
      el: '#app',
      render: h => h(App, { props: { keycloak: keycloak } })
    })
  }
~~~

上面代码表示keycloak在初始化的时候首先要去执行login-required操作，也就是说要执行身份认证。

如果没有认证的话将会跳转到keycloak的认证页面。认证完成之后，将会返回auth，表示是否授权成功。

登录成功之后，我们可以通过keycloak对象做很多操作。

比如，登出操作：

~~~js
<button class="btn" @click="keycloak.logout()">Logout</button>
~~~

获取keycloak的各种属性：

~~~xml
      <div class="jwt-token">
        <h3 style="color: black;">JWT Token</h3>
        {{keycloak.idToken}}
        clientId: {{keycloak.clientId}}
        Auth Server Url: {{keycloak.authServerUrl}}
      </div>
~~~

从keycloak中获取用户信息：

~~~xml
User: {{keycloak.idTokenParsed.preferred_username}}
~~~

更重要的是，有了idToken，就可以使用这个token去和keycloak进行交互，获取更多的信息。

我们看下怎么使用keycloak来更新token：

~~~js
//Token Refresh
  setInterval(() => {
    keycloak.updateToken(70).then((refreshed) => {
      if (refreshed) {
        Vue.$log.info('Token refreshed' + refreshed);
      } else {
        Vue.$log.warn('Token not refreshed, valid for '
          + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    }).catch(() => {
      Vue.$log.error('Failed to refresh token');
    });
  }, 6000)

}).catch(() => {
  Vue.$log.error("Authenticated Failed");
});
~~~

# SpringBoot 接入keycloak

现在java体系中最流行的就是SpringBoot了，如果在一个通用的SpringBoot程序中接入keycloak呢？

keycloak提供了一个Keycloak Spring Boot adapter ，我们可以这样来引用：

~~~xml
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-spring-boot-starter</artifactId>
</dependency>

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.keycloak.bom</groupId>
      <artifactId>keycloak-adapter-bom</artifactId>
      <version>11.0.2</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
~~~

这个starter支持SpringBoot底层的这些服务器：Tomcat，Undertow，Jetty。

如果是上面3个服务器的话，不需要额外的配置。

有了依赖包之后，我们需要在SpringBoot的配置文件中配置keycloak的一些基本信息：

~~~java
keycloak.realm = demorealm
keycloak.auth-server-url = http://127.0.0.1:8080/auth
keycloak.ssl-required = external
keycloak.resource = demoapp
keycloak.credentials.secret = 11111111-1111-1111-1111-111111111111
~~~

先介绍一下上面配置文件中各项的意思。

> 注意，配置文件中的内容和keycloak中的各项配置是一致的，大家一定要属性keycloak的配置，多修改多运行一下。

配置文件中realm表示的是我们创建的realm名。

auth-server-url是keycloak中认证服务的url。

ssl-required有三个值，分别是none：所有的请求都不使用HTTPS；external：只有外部请求才使用HTTPS，对于本地的访问使用HTTP；all：所有的请求都使用HTTPS。

Resources就是我们在realm中创建的client。

secret是我们创建的client secret。

我们还可以为keycloak配置一些web.xml中出现的权限：

~~~java
keycloak.securityConstraints[0].authRoles[0] = admin
keycloak.securityConstraints[0].authRoles[1] = user
keycloak.securityConstraints[0].securityCollections[0].name = insecure stuff
keycloak.securityConstraints[0].securityCollections[0].patterns[0] = /insecure

keycloak.securityConstraints[1].authRoles[0] = admin
keycloak.securityConstraints[1].securityCollections[0].name = admin stuff
keycloak.securityConstraints[1].securityCollections[0].patterns[0] = /admin
~~~

上面的配置表示的是访问/insecure需要admin或者user的权限，访问/admin需要admin的权限。

## SpringBoot的Rest服务

有了这些配置，我们基本上就可以创建一个基于spring boot和keycloak的一个rest服务了。

假如我们为keycloak的client创建了新的用户：alice。

第一步我们需要拿到alice的access token，则可以这样操作：

~~~sh
 export access_token=$(\
    curl -X POST http://localhost:8180/auth/realms/spring-boot-quickstart/protocol/openid-connect/token \
    -H 'Authorization: Basic YXBwLWF1dGh6LXJlc3Qtc3ByaW5nYm9vdDpzZWNyZXQ=' \
    -H 'content-type: application/x-www-form-urlencoded' \
    -d 'username=alice&password=alice&grant_type=password' | jq --raw-output '.access_token' \
 )
~~~

这个命令是直接通过用户名密码的方式去keycloak服务器中拿取access_token,除了access_token，这个命令还会返回refresh_token和session state的信息。

因为是直接和keycloak进行交换，所以keycloak的directAccessGrantsEnabled一定要设置为true。

有小伙伴要问了，上面命令中的Authorization是什么值呢？

这个值是为了防止未授权的client对keycloak服务器的非法访问，所以需要请求客户端提供client-id和对应的client-secret并且以下面的方式进行编码得到的：

```
Authorization: basic BASE64(client-id + ':' + client-secret)
```

access_token是JWT格式的，我们可以简单解密一下上面命令得出的token:

~~~json
	{
 alg: "RS256",
 typ: "JWT",
 kid: "FJ86GcF3jTbNLOco4NvZkUCIUmfYCqoqtOQeMfbhNlE"
}.
{
 exp: 1603614445,
 iat: 1603614145,
 jti: "b69c784d-5b2d-46ad-9f8d-46214add7afb",
 iss: "http://localhost:8180/auth/realms/spring-boot-quickstart",
 sub: "e6606d93-99f6-4829-ba99-1329be604159",
 typ: "Bearer",
 azp: "app-authz-springboot",
 session_state: "bdc33764-fd1a-400e-9fe0-90a82f4873c1",
 acr: "1",
 allowed-origins: [
  "http://localhost:8080"
 ],
 realm_access: {
  roles: [
   "user"
  ]
 },
 scope: "email profile",
 email_verified: false,
 preferred_username: "alice"
}.
[signature]
~~~

有了access_token,我们就可以根据access_token去做很多事情了。

比如：访问受限的资源：

~~~sh
curl http://localhost:8080/api/resourcea \
  -H "Authorization: Bearer "$access_token
~~~

这里的api/resourcea只是我们本地spring boot应用中一个非常简单的请求资源链接，一切的权限校验工作都会被keycloak拦截，我们看下这个api的实现：

~~~java
    @RequestMapping(value = "/api/resourcea", method = RequestMethod.GET)
    public String handleResourceA() {
        return createResponse();
    }
private String createResponse() {
        return "Access Granted";
    }
~~~

可以看到这个只是一个简单的txt返回，但是因为有keycloak的加持，就变成了一个带权限的资源调用。

上面的access_token解析过后，我们可以看到里面是没有包含权限信息的，我们可以使用access_token来交换一个特殊的RPT的token，这个token里面包含用户的权限信息：

~~~sh
curl -X POST \
 http://localhost:8180/auth/realms/spring-boot-quickstart/protocol/openid-connect/token \
 -H "Authorization: Bearer "$access_token \
 --data "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
 --data "audience=app-authz-rest-springboot" \
  --data "permission=Default Resource" | jq --raw-output '.access_token'
~~~

将得出的结果解密之后，看下里面的内容：

~~~json
	{
 alg: "RS256",
 typ: "JWT",
 kid: "FJ86GcF3jTbNLOco4NvZkUCIUmfYCqoqtOQeMfbhNlE"
}.
{
 exp: 1603614507,
 iat: 1603614207,
 jti: "93e42d9b-4bc6-486a-a650-b912185c35db",
 iss: "http://localhost:8180/auth/realms/spring-boot-quickstart",
 aud: "app-authz-springboot",
 sub: "e6606d93-99f6-4829-ba99-1329be604159",
 typ: "Bearer",
 azp: "app-authz-springboot",
 session_state: "bdc33764-fd1a-400e-9fe0-90a82f4873c1",
 acr: "1",
 allowed-origins: [
  "http://localhost:8080"
 ],
 realm_access: {
  roles: [
   "user"
  ]
 },
 authorization: {
  permissions: [
   {
rsid: "e26d5d63-5976-4959-8683-94b7d85318e7",
rsname: "Default Resource"
}
  ]
 },
 scope: "email profile",
 email_verified: false,
 preferred_username: "alice"
}.
[signature]
~~~

可以看到，这个RPT和之前的access_token的区别是这个里面包含了authorization信息。

我们可以将这个RPT的token和之前的access_token一样使用。

## 使用KeycloakSecurityContext

KeycloakSecurityContext是keycloak的上下文，我们可以从其中获取到AccessToken，IDToken，AuthorizationContext和realm信息。

而在AuthorizationContext中又包含了授权的权限信息。如果能够在程序中获取到KeycloakSecurityContext，则可以进行更精确的程序控制。

那么怎么获取到KeycloakSecurityContext呢？

~~~java
    private KeycloakSecurityContext getKeycloakSecurityContext() {
        return (KeycloakSecurityContext) request.getAttribute(KeycloakSecurityContext.class.getName());
    }
~~~

我们可以直接从request中获取到。

我们看下KeycloakSecurityContext的一些关键方法：

~~~java
public boolean hasResourcePermission(String name) {
        return getAuthorizationContext().hasResourcePermission(name);
    }

public String getName() {
        return securityContext.getIdToken().getPreferredUsername();
    }

public List<Permission> getPermissions() {
        return getAuthorizationContext().getPermissions();
    }
private AuthorizationContext getAuthorizationContext() {
        return securityContext.getAuthorizationContext();
    }
~~~

# Authorization Client Java API

上面介绍的Spring Boot中的其实是隐藏的做法，adaptor自动为我们做了和Keycloak认证服务连接的事情，如果我们需要手动去处理，则需要用到Authorization Client Java API。

添加maven依赖：

~~~xml
<dependencies>
    <dependency>
        <groupId>org.keycloak</groupId>
        <artifactId>keycloak-authz-client</artifactId>
        <version>${KEYCLOAK_VERSION}</version>
    </dependency>
</dependencies>
~~~

client会去读取meta-info中的keycloak.json信息：

~~~json
{
  "realm": "hello-world-authz",
  "auth-server-url" : "http://localhost:8080/auth",
  "resource" : "hello-world-authz-service",
  "credentials": {
    "secret": "secret"
  }
}
~~~

接下看下怎么使用AuthzClient。

创建一个：AuthzClient

~~~java
AuthzClient authzClient = AuthzClient.create()
~~~

获取RPT：

~~~java
AuthzClient authzClient = AuthzClient.create();
// create an authorization request
AuthorizationRequest request = new AuthorizationRequest();

// send the entitlement request to the server in order to
// obtain an RPT with all permissions granted to the user
AuthorizationResponse response = authzClient.authorization("alice", "alice").authorize(request);
String rpt = response.getToken();

System.out.println("You got an RPT: " + rpt);
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！





