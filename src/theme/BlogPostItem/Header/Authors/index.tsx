import React from 'react'
import clsx from 'clsx'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import BlogPostItemHeaderAuthor from '@theme/BlogPostItem/Header/Author'
import type { Props } from '@theme/BlogPostItem/Header/Authors'
import styles from './styles.module.css'

export default function BlogPostItemHeaderAuthors({ className }: Props): JSX.Element | null {
  const {
    metadata: { authors },
    assets,
  } = useBlogPost()
  const authorsCount = authors.length
  if (authorsCount === 0) {
    return null
  }
  const imageOnly = authors.every(({ name }) => !name)
  return (
    <div
      className={clsx(
        'margin-top--sm margin-bottom--sm',
        imageOnly ? styles.imageOnlyAuthorRow : 'row',
        className,
      )}
    >
      {authors.map((author, idx) => (
        <div
          className={clsx(
            !imageOnly && 'col col--6',
            imageOnly ? styles.imageOnlyAuthorCol : styles.authorCol,
          )}
          key={idx}
        >
          <BlogPostItemHeaderAuthor
            author={{
              ...author,
              // Handle author images using relative paths
              imageURL: assets.authorsImageUrls[idx] ?? author.imageURL,
            }}
          />
        </div>
      ))}
    </div>
  )
}
