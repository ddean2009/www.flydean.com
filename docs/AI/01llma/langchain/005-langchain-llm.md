---
slug: /005-langchain-llm
---

# 5. langchain中的LLM模型使用介绍 

# 简介

构建在大语言模型基础上的应用通常有两种，第一种叫做text completion,也就是一问一答的模式，输入是text，输出也是text。这种模型下应用并不会记忆之前的问题内容，每一个问题都是最新的。通常用来做知识库。

还有一种是类似聊天机器人这种会话模式，也叫Chat models。这种模式下输入是一个Chat Messages的列表。从而可以保存上下文信息，让模型的回复更加真实。

实际上Chat models的底层还是LLMs,只不过在调用方式上有些变化。

# 简单使用LLMs

什么是LLMs呢？LLMs是Large Language Models的简称，也就是我们常说的大语言模型。

对于langchain来说，它本身并不提供大语言模型，它只是一个中间的粘合层，提供了统一的接口，方便我们对接底层的各种LLMs模型。

langchain除了可以对接OpenAI之外，还可以对接Cohere, Hugging Face等其他的大语言模型。

比如下面是openAI的使用：

```
from langchain.llms import OpenAI

llm = OpenAI(openai_api_key="...")
```

接下来就可以调用llm的方法来进行text completion了。

一般来说有两种方式。第一种方式就是直接输出：

```
llm("给我写首诗")
```

还有一种方式调用他的generate方法：

```
llm_result = llm.generate(["给我唱首歌", "给我写首诗"])
```

这种方式可以传入一个数组，用来生成比较复杂的结果。


# langchain支持的LLM

现在大语言模型可谓是蓬勃发展，一不留神就可能出一个新的大语言模型。

就目前而言，基本的国外主流模型langchain都是支持的。 

比如：openai,azure openai,AmazonAPI,Hugging Face Hub等等。数目繁多，功能齐全,你想要的他全都有，你没想到的他也有。

那么有小伙伴可能要问题了，langchain支不支持国产的大语言模型呢？

答案是肯定的，但并不是直接的。

如果你发现langchain并没有你想要的llm，那么你可以尝试进行自定义。

langchain为我们提供了一个类叫做LLM，我们只需要继承这个LLM即可：

```
class LLM(BaseLLM):

    @abstractmethod
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
    ) -> str:
        """Run the LLM on the given prompt and input."""
```

其中，唯一一个必须要实现的方法就是_call,这个方法传入一个字符串和一些可选的stop word，然后返回LLM的输出即可。

另外还可以实现一个_identifying_params方法，用来输出自定义LLM的一些参数信息。

大家可以自行尝试和接入不同的LLM模型。

# 一些特殊的LLM

很多时候调用LLM是需要收费的，如果我们在开发的过程中也要不断的消耗token肯定是得不偿失。

所以langchain为了给我们省钱，提供了一个FakeLLM来使用。

顾名思义，FakeLLM就是可以手动来mock一些LLM的回答，方便测试。

```
from langchain.llms.fake import FakeListLLM

responses = ["窗前明月光\n低头鞋两双"]
llm = FakeListLLM(responses=responses)

print(llm("给我写首诗"))
```

上面的输出结果如下：

```
窗前明月光
低头鞋两双
```

langchain中还有一个和FakeLLM类似的叫做HumanInputLLM。 

这个LLM可以打印出给用户的prompt，并且将用户的输入作为输出返回给用户，大家可以自行体验。

# LLM的高级用法

除了正常的LLM调用之外，langchain还提供了一些LLM的高级用法。

## 异步调用

比如异步调用LLM。当然目前只支持OpenAI, PromptLayerOpenAI, ChatOpenAI 和 Anthropic这几个LLM。其他的对LLM的支持貌似正在开发中。

异步方法也很简单，主要是调用llm的agenerate方法,比如下面这样：

```
async def async_generate(llm):
    resp = await llm.agenerate(["Hello, how are you?"])
    print(resp.generations[0][0].text)

```

## 缓存功能

另外，对于一些重复的请求来说，langchain还提供了缓存功能，这样可以重复的请求就不需要再发送到LLM去了，给我们节约了时间和金钱，非常好用。

langchain提供的cache也有很多种，比如InMemoryCache,FullLLMCache,SQLAlchemyCache,SQLiteCache和RedisCache等等。

我们以InMemoryCache为例，看看是怎么使用的：

```
from langchain.cache import InMemoryCache
langchain.llm_cache = InMemoryCache()

# 第一次没有使用缓存
llm.predict("Tell me a joke")
# 第二次使用了缓存
llm.predict("Tell me a joke")
```

使用起来很简单，只需要添加一行llm_cache即可。

如果你使用其他的cache，除了构造函数不同之外，其他的都是类似的。

## 保存LLM配置

有时候我们配置好了LLM之外，还可以把LLM相关的参数以文本的形式存储起来。

保存llm到文件：

```
llm.save("llm.json")
```

加载llm：

```
llm = load_llm("llm.json")
```

## 流式处理

LLM的速度是一个硬伤，由于返回整个响应的速度太慢了，所以推出了流式响应。只要有response返回，就传输给用户。并不需要等待所有内容都获得之后再处理。这样对用户的体验是最好的。

目前langchain只支持OpenAI,ChatOpenAI和ChatAnthropic。

要实现这个流式处理， langchain提供了BaseCallbackHandler，我们只需要继承这个类，实现on_llm_new_token这个方法即可。

当然langchain已经给我们提供了一个实现好的类叫做：StreamingStdOutCallbackHandler。下面是他的实现：

```
    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        sys.stdout.write(token)
        sys.stdout.flush()
```

使用的时候，只需要在构建llm的是传入对应的callback即可：

```
from langchain.llms import OpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler


llm = OpenAI(streaming=True, callbacks=[StreamingStdOutCallbackHandler()], temperature=0)
resp = llm("给我写首诗")
```

## 统计token数目

这个统计token使用数目的功能目前只能在openai使用。

```
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback

llm = OpenAI(model_name="text-davinci-002", n=2, best_of=2)

with get_openai_callback() as cb:
    result = llm("T给我写首诗")
    print(cb)
```

# 总结

LLM是大语言模型最基础的模式，chat模式的底层就是基于LLM实现的。后续我们会详细介绍chat模式，尽请期待。

> 更多内容请参考 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！






