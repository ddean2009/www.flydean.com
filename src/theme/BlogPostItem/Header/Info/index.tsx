import React from 'react'
import clsx from 'clsx'
import { translate } from '@docusaurus/Translate'
import { usePluralForm } from '@docusaurus/theme-common'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import type { Props } from '@theme/BlogPostItem/Header/Info'
import TagsListInline from '@theme/TagsListInline'

import styles from './styles.module.css'
import Tag from '@site/src/theme/Tag'
import { Icon } from '@iconify/react'

// Very simple pluralization: probably good enough for now
function useReadingTimePlural() {
  const { selectMessage } = usePluralForm()
  return (readingTimeFloat: number) => {
    const readingTime = Math.ceil(readingTimeFloat)
    return selectMessage(
      readingTime,
      translate(
        {
          id: 'theme.blog.post.readingTime.plurals',
          description:
            'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One min read|{readingTime} min read',
        },
        { readingTime },
      ),
    )
  }
}

export function ReadingTime({ readingTime }: { readingTime: number }) {
  const readingTimePlural = useReadingTimePlural()
  return <span className="truncate">{readingTimePlural(readingTime)}</span>
}

function DateTag({ date, formattedDate }: { date: string; formattedDate: string }) {
  return (
    <time dateTime={date} itemProp="datePublished" className="truncate">
      {formattedDate}
    </time>
  )
}

export default function BlogPostItemHeaderInfo({ className }: Props): JSX.Element {
  const { metadata } = useBlogPost()
  const { date, tags, readingTime, authors } = metadata
    console.log(metadata)
    const authorsExists = authors.length > 0

    const formatDate = (blogDate: string) =>
        new Date(blogDate).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

  const tagsExists = tags.length > 0

  return (
    <div className={clsx(styles.container, 'margin-bottom--md', className)}>
        {authorsExists && (
            <>
                <Icon icon="ri:user-line"  />
                {authors.map(a => (
                    <span key={a.url} className="blog__author">
                  <a href={a.url} className={styles.blogPostAuthor}>
                    {a.name}
                  </a>
                </span>
                ))}
            </>
        )},
      <div className={styles.date}>
        <Icon icon="ri:calendar-line" />
        <DateTag date={date} formattedDate={formatDate(date)}/>
      </div>
      {tagsExists && (
        <div className={styles.tagInfo}>
          <Icon icon="ri:price-tag-3-line" />
          <div className={clsx('truncate', styles.tagList)}>
            {tags.slice(0, 3).map(({ label, permalink: tagPermalink }, index) => {
              return (
                <div key={tagPermalink}>
                  {index !== 0 && '/'}
                  <Tag label={label} permalink={tagPermalink} className={'tag'} />
                </div>
              )
            })}
          </div>
        </div>
      )}
      {typeof readingTime !== 'undefined' && (
        <div className={styles.date}>
          <Icon icon="ri:time-line" />
          <ReadingTime readingTime={readingTime} />
        </div>
      )}
    </div>
  )
}
