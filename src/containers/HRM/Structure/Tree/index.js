/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { Sidebar, ProSidebarItem, ProSelect } from 'components/Lib';
import OrganizationChart from '@dabeng/react-orgchart';
import { useFilterHandle } from 'hooks';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { fetchHierarchicalStructure } from 'store/actions/structure';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import CustomNode from './node';

import NavigationButtons from '../#shared/NavigationButtons';

function Tree(props) {
  const {
    hiearchicalStructureLoading,
    fetchHierarchicalStructure,
    fetchWorkers,
    workers,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;

  const [data, setData] = useState({});

  const [filters, onFilter] = useFilterHandle(
    {
      employees: [],
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchHierarchicalStructure({
        filters,
        onSuccessCallback: ({ data }) => {
          setData(data);
        },
      });
    }
  );

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchWorkers({
        filters: {
          businessUnitIds: filters?.businessUnitIds,
          lastEmployeeActivityType: 1,
        },
      });
    } else {
      fetchWorkers({
        filters: {
          lastEmployeeActivityType: 1,
        },
      });
    }
  }, [filters.businessUnitIds]);
  return (
    <section>
      <Sidebar title="Təşkilati struktur">
        {businessUnits?.length === 1 &&
        profile.businessUnits.length === 0 ? null : (
          <ProSidebarItem label="Biznes blok">
            <ProSelect
              mode="multiple"
              onChange={values => onFilter('businessUnitIds', values)}
              value={
                businessUnits?.length === 1
                  ? businessUnits[0]?.id === null
                    ? businessUnits[0]?.name
                    : businessUnits[0]?.id
                  : filters.businessUnitIds
              }
              disabled={businessUnits?.length === 1}
              data={businessUnits?.map(item =>
                item.id === null ? { ...item, id: 0 } : item
              )}
              disabledBusinessUnit={businessUnits?.length === 1}
            />
          </ProSidebarItem>
        )}
        <ProSidebarItem label="Əməkdaş">
          <ProSelect
            mode="multiple"
            onChange={value => onFilter('employees', value)}
            keys={['name', 'surname',"patronymic"]}
            data={workers}
          />
        </ProSidebarItem>
      </Sidebar>
      <section className="scrollbar aside">
        <div className="container">
          <NavigationButtons />

          <div>
            <Spin size="large" spinning={hiearchicalStructureLoading}>
              <OrganizationChart
                datasource={data}
                chartClass="myChart"
                NodeTemplate={CustomNode}
                collapsible={false}
                pan
                zoom
              />
            </Spin>
          </div>
        </div>
      </section>
    </section>
  );
}
const mapStateToProps = state => ({
  hiearchicalStructureLoading: state.loadings.fetchHierarchicalStructure,
  workers: state.workersReducer.workers,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});
export default connect(
  mapStateToProps,
  {
    fetchWorkers,
    fetchHierarchicalStructure,
    fetchBusinessUnitList,
  }
)(Tree);
