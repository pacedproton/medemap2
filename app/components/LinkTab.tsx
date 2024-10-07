// app/components/LinkTab.tsx

import React from 'react';
import { Tab, TabProps } from '@mui/material';
import NextLink, { LinkProps } from 'next/link';

type LinkTabProps = TabProps & LinkProps;

const LinkTab = React.forwardRef<HTMLAnchorElement, LinkTabProps>((props, ref) => {
  const { href, ...tabProps } = props;

  return (
    <NextLink href={href} passHref legacyBehavior>
      <Tab component="a" ref={ref} {...tabProps} />
    </NextLink>
  );
});

LinkTab.displayName = 'LinkTab';

export default LinkTab;