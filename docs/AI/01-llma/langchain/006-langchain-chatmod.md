---
slug: /006-langchain-chatmod
---

# 6. langchain中的chat models介绍和使用

# 简介

之前我们介绍了LLM模式，这种模式是就是文本输入，然后文本输出。

chat models是基于LLM模式的更加高级的模式。他的输入和输出是格式化的chat messages。

一起来看看如何在langchain中使用caht models吧。

# chat models的使用

首先langchain对chat models下支持的模型就少很多了。一方面是可能有些语言模型本身是不支持chat models的。另外一方面langchain也还是在一个发展中的过程，所以有些模型还需要适配。

目前看来langchain支持的chat models有：ChatAnthropic,AzureChatOpenAI,ChatVertexAI,JinaChat,ChatOpenAI和PromptLayerChatOpenAI这几种。

langchain把chat消息分成了这几种：AIMessage, HumanMessage, SystemMessage 和 ChatMessage。

HumanMessage就是用户输入的消息，AIMessage是大语言模型的消息，SystemMessage是系统的消息。ChatMessage是一种可以自定义类型的消息。

在使用的时候，只需要在chat中传入对应的消息即可：

```
from langchain.chat_models import ChatOpenAI

chat = ChatOpenAI()

messages = [
    SystemMessage(content="你是一个小说家"),
    HumanMessage(content="帮我写篇小说")
]
chat(messages)
```

当然和LLM一样，你也可以使用批量模式如下：

```
batch_messages = [
    [
        SystemMessage(content="你是一个小说家"),
        HumanMessage(content="帮我写篇小说")
    ],
    [
        SystemMessage(content="你是一个诗人"),
        HumanMessage(content="帮我写首诗")
    ],
]
result = chat.generate(batch_messages)
result
```

# chat models的高级功能

其实和LLM类似，基本上LLM有的高级功能chat models都有。

比如有用的比如缓存功能，可以缓存之前的输入和输出，避免每次都调用LLM，从而可以减少token的开销。

以InMemoryCache为例子：

```
from langchain.cache import InMemoryCache
langchain.llm_cache = InMemoryCache()

# 第一次调用，不是用cache
llm.predict("Tell me a joke")

# 第二次调用，使用cache
llm.predict("Tell me a joke")
```

除了InMemoryCache,langchain还支持FullLLMCache,SQLAlchemyCache,SQLiteCache和RedisCache等等。

同样的，chat models也是支持流模式的：

```
from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    HumanMessage,
)

from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
chat = ChatOpenAI(streaming=True, callbacks=[StreamingStdOutCallbackHandler()], temperature=0)
resp = chat([HumanMessage(content="帮忙我写首诗")])
```

只需要在构建ChatOpenAI的时候，把StreamingStdOutCallbackHandler传入callbacks即可。

如果要在chat models中使用PromptTemplate，因为chat models的消息格式跟LLM是不一样的，所以对应的PromptTemplate也是不一样的。

和对应的chat models消息对应的PromptTemplate是ChatPromptTemplate,SystemMessagePromptTemplate,
AIMessagePromptTemplate和HumanMessagePromptTemplate。

我们看下是如何使用prompt template来构建prompt:

```
from langchain import PromptTemplate
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

# 构建各种prompt
template="You are a helpful assistant that translates {input_language} to {output_language}."
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template="{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

# 使用format_prompt把prompt传给chat
chat(chat_prompt.format_prompt(input_language="English", output_language="French", text="I love programming.").to_messages())
```

chat models下消息构建确实比直接使用LLM要复杂点，大家在使用的时候需要注意。

# 总结

chat models是LLM的高阶表现形式。如果我们需要进行对话模型的话，就可以考虑使用这个。

> 更多内容请参考 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
