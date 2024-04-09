import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';
import Comment from "@site/src/components/Comment";
import LoadScript from './LoadScript';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): JSX.Element {
  return (
    <>
        <br/>
        <a href="http://www.flydean.com/" target="_blank" rel="noopener noreferrer">点我查看更多精彩内容:www.flydean.com</a>
        <img src="http://www.flydean.com/img/qrcode.jpg" alt="关注公众号" width="55" height="55"/>
        <img src="http://www.flydean.com/img/qrcode2.jpeg" alt="加我好友" width="55" height="55"/>
        <br/>
        <LoadScript url="/js/readmorelocal.js" />
        <Comment />
      <Footer {...props} />
    </>
  );
}
