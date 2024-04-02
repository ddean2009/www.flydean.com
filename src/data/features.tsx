import WebDeveloperSvg from '@site/static/img/logo.svg'
import OpenSourceSvg from '@site/static/img/logo.svg'
import SpiderSvg from '@site/static/img/logo.svg'
import Translate, { translate } from '@docusaurus/Translate'
import React from 'react'

export type FeatureItem = {
  title: string
  text: JSX.Element
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
}

const FEATURES: FeatureItem[] = [
  {
    title: translate({
      id: 'homepage.feature.developer',
      message: 'cccc',
    }),
    text: (
      <Translate>
       aaaa
      </Translate>
    ),
    Svg: WebDeveloperSvg,
  },
  {
    title: translate({
      id: 'homepage.feature.spider',
      message: 'abc',
    }),
    text: (
      <Translate>
        345。
      </Translate>
    ),
    Svg: SpiderSvg,
  },
  {
    title: translate({
      id: 'homepage.feature.enthusiast',
      message: 'def',
    }),
    text: (
      <Translate>
        123。
      </Translate>
    ),
    Svg: OpenSourceSvg,
  },
]

export default FEATURES
