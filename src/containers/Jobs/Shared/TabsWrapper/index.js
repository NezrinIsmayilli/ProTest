import React from 'react';
import { Tabs, Affix } from 'antd';

import styles from './tabs.module.scss';

// tabs container
export default function TabsWrapper(props) {
  return (
    <div id="TabsWrapper">
      <Tabs
        defaultActiveKey="1"
        className={styles.tabs}
        tabBarGutter={12}
        renderTabBar={(props, DefaultTabBar) => (
          <Affix
            offsetTop={0}
            target={() => document.getElementById('TabsWrapper')}
          >
            <DefaultTabBar {...props} />
          </Affix>
        )}
        {...props}
      />
    </div>
  );
}
