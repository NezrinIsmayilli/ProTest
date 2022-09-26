/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Sidebar, ProSearch, ProSidebarItem } from 'components/Lib';

import { positionsSearchHandle } from 'store/actions/settings/vezifeler';

import NavigationButtons from '../#shared/NavigationButtons';

import PositionsTable from './PositionsTable';

function Positions(props) {
  const { positionsSearchHandle } = props;

  useEffect(() => () => positionsSearchHandle(''), []);

  return (
    <section>
      <Sidebar title="Əməkdaşlar">
        <ProSidebarItem label="Vəzifə">
          <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          positionsSearchHandle('')
                        }
                    }} onSearch={positionsSearchHandle}/>
        </ProSidebarItem>
      </Sidebar>
      <section className="scrollbar aside">
        <div className="container">
          <NavigationButtons />

          <PositionsTable />
        </div>
      </section>
    </section>
  );
}

export default connect(
  null,
  { positionsSearchHandle }
)(Positions);
