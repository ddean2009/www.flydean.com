---
slug: /003-langchain-custprompts
---

# 3. 在langchain中使用带简短知识内容的prompt template

# 简介

langchain中有个比较有意思的prompt template叫做FewShotPromptTemplate。

他是这句话的简写："Prompt template that contains few shot examples."

什么意思呢？就是说在Prompt template带了几个比较简单的例子。然后把这些例子发送给LLM，作为简单的上下文环境，从而为LLM提供额外的一些关键信息。

这种few shot examples非常有用，如果你希望LLM可以基于你提供的prompt中的内容进行回答的时候，就需要用到这个东西了。

> 你可以把Few-shot prompt templates看做是简单的知识库，后面我们会具体讲解如何搭建自己的知识库。
> 现在先提前了解一下它的魅力吧。

# 带few shot examples的例子

加入现在我要问chatgpt这样一个问题：

```
请问工具人的代表作是什么？
```

因为这里的工具人是我虚拟出来的一个人，真实并不存在，所以chatgpt的回答可能是下面这样的：

```
工具人的代表作是迈克尔·佩拉的《开膛手杰克》。
```

因为chatgpt对不会的东西可能会乱回答，所以上面的答案是在合理范围之内的。 

那么怎么才能让chatgpt按照我们虚构的内容进行回答呢？

答案就是在prompt中提供有用的信息，比如下面这样子：

```
问题: 请帮忙描述下古龙?
回答: 姓名:古龙，出生日期:1937年,代表作:《楚留香传奇系列》、《陆小凤系列》、《萧十一郎系列》

问题: 请帮忙描述下金庸?
回答: 姓名:金庸，出生日期:1924年,代表作:《射雕英雄传》、《神雕侠侣》、《天龙八部》

问题: 请帮忙描述下工具人?
回答: 姓名:工具人，出生日期:1988年,代表作:《工具人传奇》、《工具人上班》、《工具人睡觉》

问题: 请问工具人的代表作是什么？
```

下面是chatgpt的回答：

```
工具人的代表作是《工具人传奇》、《工具人上班》和《工具人睡觉》。
```

所以大家想到了什么？

没错，就是可以使用prompt中的信息做知识库，让chatgpt从这个给定的知识库中查询出有用的东西，然后再用自己的语言组织起来，返回给用户。

# 在langchain中使用FewShotPromptTemplate

实际上，上面的问题和答案都是promot内容的一部分，所以可以保存在PromptTemplate中。

而langchain有与之对应的专门的一个类叫做FewShotPromptTemplate。

上面的问答，其实可以保存在一个json数组中，然后再在FewShotPromptTemplate中使用：

```
from langchain.prompts.few_shot import FewShotPromptTemplate
from langchain.prompts.prompt import PromptTemplate

examples = [
  {
    "question": "请帮忙描述下古龙?",
    "answer": 
"""
姓名:古龙，出生日期:1937年,代表作:《楚留香传奇系列》、《陆小凤系列》、《萧十一郎系列》
"""
  },
  {
    "question": "请帮忙描述下金庸?",
    "answer": 
"""
姓名:金庸，出生日期:1924年,代表作:《射雕英雄传》、《神雕侠侣》、《天龙八部》
"""
  },
  {
    "question": "请帮忙描述下工具人?",
    "answer":
"""
姓名:工具人，出生日期:1988年,代表作:《工具人传奇》、《工具人上班》、《工具人睡觉》
"""
  }
]
```

首先我们来看一下FewShotPromptTemplate中都有哪些属性：

```
   examples: Optional[List[dict]] = None
    """Examples to format into the prompt.
    Either this or example_selector should be provided."""

    example_selector: Optional[BaseExampleSelector] = None
    """ExampleSelector to choose the examples to format into the prompt.
    Either this or examples should be provided."""

    example_prompt: PromptTemplate
    """PromptTemplate used to format an individual example."""

    suffix: str
    """A prompt template string to put after the examples."""

    input_variables: List[str]
    """A list of the names of the variables the prompt template expects."""

    example_separator: str = "\n\n"
    """String separator used to join the prefix, the examples, and suffix."""

    prefix: str = ""
    """A prompt template string to put before the examples."""

    template_format: str = "f-string"
    """The format of the prompt template. Options are: 'f-string', 'jinja2'."""

    validate_template: bool = True
    """Whether or not to try validating the template."""
```

其中examples和example_selector是可选的，其他的都是必须的。

example_prompt是用来格式化一个特定example的PromptTemplate。

如下所示：

```
example_prompt = PromptTemplate(input_variables=["question", "answer"], template="问题: {question}\n 回答：{answer}")

print(example_prompt.format(**examples[0]))
```

```
问题: 请帮忙描述下古龙?
回答: 姓名:古龙，出生日期:1937年,代表作:《楚留香传奇系列》、《陆小凤系列》、《萧十一郎系列》
```

上面代码中，我们使用PromptTemplate对队列中的数据进行了格式化。

有了examples和example_prompt,我们就可以构建FewShotPromptTemplate了：

```
prompt = FewShotPromptTemplate(
    examples=examples, 
    example_prompt=example_prompt, 
    suffix="问题: {input}", 
    input_variables=["input"]
)

print(prompt.format(input="请问工具人的代表作是什么？"))
```

这里输出的内容和我们最开始的内容是一样的。

# 使用ExampleSelector

在上面的例子中，我们实际上是把所有的shot examples都提交给了大语言模型，但实际上并不是必须的。因为有些examples跟问题是没有关联关系的。

所以langchain给我们提供了一个类叫做ExampleSelector，可以通过这个selector来选择跟我们问题相关的一些examples，从而减少不必要的内容传输。

这里我们使用SemanticSimilarityExampleSelector，它的作用是根据语义的相似度来选择examples：

```
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings


example_selector = SemanticSimilarityExampleSelector.from_examples(
    # 要选择的examples
    examples,
    # embedding用来判断文本的相似度
    OpenAIEmbeddings(),
    # 向量数据库，用来存储embeddings
    Chroma,
    # 最终要选择的长度
    k=1
)

# 选择最为相似的作为输入
question = "请问工具人的代表作是什么？"
selected_examples = example_selector.select_examples({"question": question})
print(f"下面是和这个问题最相似的examples: {question}")
for example in selected_examples:
    print("\n")
    for k, v in example.items():
        print(f"{k}: {v}")
```

最后，我们同样的把ExampleSelector和FewShotPromptTemplate结合起来一起使用：

```
prompt = FewShotPromptTemplate(
    example_selector=example_selector, 
    example_prompt=example_prompt, 
    suffix="问题: {input}", 
    input_variables=["input"]
)

print(prompt.format(input="请问工具人的代表作是什么？"))
```

# 总结

如果你有一些简单的内容需要提供给大语言模型，那么可以使用这个方式。但是如果你有很多内容的话，比如知识库。这种实现就处理不了了。那么如何构建一个知识库应用呢？我们后续分享。




















