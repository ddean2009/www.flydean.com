---
slug: /02-new-gitbook-to-pdf
---

# 4. 把gitbook转换成pdf

最近想把自己写的一个gitbook转成pdf分享出去，突然发现最新的gitbook版本已经不支持导出PDF了。于是在网上找了好久终于被我发现了三个将gitbook转换成pdf的方式，现分享给大家。我使用的是mac系统，如果是其他系统大家可以查找相应的方案。

##  gitbook自带的npm模块gitbook

npm gitbook的最新版本是3.2.3，最新更新时间是1年前，官方估计已经放弃这个模块了。不过还好，这个模块还能够使用。 具体步骤如下：

1. 安装npm

    通常来说，安装好nodejs后会自动安装相应的npm。

   ~~~shell
   brew install nodejs
   ~~~

   

2. 安装gitbook

   ~~~shell
   npm install gitbook -g
   npm install gitbook-cli -g
   ~~~

3. 安装calibre

   直接到官网下载： https://download.calibre-ebook.com/

   安装好calibre之后，需要将 /Applications/calibre.app/Contents/MacOS/ebook-convert  链接到/usr/local/bin/ebook-convert

   ~~~shell
   ln -s /Applications/calibre.app/Contents/MacOS/ebook-convert  /usr/local/bin/ebook-convert
   ~~~

4.  生成PDF

    在所有的一切都准备好之后就可以运行下面的命令生成pdf了。

    ~~~shell
    gitbook pdf
    ~~~

> 注意，calibre要下载3.*版本，否则在gitbook pdf 的过程中会卡住。别问我是怎么知道的，我被这个问题坑了好久。

## 使用vscode的插件Markdown PDF

vscode是一个非常强大的文本编辑工具，我们可以可以使用它的Markdown PDF插件来将markdown来转换成pdf。

它有一个markdown-it-include的功能，可以将一个markdown文件中引入的其他markdown文件包含进来。

考虑下面的文件结构：

```
├── [plugins]
│  └── README.md
├── CHANGELOG.md
└── README.md
```

如果我们新建一个md文件，其内容如下：

~~~
README Content

:[Plugins](./plugins/README.md)

:[Changelog](CHANGELOG.md)
~~~

导出为PDF之后，其内容如下：

~~~
Content of README.md

Content of plugins/README.md

Content of CHANGELOG.md
~~~

这样就可以通过一个文件来包含多个md文件。当然这样也有一个缺点就是引入的文件缺少层级概念也无法生成标签。

## 使用CommandBox GitBook Exporter

第三种方式就是使用forgebox的GitBook Exporter工具了。

方法如下：

1. 安装CommandBox

   ~~~shell
   brew install commandbox
   ~~~

2. 在box中安装gitbook-exporter

    ~~~shell
    box install gitbook-exporter
    ~~~

3. 在gitbook控制页面台中，导出你要生成的gitbook的信息：
   Advanced->Danger Zone->Export

4. 导出PDF和html
   ~~~
   CommandBox> gitbook export sourcePath=/path/to/ExportFolder
   ~~~

使用上面的命令可以同时导出pdf和html，其优点就是比使用官方gitbook命令导出的文件要小很多，缺点就是pdf中文会出现乱码（暂时没有找到解决方法）

好了，三种方法都教给大家了，感觉去试一下吧。
