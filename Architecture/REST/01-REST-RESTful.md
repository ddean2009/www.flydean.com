架构之:REST和RESTful

[toc]

# 简介

近几年微服务是如火如荼的在发展，而微服务之间的调用和渐渐的从RPC调用转移到了HTTP调用。于是经常听到有些同事说我们提供微服务并且暴露RESTful接口给别的系统，但是什么是RESTful接口呢？它和REST有什么关系呢？
别急，本文将会带你一探究竟。

# REST

> REST是一种架构。

首先我们要记住的是REST是一种架构方式，并不是一种协议。它只是告诉我们应该如何去搭建一个可靠的系统。

REST的全称是REpresentational State Transfer。中文可能不好翻译，我们暂将其定义为有代表性的状态转义。它是分布式系统的一种架构方式。最先是由Roy Fielding在2000年他的博士毕业论文中首先提到的。

REST架构在现在的web应用中非常常见，它并不涉及到具体的编码，它只是一种高级比的指导方案，具体的实现还是由你自己决定。

# REST和RESTful API

我们刚刚讲解了REST，那么REST和RESTful API有什么关系呢？

我们知道，API是服务和服务之间，客户端和服务端之间沟通的桥梁，通过API之间的调用，我们可以从服务器中获取到需要的资源信息。而RESTful API就是符合REST架构的API。

所以不是所有的HTTP协议的API都是RESTful API，它的前提是你的系统是REST架构的。

# REST架构的基本原则

那么什么样的系统才能被称为是REST架构的系统呢？根据Roy Fielding的论文描述，REST架构的系统有6个基本特征。我们一一来说明。

## Uniform interface统一的接口

在REST架构中，最为核心的元素就是资源。我们将资源定义为一个个的独立的URI。一个资源用一个独立并且唯一的URI来表示。

单个的资源不能太大也不能太小，它表示的是一个独立的可以操作的单位。这些资源通过通用的获取方式来进行获取和操作。比如对资源的CURD可以分别用不同的HTTP method来表示（PUT，POST，GET，DELETE）。

同时需要对资源进行统一的命名，定义统一的link格式和数据格式。

还有一点，根据HATEOAS协议，一个资源还应该包含指向该资源或者相关资源的URI。可以能有些同学现在对这一点还有些疑惑，不过没关系，后面我们会详细对HATEOAS进行讲解。

Spring也提供了对HATEOAS的支持，我们看一个基本的HATEOAS的请求：

`GET http://localhost:8080/greeting`

该请求的返回可以是这样的：

```
{
  "content":"Hello, World!",
  "_links":{
    "self":{
      "href":"http://localhost:8080/greeting?name=World"
    }
  }
}

```

大家可以看到上面返回了一个代表自己URI的资源链接。

## Client–server 客户端和服务器端独立

另外的一条规则就是客户端和服务器端独立，客户端和服务器端互不影响，他们之间的唯一交互就是API的调用。

对于客户端来说只要能够通过API获取到对应的资源即可，并不关心服务器是怎么实现的。

而对于服务器端来说，只需要提供保持不变的API即可，自己内部的实现可以自由决定，也不需要考虑客户端是如何使用这些API的。

这条规则对于现在的很多前后端分离的架构来说已经使用了。

## Stateless无状态

和HTTP协议一样，REST架构中各个服务之间的API调用也是无状态的。无状态的意思是服务器并不保存API调用的历史记录，也不存储任何关于客户端的信息。对于服务器来说，每个请求都是最新的。

所以用户的状态信息是在客户端进行保存和维护的，客户端需要在每个接口带上可以识别用户的唯一标记，从而在服务器端进行认证和识别，从而获取到对应的资源。

## Cacheable可缓存 

缓存是提升系统速度的利器，对于REST的资源也是一样的，在REST中对于可缓存的资源需要标明它是可以被缓存的。

从而对应的调用方可以将这些资源进行缓存，从而提升系统的效率。

## Layered system分层系统

现代的系统基本上都是分层的，在REST架构中也是一样，只要保证对外提供的资源URI是一致的，架构并不关心你到底使用的是几层架构。

## Code on demand按需编码

一般来说，REST架构中各个服务通常是通过JSON或者XML来进行交互的。但是这并不是硬性规定。可以返回可执行的代码直接运行。

## RESTful API的例子

我们来举几个常见的RESTful API的例子，来见识一下这种架构的神奇之处：

请求一个entity：

`GET https://services.odata.org/TripPinRESTierService/People`

根据ID请求一个entity:

`GET https://services.odata.org/TripPinRESTierService/People('russellwhyte')`

请求一个entity的某个属性：

`GET https://services.odata.org/TripPinRESTierService/Airports('KSFO')/Name `

使用filter进行查询：

`GET https://services.odata.org/TripPinRESTierService/People?$filter=FirstName eq 'Scott'`

修改数据：

```
POST https://services.odata.org/TripPinRESTierService/People
header:
{
	Content-Type: application/json
}
body:
{
    "UserName":"lewisblack",
    "FirstName":"Lewis",
    "LastName":"Black",
    "Emails":[
        "lewisblack@example.com"
    ],
    "AddressInfo": [
    {
      "Address": "187 Suffolk Ln.",
      "City": {
        "Name": "Boise",
        "CountryRegion": "United States",
        "Region": "ID"
      }
    }
    ]
}

```

删除数据：

`DELETE https://services.odata.org/TripPinRESTierService/People('russellwhyte')`

更新数据：

```
PATCH https://services.odata.org/TripPinRESTierService/People('russellwhyte')
header:
{
	Content-Type: application/json
}
body:
{
    "FirstName": "Mirs",
    "LastName": "King"
}
```

# 总结

本文讲解了REST和RESTful相关的概念，那么对于其中最重要的资源如何定义呢？敬请期待后续文章。