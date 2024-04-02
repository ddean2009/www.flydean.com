import React from 'react'
import Layout from '@theme/Layout'
import Hero from './_components/Hero'
import BlogSection from './_components/BlogSection'
import FeaturesSection from './_components/FeaturesSection'
import HomepageProject from './_components/ProjectSection'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function Home(): JSX.Element {
  const {
    siteConfig: { customFields, tagline },
  } = useDocusaurusContext()
  const { description } = customFields as { description: string }

  return (
    <Layout >
      <main>
        <Hero />
        <div className="container-wrapper">
          <BlogSection />
          {/*<HomepageProject />*/}
          {/*<FeaturesSection />*/}
        </div>
      </main>
    </Layout>
  )
}
