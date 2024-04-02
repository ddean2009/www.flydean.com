import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import type { Props } from '@theme/Tag'

import styles from './styles.module.scss'

export default function Tag({
  permalink,
  label,
  count,
  className,
}: Props & { className?: string }): JSX.Element {
  return (
    <Link
      href={permalink}
      className={clsx(styles.tag, count ? styles.tagWithCount : styles.tagRegular, className)}
    >
      {label}
      {count && <span>{count}</span>}
    </Link>
  )
}
