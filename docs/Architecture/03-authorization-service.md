架构之:权限系统的基本概念和架构

# 简介

权限系统是我们在系统设计和应用中一种非常常见的系统。一般来说权限系统的功能分为认证和授权两种。认证就非常简单的，验证完用户名密码就算认证成功，而授权里面的套路就很多了，本文将会详细讲解权限系统中的一些基本概念和设计上面要注意的问题，希望大家能够喜欢。

# 授权流程

在授权流程中主要有三个部分，分别是资源管理，权限和策略管理，策略的执行。

先看下资源管理：

![](https://img-blog.csdnimg.cn/2020102519323639.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

首先我们需要创建一个资源服务器，然后在资源服务器中创建各种资源，最后对各种资源设置一些scope,scope就是跟资源相关的的一些可执行的操作。

什么是资源呢？资源可以是一个web页面，一个RESTful资源，一个文件等等。

举个例子，假如我们有一个图书馆资源服务器，图书馆有一个本《人月神话》的书，那么这本书就被称作资源。接下来我们需要为这个资源定义一些可操作性的scope，或者说策略。比如说只有本校的学生才能够借阅这本书。

当我们定义好资源之后，就需要对这些资源进行一些权限和策略的设置，这就需要进行权限和策略管理。

看下权限和策略管理的流程：

![](https://img-blog.csdnimg.cn/20201025195056519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

首先是创建策略，然后定义权限，最后将权限和策略进行关联。

策略就是定义的一些去访问某些资源或者权限的操作，策略是和具体的权限是分离的，策略只制定了在什么情况下可以做（某些事情），或者在某些情况下不能做（某些事情），这些事情就是后面创建的权限。

比如说，拥有user角色可以做什么事情，就是一种策略。

策略定义好了，我们就可以创建权限了，权限很好理解，比如：借《人月神话》的书的权限。

我们把策略和权限组合起来就是：拥有user角色的，可以借《人月神话》这本书。

通用的策略有很多种，比如说基于属性的访问策略，基于角色的访问策略，基于用户的访问策略，基于上下文的访问策略，基于时间的访问策略，基于规则的访问策略或者其他的自定义策略等。

通常来说，基于角色的访问策略role-based access control (RBAC)是最常用的。

我们把用户赋予相应的角色，然后在访问资源的时候根据不同的角色策略来执行不同的permission操作。

虽然RBAC非常有用，用途也非常广泛，但是它还是有下面的几个缺点：

1. 资源和角色是强绑定的，如果我们对角色进行一些添加，删除和修改操作，将会影响到所有相关联的资源。
2. 对于角色的修改则可能需要我们对代码进行修改。
3. 如果你的应用程序非常大的话，使用RBAC可能会出现一些错误。
4. RBAC的灵活性不够强，不能够做到更加细粒度的权限控制。

最后，我们看一下策略的执行。

策略的执行就是真正的在资源服务器上执行相应的授权工作。一般来说我们在资源服务器中有一个 **Policy Enforcement Point** （PEP）来和授权服务器进行交互，根据授权服务器返回的授权信息来执行相应的资源操作。

# 权限系统的架构

先看一张权限系统的基本架构图：

![](https://img-blog.csdnimg.cn/20201025175558725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

其中有下面几个关键组件：

* PAP全称是**Policy Administration Point**，它是一个权限管理的后台页面，我们需要这样的一个后台界面来配置和管理权限和资源。

* PDP全称是**Policy Decision Point**，它提供了一些决策策略，通过这些策略将授权请求发送到相应的位置，并根据请求的权限对策略进行相应的决策。
* PEP全称是**Policy Enforcement Point**，在不同的资源服务器中执行相应的策略。
* PIP全称是**Policy Information Point**，在判断和决策策略的时候，可以从中获取相应的属性信息。

上图中，Storage就是数据的存储和分类，这里我们主要存储resouce,scope,permission和policy这4种对象。

resource代表的是要访问的对象，可以是一个或者多个对象的集合。比如说：web程序中的页面等等。资源是受保护的对象，需要为资源配置一些权限。

每个资源都有一个唯一的标识符，可以代表一个资源或一组资源。 例如，你可以管理一个银行帐户资源，该资源代表并定义了所有银行帐户的一组授权策略。 但是，你也可以使用另一个名为Alice's Banking Account的资源，该资源代表由单个客户拥有的单个资源，该资源可以具有自己的一组授权策略。

我们看一个resource的例子：

![](https://img-blog.csdnimg.cn/20201026122122600.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图中，我们将不同的URI定义为resource。并给不同的resource起了唯一的名字。

Scope是对资源的一系列操作，比如你可以对资源进行读，写或者编辑，删除操作，这些都可以被称之为scope。当然，你也可以指定resource中的某个属性作为scope。

然后就是Permission，权限将受保护的对象与是否授予访问权限的策略相关联。

比如我们有下面一个权限：

~~~sh
X CAN DO Y ON RESOURCE Z
~~~

x表示的是一个或者多个用户，角色或者groups，或者是他们的组合。

**Y**表示的是对资源的一种操作。

Z就是资源了，比如/index页面。

我们可以创建基于resource的permission:

![](https://img-blog.csdnimg.cn/20201026140031179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

也可以创建基于scope的permission：

![](https://img-blog.csdnimg.cn/20201026135943682.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

Policy定义了要授予对象访问权限必须满足的条件。Policy并没有指明要保护的对象，只是指定了访问给定对象必须满足的条件。

![](https://img-blog.csdnimg.cn/20201026134704659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

比如上面的Policy，指定了什么样的角色，针对什么样的client，制定出来的什么样的逻辑。

有了策略就需要一个Policy Provider，Policy Provider主要为我们提供特定策略类型的实现。

为了做好策略评估的工作，我们还需要一个策略评估引擎，通过这个engine来执行策略的评估工作。

除此之外，作为一个认证服务器，我们还需要对外提供认证服务，那么最好的办法就是提供OAuth2或者OpenID Connect的token服务。

另外我们还需要一个Protection API，用于resource server和权限管理服务进行交互。



> 本文作者：flydean程序那些事
>
> 本文链接：[www.flydean.com](www.flydean.com)
>
> 本文来源：flydean的博客
>
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









