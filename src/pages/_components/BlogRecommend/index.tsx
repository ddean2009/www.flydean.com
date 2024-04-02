import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { BlogPost } from '@docusaurus/plugin-content-blog'
import { usePluginData } from '@docusaurus/useGlobalData'
import Translate from '@docusaurus/Translate'
import Link from '@docusaurus/Link'
import Image from '@theme/IdealImage'

import styles from './styles.module.scss'

export default function BlogRecommend(): JSX.Element {
  const blogData = usePluginData('docusaurus-plugin-content-blog') as {
    posts: BlogPost[]
    postNum: number
    tagNum: number
  }
  const recommendedPosts = blogData.posts
    .filter(b => (b.metadata.frontMatter.sticky as number) > 0)
    .map(b => b.metadata)
    .sort((a, b) => (a.frontMatter.sticky as number) - (b.frontMatter.sticky as number))
    .slice(0, 8)

  if (recommendedPosts.length === 0) {
    return <></>
  }

  return (
    <div className="container padding-vert--sm transition">
      <h2 style={{ textAlign: 'center' }}>
        <Translate id="theme.blog.title.recommend">推荐阅读</Translate>
      </h2>
      <div className="row">
        <div className="col col--12">
          <div>
            <ul className={styles.blog__recommend}>
              {recommendedPosts.map(post => (
                <motion.li
                  className={clsx('card')}
                  key={post.permalink}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  {post.frontMatter.image && (
                    <div className={styles.card__image}>
                      <Image src={post.frontMatter.image!} alt={post.title} img={''} />
                    </div>
                  )}
                  <div className={'card__body'}>
                    <h4>
                      <Link href={post.permalink}>{post.title}</Link>
                    </h4>
                    <p>{post.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
