---
slug: /wildfly-app-deployment
---

# 4. wildfly 21中应用程序的部署

# 简介

除了配置文件的修改之外，最重要的就是应用程序的部署了。本文将会讲解如何在wildfly 21中，在Managed Domain和standalone两种模式中如何部署应用程序。

# Managed Domain中的部署 

在managed domain模式下，服务是放在很多个server中启动的，而server是和server-group相关联的。同一个server-group下的server部署是一致的。

在managed domain模式下，需要先将要部署的应用程序上传到domain controller中，然后通过domain controller将其部署到一个或者多个server-group中。

当然我们在domain controller中的cli环境中只需要一个deploy命令就可以做到上面的两步了。

比如说，我们创建了一个应用程序叫做test-application.war，看下怎么进行部署：

~~~sh
[domain@localhost:9990 /] deploy ~/Desktop/test-application.war
Either --all-server-groups or --server-groups must be specified.
 
[domain@localhost:9990 /] deploy ~/Desktop/test-application.war --all-server-groups
'test-application.war' deployed successfully.
~~~

在执行deploy命令的时候，需要指定部署到的server-groups名字，可以部署到所有的server-groups中，也可以指定特定的某些server-groups:

~~~sh
[domain@localhost:9990 /] deploy ~/Desktop/test-application.war --server-groups=main-server-group,another-group
'test-application.war' deployed successfully.
~~~

部署完成之后，我们可以通过cli来查看一下部署的状态：

~~~sh
[domain@localhost:9990 /] /server-group=main-server-group/deployment=test-application.war:read-resource(include-runtime)
{
   "outcome" => "success",
   "result" => {
       "enabled" => true,
       "name" => "test-application.war",
       "managed" => true,
       "runtime-name" => "test-application.war"
   }
}
~~~

deploy可以添加--force参数，用来升级或者替换现有的程序版本：

~~~sh
[domain@localhost:9990 /] deploy ~/Desktop/test-application.war --all-server-groups --force
'test-application.war' deployed successfully.
~~~

如果想取消部署，则可以使用undeploy：

~~~sh
[domain@localhost:9990 /] undeploy test-application.war --all-relevant-server-groups
Successfully undeployed test-application.war.
 
[domain@localhost:9990 /] /server-group=main-server-group:read-children-names(child-type=deployment)
{
   "outcome" => "success",
   "result" => []
}
~~~

部署完成之后，会在domain.xml中添加或者修改两个部分的内容，分别是deployments和server-groups：

~~~xml
[...]
<deployments>
   <deployment name="test-application.war"
               runtime-name="test-application.war">
       <content sha1="dda9881fa7811b22f1424b4c5acccb13c71202bd"/>
   </deployment>
</deployments>
[...]
<server-groups>
   <server-group name="main-server-group" profile="default">
       [...]
       <deployments>
           <deployment name="test-application.war" runtime-name="test-application.war"/>
       </deployments>
   </server-group>
</server-groups>
[...]
~~~ 

## 管理展开的部署文件

一般来说，如果我们要创建或者修改一个应用程序的部署文件的话，我们可以重新打包这个部署文件，然后重新部署即可。

但是有时候，重新打包整个应用程序可能比较复杂，而我们只是想修改程序中的某一个或者某几个特定的文件。那么wildfly提供了命令行方便的实现这个功能。

要修改打包好的部署文件，首先就是要将部署文件展开。因为部署文件一般都是以ear，war结尾的，展开的目的就是将其进行解压缩，以便我们可以修改包里面的内容。

比如说我们现在已经部署好了一个kitchensink.ear文件，现在可以使用下面的命令将其展开：

~~~sh
[domain@localhost:9990 /] /deployment=kitchensink.ear:explode()
~~~

因为上面的展开命令并不是递归执行的，如果ear中包含子的部署系统war文件的话，我们可以使用path来指定展开的子系统：

~~~sh
[domain@localhost:9990 /] /deployment=kitchensink.ear:explode(path=wildfly-kitchensink-ear-web.war)
~~~

展开部署文件之后，我们可以使用browse-content来查看文件的列表：

~~~sh
[domain@localhost:9990 /] /deployment=kitchensink.ear:browse-content(archive=false, path=wildfly-kitchensink-ear-web.war)
{
    "outcome" => "success",
    "result" => [
        {
            "path" => "META-INF/",
            "directory" => true
        },
        {
            "path" => "META-INF/MANIFEST.MF",
            "directory" => false,
            "file-size" => 128L
        },
        ...
}
~~~

如果想查看具体某个文件的描述，则可以使用read-content：

~~~sh
[domain@localhost:9990 /] /deployment=kitchensink.ear:read-content(path=META-INF/MANIFEST.MF)
{
    "outcome" => "success",
    "result" => {"uuid" => "b373d587-72ee-4b1e-a02a-71fbb0c85d32"},
    "response-headers" => {"attached-streams" => [{
        "uuid" => "b373d587-72ee-4b1e-a02a-71fbb0c85d32",
        "mime-type" => "text/plain"
    }]}
}
~~~

注意，read-content只能读取到文件的描述符，并不能获取到文件的内容，如果想要读取文件的内容，可以使用attachment display ：

~~~sh
[domain@localhost:9990 /] attachment display --operation=/deployment=kitchensink.ear:read-content(path=META-INF/MANIFEST.MF)
ATTACHMENT d052340a-abb7-4a66-aa24-4eeeb6b256be:
Manifest-Version: 1.0
Archiver-Version: Plexus Archiver
Built-By: mjurc
Created-By: Apache Maven 3.3.9
Build-Jdk: 1.8.0_91
~~~

使用attachment save命令还可以将部署文件的内容拷贝到指定的文件目录中：

~~~sh
[domain@localhost:9990 /] attachment save --operation=/deployment=kitchensink.ear:read-content(path=META-INF/MANIFEST.MF) --file=/tmp/example
File saved to /tmp/example
~~~

我们可以使用add操作来创建一个空的展开部署文件：

~~~sh
[domain@localhost:9990 /] /deployment=exploded.war:add(content=[{empty=true}])
~~~

然后使用add-content向其中添加文件：

~~~sh
[domain@localhost:9990 /] /deployment=exploded.war:add-content(content=[{target-path=WEB-INF/classes/org/jboss/as/test/deployment/trivial/ServiceActivatorDeployment.class, input-stream-index=/home/demo/org/jboss/as/test/deployment/trivial/ServiceActivatorDeployment.class}, {target-path=META-INF/MANIFEST.MF, input-stream-index=/home/demo/META-INF/MANIFEST.MF}, {target-path=META-INF/services/org.jboss.msc.service.ServiceActivator, input-stream-index=/home/demo/META-INF/services/org.jboss.msc.service.ServiceActivator}])
~~~

或者使用remove-content删除其中的文件：

~~~sh
[domain@localhost:9990 /] /deployment=exploded.war:remove-content(paths=[WEB-INF/classes/org/jboss/as/test/deployment/trivial/ServiceActivatorDeployment.class, META-INF/MANIFEST.MF, META-INF/services/org.jboss.msc.service.ServiceActivator])
~~~

非常的方便。

# standalone模式下的部署

standalone模式下的部署和domain模式下的部署其实是差不多的，只不过standalone模式下没有server group的概念，我们看下怎么部署和反部署：

~~~sh
[standalone@localhost:9990 /] deploy ~/Desktop/test-application.war
'test-application.war' deployed successfully.
 
[standalone@localhost:9990 /] undeploy test-application.war
Successfully undeployed test-application.war.
~~~

## standalone模式下的自动部署

手动部署比较麻烦，需要手动输入命令才能完成部署，如果系统中已经存在了deployment-scanner这个subsystem的话，那么这个scanner会定时去扫描standalone/deployments中的文件，从而完成自动部署的工作。

> 注意，在生产环境下，并不鼓励使用scanner去完成部署工作。

我们可以在standalone.xml中对deployment-scanner进行更加具体的配置：

~~~xml
<deployment-scanner scan-interval="5000" relative-to="jboss.server.base.dir"
   path="deployments" auto-deploy-zipped="true" auto-deploy-exploded="false"/>
~~~

## Marker Files

Marker Files是和部署文件同名的文件，只不过在部署文件后面加上了一些后缀，比如：.dodeploy，.skipdeploy，.isdeploying，.deployed等等。

其中比较重要的是.dodeploy和.deployed，我们可以手动创建或者删除这些文件，来控制系统的部署工作。

比如，我们的部署文件叫做example.war，那么我们可以通过：

~~~sh
cp target/example.war/ $JBOSS_HOME/standalone/deployments

touch $JBOSS_HOME/standalone/deployments/example.war.dodeploy
~~~

来手动部署example.war文件。

还可以通过删除.deployed来反部署应用程序。

~~~sh
rm $JBOSS_HOME/standalone/deployments/example.war.deployed
~~~

如果$JBOSS_HOME/standalone/deployments/example.war.undeployed出现了，就表现系统反部署成功了。

# 受管理的和不受管理的部署 

wildfly支持两种部署模式，受管理的和不受管理的部署。

所谓不受管理的部署就是说，用户自行提供要部署的文件路径，系统直接去读取该路径上的文件。

而受管理的部署会把要部署的文件上传到内部的仓库中，然后使用这个仓库中的内容进行后面的部署操作。

仓库文件目录是standalone/data/content或者domain/data/content，我们看下仓库的文件格式：

~~~sh
ls domain/data/content/
  |---/47
  |-----95cc29338b5049e238941231b36b3946952991
  |---/dd
  |-----a9881fa7811b22f1424b4c5acccb13c71202bd
~~~

我们看一个部署文件的描述：

~~~xml
<deployments>
   <deployment name="test-application.war"
               runtime-name="test-application.war">
       <content sha1="dda9881fa7811b22f1424b4c5acccb13c71202bd"/>
   </deployment>
</deployments>
~~~

可以看到上面列出了部署文件的名字和sha1编码。WildFly主要通过这个sha1的编码去找到存储的文件。

默认情况下，我们使用deploy命令部署的是受管理的应用，我们可以通过添加--unmanaged来部署非受管理的应用：

~~~sh
[standalone@localhost:9990 /] deploy ~/Desktop/test-application.war --unmanaged
'test-application.war' deployed successfully.
~~~

这样将会存储文件的绝对路径在配置文件中，并且也不会去计算文件的hash值。

反部署应用都是一样的命令：

~~~sh
[standalone@localhost:9990 /] undeploy test-application.war
Successfully undeployed test-application.war.
~~~

# 部署覆盖

有时候我们需要修改部署好的应用程序中的某些文件，除了可以解压应用程序之外，还可以使用deployment-overlay命令：

~~~sh
deployment-overlay add --name=myOverlay --content=/WEB-INF/web.xml=/myFiles/myWeb.xml,/WEB-INF/ejb-jar.xml=/myFiles/myEjbJar.xml --deployments=test.war,*-admin.war --redeploy-affected
~~~

# 总结

wildfly的两种模式的部署就讲到这里，大家可以根据需要自行选择。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！








