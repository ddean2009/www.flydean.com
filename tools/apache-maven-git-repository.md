使用site-maven-plugin在github上搭建公有仓库
# 简介

Maven是我们在开发java程序中经常使用的构建工具，在团队合作开发过程中，如果我们想要将自己写好的jar包共享给别人使用，通常需要自己搭建maven仓库，然后将写好的jar包上传到maven仓库中，以供其他用户使用。

搭建maven仓库需要服务器和域名，对公司而言域名和服务器多的是，但是如果是我们个人或者小团队想共享一些非常有用的jar包给别人使用就太麻烦了。

最近Github好消息频出，先是对个人用户取消了repositories和协作用户的个数限制，后面对于企业用户也进行了升级和降价处理。如果仓库不大的话，完全可以把仓库搬到github上面去。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 前期准备

要在github上面搭建maven仓库，我们需要使用到maven的插件：site-maven-plugin。因为要连到github上面，所以需要设置github的oauth权限。直接用用户名密码也可以，但是这样做不安全，我们并不推荐。

![](https://img-blog.csdnimg.cn/20200508165924478.png)

如上图所示，在Settings->Developer settings->Personal access tokens中创建一个access tokens,所需权限如下：


![](https://img-blog.csdnimg.cn/20200508134401794.png)

![](https://img-blog.csdnimg.cn/2020050813441739.png)

> 注意，用户这里的权限一定要选，否则后面会报异常。

有了权限，接下来我们再创建一个github-maven-repository,用来作为mvn仓库存储数据。

假如生成的地址是：https://github.com/flydean/github-maven-repository

# 在maven中配置GitHub权限

这一步我们需要编辑setting.xml文件，一般来说这个文件是在~/.m2/settings.xml。

我们需要添加一个Server,如果直接使用github的用户名密码，则像下面这样：

~~~xml
<server>
   <id>github</id>
    <username>YOUR_USERNAME</username>
    <password>YOUR_PASSWORD</password>
</server>
~~~

前面我们讲到了直接使用用户名是不安全的，我们可以使用上面创建的oauth key：

~~~xml
<server>
    <id>github</id>
    <password>OAUTH2TOKEN</password>
</server>
~~~

这个id会在后面的pom.xml文件配置中用到，这里我们先记下来。

# 配置deploy-plugin

我们的目标是生成包含jar包的maven依赖。在将jar包上传到远程仓库之前，我们需要在本地先生成。

先配置一个本地的repository:

~~~xml
<distributionManagement>
        <repository>
            <id>maven.repo</id>
            <name>Local Staging Repository</name>
            <url>file://${project.build.directory}/mvn-repo</url>
        </repository>
    </distributionManagement>
~~~

上面我们指定了在项目的build目录下面创建了mvn-repo用来存储本地打好的package。

接下来，我们需要使用maven-deploy-plugin指定将打好的包部署到刚刚我们指定的local仓库中。

~~~xml
<plugin>
            <artifactId>maven-deploy-plugin</artifactId>
            <version>2.8.2</version>
            <configuration>
                <altDeploymentRepository>maven.repo::default::file://${project.build.directory}/mvn-repo</altDeploymentRepository>
            </configuration>
        </plugin>
~~~

# 配置site-maven-plugin

现在我们就可以使用site-maven-plugin了：

~~~xml
<plugin>
            <!-- Deploy the web site -->
            <groupId>com.github.github</groupId>
            <artifactId>site-maven-plugin</artifactId>
            <version>0.12</version>
            <executions>
                <execution>
                    <goals>
                        <goal>site</goal>
                    </goals>
                    <!-- select the Maven phase in which the plugin will be executed -->
                    <phase>deploy</phase>
                    <configuration>
                        <!-- Plugin configuration goes here -->
                        <server>github</server>
                        <!-- The commit message -->
                        <message>init git maven repository</message>
                        <!-- The location where the site is uploaded -->
                        <repositoryName>github-maven-repository</repositoryName> <!-- github repo name -->
                        <repositoryOwner>flydean</repositoryOwner> <!-- organization or user name  -->
                        <!-- Use merge or override the content -->
                        <merge>true</merge>
                        <outputDirectory>${project.build.directory}/mvn-repo</outputDirectory>
                        <branch>refs/heads/mvn-repo</branch>
<!--                        <includes>-->
<!--                            <include>**/*</include>-->
<!--                        </includes>-->
                    </configuration>
                </execution>
            </executions>
        </plugin>
~~~

使用中要注意下面几点：

1. site-maven-plugin的goals是site，它需要跟maven的deploy phase相关联，从而在我们执行mvn deploy的时候自动运行site-maven-plugin。

2. github的权限配置，我们可以在configuration中设置server=github，也可以配置下面的全局变量：

~~~xml
    <properties>
        <github.global.server>github</github.global.server>
    </properties>
~~~

3. 需要指定repositoryName和repositoryOwner，否则会报错。

4. message表示的是提交到github的消息。

5. 默认情况下的提交到github中的branch是refs/heads/gh-pages，这里我们自定义了一个。

好了，一切都配置完了，我们可以运行了mvn deploy：

![](https://img-blog.csdnimg.cn/20200508172222379.png)

从上图可以看到，github上面已经有了一个可共享的项目了。

# 怎么使用这个共享的项目

使用起来很简单，只需要在pom.xml文件中添加相应的依赖和repository即可：

~~~xml
<dependency>
    <groupId>YOUR.PROJECT.GROUPID</groupId>
    <artifactId>ARTIFACT-ID</artifactId>
    <version>VERSION</version>
</dependency>

<repository>
    <id>ARTIFACT-ID</id>
    <url>https://raw.github.com/flydean/github-maven-repository/mvn-repo/</url>
</repository>

~~~

# 总结

Github带给我们的福利，赶紧用起来吧。


本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








