import React from 'react'
import clsx from 'clsx'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import EditThisPage from '@theme/EditThisPage'
import TagsListInline from '@theme/TagsListInline'
import Tag from '@theme/Tag'
import ReadMoreLink from '@theme/BlogPostItem/Footer/ReadMoreLink'
import { Icon } from '@iconify/react'
import { ReadingTime } from '../Header/Info/index'

import styles from './styles.module.scss'

export default function BlogPostItemFooter(): JSX.Element | null {
  const { metadata, isBlogPostPage } = useBlogPost()
  const { tags, title, editUrl, hasTruncateMarker, date, readingTime, authors } =
    metadata
  const formatDate = (blogDate: string) =>
      new Date(blogDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedDate=formatDate(date)

  // A post is truncated if it's in the "list view" and it has a truncate marker
  const truncatedPost = !isBlogPostPage && hasTruncateMarker

  const tagsExists = tags.length > 0
  const authorsExists = authors.length > 0

  const renderFooter = isBlogPostPage
  // console.log(renderFooter)

  if (!renderFooter) {
    return (
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.blogPostInfo}>
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
          {date && (
            <>
              <Icon icon="ri:calendar-line" />
              <time dateTime={date} className={styles.blogPostDate} itemProp="datePublished">
                {formattedDate}
              </time>
            </>
          )}
          {tagsExists && (
            <>
              <Icon icon="ri:price-tag-3-line" />
              <span className={styles.blogPostInfoTags}>
                {tags.map(({ label, permalink: tagPermalink }) => (
                  <Tag label={label} permalink={tagPermalink} key={tagPermalink} />
                ))}
              </span>
            </>
          )}
          {readingTime && (
            <>
              <Icon icon="ri:time-line" />
              <span className={clsx(styles.blogPostReadTime, 'blog__readingTime')}>
                <ReadingTime readingTime={readingTime} />
              </span>
            </>
          )}
          {truncatedPost && (
            <div
              className={clsx('readMore', {
                'col--3': tagsExists,
              })}
            >
              <ReadMoreLink blogPostTitle={title} to={metadata.permalink} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <footer
      className={clsx('row docusaurus-mt-lg', isBlogPostPage && styles.blogPostFooterDetailsFull)}
    >
      {/* {isBlogPostPage && editUrl && (
        <div className="col margin-top--sm">
          <EditThisPage editUrl={editUrl} />
        </div>
      )} */}

      {truncatedPost && (
        <div
          className={clsx('col text--right', {
            'col--3': tagsExists,
          })}
        >
          <ReadMoreLink blogPostTitle={title} to={metadata.permalink} />
        </div>
      )}
    </footer>
  )
}
