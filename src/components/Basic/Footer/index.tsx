import React, {useEffect, useState} from 'react';
import {DefaultFooter} from '@ant-design/pro-components';
import {useModel} from "@@/exports";

const Footer: React.FC = () => {

  const defaultCopyright = '2016 余白'

  const {initialState} = useModel('@@initialState');

  const [copyright, setCopyright] = useState(defaultCopyright)

  useEffect(() => {

    if (initialState?.account?.platform) {
      setCopyright(defaultCopyright + ' - ' + initialState.account.platform.name)
    } else {
      setCopyright(defaultCopyright)
    }
  }, [initialState?.account?.platform])

  return (
    <DefaultFooter
      copyright={copyright}
      links={[]}
    />
  );
};

export default Footer;
