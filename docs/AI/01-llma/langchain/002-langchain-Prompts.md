---
slug: /002-langchain-Prompts
---

# 2. langchain:Prompt在手,天下我有

# 简介

prompts是大语言模型的输入，他是基于大语言模型应用的利器。没有差的大语言模型，只有差的prompts。

写好prompts才能发挥大语言模型300%的功力。

理论上，要写好prompts其实不是那么容易的，但是langchain把这个理论变成了现实，一起来看看吧。

# 好的prompt

有时候，不是我们使用的语言模型不够好，而是因为我们写的prompt不够优秀。

以下是一些写好大语言模型的prompts的几条原则：

1. 具体和详细：prompts应该具有明确的问题或任务，同时包含足够的细节和背景信息，以便大语言模型能够理解和回答。

2. 可理解和可回答：prompts应该明确清晰，让大语言模型能够理解并且回答。避免使用过于抽象、模糊或带有攻击性的语言。

3. 有情境和背景：prompts应该包含足够的情境和背景信息，让大语言模型能够理解问题的重要性和意义，并在回答中提供有意义的信息。

4. 有目标和方向：prompts应该明确问题或任务的目标和方向，以便大语言模型能够为需要的信息提供清晰和有用的答案。

5. 可扩展和可定制：prompts应该设计成易于扩展和定制，以适应不同的应用场景和用户需求。

因为很多时候，在类似的场景中，我们的prompts的大体结构是一样的，只有具体的细节描述有所不同，这时候，就需要用到prompt template.

# 什么是prompt template

prompt template就是一个prompt的模板，通过prompt template，我们可以快速的生成多个prompt。

基本上prompt template已经帮我们描述好了场景，要做的事情。我们只需要填入具体的内容即可。

下面是一个prompt template的简单例子：

```
from langchain import PromptTemplate


template = """/
假如你是一个金融公司的理财经理，请你分析一下{stock}这只股票。
"""

prompt = PromptTemplate.from_template(template)
prompt.format(stock="腾讯控股")

假如你是一个金融公司的理财经理，请你分析一下腾讯控股这只股票。
```

这样，对于用户来说，只需要输入需要问询的股票名称即可。其他的一长串文字就不需要了，大大节省了prompt构建的时间。

当然，这只是一个非常简单的例子，你还可以在prompt template中设置回答的格式，提供具体的例子等等，从而得到更好的回复。

# 在langchain中创建prompt template

简单点说prompt template就是一个格式化输入的东西。在langchain中，对应的工具类叫做PromptTemplate。

上面的简单例子中，我们已经大体看到了如何使用PromptTemplate。

在上例中，我们调用了PromptTemplate.from_template方法，传入了一个template的字符串。

在template的字符串中，我们用括号定义了一个变量。最后调用prompt.format方法，指定变量的名称和值，完成prompt的最终创建。

另外，prompt template中还可以指定多个变量：

```
template = "请告诉我一个关于{personA}的{thingsB}"

prompt_template = PromptTemplate.from_template(template)
prompt_template.format(personA="小张", thingsB="故事")
```

只需要在format中指定变量名称即可。

除了是用PromptTemplate.from_template方法之外，我们还可以直接使用PromptTemplate的构造函数来创建prompt。

PromptTemplate的构造函数可以接受两个参数：input_variables和template。

input_variables是template中的变量名字，它是一个数组。

template就是模板的具体内容，是个字符串。

比如，我们可以构造无变量的模板：

```
no_input_prompt = PromptTemplate(input_variables=[], template="这是一个无参数模板。")
no_input_prompt.format()
```

我们还可以构造带参数模板：

```
one_input_prompt = PromptTemplate(input_variables=["stock"], template="假如你是一个金融公司的理财经理，请你分析一下{stock}这只股票。")
one_input_prompt.format(stock="腾讯控股")
```

还有多个参数的模板：

```
multiple_input_prompt = PromptTemplate(
    input_variables=["personA", "thingsB"], 
    template="请告诉我一个关于{personA}的{thingsB}"
)
multiple_input_prompt.format(personA="小张", thingsB="故事")
```

# Chat特有的prompt template

之前在介绍langchain的时候有跟大家提到过，chat虽然是基于LLM的，但是和基本的LLM还有有区别的。

最主要的区别在于，chat消息是不同角色的。比如在openai中，chat消息就可以被分为AI, human或者system这几种角色。

这样做虽然复杂了一点，但是可以更好的对消息进行分类处理。

我们看下langchain中关于chat的PromptTemplate有哪些：

```
from langchain.prompts import (
    ChatPromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
```

和普通的prompt template一样，我们可以调用MessagePromptTemplate的from_template来创建对应的prompt：

```
template="现在你的角色是{role},请按该角色进行后续的对话."
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template="{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
```

当然你可以通过构造函数来创建prompt：

```
prompt=PromptTemplate(
    template="现在你的角色是{role},请按该角色进行后续的对话.",
    input_variables=["role"],
)

```

有了一个或者多个MessagePromptTemplates之后，就可以使用这些MessagePromptTemplates来构建ChatPromptTemplate了：

```
chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

chat_prompt.format_prompt(role="医生", text="帮我看看我的颜值还行吗？").to_messages()
```

# 总结

好了， 基本的langchain中的prompt template已经介绍完毕。大家去试试看吧。








