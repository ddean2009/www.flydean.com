type DocPost = {
  permalink: string
  description: string
  title: string
  image?: string | null
}

export const docPostList: DocPost[] = [
  {
    permalink: '/AIGC/stable-diffusion/prompt-guide',
    description: '在使用Stable Diffusion AI时，构建一个有效的提示（Prompt）是至关重要的第一步。这个过程涉及到创造性的尝试和对AI行为的理解。这里我会对如何构建一个好的Prompt进行一个总结。',
    title: '构建一个优秀的Prompt',
    image: 'https://s2.loli.net/2024/04/08/MxNfW93T2vpGPbA.png'
  },
  {
    permalink: '/AIGC/stable-diffusion/beginners-guide',
    description: '想掌握Stable Diffusion AI技术吗？这份初学者指南专为完全没接触过Stable Diffusion或任何AI图像生成器的新手设计。跟随本指南，你将了解Stable Diffusion的基本情况，并获得一些实用的入门技巧。',
    title: 'Stable diffusion 初学者指南',
    image: 'https://s2.loli.net/2024/04/08/boWljDcBURLTPm4.png'
  },
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
]
