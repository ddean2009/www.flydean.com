type DocPost = {
  permalink: string
  description: string
  title: string
  image?: string | null
}

export const docPostList: DocPost[] = [
  {
    permalink: '/AIGC/stable-diffusion/embedding',
    description: '嵌入，也称为文本反转，是在 Stable Diffusion 中控制图像样式的另一种方法。在这篇文章中，我们将学习什么是嵌入，在哪里可以找到它们，以及如何使用它们。',
    title: 'Stable Diffusion中的embedding',
    image: 'https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404102022700.png'
  },
  {
    permalink: '/AIGC/stable-diffusion/know-these-important-parameters-for-stunning-ai-images',
    description: '有了这些参数，你将无往不利',
    title: 'Stable diffusion中这些重要的参数你一定要会用',
    image: 'https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404101809033.png'
  },
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

]
