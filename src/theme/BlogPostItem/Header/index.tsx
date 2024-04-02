import React from 'react'
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title'
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info'
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors'
import { useBlogPost } from '@docusaurus/theme-common/internal'

export default function BlogPostItemHeader(): JSX.Element {
  const { isBlogPostPage } = useBlogPost()
  return (
    <header style={{ position: 'relative', zIndex: 2 }}>
      <BlogPostItemHeaderTitle />
      {isBlogPostPage && (
        <>
          <BlogPostItemHeaderInfo />
          {/* <BlogPostItemHeaderAuthors /> */}
        </>
      )}
    </header>
  )
}
