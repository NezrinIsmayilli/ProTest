/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

// actions
import { fetchAppealsCounts } from 'store/actions/jobs/appeals';

import { Row, Col } from 'antd';
import { Switch, Route, Link, useParams } from 'react-router-dom';
import { ProFilterButton } from 'components/Lib';

import Sidebar from './Sidebar';

// context
import {
  AppealsFiltersContextProvider,
  useAppealsFilters,
} from './Sidebar/FiltersContext';

// sub pages
import New from './New';
import Interview from './Interview';
import Wait from './Wait';
import Result from './Result';

import styles from './appeals.module.scss';

const mainUrl = '/recruitment/appeals';

const getAppealsCounts = createSelector(
  state => state.appealsCountsReducer,
  appealsCountsReducer => appealsCountsReducer.counts
);

const TabButtons = () => {
  const params = useParams();
  const route = params[0];

  const dispatch = useDispatch();
  const {
    new: newCount = 0,
    wait = 0,
    interview = 0,
    result = 0,
  } = useSelector(getAppealsCounts);

  useEffect(() => {
    dispatch(fetchAppealsCounts());
  }, []);

  const { onFilter } = useAppealsFilters();

  return (
    <div className={styles.rowBox}>
      <Row gutter={32} type="flex" align="middle">
        <Col span={18}>
          <div className={styles.buttonsBox}>
            <div>
              <Link to={`${mainUrl}/new`}>
                <ProFilterButton
                  count={newCount}
                  active={route === 'new'}
                  onClick={() => {
                    onFilter('status', [2]);
                  }}
                >
                  Yeni
                </ProFilterButton>
              </Link>

              <Link to={`${mainUrl}/wait`}>
                <ProFilterButton
                  count={wait}
                  active={route === 'wait'}
                  onClick={() => {
                    onFilter('status', [1]);
                  }}
                >
                  Gözlənilir
                </ProFilterButton>
              </Link>

              <Link to={`${mainUrl}/interview`}>
                <ProFilterButton
                  count={interview}
                  active={route === 'interview'}
                  onClick={() => {
                    onFilter('status', [3]);
                  }}
                >
                  Müsahibə
                </ProFilterButton>
              </Link>

              <Link to={`${mainUrl}/result`}>
                <ProFilterButton
                  count={result}
                  active={route === 'result'}
                  onClick={() => {
                    onFilter('status', [4, 5, 6]);
                  }}
                >
                  Nəticə
                </ProFilterButton>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

function Appeals() {
  return (
    <AppealsFiltersContextProvider>
      <Sidebar />
      <section className="scrollbar aside" id="appealsArea">
        <div className="container">
          {/* appeals/Müraciətlər tab buttons */}
          <TabButtons />

          {/* render current page */}
          <Switch>
            <Route exact path={`${mainUrl}/new`}>
              <New />
            </Route>

            <Route exact path={`${mainUrl}/wait`}>
              <Wait />
            </Route>

            <Route exact path={`${mainUrl}/interview`}>
              <Interview />
            </Route>

            <Route exact path={`${mainUrl}/result`}>
              <Result />
            </Route>
          </Switch>
        </div>
      </section>
    </AppealsFiltersContextProvider>
  );
}

export default Appeals;
