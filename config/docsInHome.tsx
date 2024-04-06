type DocPost = {
  permalink: string
  description: string
  title: string
  image?: string | null
}

export const docPostList: DocPost[] = [
  {
    permalink: '/009-langchain-retrieval-document-loaders',
    description: 'LangChain为开发人员提供了多种文档加载器,LangChain中的文档加载器都在langchain.document_loaders中，langchain把所有要加载的文档都看做是一个Document。\n' +
        '你可以通过langchain来加载txt文件，pdf文件，csv文件或者html文件等等。',
    title: '使用langchain的Document loaders加载外部数据',
    // image: 'https://mmbiz.qpic.cn/mmbiz_png/cgBQ3XFy0lp2sFjhDIhzdCv2Bdy9NNbMHtPziczLCEgr9a4wGGEGkIO7CpUtwzRD0XHPdAic2xd8J0Gn59blHotg/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1',
  },
  {
    permalink: '/008-langchain-retrieval-overview',
    description: '在大型语言模型（LLM）领域，越来越多的应用需要生成用户特定的数据，这些数据通常超出了模型的训练数据范围。因为大模型在训练的过程中，因为受到训练数据的影响，可能并没没有用户所需要的数据，所以可能会导致大语言模型在某些特定数据上的行为缺失。',
    title: '如何在langchain中使用外部数据',
  },
  {
    permalink: '/007-langchain-output-parthcer',
    description: '我们知道在大语言模型中, 不管模型的能力有多强大，他的输入和输出基本上都是文本格式的，文本格式的输入输出虽然对人来说非常的友好，但是如果我们想要进行一些结构化处理的话还是会有一点点的不方便。',
    title: '如何在langchain中对大模型的输出进行格式化',
  },
  {
    permalink: '/006-langchain-chatmod',
    description: 'chat models是基于LLM模式的更加高级的模式。他的输入和输出是格式化的chat messages。一起来看看如何在langchain中使用caht models吧。',
    title: 'langchain中的chat models介绍和使用',
  },
]
