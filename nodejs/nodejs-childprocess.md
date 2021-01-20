在nodejs中创建child process

# 简介

nodejs的main event loop是单线程的，nodejs本身也维护着Worker Pool用来处理一些耗时的操作，我们还可以通过使用nodejs提供的worker_threads来手动创建新的线程来执行自己的任务。

本文将会介绍一种新的执行nodejs任务的方式，child process。

# child process

lib/child_process.js提供了child_process模块，通过child_process我们可以创建子进程。

> 注意，worker_threads创建的是子线程，而child_process创建的是子进程。

在child_process模块中，可以同步创建进程也可以异步创建进程。同步创建方式只是在异步创建的方法后面加上Sync。

创建出来的进程用ChildProcess类来表示。

我们看下ChildProcess的定义：

~~~js
interface ChildProcess extends events.EventEmitter {
        stdin: Writable | null;
        stdout: Readable | null;
        stderr: Readable | null;
        readonly channel?: Pipe | null;
        readonly stdio: [
            Writable | null, // stdin
            Readable | null, // stdout
            Readable | null, // stderr
            Readable | Writable | null | undefined, // extra
            Readable | Writable | null | undefined // extra
        ];
        readonly killed: boolean;
        readonly pid: number;
        readonly connected: boolean;
        readonly exitCode: number | null;
        readonly signalCode: NodeJS.Signals | null;
        readonly spawnargs: string[];
        readonly spawnfile: string;
        kill(signal?: NodeJS.Signals | number): boolean;
        send(message: Serializable, callback?: (error: Error | null) => void): boolean;
        send(message: Serializable, sendHandle?: SendHandle, callback?: (error: Error | null) => void): boolean;
        send(message: Serializable, sendHandle?: SendHandle, options?: MessageOptions, callback?: (error: Error | null) => void): boolean;
        disconnect(): void;
        unref(): void;
        ref(): void;

        /**
         * events.EventEmitter
         * 1. close
         * 2. disconnect
         * 3. error
         * 4. exit
         * 5. message
         */
        ...
    }
~~~

可以看到ChildProcess也是一个EventEmitter，所以它可以发送和接受event。

ChildProcess可以接收到event有5种，分别是close，disconnect，error，exit和message。

当调用父进程中的 subprocess.disconnect() 或子进程中的 process.disconnect() 后会触发 disconnect 事件。

当出现无法创建进程，无法kill进程和向子进程发送消息失败的时候都会触发error事件。

当子进程结束后时会触发exit事件。

当子进程的 stdio 流被关闭时会触发 close 事件。 注意，close事件和exit事件是不同的，因为多个进程可能共享同一个stdio，所以发送exit事件并不一定会触发close事件。

看一个close和exit的例子：

~~~js
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程使用代码 ${code} 关闭所有 stdio`);
});

ls.on('exit', (code) => {
  console.log(`子进程使用代码 ${code} 退出`);
});
~~~

最后是message事件，当子进程使用process.send() 发送消息的时候就会被触发。

ChildProcess中有几个标准流属性，分别是stderr，stdout，stdin和stdio。

stderr，stdout，stdin很好理解，分别是标准错误，标准输出和标准输入。

我们看一个stdout的使用：

~~~js
const { spawn } = require('child_process');

const subprocess = spawn('ls');

subprocess.stdout.on('data', (data) => {
  console.log(`接收到数据块 ${data}`);
});
~~~

stdio实际上是stderr,stdout,stdin的集合：

~~~js
readonly stdio: [
            Writable | null, // stdin
            Readable | null, // stdout
            Readable | null, // stderr
            Readable | Writable | null | undefined, // extra
            Readable | Writable | null | undefined // extra
        ];
~~~

其中stdio[0]表示的是stdin，stdio[1]表示的是stdout，stdio[2]表示的是stderr。

如果在通过stdio创建子进程的时候，这三个标准流被设置为除pipe之外的其他值，那么stdin，stdout和stderr将为null。

我们看一个使用stdio的例子：

~~~js
const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');

const subprocess = child_process.spawn('ls', {
  stdio: [
    0, // 使用父进程的 stdin 用于子进程。
    'pipe', // 把子进程的 stdout 通过管道传到父进程 。
    fs.openSync('err.out', 'w') // 把子进程的 stderr 定向到一个文件。
  ]
});

assert.strictEqual(subprocess.stdio[0], null);
assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

assert(subprocess.stdout);
assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

assert.strictEqual(subprocess.stdio[2], null);
assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
~~~

通常情况下父进程中维护了一个对子进程的引用计数，只有在当子进程退出之后父进程才会退出。

这个引用就是ref，如果调用了unref方法，则允许父进程独立于子进程退出。

~~~js
const { spawn } = require('child_process');

const subprocess = spawn(process.argv[0], ['child_program.js'], {
  detached: true,
  stdio: 'ignore'
});

subprocess.unref();
~~~

最后，我们看一下如何通过ChildProcess来发送消息：

~~~js
subprocess.send(message[, sendHandle[, options]][, callback])
~~~

其中message就是要发送的消息，callback是发送消息之后的回调。

sendHandle比较特殊，它可以是一个TCP服务器或socket对象，通过将这些handle传递给子进程。子进程将会在message事件中，将该handle传递给Callback函数，从而可以在子进程中进行处理。

我们看一个传递TCP server的例子，首先看主进程：

~~~js
const subprocess = require('child_process').fork('subprocess.js');

// 打开 server 对象，并发送该句柄。
const server = require('net').createServer();
server.on('connection', (socket) => {
  socket.end('由父进程处理');
});
server.listen(1337, () => {
  subprocess.send('server', server);
});
~~~

再看子进程：

~~~js
process.on('message', (m, server) => {
  if (m === 'server') {
    server.on('connection', (socket) => {
      socket.end('由子进程处理');
    });
  }
});
~~~

可以看到子进程接收到了server handle，并且在子进程中监听connection事件。

下面我们看一个传递socket对象的例子：

~~~js
onst { fork } = require('child_process');
const normal = fork('subprocess.js', ['normal']);
const special = fork('subprocess.js', ['special']);

// 开启 server，并发送 socket 给子进程。
// 使用 `pauseOnConnect` 防止 socket 在被发送到子进程之前被读取。
const server = require('net').createServer({ pauseOnConnect: true });
server.on('connection', (socket) => {

  // 特殊优先级。
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket);
    return;
  }
  // 普通优先级。
  normal.send('socket', socket);
});
server.listen(1337);
~~~

subprocess.js的内容：

~~~js
process.on('message', (m, socket) => {
  if (m === 'socket') {
    if (socket) {
      // 检查客户端 socket 是否存在。
      // socket 在被发送与被子进程接收这段时间内可被关闭。
      socket.end(`请求使用 ${process.argv[2]} 优先级处理`);
    }
  }
});
~~~

主进程创建了两个subprocess，一个处理特殊的优先级， 一个处理普通的优先级。

# 异步创建进程

child_process模块有4种方式可以异步创建进程，分别是child_process.spawn()、child_process.fork()、child_process.exec() 和 child_process.execFile()。

先看一个各个方法的定义：

~~~js
child_process.spawn(command[, args][, options])

child_process.fork(modulePath[, args][, options])

child_process.exec(command[, options][, callback])

child_process.execFile(file[, args][, options][, callback])
~~~

其中child_process.spawn是基础，他会异步的生成一个新的进程，其他的fork，exec和execFile都是基于spawn来生成的。

fork会生成新的Node.js 进程。

exec和execFile是以新的进程执行新的命令，并且带有callback。他们的区别就在于在windows的环境中，如果要执行.bat或者.cmd文件，没有shell终端是执行不了的。这个时候就只能以exec来启动。execFile是无法执行的。

或者也可以使用spawn。

我们看一个在windows中使用spawn和exec的例子：

~~~js
// 仅在 Windows 上。
const { spawn } = require('child_process');
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data.toString());
});

bat.stderr.on('data', (data) => {
  console.error(data.toString());
});

bat.on('exit', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});
~~~

~~~js
const { exec, spawn } = require('child_process');
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

// 文件名中包含空格的脚本：
const bat = spawn('"my script.cmd"', ['a', 'b'], { shell: true });
// 或：
exec('"my script.cmd" a b', (err, stdout, stderr) => {
  // ...
});
~~~

# 同步创建进程

同步创建进程可以使用child_process.spawnSync()、child_process.execSync() 和 child_process.execFileSync() ，同步的方法会阻塞 Node.js 事件循环、暂停任何其他代码的执行，直到子进程退出。

通常对于一些脚本任务来说，使用同步创建进程会比较常用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！



