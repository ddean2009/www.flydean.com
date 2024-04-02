import React from 'react'
import Link from '@docusaurus/Link'
import Translate, { translate } from '@docusaurus/Translate'
import clsx from 'clsx'
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common'
import type { ArchiveBlogPost, Props } from '@theme/BlogArchivePage'
import { Icon } from '@iconify/react'
import styles from './styles.module.css'

import { motion, Variants } from 'framer-motion'

import dayjs from 'dayjs'
import MyLayout from '../MyLayout'

type YearProp = {
  year: string
  posts: ArchiveBlogPost[]
}

const variants: Variants = {
  from: { opacity: 0.01, y: 50 },
  to: i => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      bounce: 0.2,
      duration: 0.3,
      delay: i * 0.1,
    },
  }),
}

function Year({ posts }: YearProp) {
  return (
    <>
      <ul className={styles.archiveList}>
        {posts.map((post, i) => (
          <motion.li
            key={post.metadata.permalink}
            className={styles.archiveItem}
            custom={i}
            initial="from"
            animate="to"
            variants={variants}
            viewport={{ once: true, amount: 0.8 }}
          >
            <Link to={post.metadata.permalink}>
              <time className={styles.archiveTime}>
                {dayjs(post.metadata.date).format('MM-DD')}
              </time>
              <span>{post.metadata.title}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </>
  )
}

function YearsSection({ years }: { years: YearProp[] }) {
  return (
    <div className="margin-top--md margin-left--sm">
      {years.map((_props, idx) => (
        <motion.div
          key={idx}
          initial="from"
          animate="to"
          custom={idx}
          variants={variants}
        >
          <div className={styles.archiveYear}>
            <h3 className={styles.archiveYearTitle}>{_props.year}</h3>
            <span>
              <i>{(years[idx] as YearProp).posts.length} </i>
              <Translate id="theme.blog.archive.posts.unit">篇</Translate>
            </span>
          </div>
          <Year {..._props} />
        </motion.div>
      ))}
    </div>
  )
}

function listPostsByYears(blogPosts: readonly ArchiveBlogPost[]): YearProp[] {
  const postsByYear = blogPosts.reduceRight((posts, post) => {
    const year = post.metadata.date.split('-')[0]!
    const yearPosts = posts.get(year) ?? []
    return posts.set(year, [post, ...yearPosts])
  }, new Map<string, ArchiveBlogPost[]>())

  return Array.from(postsByYear, ([year, posts]) => ({
    year,
    posts,
  })).reverse()
}

export default function BlogArchive({ archive }: Props) {
  const title = translate({
    id: 'theme.blog.archive.title',
    message: 'Archive',
    description: 'The page & hero title of the blog archive page',
  })
  const description = translate({
    id: 'theme.blog.archive.description',
    message: 'Archive',
    description: 'The page & hero description of the blog archive page',
  })

  const years = listPostsByYears(archive.blogPosts)
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}
    >
      <PageMetadata title={title} description={description} />
      <MyLayout>
        <h2 className={styles.archiveTitle}>
          <Icon icon="carbon:blog" width={24} height={24} />
          {title}
        </h2>
        <div className={styles.archiveCount}>
          <Translate
            id="theme.blog.archive.posts.total"
            values={{ total: archive.blogPosts.length }}
          >
            {`共 {total} 篇文章`}
          </Translate>
        </div>
        {years.length > 0 && <YearsSection years={years} />}
      </MyLayout>
    </HtmlClassNameProvider>
  )
}
