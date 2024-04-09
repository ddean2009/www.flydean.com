import React from 'react';
import DocRoot from '@theme-original/DocRoot';
import type DocRootType from '@theme/DocRoot';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof DocRootType>;

export default function DocRootWrapper(props: Props): JSX.Element {
  return (
    <>
      <DocRoot {...props} />
    </>
  );
}
