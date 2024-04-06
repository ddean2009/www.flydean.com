import React from 'react'
import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import Translate from '@docusaurus/Translate'
import Link from '@docusaurus/Link'
import Image from '@theme/IdealImage'

import styles from './styles.module.scss'
import SectionTitle from '../SectionTitle'
import {DocPost, docPostList} from '@site/config/docsInHome';

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  )

const BLOG_POSTS_COUNT = 4
const BLOG_POSTS_PER_ROW = 2

export function DocItem({ post }: { post: DocPost }) {
  const {
    permalink, image, title, description
  } = post

  return (
    <motion.li
      className={clsx('card', 'margin-bottom--md')}
      key={permalink}
      initial={{ y: 100, opacity: 0.001 }}
      whileInView={{ y: 0, opacity: 1, transition: { duration: 0.5 } }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      viewport={{ once: true }}
    >
      {image && (
        <Link href={permalink} className={styles.image}>
          <Image src={image!} alt={title} img={''} />
        </Link>
      )}
      <div className={'card__body'}>
        <h4>
          <Link href={permalink}>{title}</Link>
        </h4>
        <p>{description}</p>
      </div>
    </motion.li>
  )
}

export default function DocsSection(): JSX.Element {

  const posts = chunk(docPostList.slice(0, BLOG_POSTS_COUNT), BLOG_POSTS_PER_ROW)

  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20], {
    clamp: false,
  })

  if (docPostList.length === 0) {
    return <>作者还没有发表过文章哦</>
  }

  return (
    <section className={clsx('container padding-vert--sm', styles.blogContainer)}>
      <SectionTitle icon="ri:quill-pen-line" href={'/AI/llma/'}>
        <Translate id="homepage.blog.title">最新文章</Translate>
      </SectionTitle>
      <div ref={ref} className={clsx('row', styles.list)}>
        {posts.map((postGroup, index) => (
          <div className="col col-6 margin-top--sm" key={index}>
            {postGroup.map((post, i) => (
              <motion.div style={{ y: i / 2 ? y : 0 }} key={i}>
                <DocItem key={post.id} post={post} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
