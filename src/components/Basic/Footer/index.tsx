import React from 'react';
import {DefaultFooter} from '@ant-design/pro-components';
import {useModel} from "@@/exports";

const Footer: React.FC = () => {

  const defaultCopyright = '2016 余白'

  const {initialState} = useModel('@@initialState');
  const copyright = initialState?.account?.platform
    ? `${defaultCopyright} - ${initialState.account.platform.name}`
    : defaultCopyright

  return (
    <DefaultFooter
      copyright={copyright}
      links={[]}
    />
  );
};

export default Footer;
