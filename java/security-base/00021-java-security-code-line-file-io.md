java安全编码指南之:文件IO操作

# 简介

对于文件的IO操作应该是我们经常会使用到的，因为文件的复杂性，我们在使用File操作的时候也有很多需要注意的地方，下面我一起来看看吧。

# 创建文件的时候指定合适的权限

不管是在windows还是linux，文件都有权限控制的概念，我们可以设置文件的owner，还有文件的permission，如果文件权限没有控制好的话，恶意用户就有可能对我们的文件进行恶意操作。

所以我们在文件创建的时候就需要考虑到权限的问题。

很遗憾的是，java并不是以文件操作见长的，所以在JDK1.6之前，java的IO操作是非常弱的，基本的文件操作类，比如FileOutputStream和FileWriter并没有权限的选项。

~~~java
Writer out = new FileWriter("file");
~~~

那么怎么处理呢？

在JDK1.6之前，我们需要借助于一些本地方法来实现权限的修改功能。

在JDK1.6之后，java引入了NIO，可以通过NIO的一些特性来控制文件的权限功能。

我们看一下Files工具类的createFile方法：

~~~java
    public static Path createFile(Path path, FileAttribute<?>... attrs)
        throws IOException
    {
        newByteChannel(path, DEFAULT_CREATE_OPTIONS, attrs).close();
        return path;
    }
~~~

其中FileAttribute就是文件的属性，我们看一下怎么指定文件的权限：

~~~java
    public void createFileWithPermission() throws IOException {
        Set<PosixFilePermission> perms =
                PosixFilePermissions.fromString("rw-------");
        FileAttribute<Set<PosixFilePermission>> attr =
                PosixFilePermissions.asFileAttribute(perms);
        Path file = new File("/tmp/www.flydean.com").toPath();
        Files.createFile(file,attr);
    }
~~~

# 注意检查文件操作的返回值

java中很多文件操作是有返回值的，比如file.delete()，我们需要根据返回值来判断文件操作是否完成，所以不要忽略了返回值。

# 删除使用过后的临时文件

如果我们使用到不需要永久存储的文件时，就可以很方便的使用File的createTempFile来创建临时文件。临时文件的名字是随机生成的，我们希望在临时文件使用完毕之后将其删除。

怎么删除呢？File提供了一个deleteOnExit方法，这个方法会在JVM退出的时候将文件删除。

> 注意，这里的JVM一定要是正常退出的，如果是非正常退出，文件不会被删除。

我们看下面的例子：

~~~java
    public void wrongDelete() throws IOException {
        File f = File.createTempFile("tmpfile",".tmp");
        FileOutputStream fop = null;
        try {
            fop = new FileOutputStream(f);
            String str = "Data";
            fop.write(str.getBytes());
            fop.flush();
        } finally {
            // 因为Stream没有被关闭，所以文件在windows平台上面不会被删除
            f.deleteOnExit(); // 在JVM退出的时候删除临时文件

            if (fop != null) {
                try {
                    fop.close();
                } catch (IOException x) {
                    // Handle error
                }
            }
        }
    }
~~~

上面的例子中，我们创建了一个临时文件，并且在finally中调用了deleteOnExit方法，但是因为在调用该方法的时候，Stream并没有关闭，所以在windows平台上会出现文件没有被删除的情况。

怎么解决呢？

NIO提供了一个DELETE_ON_CLOSE选项，可以保证文件在关闭之后就被删除：

~~~java
    public void correctDelete() throws IOException {
        Path tempFile = null;
            tempFile = Files.createTempFile("tmpfile", ".tmp");
            try (BufferedWriter writer =
                         Files.newBufferedWriter(tempFile, Charset.forName("UTF8"),
                                 StandardOpenOption.DELETE_ON_CLOSE)) {
                // Write to file
            }
        }
~~~

上面的例子中，我们在writer的创建过程中加入了StandardOpenOption.DELETE_ON_CLOSE，那么文件将会在writer关闭之后被删除。

# 释放不再被使用的资源

如果资源不再被使用了，我们需要记得关闭他们，否则就会造成资源的泄露。

但是很多时候我们可能会忘记关闭，那么该怎么办呢？JDK7中引入了try-with-resources机制，只要把实现了Closeable接口的资源放在try语句中就会自动被关闭，很方便。

# 注意Buffer的安全性

NIO中提供了很多非常有用的Buffer类，比如IntBuffer, CharBuffer 和 ByteBuffer等，这些Buffer实际上是对底层的数组的封装，虽然创建了新的Buffer对象，但是这个Buffer是和底层的数组相关联的，所以不要轻易的将Buffer暴露出去，否则可能会修改底层的数组。

~~~java
    public CharBuffer getBuffer(){
         char[] dataArray = new char[10];
         return CharBuffer.wrap(dataArray);
    }
~~~

上面的例子暴露了CharBuffer，实际上也暴露了底层的char数组。

有两种方式对其进行改进：

~~~java
    public CharBuffer getBuffer1(){
        char[] dataArray = new char[10];
        return CharBuffer.wrap(dataArray).asReadOnlyBuffer();
    }
~~~

第一种方式就是将CharBuffer转换成为只读的。

第二种方式就是创建一个新的Buffer，切断Buffer和数组的联系：

~~~java
    public CharBuffer getBuffer2(){
        char[] dataArray = new char[10];
        CharBuffer cb = CharBuffer.allocate(dataArray.length);
        cb.put(dataArray);
        return cb;
    }
~~~

# 注意 Process 的标准输入输出

java中可以通过Runtime.exec()来执行native的命令，而Runtime.exec()是有返回值的，它的返回值是一个Process对象，用来控制和获取native程序的执行信息。

默认情况下，创建出来的Process是没有自己的I/O stream的，这就意味着Process使用的是父process的I/O(stdin, stdout, stderr),Process提供了下面的三种方法来获取I/O:

~~~java
getOutputStream()
getInputStream()
getErrorStream()
~~~

如果是使用parent process的IO，那么在有些系统上面，这些buffer空间比较小，如果出现大量输入输出操作的话，就有可能被阻塞，甚至是死锁。

怎么办呢？我们要做的就是将Process产生的IO进行处理，以防止Buffer的阻塞。

~~~java
public class StreamProcesser implements Runnable{
    private final InputStream is;
    private final PrintStream os;

    StreamProcesser(InputStream is, PrintStream os){
        this.is=is;
        this.os=os;
    }

    @Override
    public void run() {
        try {
            int c;
            while ((c = is.read()) != -1)
                os.print((char) c);
        } catch (IOException x) {
            // Handle error
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        Runtime rt = Runtime.getRuntime();
        Process proc = rt.exec("vscode");

        Thread errorGobbler
                = new Thread(new StreamProcesser(proc.getErrorStream(), System.err));

        Thread outputGobbler
                = new Thread(new StreamProcesser(proc.getInputStream(), System.out));

        errorGobbler.start();
        outputGobbler.start();

        int exitVal = proc.waitFor();
        errorGobbler.join();
        outputGobbler.join();
    }
}
~~~

上面的例子中，我们创建了一个StreamProcesser来处理Process的Error和Input。

# InputStream.read() 和 Reader.read()

InputStream和Reader都有一个read()方法，这两个方法的不同之处就是InputStream read的是Byte，而Reader read的是char。

虽然Byte的范围是-128到127，但是InputStream.read()会将读取到的Byte转换成0-255(0x00-0xff)范围的int。

Char的范围是0x0000-0xffff，Reader.read()将会返回同样范围的int值：0x0000-0xffff。

如果返回值是-1，表示的是Stream结束了。这里-1的int表示是：0xffffffff。

我们在使用的过程中，需要对读取的返回值进行判断，以用来区分Stream的边界。

我们考虑这样的一个问题：

~~~java
FileInputStream in;
byte data;
while ((data = (byte) in.read()) != -1) {
}
~~~

上面我们将InputStream的read结果先进行byte的转换，然后再判断是否等于-1。会有什么问题呢？

如果Byte本身的值是0xff,本身是一个-1，但是InputStream在读取之后，将其转换成为0-255范围的int，那么转换之后的int值是：0x000000FF, 再次进行byte转换，将会截取最后的Oxff, Oxff == -1,最终导致错误的判断Stream结束。

所以我们需要先做返回值的判断，然后再进行转换：

~~~java
FileInputStream in;
int inbuff;
byte data;
while ((inbuff = in.read()) != -1) {
  data = (byte) inbuff;
  // ... 
}
~~~

> 拓展阅读：
> 
> 这段代码的输出结果是多少呢？ (int)(char)(byte)-1
> 
> 首先-1转换成为byte：-1是0xffffffff，转换成为byte直接截取最后几位，得到0xff，也就是-1.
> 
> 然后byte转换成为char：0xff byte是有符号的，转换成为2个字节的char需要进行符号位扩展，变成0xffff，但是char是无符号的，对应的十进制是65535。
> 
> 最后char转换成为int，因为char是无符号的，所以扩展成为0x0000ffff,对应的十进制数是65535.

同样的下面的例子中，如果提前使用char对int进行转换，因为char的范围是无符号的，所以永远不可能等于-1.

~~~java
FileReader in;
char data;
while ((data = (char) in.read()) != -1) {
  // ...
}
~~~

#  write() 方法不要超出范围

在OutputStream中有一个很奇怪的方法，就是write，我们看下write方法的定义：

~~~java
    public abstract void write(int b) throws IOException;
~~~

write接收一个int参数，但是实际上写入的是一个byte。

因为int和byte的范围不一样，所以传入的int将会被截取最后的8位来转换成一个byte。

所以我们在使用的时候一定要判断写入的范围：

~~~java
    public void writeInt(int value){
        int intValue = Integer.valueOf(value);
        if (intValue < 0 || intValue > 255) {
            throw new ArithmeticException("Value超出范围");
        }
        System.out.write(value);
        System.out.flush();
    }
~~~

或者有些Stream操作是可以直接writeInt的，我们可以直接调用。

# 注意带数组的read的使用

InputStream有两种带数组的read方法：

~~~java
public int read(byte b[]) throws IOException
~~~

和

~~~java
public int read(byte b[], int off, int len) throws IOException
~~~

如果我们使用了这两种方法，那么一定要注意读取到的byte数组是否被填满，考虑下面的一个例子：

~~~java
    public String wrongRead(InputStream in) throws IOException {
        byte[] data = new byte[1024];
        if (in.read(data) == -1) {
            throw new EOFException();
        }
        return new String(data, "UTF-8");
    }
~~~

如果InputStream的数据并没有1024，或者说因为网络的原因并没有将1024填充满，那么我们将会得到一个没有填充满的数组，那么我们使用起来其实是有问题的。

怎么正确的使用呢？

~~~java
    public String readArray(InputStream in) throws IOException {
        int offset = 0;
        int bytesRead = 0;
        byte[] data = new byte[1024];
        while ((bytesRead = in.read(data, offset, data.length - offset))
                != -1) {
            offset += bytesRead;
            if (offset >= data.length) {
                break;
            }
        }
        String str = new String(data, 0, offset, "UTF-8");
        return str;
    }
~~~

我们需要记录实际读取的byte数目，通过记载偏移量，我们得到了最终实际读取的结果。

或者我们可以使用DataInputStream的readFully方法，保证读取完整的byte数组。

#  little-endian和big-endian的问题

java中的数据默认是以big-endian的方式来存储的，DataInputStream中的readByte(), readShort(), readInt(), readLong(), readFloat(), 和 readDouble()默认也是以big-endian来读取数据的，如果在和其他的以little-endian进行交互的过程中，就可能出现问题。

我们需要的是将little-endian转换成为big-endian。

怎么转换呢？

比如，我们想要读取一个int，可以首先使用read方法读取4个字节，然后再对读取的4个字节做little-endian到big-endian的转换。

~~~java
    public void method1(InputStream inputStream) throws IOException {
        try(DataInputStream dis = new DataInputStream(inputStream)) {
            byte[] buffer = new byte[4];
            int bytesRead = dis.read(buffer);  // Bytes are read into buffer
            if (bytesRead != 4) {
                throw new IOException("Unexpected End of Stream");
            }
            int serialNumber =
                    ByteBuffer.wrap(buffer).order(ByteOrder.LITTLE_ENDIAN).getInt();
        }
    }
~~~

上面的例子中，我们使用了ByteBuffer提供的wrap和order方法来对Byte数组进行转换。

当然我们也可以自己手动进行转换。

还有一个最简单的方法，就是调用JDK1.5之后的reverseBytes() 直接进行小端到大端的转换。

~~~java
    public  int reverse(int i) {
        return Integer.reverseBytes(i);
    }
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！









