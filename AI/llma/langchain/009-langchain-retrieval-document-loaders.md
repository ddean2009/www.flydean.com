使用langchain的Document loaders加载外部数据

# 简介

LangChain为开发人员提供了多种文档加载器,LangChain中的文档加载器都在langchain.document_loaders中，langchain把所有要加载的文档都看做是一个Document。

你可以通过langchain来加载txt文件，pdf文件，csv文件或者html文件等等。

# Document

Document是langchain对要加载文档的抽象。我们看下他的定义:

```
class Document(Serializable):
    """Class for storing a piece of text and associated metadata."""

    page_content: str
    """String text."""
    metadata: dict = Field(default_factory=dict)
    """Arbitrary metadata about the page content (e.g., source, relationships to other
        documents, etc.).
    """

    @property
    def lc_serializable(self) -> bool:
        """Return whether or not the class is serializable."""
        return True
```

这段代码定义了一个 Document 类，该类用于表示文本文档及其元数据。文档的文本内容存储在 page_content 属性中，元数据信息存储在 metadata 属性中, metadata是一个字典，表示存放多种元数据。

此外，这个类还具有一个名为 lc_serializable 的属性，该属性返回 True，表示这个类是可序列化的。

可序列化通常指的是可以将类的实例转换为一种格式（例如JSON）以进行数据存储或传输。

# BaseLoader

langchain中的基础loader类叫做BaseLoader，BaseLoader定义了三个方法:

```
def load(self) -> List[Document]:

def load_and_split(
        self, text_splitter: Optional[TextSplitter] = None
    ) -> List[Document]:

def lazy_load(
        self,
    ) -> Iterator[Document]:
```

分别是加载，加载然后分割和最后的懒加载。

BaseLoader只是一个抽象类，所有的方法都是在子类中实现的。langchain提供了多种loader供我们使用。

因为loader太多了，大家有需要的可以自行查阅langchain的文档。

这里我们挑几个有代表性的，使用比较多的loader给大家介绍。

# TextLoader

TextLoader是最简单的loader了。 他就是把要加载的文档看做是一个text。

看一下他的具体实现：

```
    def load(self) -> List[Document]:
        """Load from file path."""
        text = ""
        try:
            with open(self.file_path, encoding=self.encoding) as f:
                text = f.read()
        except UnicodeDecodeError as e:
            if self.autodetect_encoding:
                detected_encodings = detect_file_encodings(self.file_path)
                for encoding in detected_encodings:
                    logger.debug(f"Trying encoding: {encoding.encoding}")
                    try:
                        with open(self.file_path, encoding=encoding.encoding) as f:
                            text = f.read()
                        break
                    except UnicodeDecodeError:
                        continue
            else:
                raise RuntimeError(f"Error loading {self.file_path}") from e
        except Exception as e:
            raise RuntimeError(f"Error loading {self.file_path}") from e

        metadata = {"source": self.file_path}
        return [Document(page_content=text, metadata=metadata)]
```

load方法很简单，首先使用默认的encoding来加载文档，如果出现UnicodeDecodeError，则尝试用其他的编码方式进行读取。

最后把读取到的文件内容，和生成的元数据传入到一个Document对象中返回。

下面是一个使用的例子，非常简单：

```
from langchain.document_loaders import TextLoader

loader = TextLoader("./index.html")
loader.load()
```

# CSVLoader

CSV的全称是comma-separated values，csv文件是一种我们在日常工作中经常会用到的一种文件格式。

看一下csv文件的简单加载：

```
from langchain.document_loaders.csv_loader import CSVLoader


loader = CSVLoader(file_path='./index.csv')
data = loader.load()
```

当然csv文件可能并不是以默认的逗号作为分隔符的，所以我们可以使用一种更加复杂的加载方式如下：

```
loader = CSVLoader(file_path='./index.csv', csv_args={
    'delimiter': ',',
    'quotechar': '"',
    'fieldnames': ['姓名', '年龄', '班级']
})

data = loader.load()

```

默认情况下Document里面的元数据的source属性是csv文件的路径，你也可以通过传入source_column来改变这一行为：

```
loader = CSVLoader(file_path='./index.csv', source_column="班级")

data = loader.load()
```

# HTML loader

HTML也是我们经常会用到的数据有，如果我们只想获取html中的具体内容的话，可以使用UnstructuredHTMLLoader：

```
from langchain.document_loaders import UnstructuredHTMLLoader

loader = UnstructuredHTMLLoader("index.html")

data = loader.load()
```

这个loader会把html中的具体内容转换成为document中的page_content。

langchain还提供了一个BSHTMLLoader的加载器。

这个加载器会额外获取html的title字段，将其放在Document的元数据中的title里面：

```
from langchain.document_loaders import BSHTMLLoader

loader = BSHTMLLoader("index.html")
data = loader.load()
data
```

# JSONLoader

JSON也是一种非常常见的数据格式。在Langchain中，提供了JSONLoader为我们使用。

因为JSON相对而言比较复杂一点，所以这里langchain解析的时候实际上使用的是jq这个python包来实现的。

所以，如果你需要使用JSONLoader,必须安装jq先。

我们看下他的具体使用：

```
from langchain.document_loaders import JSONLoader

import json
from pathlib import Path
from pprint import pprint


file_path='./index.json'
data = json.loads(Path(file_path).read_text())
```

这里我们读取了一个json文件， 他的内容可能是这样的：

```
{'name': 'jack', 'age': 10, 'books': {'bookName': 'book A', 'author': 'author'}}
```

假如我们只想获取json中books相关的信息，那么可以这样使用JSONLoader：

```
loader = JSONLoader(
    file_path='./index.json',
    jq_schema='.books',
    text_content=False)

data = loader.load()
```

我们可以得到下面的内容：

```
[Document(page_content='{"bookName": "book A", "author": "author"}', metadata={'source': '/index.json', 'seq_num': 1})]

```

这里我们可能需要注意传入的jq_schema，不同的schema需要不同的格式，下面是几个jq_schema的例子:

```
JSON        -> [{"text": ...}, {"text": ...}, {"text": ...}]
jq_schema   -> ".[].text"

JSON        -> {"key": [{"text": ...}, {"text": ...}, {"text": ...}]}
jq_schema   -> ".key[].text"

JSON        -> ["...", "...", "..."]
jq_schema   -> ".[]"
```

# UnstructuredMarkdownLoader

Markdown是一种非常常见的文档文件，这种文档文件可以方便的生成带样式的页面，深受广大程序员的喜爱。

langchain提供了UnstructuredMarkdownLoader来加载markdown文件：

```
from langchain.document_loaders import UnstructuredMarkdownLoader

markdown_path = "./index.md"
loader = UnstructuredMarkdownLoader(markdown_path)

data = loader.load()
```

默认情况下UnstructuredMarkdownLoader会把从markdown文件中解析出来的各个模块合并在一起，放入Document的page_content中。

但是有些情况下，我们希望保留各个模块，并不想对内容进行合并，这样的话，我们可以给UnstructuredMarkdownLoader传入一个mode参数，这样就会被对内容进行合并了：

```
loader = UnstructuredMarkdownLoader(markdown_path, mode="elements")

data = loader.load()

data[0]
```

# PyPDFLoader

pdf是一种我们在日常工作中经常会使用到的一种文本结构。他的全称叫做Portable Document Format (PDF),是Adobe公司在1992开发的一种文件格式。

如果你的pdf在本地，那么可以使用langchain提供的PyPDFLoader来加载pdf文档。

```
from langchain.document_loaders import PyPDFLoader

loader = PyPDFLoader("files/mypdf.pdf")
pages = loader.load_and_split()
```

最后得到的pages是pdf中的页面，你可以通过pages的下标来获取不同页面的数据。

如果pdf中包含图片，你还可以通过安装rapidocr-onnxruntime包来讲图片转换成文字：

```
pip install rapidocr-onnxruntime

loader = PyPDFLoader("files/mypdf.pdf", extract_images=True)
pages = loader.load()
pages[4].page_content
```

这里面我们需要给PyPDFLoader传入多一个参数：extract_images。

当然，还有其他很多种类的pdfloader，比如MathpixPDFLoader，UnstructuredPDFLoader.

如果你想获取远程的pdf，可以使用OnlinePDFLoader.

# 总结

有了这么多文档加载器之后，从外部文件读取数据就不再是一个梦想了。







