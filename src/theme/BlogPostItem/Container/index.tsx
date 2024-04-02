import React from 'react'
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import type { Props } from '@theme/BlogPostItem/Container'
import clsx from 'clsx'

import styles from './styles.module.css'

export default function BlogPostItemContainer({ children, className }: Props): JSX.Element {
  const { frontMatter, assets } = useBlogPost()
  const { withBaseUrl } = useBaseUrlUtils()
  const image = assets.image ?? frontMatter.image
  return (
    <article
      className={clsx(className, styles.article)}
      itemProp="blogPost"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      {image && (
        <>
          <meta itemProp="image" content={withBaseUrl(image, { absolute: true })} />
          <div className={styles.cover}>
            <div className={styles.coverMask} style={{ backgroundImage: `url("${image}")` }}></div>
          </div>
          <div style={{ height: '120px' }}></div>
        </>
      )}
      {children}
    </article>
  )
}
