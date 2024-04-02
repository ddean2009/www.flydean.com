import React from 'react'
import clsx from 'clsx'
import Translate from '@docusaurus/Translate'

import styles from './styles.module.scss'
import features, { type FeatureItem } from '@site/src/data/features'
import SectionTitle from '../SectionTitle'

function Feature({ title, Svg, text }: FeatureItem) {
  return (
    <div className={clsx('col', styles.feature)}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--left padding-horiz--md">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default function FeaturesSection(): JSX.Element {
  return (
    <section className={clsx(styles.featureContainer, 'container padding-vert--sm')}>
      <SectionTitle icon={'ri:map-pin-user-line'}>
        <Translate id="homepage.feature.title">个人特点</Translate>
      </SectionTitle>
      <div className="row">
        {features.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  )
}
