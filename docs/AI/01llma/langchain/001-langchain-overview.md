---
slug: /001-langchain-overview
---

# 1. 大语言模型的开发利器langchain

# 简介

最近随着chatgpt的兴起，人工智能和大语言模型又再次进入了人们的视野，不同的是这一次像是来真的，各大公司都在拼命投入，希望能在未来的AI赛道上占有一席之地。因为AI需要大规模的算力，尤其是对于大语言模型来说。大规模的算力就意味着需要大量金钱的投入。那么对于小公司或者个人来说是不是什么都做不了呢？

当然不是，虽然小公司或者个人不能开发底层的大语言模型，但是我们可以在大语言模型之上进行应用开发，这应该就是我们现在能做到的。

今天给大家介绍一个大语言模型的开发框架langchain，有了它，在AI的世界，你可以如虎添翼。

# 什么是langchain

简单来说，langchain是一个基于大语言模型只上的开发框架，有了他，我们就可以轻松在各种大模型之上进行实际应用的开发。

langchain的主要特点有两个，第一点就是组件化。langchain提供了各种封装好的组件供我们使用，大大缩短了我们开发的时间。

第二点就是提供了工具链，可以组装各种组件，从而实现更加复杂的功能。

# langchain的安装 

废话不多说，我们来看下langchain是如何安装的。

> AI时代大家一定要学一下python，至于为什么要学习python呢？因为其他语言都不好使......

langchain实际上是python的一个开发包，所以可以通过pip或者conda两种方式来安装：

**pip安装**： 

```
pip install langchain
```

**conda安装**：

```
conda install langchain -c conda-forge
```

默认情况下上面的安装方式是最简单的安装，还有很多和langchain集成的modules并没有安装进来，如果你希望安装common LLM providers的依赖模块，那么可以通过下面的命令：

```
pip install langchain[llms]
```

如果你想安装所有的模块，那么可以使用下面的命令：

```
pip install langchain[all]
```

因为langchain是开源软件，所以你也可以通过源代码来安装,下载好源代码之后，通过下面的命令安装即可：

```
pip install -e .
```

# langchain快速使用

下面我们以几个具体的例子来讲解一下langchain如何使用的。

因为langchain只是一个大语言模型上的开发框架，它的所有的能力都是依赖于大语言模型的，所以在使用langchain之前，我们需要一个大语言模型，最简单同时也是最强大的大语言模型就是openai的chatgpt了。

接下来我们就以接入openai为例子进行讲解。

> 当然langchain也可以接入其他的大语言模型框架，后面的系列教程中我们会详细讲解。

要使用openai，必须先注册一个openai的账号，然后拿到openai的api key。 

具体的注册流程这里就不讲了。大家可以自行参考网络上的各种教程。

有了api key之后，我们需要配置一下环境变量：

```
export OPENAI_API_KEY="..."
```

然后安装openai的包：

```
pip install openai
```

接下来就可以愉快的使用openai提供的各种功能了。

当然，如果你不想在环境变量中配置openai的key，我们也可以在OpenAI的构造函数中传入openai_api_key:

```
from langchain.llms import OpenAI

llm = OpenAI(openai_api_key="...")
```

## 构建应用

有了上面的准备工作，接下来我们就可以开始使用langchain了。 

当然，最最基础的一个应用就是跟大模型交互了，比如跟openai交互，我们可以让openai给我们写首诗：

```
>>> from langchain.llms import OpenAI
>>> llm = OpenAI(temperature=0.9)
>>> llm.predict("请以古龙的口吻，写首关于春天诗")

春天来了，万物复苏，
终于迎来了一个新的时辰，
草儿花儿抬起头，
喜迎新绿与绚丽的颜色。

山林里，小草发芽，
河畔边，花儿香烈，
这让我们感到心旷神怡，
这真是一个美好的世界。

春天来了，列位朋友，
请喜迎这样一个新时辰，
不要抱怨什么，
享受春的温暖与欣慰。
```

虽然写出来了，但是我觉得写的一般般吧。

但是这不重要，我们知道了如何通过langchain来调用openai的大模型，这个才是最重要的。

## 聊天模式

上面我们调用LLM使用用的是"text in, text out"的模型。

虽然聊天模式也是基于LLM，但是他更进了一步，因为他保存了会话的上下问题，所以在对话上更加智能化。

在代码上，传入的就不是文本了，而是message对象。

在langchain中，目前支持下面几种消息类型：AIMessage, HumanMessage, SystemMessage 和 ChatMessage。

在绝大多数情况下，我们只需要用到AIMessage, HumanMessage, SystemMessage即可。

下面是使用的代码例子：

```
from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)

chat = ChatOpenAI(temperature=0)
chat.predict_messages([HumanMessage(content="请以古龙的口吻，写首关于春天诗")])

```

那么聊天模式和LLM模式有什么不一样呢？

大家可以看到，聊天模式调用的是predict_messages接口， 而LLM模式调用的是predict接口。

事实上聊天模式底层还是使用的是LLM，为了方便大家的使用，你也可以直接使用chat.predict方法来进行LLM方式的调用，如下所示：

```
chat.predict("请以古龙的口吻，写首关于春天诗")
```

## Prompt的模板

开发过LLM应用的人都知道，在LLM中Prompt是非常重要的，一个好的Prompt直接决定了这个应用的质量。

但是Prompt肯定需要结合用户的输入和我们自己做的一些限定来结合使用。

这时候就需要用到Prompt的模板功能了。 我们可以在系统中设置好模板，用户只需要填充模板中的特定消息即可。

在LLM模式中，可以使用PromptTemplates，这样来写：

```
from langchain.prompts import PromptTemplate

prompt = PromptTemplate.from_template("请帮忙我详细描述一下这个物体，这个物体的名字是: {object}?")
prompt.format(object="猫")
```

最后生成的结果如下：

```
请帮忙我详细描述一下这个物体，这个物体的名字是: 猫
```

如果是在chat models中，代码会复杂一点点，但是逻辑实际上是一样的。 在chat models中，需要用到几种MessagePromptTemplate，比如：ChatPromptTemplate,SystemMessagePromptTemplate和HumanMessagePromptTemplate。

我们具体来看下如何使用：

```
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

template = "现在，你的角色是{your_role}, 请根据你的角色回答后续的问题."
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

chat_prompt.format_messages(your_role="教师", text="世界上最远的地方是哪里？")

```

对应的输出如下：

```
[
    SystemMessage(content="现在，你的角色是教师, 请根据你的角色回答后续的问题.", additional_kwargs={}),
    HumanMessage(content="世界上最远的地方是哪里？")
]
```

非常完美。

## Chains

langchain还有一个非常有用的功能就是Chains，他可以把多种不同的功能结合起来。

比如上面我们用到了LLM，还用到了Prompt的模板，那么我们可以用Chains把他们结合起来：

```
from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
chain.run("猫")
```

当然，也可以结合chat使用：

```
from langchain import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

chat = ChatOpenAI(temperature=0)

template = "现在，你的角色是{your_role}, 请根据你的角色回答后续的问题."
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

chain = LLMChain(llm=chat, prompt=chat_prompt)
chain.run(your_role="教师", text="世界上最远的地方是哪里？")
```

## Agents

什么是agents? 从字面意义上看，Agents就是代理。

事实上langchain中的Agents就是代理的意思。

比如我们现在需要向openai询问昨天的天气，但是openai本身只是一个大模型，它并不知道实时的信息。但是通过agents就可以先进行一次判断，看看这个问题是交给大模型处理合适，还是交给搜索引擎来查询比较合适。

这就是agents的作用。

agents利用LLM来判断需要怎么处理这个任务，并且以什么样的顺序来处理这个任务。

但是使用agents是要有些条件的，首先你这个LLM模型必须支持agent，这样才能进行后续的工作。

其次是需要挑选合适的工具来进行你想要做的事情，比如：Google Search, Database lookup, Python REPL等等。

最后就是需要指定支持的agent的名字，这样LLM才知道到底需要进行哪种action。

下面是一个使用SerpAPI结合openai来进行搜索的例子：

```
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.llms import OpenAI

# The language model we're going to use to control the agent.
llm = OpenAI(temperature=0)

# The tools we'll give the Agent access to. Note that the 'llm-math' tool uses an LLM, so we need to pass that in.
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# Finally, let's initialize an agent with the tools, the language model, and the type of agent we want to use.
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

# Let's test it out!
agent.run("What was the high temperature in SF yesterday in Fahrenheit? What is that number raised to the .023 power?")
```

agent比较复杂，功能也很强大，后续我们会详细讲解。

## Memory

最后要讲解的langchain的一个功能就是Memory。

因为很多时候，我们的应用应该是一个有状态的，也就是说应用需要知道你之前做了什么，这样才可以给用户提供更好的服务。

但是之前我们将的LLM或者chain都是无状态的。

所以langchain提供了一个Memory的功能，可以把之前的输入输出保存起来，方便后续的使用。

# 总结

有了langchain的各种工具，现在你就可以快速开发一个属于你自己的LLM应用啦。



