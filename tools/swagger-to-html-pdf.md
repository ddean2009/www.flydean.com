怎么将swagger API导出为HTML或者PDF

## 将swagger API导出为HTML或者PDF

现在有很多项目都是使用的swagger，将API直接写在swagger文档中，使用起来非常方便，并且支持在线调试。但是它不方便对外提供，这里我们找到了一种方法，可以方便的将swagger API导出为HTML或者PDF。

主要使用maven的两个插件：
1. swagger2markup-maven-plugin
2. asciidoctor-maven-plugin

下面我们会详细讲解怎么使用他们和可能会遇到的问题。

## 什么是Asciidoc

AsciiDoc是一种文本文档格式，用于编写笔记，文档，文章，书籍，电子书，幻灯片，网页，手册页和博客。 AsciiDoc文件可以转换为多种格式，包括HTML，PDF，EPUB，手册页。

AsciiDoc是高度可配置的：AsciiDoc源文件语法和后端输出标记（可以是几乎任何类型的SGML / XML标记）都可以由用户自定义和扩展。

AsciiDoc是免费软件，并根据GNU通用公共许可证版本2（GPLv2）的条款获得许可。

AsciiDoc，它的设计初衷就是为了解决写书规模的问题，并且是 O’Reilly 的在线出版平台 Atlas 的推荐语言。

## swagger2markup-maven-plugin

swagger2markup-maven-plugin这个插件可以将swagger的API转换为ASCIIDOC或者MARKDOWN和CONFLUENCE_MARKUP。这里我们选择转换为ASCIIDOC。

在build中加入如下代码：

~~~xml
<plugin>
                <groupId>io.github.swagger2markup</groupId>
                <artifactId>swagger2markup-maven-plugin</artifactId>
                <version>1.3.7</version>
                <configuration>
                    <!--此处端口一定要是当前项目启动所用的端口-->
                    <swaggerInput>http://localhost:7667/v2/api-docs</swaggerInput>
                    <outputDir>target/docs/asciidoc/generated</outputDir>
                    <config>
                        <!-- 除了ASCIIDOC之外，还有MARKDOWN和CONFLUENCE_MARKUP可选 -->
                        <swagger2markup.markupLanguage>ASCIIDOC</swagger2markup.markupLanguage>
                    </config>
                </configuration>
            </plugin>
~~~

版本我们用的是最新的1.3.7. 

target/docs/asciidoc/generated 是生成的ASCIIDOC的目标地址，我们会在后面将其转换为HTML或者PDF。

运行下面命令生成asciidoc：

~~~java
mvn swagger2markup:convertSwagger2markup 
~~~


## asciidoctor-maven-plugin

有了asciidoc，我们使用asciidoctor-maven-plugin将其转换为HTML和PDF。

Asciidoctor是一种快速，开放源代码的文本处理器和发布工具链，用于将AsciiDoc内容转换为HTML5，DocBook，PDF和其他格式。 Asciidoctor用Ruby编写，可在所有主要操作系统上运行。 

Asciidoctor提供了一个asciidoctor-maven-plugin，可以方便的在maven环境使用。其配置如下：

~~~xml
        <plugins>
            <plugin>
                <groupId>org.asciidoctor</groupId>
                <artifactId>asciidoctor-maven-plugin</artifactId>
                <version>2.0.0-RC.1</version>
                <dependencies>
                    <dependency>
                        <groupId>org.asciidoctor</groupId>
                        <artifactId>asciidoctorj-pdf</artifactId>
                        <version>1.5.0-alpha.18</version>
                    </dependency>
                    <!-- Comment this section to use the default jruby artifact provided by the plugin -->
                    <dependency>
                        <groupId>org.jruby</groupId>
                        <artifactId>jruby-complete</artifactId>
                        <version>9.2.7.0</version>
                    </dependency>
                    <!-- Comment this section to use the default AsciidoctorJ artifact provided by the plugin -->
                    <dependency>
                        <groupId>org.asciidoctor</groupId>
                        <artifactId>asciidoctorj</artifactId>
                        <version>2.0.0</version>
                    </dependency>
                </dependencies>
                <configuration>
                    <sourceDirectory>src/docs/asciidoc</sourceDirectory>
                    <!-- Attributes common to all output formats -->
                    <attributes>
                        <sourcedir>target/docs/asciidoc/generated</sourcedir>
                    </attributes>
                </configuration>
                <executions>
                    <execution>
                        <id>generate-pdf-doc</id>
                        <phase>generate-resources</phase>
                        <goals>
                            <goal>process-asciidoc</goal>
                        </goals>
                        <configuration>
                            <backend>pdf</backend>
                            <!-- Since 1.5.0-alpha.9 PDF back-end can use 'rouge' as well as 'coderay'
                            for source highlighting -->
                            <!-- Due to a known issue on windows, it is recommended to use 'coderay' until an new version of 'rouge' is released.
                            -->
                            <sourceHighlighter>coderay</sourceHighlighter>
                            <attributes>
                                <icons>font</icons>
                                <pagenums/>
                                <toc/>
                                <idprefix/>
                                <idseparator>-</idseparator>
                            </attributes>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
~~~

运行下面命令生成HTML和PDF：

~~~java
mvn generate-resources
~~~

## 使用命令行

上面讲到了，Asciidoctor是基于ruby的，有了asciidoc之后，我们也可以直接使用Asciidoctor的命令行来进行转换。步骤如下：

1. 安装rvm：rvm是一个ruby的版本管理工具，方便使用。当然你也可以使用系统原生的ruby。ruby的版本必须在2.3以上。
2. 安装asciidoctor-pdf： 
   
   `gem install asciidoctor-pdf --pre`

3. 转换pdf：
   `asciidoctor -r asciidoctor-pdf -b pdf basic-example.adoc`

## PDF的中文展示

Asciidoctor可以处理全范围的UTF-8字符的字符集。这意味着你可以写你的文档中的任何语言，使用UTF-8编码的文件，并期望Asciidoctor到文本正确转换。但是，你可能会注意到PDF中缺少某些语言的某些字符，例如中文。

如果你使用非拉丁语书写，则需要使用专门的主题来提供必要的字体。例如，以从写在CJK语言文档的PDF如中国，你需要使用一个CJK主题。你可以通过安装asciidoctor-pdf-cjk-kai_gen_gothic gem获得这样的主题。

采用专用的主题，是因为PDF需要你自己提供字体来为所有字符提供字形。没有一种字体可以支持世界上所有的语言（尽管像Noto Serif之类的语言肯定会比较接近）。

因此，我们采取的策略是针对每个语言家族（例如CJK）创建单独的专用主题。当然，你可以自由地遵循这种模式，并使用选择的字体来创建自己的主题。

怎么创建主题这里就不详细讲解了，有兴趣的小伙伴可以自行查阅有关资料。

**如何安装：**

`gem install asciidoctor-pdf-cjk-kai_gen_gothic`

**下载字体：**
`asciidoctor-pdf-cjk-kai_gen_gothic-install`

这个主题支持以下几种字体：

* KaiGenGothicCN
* KaiGenGothicJP
* KaiGenGothicKR
* KaiGenGothicTW

使用下面的命令来转换PDF：

`asciidoctor-pdf -r asciidoctor-pdf-cjk-kai_gen_gothic -a pdf-style=THEME doc.asc`

这里我遇到了一个问题，如果字体选择KaiGenGothicCN， 那么会在运行时候报错：

~~~java
undefined method `strip_extended' for nil:NilClass
  Use --trace for backtrace
~~~

详细查看--trace，会发现报错的是ttfunk/table/name.rb：

~~~java
@postscript_name = @strings[6].first.strip_extended
~~~

从字体中获取到的@strings[6]是空。 那么怎么办呢？

很简单，使用KaiGenGothicTW字体即可。

## PDF中文主题在maven中的使用

那么有了命令行，我们怎么在maven中使用呢？

请使用如下的XML配置：

~~~xml
<execution>
                        <id>output-pdf</id>
                        <phase>generate-resources</phase>
                        <goals>
                            <goal>process-asciidoc</goal>
                        </goals>
                        <configuration>
                            <backend>pdf</backend>
                            <outputDirectory>target/docs/asciidoc/pdf</outputDirectory>
                            <attributes>
                                <pdf-stylesdir>/Library/Ruby/Gems/2.3.0/gems/asciidoctor-pdf-cjk-kai_gen_gothic-0.1.1/data/themes</pdf-stylesdir>
                                <pdf-style>KaiGenGothicTW</pdf-style>
                                <pdf-fontsdir>/Library/Ruby/Gems/2.3.0/gems/asciidoctor-pdf-cjk-kai_gen_gothic-0.1.1/data/fonts</pdf-fontsdir>
                                <icons>font</icons>
                                <pagenums/>
                                <toc/>
                                <idprefix/>
                                <idseparator>-</idseparator>
                            </attributes>
                        </configuration>
                    </execution>
~~~

请关注如下几个字段：

pdf-stylesdir：你安装的中文主题的目录
pdf-style：中文主题的名称
pdf-fontsdir： 中文主题字体的名称。

好了，本文讲到这里，有疑问的小伙伴可以发邮件或者留言提问。谢谢。



