---
slug: /14-7-netty-codec-xml
---

# 33. netty系列之:netty中常用的xml编码解码器



# 简介

在json之前，xml是最常用的数据传输格式，虽然xml的冗余数据有点多，但是xml的结构简单清晰，至今仍然运用在程序中的不同地方，对于netty来说自然也提供了对于xml数据的支持。

netty对xml的支持表现在两个方面，第一个方面是将编码过后的多个xml数据进行frame拆分，每个frame包含一个完整的xml。另一方面是将分割好的frame进行xml的语义解析。

进行frame拆分可以使用XmlFrameDecoder,进行xml文件内容的解析则可以使用XmlDecoder，接下来我们会详细讲解两个decoder实现和使用。

# XmlFrameDecoder

因为我们收到的是数据流，所以不确定收到的数据到底是什么样的，一个正常的xml数据可能会被拆分成多个数据frame。

如下所示:

```
   +-------+-----+--------------+
   | <this | IsA | XMLElement/> |
   +-------+-----+--------------+
```

这是一个正常的xml数据，但是被拆分成为了三个frame，所以我们需要将其合并成为一个frame如下：

```
   +-----------------+
   | <thisIsAXMLElement/> |
   +-----------------+

```

还有可能不同的xml数据被分拆在多个frame中的情况,如下所示：

```
   +-----+-----+-----------+-----+----------------------------------+
   | <an | Xml | Element/> | <ro | ot><child>content</child></root> |
   +-----+-----+-----------+-----+----------------------------------+
```

上面的数据需要拆分成为两个frame：

```
   +-----------------+-------------------------------------+
   | <anXmlElement/> | <root><child>content</child></root> |
   +-----------------+-------------------------------------+
```

拆分的逻辑很简单，主要是通过判断xml的分隔符的位置来判断xml是否开始或者结束。xml中的分隔符有三个，分别是'<', '>' 和 '/'。

在decode方法中只需要判断这三个分隔符即可。

另外还有一些额外的判断逻辑，比如是否是有效的xml开始字符：

```
    private static boolean isValidStartCharForXmlElement(final byte b) {
        return b >= 'a' && b <= 'z' || b >= 'A' && b <= 'Z' || b == ':' || b == '_';
    }
```

是否是注释:

```
    private static boolean isCommentBlockStart(final ByteBuf in, final int i) {
        return i < in.writerIndex() - 3
                && in.getByte(i + 2) == '-'
                && in.getByte(i + 3) == '-';
    }

```

是否是CDATA数据：

```
    private static boolean isCDATABlockStart(final ByteBuf in, final int i) {
        return i < in.writerIndex() - 8
                && in.getByte(i + 2) == '['
                && in.getByte(i + 3) == 'C'
                && in.getByte(i + 4) == 'D'
                && in.getByte(i + 5) == 'A'
                && in.getByte(i + 6) == 'T'
                && in.getByte(i + 7) == 'A'
                && in.getByte(i + 8) == '[';
    
```

通过使用这些方法判断好xml数据的起始位置之后，就可以调用extractFrame方法将要使用的ByteBuf从原始数据中拷贝出来，最后放到out中去：

```
final ByteBuf frame =
                    extractFrame(in, readerIndex + leadingWhiteSpaceCount, xmlElementLength - leadingWhiteSpaceCount);
            in.skipBytes(xmlElementLength);
            out.add(frame);
```

# XmlDecoder

将xml数据拆分成为一个个frame之后，接下来就是对xml中具体数据的解析了。

netty提供了一个xml数据解析的方法叫做XmlDecoder,主要用来对已经是一个单独的xml数据的frame进行实质内容的解析，它的定义如下：

```
public class XmlDecoder extends ByteToMessageDecoder 
```

XmlDecoder根据读取到的xml内容，将xml的部分拆分为XmlElementStart,XmlAttribute,XmlNamespace,XmlElementEnd,XmlProcessingInstruction,XmlCharacters,XmlComment,XmlSpace,XmlDocumentStart,XmlEntityReference,XmlDTD和XmlCdata。

这些数据基本上覆盖了xml中所有可能出现的元素。

所有的这些元素都是定义在io.netty.handler.codec.xml包中的。

但是XmlDecoder对xml的读取解析则是借用了第三方xml工具包：fasterxml。

XmlDecoder使用了fasterxml中的AsyncXMLStreamReader和AsyncByteArrayFeeder用来进行xml数据的解析。

这两个属性的定义如下：

```
    private static final AsyncXMLInputFactory XML_INPUT_FACTORY = new InputFactoryImpl();
    private final AsyncXMLStreamReader<AsyncByteArrayFeeder> streamReader;
    private final AsyncByteArrayFeeder streamFeeder;

            this.streamReader = XML_INPUT_FACTORY.createAsyncForByteArray();
        this.streamFeeder = (AsyncByteArrayFeeder)this.streamReader.getInputFeeder();
```

decode的逻辑是通过判断xml element的类型来分别进行不同数据的读取,最后将读取到的数据封装成上面我们提到的各种xml对象，最后将xml对象添加到out list中返回。

# 总结

我们可以借助XmlFrameDecoder和XmlDecoder来实现非常方便的xml数据解析，netty已经为我们造好轮子了，我们就不需要再自行发明了。

