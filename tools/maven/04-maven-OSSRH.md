maven中心仓库OSSRH使用简介

[toc]

# 简介

使用java做项目的朋友肯定对maven不陌生，maven为我们提供了一个中心仓库，我们在构建java项目时，直接从maven中心仓库中下载依赖的jar包到本地，然后打包进行构建。

所有人都知道有这样一个maven仓库，但是很少有人去探寻这个maven仓库到底在什么地方，能不能发布自己的jar包到中心仓库呢？今天给大家介绍一下maven中心仓库和OSSRH的使用。

# 为什么使用中心仓库

maven中心仓库的地址是 https://search.maven.org/#browse ， 我们可以通过该链接去查找需要的jar包，而这些jar包都是各个开源组织发布上去的。

这个中心仓库是Apache Maven, SBT 默认的repository。同时还可以支持 Apache Ant/Ivy, Gradle 等构建工具的使用。

现在的软件界是开源的软件界，越来越多的人和企业愿意在网络上贡献自己的代码，于是有了maven社区的中心仓库，可以方便任何人共享和使用jar包。

# 发布到中心仓库前的准备工作

发布到中心仓库是需要权限的，我们需要注册我们的项目也就是artifacts id，并且指定需要将项目发布到哪里。

Sonatype 提供了一个叫做开源软件资源库托管Open Source Software Repository Hosting (OSSRH) 的工具，帮助我们来方便的将项目发布到中心仓库中。它是项目所有者和贡献者将其组件发布到中央资源库的主要途径。

我们需要选择一个你所拥有的domain作为groupId，对于GitHub groupId（io.github.username），只要您的项目URL与所请求的groupId匹配，就会立即进行验证。

对于其他的域名，可以通过下面两种方式之一来进行域名的验证：

1. 使用TXT文件验证：在域名下创建一个代表OSSRH ticket number的TXT文件来进行验证。
2. GitHub重定向：设置你的域名到托管项目的GitHub URL的重定向。

# 使用OSSRH

Sonatype OSSRH（OSS存储库托管）使用Sonatype Nexus存储库管理器为开源项目二进制文件提供存储库托管服务。 OSSRH使用的是Maven存储库格式，我们可以部署开发版本的二进制文件snapshots，阶段发布二进制文件，还可以升级二进制文件并将其同步到中央仓库中。

## 使用Sonatype创建ticket

Sonatype使用JIRA来管理创建请求，所以我们需要首先创建一个JIRA账号，创建账号地址： https://issues.sonatype.org/secure/Signup!default.jspa ， 然后使用该账户创建一个Project ticket，创建ticket地址：https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134。

一般来说会在2个工作日内进行审核。

## 中央仓库中的组件要求

不同于我们自己的私人仓库，中央仓库中的组件的格式是有一定要求的。我们需要遵循它的格式规范。

### 提供Javadoc 和源代码

除了pom文件之外，还需要提供javadoc文件和源代码文件。这样的目的是方便在IDE中直接访问使用。

这些文件的命名遵循Maven存储库格式的命名约定，使用artifactId加上version作为文件名称，并根据类型使用javadoc或者sources作为名字的区分，以jar结尾，比如：

```
<groupId>com.example.applications</groupId>
<artifactId>example-application</artifactId>
<version>1.4.7</version>
```

其对应的javadoc文件和源代码文件如下：

```
example-application-1.4.7-sources.jar
example-application-1.4.7-javadoc.jar
```

如果确实没有javadoc和源代码文件，比如Scala项目，那么需要创建一个假的文件来通过验证。

### 使用GPG/PGP给文件签名

所有的文件都需要使用GPG/PGP进行签名，生成一个.asc后缀的文件，比如对应下面的文件：

```
example-application-1.4.7.pom
example-application-1.4.7.jar
example-application-1.4.7-sources.jar
example-application-1.4.7-javadoc.jar
```

需要生成：

```
example-application-1.4.7.pom.asc
example-application-1.4.7.jar.asc
example-application-1.4.7-sources.jar.asc
example-application-1.4.7-javadoc.jar.asc
```

### Metadata文件

Metadata文件也就是需要提交的pom文件。 这是Apache Maven用来定义项目及其构建的Project Object Model文件。 使用其他工具进行构建时，必须对其进行组装并确保其包含下面几项必须的信息。

除了必需的信息外，还建议包含项目的正确依赖关系，以便构建工具可以使用该信息正确地解决传递依赖关系，并且不需要用户手动管理依赖关系。

1. 项目坐标信息，也叫做GAV。包括groupId ，artifactId和version，如下所示：

```
<groupId>com.example.applications</groupId>
<artifactId>example-application</artifactId>
<version>1.4.7</version>
```

除此之外，如果项目不是jar包，还需要包含packaging信息，有效的值包括： `jar` , `war` ,`ear` , `pom` , `maven-plugin` , `ejb` , `rar` , `par` , `aar` 和 `apklib` 。

2. 项目名字，描述和URL信息：

```
<name>Example Application</name>
<description>A application used as an example on how to set up pushing 
  its components to the Central Repository.</description>
<url>http://www.example.com/example-application</url>
```

还可以使用变量来构建项目名：

```
<name>${project.groupId}:${project.artifactId}</name>
```

3. License信息

```
<licenses>
  <license>
    <name>The Apache License, Version 2.0</name>
    <url>http://www.apache.org/licenses/LICENSE-2.0.txt</url>
  </license>
</licenses>
```

4. 开发者信息

```
<developers>
    <developer>
      <name>Manfred Moser</name>
      <email>manfred@sonatype.com</email>
      <organization>Sonatype</organization>
      <organizationUrl>http://www.sonatype.com</organizationUrl>
    </developer>
  </developers>
```

5. SCM信息

SCM是你项目的地址，如果使用的svn可以这样写：

```
<scm>
  <connection>scm:svn:http://subversion.example.com/svn/project/trunk/</connection>
  <developerConnection>scm:svn:https://subversion.example.com/svn/project/trunk/</developerConnection>
  <url>http://subversion.example.com/svn/project/trunk/</url>
</scm>
```

如果使用的github可以这样写：

```
<scm>
  <connection>scm:git:git://github.com/simpligility/ossrh-demo.git</connection>
  <developerConnection>scm:git:ssh://github.com:simpligility/ossrh-demo.git</developerConnection>
  <url>http://github.com/simpligility/ossrh-demo/tree/master</url>
</scm>
```

## 部署

部署的目的是将生成的组件部署到本地的仓库中，有很多工具可以使用，最常见的就是Apache Maven，其他的构建工具比如Apache ant、Gradle、sbt等都可以很方便的构建项目。

> 注意，OSSRH单个文件有上传大小限制，最大为1024MB。如果需要上传更大的组件，需要联系sonatype。

## 上传到中央仓库

本地部署好之后，就可以上传到中央仓库了。

可以使用Nexus Staging Maven Plugin 或者 Ant Tasks 来通过命令行上传。也可以直接浏览器访问 https://oss.sonatype.org/ 来上传。

一旦发布，组件会在10分钟之内发布到中央仓库，并且在2个小时之内，可以从中央仓库搜索到。

我们以浏览器发布为例来看一下具体的步骤。

首先使用JIRA创建的用户名和密码登录到 https://oss.sonatype.org/  。

![](https://img-blog.csdnimg.cn/20210223234823227.png)

登录之后，在左下角可以看到Build Promotion选项，我们选择Staging Repositories ，就会展示目前处于stage状态的仓库。

在部署过程中创建的stage存储库会有一个名称，该名称以项目的groupId开头(删除其中的点)，带有破折号和4位数字。 例如。 如果您的项目groupId为com.example.applications，则staging配置文件名称将以comexampleapplications开头。 序列号从1000开始，并且随着部署的增加而增加，比如：comexampleapplication-1010。

选择staging存储库，列表下方的面板将显示有关存储库的更多详细信息。 另外，可以点击*Close*和*Release*按钮。

![](https://img-blog.csdnimg.cn/20210223235207581.png)

部署完成后，状态会变成*Open*，点击close会触发对组件的校验，如果校验成功，那么可以点击release按钮将其部署到中央仓库中。

> 如果选择使用Nexus Staging Maven插件或Ant任务进行部署，可以直接在命令行进行。



