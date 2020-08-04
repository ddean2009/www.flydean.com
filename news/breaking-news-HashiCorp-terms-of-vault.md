突发！HashiCorp禁止在中国使用企业版VAULT软件

# 前言

昨天HashiCorp突然发布一则消息，禁止在中国使用Vault软件的企业版本，官方申明是这样的：

![](https://img-blog.csdnimg.cn/20200530071025939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

HashiCorp的解释是因为中国的出口管制的原因导致无法出售HASHICORP软件或者使用企业版的Vault。所以在没有取得HashiCorp书面协议的前提下，不得在中国境内使用，部署和安装HashiCorp的Vault企业版本软件。

> 注意，这里只是禁止使用企业版本的Vault软件，个人版本和HashiCorp公司的其他软件并不在此限制之内。大家不要被网络上面的谣言所迷惑，一定要勇于探索真理。

# HashiCorp公司介绍

那么这个影响到底对我们有多大呢？我们先看下HashiCorp公司的成长史。

![](https://img-blog.csdnimg.cn/20200530071841736.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

HashiCorp于2012年成立，由Mitchell Hashimoto和Armon Dadgar创办，并陆续推出了Vagrant、Packer 、 Terraform、Consul , Vault 和 Nomad以满足不同的需求。

HashiCorp专注于提供DevOps基础设施自动化工具，集开发、运营和安全性于一体，可以帮助开发者编写和部署应用程序，加速应用程序分发，助力企业提升开发效率。公司还推出了一个商业平台Atlas，为公共云服务供应商和私人云技术公司等提供支持。

HashiCorp于2014年获得了1000万美元A轮融资。并在最近，也就是2020-03-18月E轮融资获得了1.75亿美元。主要投资方包括：GGV纪源资本，红点投资，Mayfield Fund，IVP (Institutional Venture Partners)等知名机构。

HashiCorp采用开源的方式和云厂商合作，为云的使用提供了一套通用的工作流程。合作方包括2000多家上市公司。

在2019 胡润研究院发布《2019胡润全球独角兽榜》，HashiCorp排名第138位。

# HashiCorp旗下的软件

![](https://img-blog.csdnimg.cn/20200530072905179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

HashiCor提供了一整套的技术服务，涵盖了云服务的每一层，帮助企业轻松在云环境中操作，每个产品都是为特定的云基础设置自动化来服务的。

区分下来，可以分为Provision，Secure，Connect和Run四个部分。

## Provision

Provision的意思就是安装。

![](https://img-blog.csdnimg.cn/20200530073418681.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Terraform可以实现用代码的形式来安装cloud或者infrastructure。基础结构即代码，使用 Terraform 配置语言可以轻松跨整个工作流实现资源管理自动化。

基本上大部分的公有云都支持使用Terraform。

## Secure

![](https://img-blog.csdnimg.cn/20200530073817808.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

安装好基础组件之后，那么就需要保证他们使用的安全性。那么就需要用到Vault。也就是今天被禁止使用的Vault。

 Vault是一款企业级私密信息管理工具。

 在企业级应用开发过程中，我们每时每刻都在使用到私密信息，包括密码，密钥，token等等。那么如果在公司内部的开发者之间共享这些密码，密钥，token就是一个很实在的问题。

 而Vault就是这样的一套统一的管理私密信息的接口。

 难道被禁的原因是Vault的安全性协议？

## Connect

 安全性也保证了，那么接下来就是连接服务了。

 ![](https://img-blog.csdnimg.cn/20200530074218900.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

 Consul是一个支持多数据中心分布式高可用的服务发现和配置共享的服务软件。在国内有大量的使用案例。

## Run

 ![](https://img-blog.csdnimg.cn/20200530074416100.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

 最后就是运行了，Nomad可以用来对容器进行管理和调度。从而更加快捷的部署和更加方便的管理线上资源。

# 总结

 虽然目前被禁用的只是Vault的企业版本，但是还是让人感到深深的危机感，中国的企业什么时候能够做出世界级的软件平台，让我们拭目以待！

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！




