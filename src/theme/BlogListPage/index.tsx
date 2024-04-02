import clsx from 'clsx'
import React from 'react'
import { HtmlClassNameProvider, PageMetadata, ThemeClassNames } from '@docusaurus/theme-common'
import BackToTopButton from '@theme/BackToTopButton'
import type { Props } from '@theme/BlogListPage'
import BlogListPaginator from '@theme/BlogListPaginator'
import BlogPostItems from '@theme/BlogPostItems'
import SearchMetadata from '@theme/SearchMetadata'

import { ViewType, useViewType } from '@site/src/hooks/useViewType'
import Translate from '@docusaurus/Translate'
import { Icon } from '@iconify/react'
import BlogPostGridItems from '../BlogPostGridItems'

import styles from './styles.module.scss'
import MyLayout from '../MyLayout'

function BlogListPageMetadata(props: Props): JSX.Element {
  const { metadata } = props
  const { blogDescription } = metadata

  return (
    <>
      <PageMetadata title={`Blog`} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  )
}

function ViewTypeSwitch({
  viewType,
  toggleViewType,
}: {
  viewType: ViewType
  toggleViewType: (viewType: ViewType) => void
}): JSX.Element {
  return (
    <div className={styles.blogSwithView}>
      <Icon
        icon="ph:list"
        width="24"
        height="24"
        onClick={() => toggleViewType('list')}
        color={viewType === 'list' ? 'var(--ifm-color-primary)' : '#ccc'}
      />
      <Icon
        icon="ph:grid-four"
        width="24"
        height="24"
        onClick={() => toggleViewType('grid')}
        color={viewType === 'grid' ? 'var(--ifm-color-primary)' : '#ccc'}
      />
    </div>
  )
}

function BlogListPageContent(props: Props) {
  const { metadata, items } = props

  const { viewType, toggleViewType } = useViewType()

  const isListView = viewType === 'list'
  const isGridView = viewType === 'grid'

  return (
    <MyLayout>
      <h2 className={styles.blogTitle}>
        <Translate id="theme.blog.title.new">我的博客</Translate>
      </h2>
      <p className={styles.blogDescription}>寻求诗与远方</p>
      <ViewTypeSwitch viewType={viewType} toggleViewType={toggleViewType} />
      <div className="row">
        <div className={'col col--12'}>
          <>
            {isListView && (
              <div className={styles.blogList}>
                <BlogPostItems items={items} />
              </div>
            )}
            {isGridView && <BlogPostGridItems items={items} />}
          </>
          <BlogListPaginator metadata={metadata} />
        </div>
      </div>
      <BackToTopButton />
    </MyLayout>
  )
}

export default function BlogListPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  )
}
