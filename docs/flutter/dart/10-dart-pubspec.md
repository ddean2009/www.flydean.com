---
slug: /10-dart-pubspec
---

# 10. 元世界pubspec.yaml文件详解



# 简介

pubspec.yaml是所有dart项目的灵魂，它包含了所有dart项目的依赖信息和其他元信息，所以pubspec.yaml就是dart项目的meta!

# pubspec.yaml支持的字段

根据dart的定义，pubspec.yaml中可以包含下面的字段:


字段名 | 是否必须字段 | 描述
---------|----------|---------
 name | 是 | package的名字
 version | 如果发布到pub.dev，则需要 | package的版本号
 description | 如果发布到pub.dev，则需要  | package的描述信息
 homepage | 否 | package的主页
 repository | 否 | package的源代码地址
 issue_tracker | 否 | package问题跟踪地址
 documentation | 否 | package的文档信息
 dependencies | 否 | package的依赖信息
 dev_dependencies | 否 | pacakge的dev依赖信息
 dependency_overrides | 否 | 想要覆盖的package
 environment | dart2需要 | 
 executables | 否 | package的可执行文件路径
 publish_to | 否 | package将如何发布

 > 注意，以上是dart中pubspec.yaml支持的字段，如果是在flutter环境中，则会有些额外支持的字段。

 # 一个例子

 我们看一个具体的例子：

```
 name: my_app
version: 11.15
description: >-
  this is a new app
homepage: http://www.flydean.com
documentation: http://www.flydean.com
environment:
  sdk: '>=2.10.0 <3.0.0'
dependencies:
  efts: ^2.0.4
  transmogrify: ^0.4.0
dev_dependencies:
  test: '>=1.15.0 <2.0.0'

```

# 字段详情

下面来看下各个字段的详情和限制情况：

1. Name

name表示的是包的名字，name必须是全小写，如果有多个词的话，可以用下划线来区分，如：my_app.

并且只能使用小写字母和数字的组合,同时不能以数字开头，并且不要使用dart中的保留字。

2. Version

Version表示的是版本号，版本号是由点分割的三个数字，如：11.15.0. 后面还可以跟上build版本号：+1, +2, +hotfix.oopsie, 或者预发布版本等：-dev.4, -alpha.12, -beta.7, -rc.5.

3. Description

package的描述信息最好使用英文来描写，长度是60 到180个字符，表示这个包的作用。

4. Dependencies

有两种依赖信息，一种是所有使用到这个packages的人都需要用到的依赖，这种依赖放在dependencies中。

还有一种是只用在当前pacakge开发中的包，这种依赖放在dev_dependencies中。

在某些情况下，我们有可能需要覆盖某些依赖包，则可以放在：dependency_overrides中。

5. Executables

有些pacakges提供的是工具供大家使用，这些工具有可能是命令行工具，所以需要在executables中指定可以执行的命令的路径。

比如下面的配置：

```
executables:
  slidy: main
  fvm:
```

那么在执行pub global activate之后，就可以在全局执行slidy来执行bin/main.dart, 和fvm来执行binfvm.dart.

6. environment

因为Dart是一门新的语言，所以目前来说其变动还是挺大的。所以有些应用可以依赖于不同的dart版本，这时候就需要用到environment：

```
environment:
  sdk: '>=2.10.0 <3.0.0'
```

上面的代码中，我们指定了dart sdk的版本范围。

从dart1.19之后，environment:中还支持指定flutter的版本：

```
environment:
  sdk: '>=1.19.0 <3.0.0'
  flutter: ^0.1.2
```

# 总结

以上就是dart的元世界pubspec.yaml详解。





