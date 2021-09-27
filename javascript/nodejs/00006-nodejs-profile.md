使用V8和node轻松profile分析nodejs应用程序

# 简介

我们使用nodejs写好了程序之后，要是想对该程序进行性能分析的话，就需要用到profile工具了。

虽然有很多很方便和强大的第三方profile工具，但是我们这里主要讲解V8和node自带的profile，因为他们已经足够简单和强大了。使用他们基本上可以满足我们的日常分析需要。

下面就一起来看看吧。

# 使用V8的内置profiler工具

nodejs是运行在V8引擎上的，而V8引擎本身就提供了内置的profile工具，要想直接使用V8引擎，我需要下载V8源代码，然后进行build。一般来说我们有两种build V8的方法。

## 使用gm来build V8

gm是一个非常方便的all-in-one的脚本，可以用来生成build文件，触发build过程和运行测试用例。

一般来说，gm脚本的位置在：/path/to/v8/tools/dev/gm.py

我们可以为其创建一个alias，方便后面的使用：

~~~js
alias gm=/path/to/v8/tools/dev/gm.py
~~~

build V8:

~~~js
gm x64.release
~~~

build之后进行用例验证：

~~~js
gm x64.release.check
~~~

是不是很简单？

## 手动build V8

手动build V8就比较麻烦了，我们也可以分为三步，1.生成build文件，2.触发build，3.运行测试用例

我们可以使用gn来为out/foo生成build文件：

~~~js
gn args out/foo
~~~

上面的命令将会开启一个编辑窗口，用来输入gn的参数。

我们可以添加list来查看所有的参数描述：

~~~js
gn args out/foo --list
~~~

当然我们也可以直接指定参数，来创建build文件：

~~~js
gn gen out/foo --args='is_debug=false target_cpu="x64" v8_target_cpu="arm64" use_goma=true'
~~~

除了gn之外，我们还可以使用v8自带的v8gen来创建build文件：

~~~js
alias v8gen=/path/to/v8/tools/dev/v8gen.py

v8gen -b 'V8 Linux64 - debug builder' -m client.v8 foo
~~~

创建好build文件之后，我们就可以进行编译了。

build所有的V8：

~~~js
ninja -C out/x64.release
~~~

只build d8:

~~~js
ninja -C out/x64.release d8
~~~

最后我们运行测试，来验证是否构建成功：

~~~js
tools/run-tests.py --outdir out/foo
//或者
tools/run-tests.py --gn
~~~

## 生成profile文件

build好V8之后，我们就可以使用其中的命令来生成profile文件了。

找到d8文件：

~~~js
d8 --prof app.js
~~~

通过添加 --prof 参数，我们可以生成一个v8.log文件，这个文件中包含了profiling数据。

注意这时候的v8.log文件虽然不是二进制格式的，但是阅读起来还是有难度的，因为它只是简单的做了log操作，并没有进行有效的统计分析。

我们看下生成的文件：

~~~js
...
profiler,begin,1000
tick,0x7fff688bbe36,839,0,0x0,6
tick,0x7fff688bc2d2,2081,0,0x0,6
tick,0x100373430,3263,0,0x0,6
code-creation,Builtin,3,3746,0x1008aa020,1634,RecordWrite
code-creation,Builtin,3,3766,0x1008aa6a0,457,EphemeronKeyBarrier
code-creation,Builtin,3,3773,0x1008aa880,44,AdaptorWithBuiltinExitFrame
code-creation,Builtin,3,3781,0x1008aa8c0,294,ArgumentsAdaptorTrampoline
code-creation,Builtin,3,3788,0x1008aaa00,203,CallFunction_ReceiverIsNullOrUndefined
code-creation,Builtin,3,3796,0x1008aaae0,260,CallFunction_ReceiverIsNotNullOrUndefined
code-creation,Builtin,3,3804,0x1008aac00,285,CallFunction_ReceiverIsAny
code-creation,Builtin,3,3811,0x1008aad20,130,CallBoundFunction
...
~~~

可以看到日志文件中只记录了事件的发生，但是并没有统计信息。

## 分析生成的文件

如果想要生成我们看得懂的统计信息，则可以使用：

~~~js
//windows
tools\windows-tick-processor.bat v8.log

//linux
tools/linux-tick-processor v8.log

//macOS
tools/mac-tick-processor v8.log
~~~

来生成可以理解的日志文件。

生成的文件大概是下面样子的：

~~~js
Statistical profiling result from benchmarks\v8.log, (4192 ticks, 0 unaccounted, 0 excluded).

 [Shared libraries]:
   ticks  total  nonlib   name
      9    0.2%    0.0%  C:\WINDOWS\system32\ntdll.dll
      2    0.0%    0.0%  C:\WINDOWS\system32\kernel32.dll

 [JavaScript]:
   ticks  total  nonlib   name
    741   17.7%   17.7%  LazyCompile: am3 crypto.js:108
    113    2.7%    2.7%  LazyCompile: Scheduler.schedule richards.js:188
    103    2.5%    2.5%  LazyCompile: rewrite_nboyer earley-boyer.js:3604
    103    2.5%    2.5%  LazyCompile: TaskControlBlock.run richards.js:324
     96    2.3%    2.3%  Builtin: JSConstructCall
    ...
~~~

用惯的IDE的同学可能在想，能不能有个web页面来统一展示这个结果呢？

有的，V8提供了profview工具，让我们可以从web UI来分析生成的结果。

> profview是一个html工具，我们可以从 https://chromium.googlesource.com/v8/v8.git/+/master/tools/profview/ 下载。

如果要使用profview，我们还需要对第一步生成的v8.log文件进行预处理：

~~~js
linux-tick-processor --preprocess > v8.json
~~~

然后在profview页面上传v8.json进行分析即可。

## 生成时间线图

--prof 还可以接其他参数，比如 --log-timer-events， 通过使用这个参数可以用来统计V8引擎中花费的时间。

~~~js
d8 --prof --log-timer-events app.js

tools/plot-timer-events v8.log
~~~

第一个命令生成v8.log文件，第二个命令会生成一个timer-events.png图形文件，更加直观的展示数据。

因为生成日志实际上对程序的性能是有一定的影响的，我们还可以为plot-timer-events添加失真因子，来纠正这个问题。如果我们没有指定纠正因子，脚本会自动进行查找。当然，我们也可以向下面这样手动指定：

~~~js
tools/plot-timer-events --distortion=4500 v8.log
~~~

# 使用nodejs的profile工具

在nodejs 4.4.0之前，只能下载V8的源代码进行编译，才能进行profile。 而在nodejs 4.4.0之后，node命令已经集成了V8的功能。

我们可以使用 node  --v8-options 来查看 node中可用的V8参数：

~~~js
node  --v8-options
SSE3=1 SSSE3=1 SSE4_1=1 SAHF=1 AVX=1 FMA3=1 BMI1=1 BMI2=1 LZCNT=1 POPCNT=1 ATOM=0
Synopsis:
  shell [options] [--shell] [<file>...]
  d8 [options] [-e <string>] [--shell] [[--module] <file>...]

  -e        execute a string in V8
  --shell   run an interactive JavaScript shell
  --module  execute a file as a JavaScript module

Note: the --module option is implicitly enabled for *.mjs files.

The following syntax for options is accepted (both '-' and '--' are ok):
  --flag        (bool flags only)
  --no-flag     (bool flags only)
  --flag=value  (non-bool flags only, no spaces around '=')
  --flag value  (non-bool flags only)
  --            (captures all remaining args in JavaScript)

Options:
  --use-strict (enforce strict mode)
        type: bool  default: false
  --es-staging (enable test-worthy harmony features (for internal use only))
        type: bool  default: false
...
~~~

参数很多，同样的我们可以使用 --prof 参数：

~~~js
node --prof app.js
~~~

会在本地目录生成一个类似 isolate-0x102884000-14025-v8.log 的文件。

文件的内容和V8生成的一致，这里就不列出来了。

要想分析这个文件，可以使用：

~~~js
node --prof-process isolate-0x102884000-14025-v8.log > processed.txt
~~~

看下生成的分析结果：

~~~js
Statistical profiling result from isolate-0x102884000-14025-v8.log, (296 ticks, 4 unaccounted, 0 excluded).
  
 [Shared libraries]:
   ticks  total  nonlib   name
      6    2.0%          /usr/lib/system/libsystem_pthread.dylib
      6    2.0%          /usr/lib/system/libsystem_kernel.dylib
      2    0.7%          /usr/lib/system/libsystem_malloc.dylib
      1    0.3%          /usr/lib/system/libmacho.dylib
      1    0.3%          /usr/lib/system/libcorecrypto.dylib

 [JavaScript]:
   ticks  total  nonlib   name

...

 [Summary]:
   ticks  total  nonlib   name
      0    0.0%    0.0%  JavaScript
    276   93.2%   98.6%  C++
     24    8.1%    8.6%  GC
     16    5.4%          Shared libraries
      4    1.4%          Unaccounted

 [C++ entry points]:
   ticks    cpp   total   name
    142   63.1%   48.0%  T __ZN2v88internal21Builtin_HandleApiCallEiPmPNS0_7IsolateE
     82   36.4%   27.7%  T __ZN2v88internal40Builtin_CallSitePrototypeGetPromiseIndexEiPmPNS0_7IsolateE
      1    0.4%    0.3%  T __ZN2v88internal36Builtin_CallSitePrototypeGetFileNameEiPmPNS0_7IsolateE
...


~~~

和V8的也很类似。

从Summary和各个entry points中，我们可以进一步分析程序中到底哪一块占用了较多的CPU时间。

上面的百分百的意思是，在采样的这些数据中，有93.2%的都在运行C++代码。那么我们接下来就应该去看一下，到底是哪些C++代码占用了最多的时间，并找出相应的解决办法。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







