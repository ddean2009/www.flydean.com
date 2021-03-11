nodejs中的文件系统

# 简介

nodejs使用了异步IO来提升服务端的处理效率。而IO中一个非常重要的方面就是文件IO。今天我们会详细介绍一下nodejs中的文件系统和IO操作。

# nodejs中的文件系统模块

nodejs中有一个非常重要的模块叫做fs。这个模块提供了许多非常实用的函数来访问文件系统并与文件系统进行交互。

简单统计一下，fs提供了下面这么多种使用的文件操作方法：

* fs.access(): 检查文件是否存在，以及 Node.js 是否有权限访问。
* fs.appendFile(): 追加数据到文件。如果文件不存在，则创建文件。
* fs.chmod(): 更改文件（通过传入的文件名指定）的权限。相关方法：fs.lchmod()、fs.fchmod()。
* fs.chown(): 更改文件（通过传入的文件名指定）的所有者和群组。相关方法：fs.fchown()、fs.lchown()。
* fs.close(): 关闭文件描述符。
* fs.copyFile(): 拷贝文件。
* fs.createReadStream(): 创建可读的文件流。
* fs.createWriteStream(): 创建可写的文件流。
* fs.link(): 新建指向文件的硬链接。
* fs.mkdir(): 新建文件夹。
* fs.mkdtemp(): 创建临时目录。
* fs.open(): 设置文件模式。
* fs.readdir(): 读取目录的内容。
* fs.readFile(): 读取文件的内容。相关方法：fs.read()。
* fs.readlink(): 读取符号链接的值。
* fs.realpath(): 将相对的文件路径指针（.、..）解析为完整的路径。
* fs.rename(): 重命名文件或文件夹。
* fs.rmdir(): 删除文件夹。
* fs.stat(): 返回文件（通过传入的文件名指定）的状态。相关方法：fs.fstat()、fs.lstat()。
* fs.symlink(): 新建文件的符号链接。
* fs.truncate(): 将传递的文件名标识的文件截断为指定的长度。相关方法：fs.ftruncate()。
* fs.unlink(): 删除文件或符号链接。
* fs.unwatchFile(): 停止监视文件上的更改。
* fs.utimes(): 更改文件（通过传入的文件名指定）的时间戳。相关方法：fs.futimes()。
* fs.watchFile(): 开始监视文件上的更改。相关方法：fs.watch()。
* fs.writeFile(): 将数据写入文件。相关方法：fs.write()。

> 注意，上面fs提供的方法都是异步的，所谓异步的意思是，这些方法都提供了回调函数，方便异步触发相应的处理逻辑。

我们举一个简单的读取文件的例子：

~~~js
const fs = require('fs')

fs.readFile('/tmp/flydean.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})
~~~

上面的例子中，我们从/tmp文件中读取了一个flydean.txt文件。并在callback函数中分别对异常和正常的数据进行了处理。

fs在提供异步方法的同时，还提供了同步的方法调用，这个同步的方法就是在异步方法后面加上Sync：

~~~js
const fs = require('fs')

try {
  const data = fs.readFileSync('/tmp/flydean.txt', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}
~~~

看下将上面的方法改写成同步方法之后的样子。

两者的区别就是，同步方法会阻塞，一直等到file读取完成。

# Promise版本的fs

异步操作怎么能少得了Promsie, 因为fs中的操作都是异步的，如果大家不想通过callback来使用fs的话，fs也提供了Promise版本。

还是刚刚的readfile的例子，我们看看如果使用Promise该怎么处理：

~~~js
const fs = require('fs/promises');

(async function(path) {
  try {
    await fs.readFile(path, 'utf8' ）;
    console.log(`读取文件成功 ${path}`);
  } catch (error) {
    console.error('出错：', error.message);
  }
})('/tmp/flydean.txt');
~~~

fs的promise版本在fs/promises下面，上面的例子中我们使用了async和await，以同步的方式编写异步程序，非常的方便。

# 文件描述符

文件描述符就是指在nodejs中，当我们使用fs.open方法获得的这个返回值。

我们可以通过这个文件描述符来进步和文件进行交互操作。

~~~js
const fs = require('fs')

fs.open('/tmp/flydean.txt', 'r', (err, fd) => {
  //fd 是文件描述符。
})
~~~

上面的open方法的第二个参数表示以只读的方式打开文件。

我们看下常用的文件系统标志：

* 'r': 打开文件用于读取。 如果文件不存在，则会发生异常。
  
* 'r+': 打开文件用于读取和写入。 如果文件不存在，则会发生异常。
  
* 'w': 打开文件用于写入。 如果文件不存在则创建文件，如果文件存在则截断文件。
  
* 'w+': 打开文件用于读取和写入。 如果文件不存在则创建文件，如果文件存在则截断文件。
  
* 'a': 打开文件用于追加。 如果文件不存在，则创建该文件。
  
* 'a+': 打开文件用于读取和追加。 如果文件不存在，则创建该文件。

当然，上面的例子也可以用openSync来改写：

~~~js
const fs = require('fs')

try {
  const fd = fs.openSync('/tmp/flydean.txt', 'r')
} catch (err) {
  console.error(err)
}
~~~

# fs.stat文件状态信息

nodejs提供了一个fs.Stats类，用来描述文件的状态信息。

Stats提供了一些非常有用的方法来判断文件的状态：

比如：
stats.isDirectory()，stats.isFile()，stats.isSocket()，stats.isSymbolicLink()，stats.ctime等。

stats还提供了一些关于文件时间相关的选项：

* atime "访问时间" - 上次访问文件数据的时间。
* mtime "修改时间" - 上次修改文件数据的时间。
* ctime "更改时间" - 上次更改文件状态（修改索引节点数据）的时间。
* birthtime "创建时间" - 创建文件的时间。

我们看一下怎么获取到fs.stat:

~~~js
const fs = require('fs')
fs.stat('/tmp/flydean.txt', (err, stats) => {
  if (err) {
    console.error(err)
    return
  }

  stats.isFile() //true
  stats.isDirectory() //false
  stats.isSymbolicLink() //false
  stats.size //文件大小
})
~~~

fs.Stats将会作为fs.stat的回调函数参数传入。通过fs.Stats，我们再进行一系列的操作。

# fs的文件读写

上面我们介绍了使用fs进行文件读取操作，下面我们来介绍怎么使用fs来进行文件写入操作：

~~~js
const fs = require('fs')

const content = 'www.flydean.com'

fs.writeFile('/tmp/flydean.txt', content, err => {
  if (err) {
    console.error(err)
    return
  }
  //文件写入成功。
})
~~~

上面是一个callback版本的，我们再看一个同步版本的：

~~~js
const fs = require('fs')

const content = 'www.flydean.com'

try {
  const data = fs.writeFileSync('/tmp/flydean.txt', content)
  //文件写入成功。
} catch (err) {
  console.error(err)
}
~~~

writeFile还支持一个额外的options参数，在options参数中，我们可以指定文件写入的flag标记位，比如：r+，w+，a，a+等等。

~~~js
fs.writeFile('/tmp/flydean.txt', content, { flag: 'a+' }, err => {})
~~~

当然，除了使用a+表示append到文件末尾之外，fs还提供了一个appendFile方法来向文件末尾输出：

~~~js
const fs = require('fs')

const content = 'www.flydean.com'

fs.appendFile('/tmp/flydean.txt', content, err => {
  if (err) {
    console.error(err)
    return
  }
  //文件append成功。
})
~~~

# fs的文件夹操作

有文件就有文件夹，fs提供了一系列的文件夹操作，比如：

mkdir，readdir，rename  rmdir操作。

readdir相对而言负责点，我们举例说明：

~~~js
const fs = require('fs')
const folderPath = '/tmp'

fs.readdir(folderPath, function(err,files){
    if(err){
        console.log(err);
    }
    files.map(file => console.log(file));
})

fs.readdirSync(folderPath).map(fileName => {
    console.log(fileName);
})
~~~

上面的例子中，我们分别使用了readdir和readdirSync两种方式来读取目录中的文件。

大家可以看下其中的区别。

# path操作

最后，我们介绍一个和file特别相关的path操作，它提供了一些实用工具，用于处理文件和目录的路径。 

path代表的是路径。我们通过下面的方式来使用path：

~~~js
const path = require('path')
~~~

为什么需要path呢？我们知道这个世界上大约有两种风格的操作系统，windows和POSIX。

在这两种操作系统中，路径的表达方式是不一样的。所以，我们需要一个通用的path模块来为我们解决这个差异。

我们可以通过一个例子来观察这个差异：

在windows上：

~~~js
path.basename('C:\\temp\\myfile.html');
// 返回: 'myfile.html'
~~~

在POSIX上：

~~~js
path.basename('C:\\temp\\myfile.html');
// 返回: 'C:\\temp\\myfile.html'
~~~

我们先来看一下path.basename这个方法，是用来返回path 的最后一部分。

上面的例子中，我们向windows传入了一个windows风格的path，所以可以正常解析，得到正常的结果。

而在POSIX环境中，我们传入了一个windows风格的路径，无法正常解析，直接返回整个的结果。

path还有很多非常有用的方法，比如：

~~~js
const notes = '/tmp/notes.txt'

path.dirname(notes) // /tmp
path.basename(notes) // notes.txt
path.extname(notes) // .txt

path.join('/', 'tmp', 'notes.txt') //'/tmp/notes.txt'

path.resolve('notes.txt') //'/Users/flydean/notes.txt' 从当前目录开始解析，获得相对路径的绝对路径

path.normalize('/tmp/flydean..//test.txt') ///tmp/test.txt  尝试计算实际的路径
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





