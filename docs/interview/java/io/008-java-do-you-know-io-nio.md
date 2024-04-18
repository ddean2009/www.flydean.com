---
slug: /0005-java-do-you-know-io-nio
---

# 高效IO 与 NIO

### 引言

输入输出（IO）是任何编程语言中的核心概念，而在Java中，IO操作更是应用程序成功运行的基石。随着计算机系统变得越来越复杂，对IO的要求也日益增加。在本文中，我们将探讨Java IO和非阻塞IO（NIO）的重要性以及如何在Java中实现高效的输入输出操作。

### 传统IO（阻塞IO）

传统IO是大多数开发人员熟悉的IO模型，其中主要涉及InputStream和OutputStream。通过传统IO，您可以轻松地进行文件读写和网络通信。让我们看一下传统IO的一个示例：

```
import java.io.*;
public class TraditionalIOExample {
    public static void main(String[] args) {
        try {
            // 打开文件
            InputStream input = new FileInputStream("example.txt");
            OutputStream output = new FileOutputStream("output.txt");

            // 读取和写入数据
            int data;
            while ((data = input.read()) != -1) {
                output.write(data);
            }

            // 关闭文件
            input.close();
            output.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

传统IO简单易用，但在某些情况下，它可能会阻塞程序的执行，特别是在处理大量并发请求时。

### Java NIO简介

Java NIO（New I/O）引入了新的IO模型，主要由通道（Channels）和缓冲区（Buffers）组成。NIO提供了非阻塞和多路复用的特性，使其成为处理大量并发连接的理想选择。让我们了解一下NIO的核心概念。

### NIO通道与缓冲区

NIO中，通道是数据传输的管道，而缓冲区则是数据的容器。通过通道和缓冲区，您可以实现高效的文件和网络操作。下面是一个简单的NIO示例：

```
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.io.RandomAccessFile;
public class NIOExample {
    public static void main(String[] args) {
        try {
            RandomAccessFile file = new RandomAccessFile("example.txt", "r");
            FileChannel channel = file.getChannel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);

            while (channel.read(buffer) != -1) {
                buffer.flip();  // 切换为读模式
                while (buffer.hasRemaining()) {
                    System.out.print((char) buffer.get());
                }
                buffer.clear();  // 清空缓冲区，切换为写模式
            }

            channel.close();
            file.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

NIO的通道和缓冲区模型允许您更灵活地管理数据，以及处理大规模数据传输。

### 选择IO类型的考虑

在选择传统IO或NIO时，需要考虑性能需求、复杂性和应用场景。传统IO简单易用，适用于大多数情况。而NIO更适用于需要处理大量并发连接的高性能应用，如网络服务器和数据传输。

### NIO的非阻塞特性

NIO的非阻塞特性主要通过选择器（Selector）和通道的非阻塞模式实现。这允许程序同时管理多个通道，而不必等待每个通道的数据可用。以下是一个NIO非阻塞IO的示例：

```
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
public class NIOSelectorExample {
    public static void main(String[] args) {
        try {
            Selector selector = Selector.open();
            ServerSocketChannel serverSocket = ServerSocketChannel.open();
            serverSocket.configureBlocking(false);
            serverSocket.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                int readyChannels = selector.select();
                if (readyChannels == 0) continue;

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();
                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();
                    if (key.isAcceptable()) {
                        // 处理连接
                    } else if (key.isReadable()) {
                        // 处理读取
                    }
                    keyIterator.remove();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

NIO的非阻塞特性允许程序同时处理多个通道，从而提高了应用程序的响应性。

### IO和NIO的性能对比

性能对比是选择IO类型的关键因素之一。传统IO在处理少量并发请求时可能表现良好，但在高并发情况下可能出现性能瓶颈。NIO通过非阻塞和多路复用等特性提供更好的性能。性能测试和案例研究可以帮助开发人员了解哪种IO类型适合他们的应用。

IO（传统IO）和NIO（非阻塞IO）在性能方面存在显著差异，尤其在处理大量并发连接时。以下是一个具体的代码和实例，用于比较IO和NIO的性能。

**性能测试目标：** 我们将模拟一个简单的HTTP服务器，它将响应客户端请求并返回一个固定的响应（"Hello, World!"）。我们将使用IO和NIO两种不同的方式实现此服务器，然后进行性能测试。

**IO实现：**

```
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class IoHttpServer {
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(8080)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                handleRequest(clientSocket);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleRequest(Socket clientSocket) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        BufferedWriter out = new BufferedWriter(new OutputStreamWriter(clientSocket.getOutputStream()));
        String request = in.readLine();
        out.write("HTTP/1.1 200 OK\r\n\r\nHello, World!\r\n");
        out.flush();
        clientSocket.close();
    }
}
```

**NIO实现：**

```
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Iterator;
import java.util.Set;

public class NioHttpServer {
    public static void main(String[] args) {
        try {
            ServerSocketChannel serverChannel = ServerSocketChannel.open();
            serverChannel.socket().bind(new InetSocketAddress(8080));
            serverChannel.configureBlocking(false);

            Selector selector = Selector.open();
            serverChannel.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                selector.select();
                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();
                    keyIterator.remove();

                    if (key.isAcceptable()) {
                        ServerSocketChannel server = (ServerSocketChannel) key.channel();
                        SocketChannel clientChannel = server.accept();
                        clientChannel.configureBlocking(false);
                        clientChannel.register(selector, SelectionKey.OP_READ);
                    } else if (key.isReadable()) {
                        SocketChannel clientChannel = (SocketChannel) key.channel();
                        ByteBuffer buffer = ByteBuffer.allocate(1024);
                        clientChannel.read(buffer);
                        buffer.flip();
                        byte[] bytes = new byte[buffer.remaining()];
                        buffer.get(bytes);
                        String request = new String(bytes);

                        String response = "HTTP/1.1 200 OK\r\n\r\nHello, World!\r\n";
                        ByteBuffer responseBuffer = ByteBuffer.wrap(response.getBytes());
                        clientChannel.write(responseBuffer);
                        clientChannel.close();
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

**性能测试：** 我们将使用Apache Benchmark工具（ab）来测试这两个HTTP服务器的性能，模拟1000个并发请求，每个请求重复1000次。

```
ab -n 100000 -c 1000 http://localhost:8080/
```

**性能测试结果：** 在这个简单的性能测试中，NIO的实现通常会比传统IO的实现更具竞争力。由于NIO的非阻塞特性，它能够更好地处理大量并发请求，减少线程阻塞和上下文切换。

需要注意的是，性能测试结果受多个因素影响，包括硬件、操作系统和代码优化。因此，实际性能可能会因环境而异。然而，通常情况下，NIO在高并发场景下表现更出色。

总之，通过上述性能测试，我们可以看到NIO相对于传统IO在处理大量并发请求时的性能表现更为出色。因此，在需要高性能和可伸缩性的应用中，NIO通常是更好的选择。

### 实际应用场景

最后，我们将探讨一些实际应用场景，包括文件复制、HTTP服务器和套接字通信。这些场景演示了如何有效地应用IO和NIO来满足特定需求。

当涉及到Java中的IO和NIO的实际应用时，我们可以探讨一些常见的使用场景和示例代码。以下是几个实际应用的示例：

#### 1. 文件复制

文件复制是一个常见的IO任务，它可以使用传统IO和NIO来实现。以下是一个使用传统IO的文件复制示例：

```
import java.io.*;

public class FileCopyUsingIO {
    public static void main(String[] args) {
        try (InputStream inputStream = new FileInputStream("input.txt");
             OutputStream outputStream = new FileOutputStream("output.txt")) {

            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这段代码使用InputStream和OutputStream进行文件复制。

以下是一个使用NIO的文件复制示例：

```
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.file.StandardCopyOption;
import java.nio.file.FileSystems;

public class FileCopyUsingNIO {
    public static void main(String[] args) {
        try {
            Path source = FileSystems.getDefault().getPath("input.txt");
            Path target = FileSystems.getDefault().getPath("output.txt");
            FileChannel sourceChannel = FileChannel.open(source, StandardOpenOption.READ);
            FileChannel targetChannel = FileChannel.open(target, StandardOpenOption.CREATE, StandardOpenOption.WRITE);

            ByteBuffer buffer = ByteBuffer.allocate(1024);
            int bytesRead;
            while ((bytesRead = sourceChannel.read(buffer)) != -1) {
                buffer.flip();
                while (buffer.hasRemaining()) {
                    targetChannel.write(buffer);
                }
                buffer.clear();
            }

            sourceChannel.close();
            targetChannel.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这段代码使用NIO中的FileChannel和ByteBuffer来实现文件复制。

#### 2. HTTP服务器

创建一个简单的HTTP服务器也是一个常见的应用场景，可以使用NIO来处理多个并发连接。以下是一个使用NIO的简单HTTP服务器示例：

```
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;

public class SimpleHttpServer {
    public static void main(String[] args) {
        try {
            ServerSocketChannel serverChannel = ServerSocketChannel.open();
            serverChannel.socket().bind(new InetSocketAddress(8080));

            while (true) {
                SocketChannel clientChannel = serverChannel.accept();

                ByteBuffer buffer = ByteBuffer.allocate(1024);
                clientChannel.read(buffer);
                buffer.flip();
                // 处理HTTP请求
                // ...

                clientChannel.write(buffer);
                clientChannel.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这段代码创建一个简单的HTTP服务器，使用NIO中的ServerSocketChannel和SocketChannel处理客户端请求。

#### 3. 套接字通信

套接字通信是在网络编程中常见的应用，可以使用NIO来实现非阻塞的套接字通信。以下是一个使用NIO的简单套接字通信示例：

```
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.net.InetSocketAddress;

public class SocketCommunication {
    public static void main(String[] args) {
        try {
            SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("localhost", 8080));

            ByteBuffer buffer = ByteBuffer.allocate(1024);
            String message = "Hello, Server!";
            buffer.put(message.getBytes());
            buffer.flip();
            clientChannel.write(buffer);

            buffer.clear();
            clientChannel.read(buffer);
            buffer.flip();
            // 处理从服务器接收的数据
            // ...

            clientChannel.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这段代码创建一个客户端套接字通信，使用NIO的SocketChannel来与服务器进行非阻塞通信。

这些示例代表了Java中IO和NIO的实际应用场景，从文件复制到HTTP服务器和套接字通信。这些示例演示了如何使用Java的IO和NIO来处理各种输入输出任务。

### 总结

通过本文，我们深入探讨了Java中的IO和NIO，以及它们的应用。了解如何选择合适的IO类型和使用适当的工具，可以帮助开发人员实现高效的输入输出操作，提高应用程序的性能和可伸缩性。鼓励读者在实际开发中深入研究和应用IO和NIO，以满足不同应用的需求。

> 更多内容请参考 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


