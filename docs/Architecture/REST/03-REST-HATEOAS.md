---
slug: /03-REST-HATEOAS
---

# 架构之:REST和HATEOAS



# 简介

我们知道REST是一种架构方式，它只是指定了六种需要遵循的基本原则，但是它指定的原则都比较宽泛，我们需要一种更加具象的约束条件来指导我们的编码。这就是HATEOAS。

# HATEOAS简介

REST的英文全称是REpresentational State Transfer，表示的是状态的转移。而HATEOAS的全称是Hypertext As The Engine Of Application State，表示使用超文本作为应用程序的状态。这样两者就关联起来了。HATEOAS指定了状态的表现形式。

超文本就是链接，在HATEOAS的规则下，所有的资源请求都是需要带上链接的，这些链接表示可以对该资源进行的下一步操作。并且，这些链接是动态变化的，根据请求资源的不同而不同。所以，如果你的架构实现了HATEOAS风格的话，可以继续减少client和server端的接口依赖关系。因为所有可以进行的操作都已经放在返回资源的超链接中了。

我们举个例子，还是请求students的例子，假如我们请求：

```
GET /students/zhangsan HTTP/1.1
Host: api.rest.com
Accept: application/json
```

那么返回的json可能是下面这样子的：

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: ...

{
    "student": {
        "student_id": 11111,
        "age": 10,
        "links": {
            "school": "/student/11111/school"
        }
    }
}

```

可以看到返回的信息包含student本身的信息和相关的links信息，里面含有Student的school信息。客户端可以通过返回的links继续向下获取更多的信息。

如果我们访问另外一个student，看下返回结果有什么不同：

```
GET /students/lisi HTTP/1.1
Host: api.rest.com
Accept: application/json
```

那么返回的json可能是下面这样子的：

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: ...

{
    "student": {
        "student_id": 2222,
        "age": 20,
        "links": {
            "school": "/student/2222/school",
            "vote": "/student/2222/vote",
        }
    }
}

```

看到有什么不同了吗？ 这次学生的age=20 ，所以拥有的选举的权限，这次在我们的links里面多了一个vote链接。

links会根据资源的不同发送变化，客户端不需要知道任何服务器端的逻辑，每个请求都包含了所有可以继续执行的操作，从而让客户端和服务器端彻底解耦。

在现实世界中，当您访问一个网站时，您会点击它的主页。它提供了一些快照和网站其他部分的链接。您单击它们，然后您将获得更多信息以及与上下文相关的更多相关链接。

类似于人与网站的交互，REST客户端访问初始API URI并使用服务器提供的链接动态发现可用操作并访问所需的资源。客户不需要事先了解服务或工作流中涉及的不同步骤。此外，客户端不再需要对各种资源的URI结构进行硬编码。 HATEOAS允许服务器在不中断客户端的情况下随着API的发展进行URI更改。

# HATEOAS的格式

HATEOAS有两个比较重要的格式，分别是RFC 5988 (web linking) 和 JSON Hypermedia API Language (HAL)。 

他们稍有不同，但是原理是大同小异的。感兴趣的朋友可以自行查阅。

# HATEOAS的Spring支持

人民需要什么，Spring就造什么。同样的，对于REST+HATEOAS这种优美组合，怎么能够少得了Spring的身影呢？

Spring推出了Spring HATEOAS来实现这一功能。最新的版本是1.3.0，如果你使用的Spring boot，那么使用起来将会更加的简单，引用下面的XML就可以了：

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
    <version>2.5.1</version>
</dependency>

```

如果是非Spring boot环境，则可以这样引用：

```
<dependency>
    <groupId>org.springframework.hateoas</groupId>
    <artifactId>spring-hateoas</artifactId>
    <version>1.3.1</version>
</dependency>

```

在Spring HATEOAS中提供了一系列非常有用的特征来帮助我们创建Link，从而减轻我们的工作。有关Spring HATEOAS的具体内容，我们会在后面的文章中详细讲解。

# 总结

如果你使用的REST架构，那么配合上HATEOAS规则应该就是最好的组合。祝你成功。
