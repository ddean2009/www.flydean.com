type DocPost = {
  permalink: string
  description: string
  title: string
  image?: string | null
}

export const docPostList: DocPost[] = [
  {
    permalink: '/AIGC/stable-diffusion/stable-difussion-glossary',
    description: '介绍Stable Diffusion中的常用术语和他们的涵义',
    title: 'Stable Diffusion中的常用术语解析',
    image: 'https://s2.loli.net/2024/04/08/Fupk5D1ZjCJS2ez.png'
  },
  {
    permalink: '/AIGC/stable-diffusion/prompts-from-images',
    description: '现在有一个非常漂亮的AI图片，你是不是想知道他是怎么生成的？今天我会交给大家三种方法，学会了，什么图都可以手到擒来了。',
    title: '轻松复现一张AI图片',
    image: 'https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404092330523.png'
  },
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


]
