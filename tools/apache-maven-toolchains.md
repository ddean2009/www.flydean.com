Apache Maven ToolChains的使用

# 简介

Maven是java中非常有用和常用的构建工具，基本上现在大型的java项目都是Maven和gradle的天下了。

因为JDK的版本现在以每半年一次的速度在飞速发展。不同的JDK版本就有不同的java路径，我们在使用Maven的过程中，可能经常会需要切换JDK的版本。

> 更多内容请访问[www.flydean.com](www.flydean.com)

一般来说我们可以在maven-compiler-plugin中配置好executable的路径。如下所示：

~~~java

<build>
	<plugins>
		<!-- target Java 14 -->
		<plugin>
			<artifactId>maven-compiler-plugin</artifactId>
			<configuration>
				<!-- fork compilation and use the
						 specified executable -->
				<fork>true</fork>
				<executable>/usr/bin/javac14</executable>
			</configuration>
		</plugin>
	</plugins>
</build>
~~~

看起来还不错，但是如果想切换executable的路径可能就比较麻烦。更有问题的是，如果你是团队来发，一个人在mac环境一个人在windows环境，两边的executable的路径完全是不同的，这会导致代码冲突，和代码难以维护。

# Toolchains的介绍

为了解决这个问题，Maven为我们推出了Toolchains。使用Toolchains,我们可以将这些可执行文件的路径，版本号，还有类型都定义在一个toolchains.xml文件里面。

而在pom.xml文件中只需要引用toolchains.xml中定义的别名就可以了。

针对上面的windows和linux路径不一致的问题，我们可以保证pom.xml是完全一致的，大家只需要适配自己的toolchains.xml文件即可。

# Toolchains的例子

Toolchains是和pom中其他的plugin结合起来使用的，比如最常用的maven-compiler-plugin。

下面我们举一个例子来说明。首先定义toolchains.xml文件，这个文件最好放在${user.home}/.m2/中。

~~~xml
<?xml version="1.0" encoding="UTF8"?>
<toolchains>
  <!-- JDK toolchains -->
  <toolchain>
    <type>jdk</type>
    <provides>
      <version>14</version>
      <vendor>oracle</vendor>
    </provides>
    <configuration>
      <jdkHome>/path/to/jdk/14</jdkHome>
    </configuration>
  </toolchain>
  <toolchain>
    <type>jdk</type>
    <provides>
      <version>11</version>
      <vendor>oracle</vendor>
    </provides>
    <configuration>
      <jdkHome>/path/to/jdk/11</jdkHome>
    </configuration>
  </toolchain>
</toolchains>
~~~

上面的例子中，我们定义了2个JDK的toolchains。一个JDK14，一个JDK11。下面看下怎么在pom文件中使用。

~~~xml
<plugins>
 ...
  <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.1</version>
  </plugin>
  <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>1.1</version>
    <executions>
      <execution>
        <goals>
          <goal>toolchain</goal>
        </goals>
      </execution>
    </executions>
    <configuration>
      <toolchains>
        <jdk>
          <version>14</version>
          <vendor>oracle</vendor>
        </jdk>
      </toolchains>
    </configuration>
  </plugin>
  ...
</plugins>
~~~

上面的pom配置文件中，我们通过简单的引用toolchains中的定义，即可无缝的进行JDK版本的切换。

# Toolchains支持

Toolchains需要Maven 2.0.9以上版本的支持。

Toolchains是需要和pom中的plugin一起使用的，下面的图中列出了toolchains支持的plugin名字和最低的版本要求。

![](https://img-blog.csdnimg.cn/20200505125211775.png)

# 总结

本文介绍了Apache Maven中toolchain的使用，希望大家能够在实际工作中用起来。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)




