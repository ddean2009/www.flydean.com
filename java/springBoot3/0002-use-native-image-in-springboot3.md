在spring boot3中使用native image

[toc]

# 简介

在之前spring boot3文章中我们介绍了，spring boot3的一个重要特性就是支持把spring boot3的应用编译成为GraalVM的Native Image。

今天我们用具体的例子来给大家演示一下如何正确的将spring boot3的应用编译成为native image。

# 安装GraalVM

如果要把spring boot3的app编译成为native应用，需要GraalVM的支持。

什么是GraalVM呢？

从名字就可以看出来GraalVM是一个虚拟机，它的主要目标就是提升java应用程序的性能，并且消耗更少的资源。

它在java HotSpot JVM的基础上添加了JIT编译器和AOT来实现将应用编译成为本地可执行文件。除了java之外，GraalVM还支持JavaScript、Ruby、Python等多种编程语言。

所以，为什么要用GraalVM呢？一个字：快。

安装GraalVM也比较简单，我们进入它的官方下载页面下载对应的版本即可：https://www.oracle.com/downloads/graalvm-downloads.html。

GraalVM跟JDK一样也有两个版本，社区版和企业版本，大家可以根据需要自行选择。

> 要注意的是spring boot3需要GraalVM 22.3以上的版本支持，大家可不要下载错了。

下载完成之后，我们可以像正常安装JDK一样来安装GraalVM,这里以mac为例，假如我们安装的目录是/Library/Java/JavaVirtualMachines/graalvm-ee-java17-22.3.0，那么我们需要配置对应的JAVA_HOME和PATH环境变量如下：

```
 export PATH=/Library/Java/JavaVirtualMachines/graalvm-ee-java17-22.3.0/Contents/Home/bin:$PATH

 export JAVA_HOME=/Library/Java/JavaVirtualMachines/graalvm-ee-java17-22.3.0/Contents/Home
```

PATH中有一个非常重要的命令叫做gu，如果不添加PATH，那么在使用中就可能遇到下面的异常：

```
'gu' tool wasn't found. This probably means that JDK at isn't a GraalVM distribution.
```

安装完毕之后可以通过下面的命令来进行验证：

```
java -version
java version "17.0.5" 2022-10-18 LTS
Java(TM) SE Runtime Environment GraalVM EE 22.3.0 (build 17.0.5+9-LTS-jvmci-22.3-b07)
Java HotSpot(TM) 64-Bit Server VM GraalVM EE 22.3.0 (build 17.0.5+9-LTS-jvmci-22.3-b07, mixed mode, sharing)
```

如果是在mac环境下，还需要执行下面的命令来解除对graalvm的隔离限制：

```
 sudo xattr -r -d com.apple.quarantine /path/to/graalvm
```

否则在使用中就会遇到下面的问题：

![](https://img-blog.csdnimg.cn/2ac386b9d0ef4a72b8cf460902425014.png)

## 添加Native Image支持

我们安装GraalVM的目的就是使用它的native Image特性。native image是一个单独的jar包，我们可以执行下面的命令来进行安装：

```
gu install native-image
```

其中gu就是/Library/Java/JavaVirtualMachines/graalvm-ee-java17-22.3.0/Contents/Home/bin中的命令。

下载的过程中还需要输入一个有效的邮件，并进行邮箱校验。然后一路ENTER就可以了。

当然，你还可以把Oracle GraalVM Enterprise Edition Native Image下载到本地，然后使用gu install -L来进行本地安装。

好了，到目前为止，一切准备妥当，我们接下来看看如何把spring boot3的应用打包成为native image吧。

# 构建spring boot3应用

这里我们使用的是maven，所以需要添加下面的spring boot3的依赖：

```
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.1</version>
        <relativePath/> 
    </parent>
```

因为要构建native image，所以我们还需要用到下面的一个native-maven-plugin插件：

```
            <plugin>
                <groupId>org.graalvm.buildtools</groupId>
                <artifactId>native-maven-plugin</artifactId>
            </plugin>
```

这里我们只创建了一个非常简单的main方法：

```
@SpringBootApplication
public class NativeImageApplication {

    public static void main(String[] args) {
        SpringApplication.run(NativeImageApplication.class, args);
    }

}

```

然后，我们尝试运行 mvn native:build来构建spring boot3应用程序。

> 记得在build之前一定先要编译好项目。

很可惜，你会发现下面的异常：

```
[INFO] --- native-maven-plugin:0.9.19:build (default-cli) @ native-image ---
[WARNING] 'native:build' goal is deprecated. Use 'native:compile-no-fork' instead.
[INFO] Found GraalVM installation from JAVA_HOME variable.
...
Error: Please specify class (or <module>/<mainclass>) containing the main entry point method. (see --help)

```

从上面的异常我们发现了两个问题，第一个问题是一个警告，它推荐我们使用native:compile-no-fork。

第二个问题是说找不到mainclass,根据异常信息，我们在pom的plugin中添加下面的配置信息，如下所示：

```
<plugin>
                <groupId>org.graalvm.buildtools</groupId>
                <artifactId>native-maven-plugin</artifactId>
                <configuration>
                    <!-- imageName用于设置生成的二进制文件名称 -->
                    <imageName>${project.artifactId}</imageName>
                    <!-- mainClass用于指定main方法类路径 -->
                    <mainClass>com.flydean.nativeimage.NativeImageApplication</mainClass>
                    <buildArgs>
                        --no-fallback
                    </buildArgs>
                </configuration>
                <executions>
                    <execution>
                        <id>build-native</id>
                        <goals>
                            <goal>compile-no-fork</goal>
                        </goals>
                        <phase>package</phase>
                    </execution>
                </executions>
            </plugin>
```

然后重新运行mvn native:compile-no-fork：

```
GraalVM Native Image: Generating 'native-image' (executable)...
========================================================================================================================
[1/7] Initializing...                                                                                    (4.3s @ 0.25GB)
 Version info: 'GraalVM 22.3.0 Java 17 EE'
 Java version info: '17.0.5+9-LTS-jvmci-22.3-b07'
 C compiler: cc (apple, arm64, 14.0.0)
 Garbage collector: Serial GC
 1 user-specific feature(s)
 - org.springframework.aot.nativex.feature.PreComputeFieldFeature
Field org.apache.commons.logging.LogAdapter#log4jSpiPresent set to true at build time
Field org.apache.commons.logging.LogAdapter#log4jSlf4jProviderPresent set to true at build time
Field org.apache.commons.logging.LogAdapter#slf4jSpiPresent set to true at build time
Field org.apache.commons.logging.LogAdapter#slf4jApiPresent set to true at build time
Field org.springframework.core.NativeDetector#imageCode set to true at build time
Field org.springframework.core.KotlinDetector#kotlinPresent set to false at build time
Field org.springframework.core.KotlinDetector#kotlinReflectPresent set to false at build time
Field org.springframework.format.support.DefaultFormattingConversionService#jsr354Present set to false at build time
Field org.springframework.cglib.core.AbstractClassGenerator#imageCode set to true at build time
[2/7] Performing analysis...  [**********]                                                              (24.8s @ 4.57GB)
  10,266 (89.50%) of 11,470 classes reachable
  16,675 (63.53%) of 26,248 fields reachable
  53,776 (60.71%) of 88,575 methods reachable
     469 classes,   140 fields, and 2,281 methods registered for reflection
      63 classes,    69 fields, and    55 methods registered for JNI access
       5 native libraries: -framework CoreServices, -framework Foundation, dl, pthread, z
[3/7] Building universe...                                                                               (5.0s @ 2.72GB)
[4/7] Parsing methods...      [**]                                                                       (4.4s @ 2.42GB)
[5/7] Inlining methods...     [***]                                                                      (1.3s @ 3.87GB)
[6/7] Compiling methods...    [********]                                                                (70.0s @ 1.04GB)
[7/7] Creating image...                                                                                  (4.7s @ 3.35GB)
  30.27MB (58.75%) for code area:    30,771 compilation units
  20.50MB (39.79%) for image heap:  305,579 objects and 93 resources
 769.52KB ( 1.46%) for other data
  51.52MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 packages in code area:                               Top 10 object types in image heap:
   2.02MB com.oracle.svm.core.code                             5.79MB byte[] for code metadata
   1.77MB sun.security.ssl                                     2.31MB byte[] for java.lang.String
   1.29MB java.util                                            2.09MB byte[] for general heap data
 929.52KB java.lang.invoke                                     2.07MB java.lang.String
 925.96KB com.sun.crypto.provider                              1.76MB java.lang.Class
 802.99KB java.lang                                          671.09KB byte[] for embedded resources
 633.35KB sun.nio.ch                                         567.26KB byte[] for reflection metadata
 625.89KB java.util.concurrent                               481.22KB com.oracle.svm.core.hub.DynamicHubCompanion
 601.86KB org.apache.tomcat.util.net                         450.06KB java.util.HashMap$Node
 594.48KB sun.security.x509                                  401.78KB java.util.concurrent.ConcurrentHashMap$Node
  20.02MB for 397 more packages                                3.40MB for 2297 more object types
------------------------------------------------------------------------------------------------------------------------
                        9.5s (7.9% of total time) in 50 GCs | Peak RSS: 3.75GB | CPU load: 4.39
------------------------------------------------------------------------------------------------------------------------
Produced artifacts:
 /Users/learn-springboot3/learn-springboot3/native-image/target/native-image (executable)
 /Users/learn-springboot3/learn-springboot3/native-image/target/native-image.build_artifacts.txt (txt)
========================================================================================================================
Finished generating 'native-image' in 2m 0s.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  02:01 min
[INFO] Finished at: 2023-01-05T20:43:39+08:00
[INFO] ------------------------------------------------------------------------

```

经过漫长的等待，我们终于build完成了。

因为我们的artifactId叫做native-image,所以最终在target目录下面生成了一个叫做native-image的可执行文件：

```
.
├── classes
│   ├── application.properties
│   └── com
│       └── flydean
│           └── nativeimage
│               └── NativeImageApplication.class
├── generated-sources
│   └── annotations
├── generated-test-sources
│   └── test-annotations
├── maven-archiver
│   └── pom.properties
├── maven-status
│   └── maven-compiler-plugin
│       ├── compile
│       │   └── default-compile
│       │       ├── createdFiles.lst
│       │       └── inputFiles.lst
│       └── testCompile
│           └── default-testCompile
│               ├── createdFiles.lst
│               └── inputFiles.lst
├── native-image
├── native-image-0.0.1-SNAPSHOT.jar
├── native-image-0.0.1-SNAPSHOT.jar.original
├── native-image.build_artifacts.txt
├── surefire-reports
│   ├── TEST-com.flydean.nativeimage.NativeImageApplicationTests.xml
│   └── com.flydean.nativeimage.NativeImageApplicationTests.txt
└── test-classes
    └── com
        └── flydean
            └── nativeimage
                └── NativeImageApplicationTests.class

20 directories, 14 files

```

如果你这时候运行target/native-image,那么很可能得到下面的异常：

```
[main] DEBUG org.springframework.context.aot.AotApplicationContextInitializer - Initializing ApplicationContext with AOT
[main] ERROR org.springframework.boot.SpringApplication - Application run failed
java.lang.IllegalArgumentException: Could not find class [com.flydean.nativeimage.NativeImageApplication__ApplicationContextInitializer]
        at org.springframework.util.ClassUtils.resolveClassName(ClassUtils.java:333)

```

这是因为我们缺少一些spring boot的AOT元文件信息，正确的做法是使用下面的命令：

```
mvn clean package -Pnative
```

它实际上执行的是下面的几个命令：

```
mvn spring-boot:process-aot
mvn spring-boot:process-test-aot
mvn spring-boot:build-image
```

最终我们得到编译好的native-image信息，运行得到下面的结果：


```
2023-01-05T17:07:11.692+08:00  INFO 69299 --- [           main] c.f.nativeimage.NativeImageApplication   : Starting AOT-processed NativeImageApplication using Java 17.0.5 with PID 69299 (/Users/wayne/data/git/ddean2009/learn-springboot3/learn-springboot3/native-image/target/native-image started by wayne in /Users/wayne/data/git/ddean2009/learn-springboot3/learn-springboot3/native-image)
2023-01-05T17:07:11.693+08:00  INFO 69299 --- [           main] c.f.nativeimage.NativeImageApplication   : No active profile set, falling back to 1 default profile: "default"
2023-01-05T17:07:11.709+08:00  INFO 69299 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2023-01-05T17:07:11.710+08:00  INFO 69299 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2023-01-05T17:07:11.710+08:00  INFO 69299 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.4]
2023-01-05T17:07:11.717+08:00  INFO 69299 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2023-01-05T17:07:11.717+08:00  INFO 69299 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 24 ms
2023-01-05T17:07:11.729+08:00  INFO 69299 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-01-05T17:07:11.729+08:00  INFO 69299 --- [           main] c.f.nativeimage.NativeImageApplication   : Started NativeImageApplication in 0.053 seconds (process running for 0.072)

```

# 总结

从运行情况来看，native-image的启动速度非常快，应该可以提升不少的性能。

感兴趣的小伙伴赶紧用起来吧。

本文的例子[https://github.com/ddean2009/learn-springboot3](https://github.com/ddean2009/learn-springboot3)





