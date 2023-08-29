在langchain中使用自定义example selector

# 简介

在之前的文章中，我们提到了可以在跟大模型交互的时候，给大模型提供一些具体的例子内容，方便大模型从这些内容中获取想要的答案。这种方便的机制在langchain中叫做FewShotPromptTemplate。

如果例子内容少的话，其实无所谓，我们可以把所有的例子都发送给大语言模型进行处理。

但是如果例子太多的话，每次都发送如此多的内容，会让我们的钱包承受不住。毕竟那些第三方的大语言模型是按token收费的。

怎么办呢？ 能不能找到一个经济又有效的方法来完成我们的工作呢？

答案就是使用example selector。

# 使用和自定义example selector

我们回想一下在使用FewShotPromptTemplate的时候，实际上是可以同时传入example_selector和examples。

```
prompt = FewShotPromptTemplate(
    example_selector=example_selector, 
    example_prompt=example_prompt, 
    suffix="Question: {input}", 
    input_variables=["input"]
)
```

这里我们使用了一个example_selector，那么什么是example_selector呢？

从名字上看他的主要作用就是从给定的examples中选择需要的examples出来，提供给大模型使用，从而减少会话的token数目。

langchain中提供了这样的example_selector的实现，我们先来看下它的基础类的定义是怎么样的：

```
class BaseExampleSelector(ABC):
    """Interface for selecting examples to include in prompts."""

    @abstractmethod
    def add_example(self, example: Dict[str, str]) -> Any:
        """Add new example to store for a key."""

    @abstractmethod
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the inputs."""
```

可以看到BaseExampleSelector继承自ABC,并且定义了两个需要实现的抽象方法。

一个方法叫做add_example。目的是向selector中添加一个example。

一个方法叫做select_examples，主要目的就是根据input，从examples中找出要select出来的内容。

那么什么是ABC呢？

ABC当然就是你了解到的ABC，但是他还有一些额外的含义。ABC的全称叫做Abstract Base Class,也叫做抽象基类。主要用于在Python程序中创建抽象基类。

他提供了一些@abstractmethod,@abstarctproperty这些装饰方法，来表明具体类的特征。

所以，如果我们想自定义一个ExampleSelector，只需要继承自BaseExampleSelector，然后实现这两个抽象方法即可。

# langchain中的ExampleSelector实现

除了自定义实现之外，langchain已经为我们提供了几个常用的ExampleSelector实现，一起来看看吧。

## LengthBasedExampleSelector

LengthBasedExampleSelector是根据example的长度来进行选择的选择器。

我们看下它的具体实现：

```
    def add_example(self, example: Dict[str, str]) -> None:
        """Add new example to list."""
        self.examples.append(example)
        string_example = self.example_prompt.format(**example)
        self.example_text_lengths.append(self.get_text_length(string_example))
```

add_example的逻辑是先把example添加到examples这个list中。

然后使用example_prompt对example进行格式化，得到最终的输出。

最后再把最后输出的text长度添加到example_text_lengths数组中。

```
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the input lengths."""
        inputs = " ".join(input_variables.values())
        remaining_length = self.max_length - self.get_text_length(inputs)
        i = 0
        examples = []
        while remaining_length > 0 and i < len(self.examples):
            new_length = remaining_length - self.example_text_lengths[i]
            if new_length < 0:
                break
            else:
                examples.append(self.examples[i])
                remaining_length = new_length
            i += 1
        return examples
```

select_examples方法实际上就是用max_length减去输入text的长度，然后再去匹配example_text的长度，匹配一个减去一个，最终得到特定长度的examples。

这个selector的最主要作用就是防止耗尽context window。因为对于大多数大语言模型来说，用户的输入是有长度限制的。

如果超出了输入长度，会产生意想不到的结果。

这个selector使用起来很简单，下面是具体的例子：

```
examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
    {"input": "energetic", "output": "lethargic"},
    {"input": "sunny", "output": "gloomy"},
    {"input": "windy", "output": "calm"},

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="Input: {input}\nOutput: {output}",
)
example_selector = LengthBasedExampleSelector(
    examples=examples, 
    example_prompt=example_prompt, 
    max_length=25,
)
```

## SemanticSimilarityExampleSelector和MaxMarginalRelevanceExampleSelector

这两个selector是根据相似度来进行example的查找的。

其中MaxMarginalRelevanceExampleSelector是SemanticSimilarityExampleSelector的字类，他是对SemanticSimilarityExampleSelector进行了一些算法上的优化。所以这里我们把他们两个放在一起介绍。

这两个selector和之前介绍的selector有所不同。因为他们用到了向量数据库。

向量数据库是干什么用的呢？它的主要目的是把输入转换成各种向量然后存储起来。向量数据库可以方便的进行输入相识度的计算。

我们先来看下他们的add_example方法：

```
    def add_example(self, example: Dict[str, str]) -> str:
        """Add new example to vectorstore."""
        if self.input_keys:
            string_example = " ".join(
                sorted_values({key: example[key] for key in self.input_keys})
            )
        else:
            string_example = " ".join(sorted_values(example))
        ids = self.vectorstore.add_texts([string_example], metadatas=[example])
        return ids[0]
```

这个方法先把example的key加入到input_keys中，然后进行排序。最后通过调用vectorstore的add_texts，把key和value加入到向量数据库中。

这两个selector的add_example都是一样的。只有select_examples的方法不同。

其中SemanticSimilarityExampleSelector调用了vectorstore的similarity_search方法来实现相似度的搜索。

而MaxMarginalRelevanceExampleSelector则是调用vectorstore的max_marginal_relevance_search方法来实现搜索的。

两者的搜索算法不太一样。

因为使用了向量数据库，所以他们的调用方法和其他的也不太一样：

```
examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
    {"input": "energetic", "output": "lethargic"},
    {"input": "sunny", "output": "gloomy"},
    {"input": "windy", "output": "calm"},
]

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples, 
    # 使用的ebeddings
    OpenAIEmbeddings(), 
    # 向量数据库
    Chroma, 
    # 要返回的数目
    k=1
)
```

## NGramOverlapExampleSelector

最后一个要介绍的是NGramOverlapExampleSelector。这个selector使用的是ngram 重叠矩阵来选择相似的输入。

具体的实现算法和原理这里就不介绍了。大家有兴趣的可以自行探索。

这个selector也不需要使用向量数据库。

使用起来是这样的：

```
example_selector = NGramOverlapExampleSelector(
    examples=examples,
    example_prompt=example_prompt,
    threshold=-1.0,
)
```

这里有个不太一样的参数叫做threshold。

对于负阈值：Selector按ngram重叠分数对示例进行排序，不排除任何示例。

对于大于1.0的阈值：选择器排除所有示例，并返回一个空列表。

对于等于0.0的阈值：选择器根据ngram重叠分数对示例进行排序，并且排除与输入没有ngram重叠的那些。

# 总结

有了这些selector我们就可以在提供的examples中进行特定的选择，然后再把选择的结果输入给大语言模型。

从而有效的减少token的浪费。







