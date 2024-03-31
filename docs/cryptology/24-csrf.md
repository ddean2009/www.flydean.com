---
slug: /csrf
---

# 24. 密码学系列之:csrf跨站点请求伪造



# 简介

CSRF的全称是Cross-site request forgery跨站点请求伪造，也称为一键攻击或会话劫持，它是对网站的一种恶意利用，主要利用的是已授权用户对于站点的信任，无辜的最终用户被攻击者诱骗提交了他们不希望的Web请求。 恶意网站可以通过多种方式来发送此类命令。 例如，特制的图像标签，隐藏的表单和JavaScript XMLHttpRequests都可以在用户不交互甚至不知情的情况下工作。

如果发生了CSRF攻击，可能导致客户端或服务器数据意外泄漏，会话状态更改或者修改用户的信息。

# CSRF的特点

在CSRF的恶意攻击中，攻击者的目标是让被攻击者在不知不觉中向有权限访问的网站提交恶意的web请求。通过对该请求进行精心的设计，使其包含URL参数，Cookie和其他对处理该请求的Web服务器而言正常显示的数据。通过保存在用户Web浏览器中的cookie进行身份验证的用户可能会在不知不觉中将HTTP请求发送到信任该用户的站点，从而导致不必要的操作。

为什么会有这样的攻击呢？因为对于web浏览器来说，它们将在发送给该域的任何Web请求中自动且无形地包含给定域使用的任何cookie。 CSRF攻击利用了此属性，因为浏览器发出的任何Web请求都将自动包含受害者登录网站时创建的任何cookie（包括会话cookie和其他cookie）。如果用户被诱骗通过浏览器无意中提交了请求，这些自动包含的cookie将使伪造也能够通过目标服务器的认证，从而产生恶意攻击。

为了生成这样的攻击URL，恶意攻击者需要构造一个可以被执行的web请求，比如在目标页面上更改帐户密码。攻击者可以将该链接嵌入攻击者控制范围内的页面上。比如它可以嵌入到发送给受害者的电子邮件中的html图像标签中，当受害者打开其电子邮件时，该图像会自动加载。一旦受害者单击了链接，他们的浏览器将自动包含该网站使用的所有cookie，并将请求提交到Web服务器。 Web服务器将会执行该恶意请求。

# CSRF的历史

早在2001年，就有人开始使用它来进行攻击了。不过因为攻击使用的是用户自己的IP地址，看起来就像是用户自己的一个正常的请求，所以很少有直接的攻击证据。目前知道的比较有名的CSRF攻击如下：

2006年Netflix爆出了众多CSRF漏洞，攻击者可以更改受害者的账户收货地址，从而为攻击者自己来购买商品。
YouTube在2008年也受到了CSRF的攻击，这使得任何攻击者都几乎可以执行任何用户的所有操作。
McAfee Secure也曾经受到过CSRF的攻击，它允许攻击者更改公司系统。
2018年，一些路由器也受到了CSRF的攻击，从而能够修改路由器的DNS设置。

# CSRF攻击的限制

要想达成CSRF攻击是需要一定的条件的，事实上CSRF攻击也并不是一个很简单的事情,必须满足下面的条件：

1. 目标web服务没有检查请求的referrer header，如果只允许同源请求的话，则无法使用CSRF。
2. 攻击者必须在目标站点上找到表单提交文件，或者发现具有攻击属性的URL，该URL会执行某些操作（例如，转账或更改受害者的电子邮件地址或密码）。
3. 攻击者必须为所有表单或URL输入确定正确的值；如果要求它们中的任何一个是攻击者无法猜到的秘密身份验证值或ID，则攻击很可能会失败（除非攻击者在他们的猜测中非常幸运）。
4. 当受害者登录到目标站点时，攻击者必须诱使受害者进入带有恶意代码的网页。
5. 攻击者只能发出请求，但是无法看到目标站点响应攻击请求发回给用户的内容，如果操作具有连续性的话，后续的CSRF攻击将无法完成。

# CSRF攻击的防范

因为web浏览器对不同的HTTP请求处理方式是不同的，所以针对CSRF攻击的防范跟HTTP请求的方法相关。

在HTTP GET中，使用CSRF攻击非常简单，比如将攻击URL带入IMG标签就会自动加载。但是，根据HTTP规范，GET方法不应该被用于修改数据。使用GET进行更新数据操作的应用程序应切换到HTTP POST或使用反CSRF保护。

CSRF的HTTP POST漏洞取决于使用情况：
在最简单的POST形式中，数据编码为查询字符串（field1 = value1＆field2 = value2），可以使用简单的HTML形式轻松实现CSRF攻击，这就意味着必须采取反CSRF措施。

如果以其他任何格式（JSON，XML）发送数据，标准方法是使用XMLHttpRequest发出POST请求，并通过同源策略（SOP）和跨域资源共享（CORS）防止CSRF攻击。

其他HTTP方法（PUT，DELETE等）只能使用具有同源策略（SOP）和跨域资源共享（CORS）来防止CSRF的XMLHttpRequest请求；但是，在使用Access-Control-Allow-Origin：*标头明确禁用它们的网站上，这些措施将无效。

下面我们来具体讲解几个防范CSRF的技巧

## STP技术

STP的全称是Synchronizer token pattern。也就是说在所有的HTML表单上包含一个隐藏的token字段，token是可以由很多种方法来生成，只要保证其随机性就行了。因为攻击者无法预测到这个token的值，所以无法进行CSRF攻击。比如下面的代码：

```
<input type="hidden" name="csrfmiddlewaretoken" value="KbyUmhTLMpYj7CD2di7JKP1P3qmLlkPt" />
```

STP是兼容性最好的，因为它仅依赖HTML，但是每个请求都带上token会增加程序的复杂性， 由于token是唯一且不可预测的，因此还会强制执行适当的事件顺序，这会引发一些可用性的问题（例如用户打开多个选项卡）。 可以通过使用每个会话CSRF令牌而不是每个请求CSRF令牌来放宽它。

## Cookie-to-header token

如果web应用程序主要使用javascript来进行交互的话，可以考虑使用这种方式。

在初次访问web服务的时候，会在cookie中设置一个随机令牌，该cookie无法在跨域请求中访问：

```
Set-Cookie: csrf_token=i8XNjC4b8KVok4uw5RftR38Wgp2BFwql; Expires=Thu, 23-Jul-2015 10:25:33 GMT; Max-Age=31449600; Path=/; Domain=.wikipedia.org; SameSite=Lax; Secure
```

在客户端运行javascript的时候，从cookie中读取这个token值，并将其复制到随每个事务请求发送的自定义HTTP标头中

```
X-Csrftoken：i8XNjC4b8KVok4uw5RftR38Wgp2BFwql
```

服务器验证令牌的存在和完整性。因为从恶意文件或电子邮件运行的JavaScript无法成功读取cookie值以复制到自定义标头中。即使将csrf token cookie与恶意请求一起自动发送，服务器任然需要有效的X-Csrf-Token头。

这项技术已经被很多框架实现了，比如Django 和AngularJS，因为令牌在整个用户会话中保持不变，所以它可以与AJAX应用程序很好地协同工作。

> 注意，使用这项技术，必须确保同源政策。

## Double Submit Cookie

这个方法与cookie-to-header方法类似，但不涉及JavaScript，站点可以将CSRF令牌设置为cookie，也可以将其作为每个HTML表单中的隐藏字段插入。 提交表单后，站点可以检查cookie令牌是否与表单令牌匹配。 同源策略可防止攻击者在目标域上读取或设置Cookie，因此他们无法以其精心设计的形式放置有效令牌。

与同步器模式相比，此技术的优势在于不需要将令牌存储在服务器上。

## SameSite cookie attribute

当服务器设置cookie时，可以包含一个附加的“ SameSite”属性，指示浏览器是否将cookie附加到跨站点请求。 如果将此属性设置为“strict”，则cookie仅在相同来源的请求中发送，从而使CSRF无效。 但是，这需要浏览器识别并正确实现属性，并且还要求cookie具有“Secure”标志。

## Client-side safeguards

浏览器本身可以通过为跨站点请求提供默认拒绝策略，来阻止CSRF。比如Mozilla Firefox的RequestPolicy或者Firefox和Google Chrome / Chromium 的uMatrix之类。但是，这可能会严重干扰许多网站的正常运行。

有些浏览器扩展程序如CsFire扩展（也适用于Firefox）可以通过从跨站点请求中删除身份验证信息，从而减少对正常浏览的影响。





