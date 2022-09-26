/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { useFilterHandle } from 'hooks';

import { createReducer, exportFileDownloadHandle } from 'utils';

import { Col, Dropdown, Menu } from 'antd';
import {
  Sidebar,
  ProSidebarItem,
  ProSearch,
  ExcelButton,
  Can,
  NewButton,
  ProSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
  structuresSearchHandle,
  structuresSectionHandle,
  fetchStructures,
} from 'store/actions/structure';
import { AiOutlineDown, BiUnite } from 'react-icons/all';
import { accessTypes, permissions } from 'config/permissions';
import NavigationButtons from '../#shared/NavigationButtons';

import StructureDrawer from './SectionsDrawer';
import SectionsTable from './SectionsTable';
import styles from './styles.module.scss';
import { useHistory, useLocation } from 'react-router-dom';

const initialState = {
  isDrawerOpen: false,
  isEdit: false,
  editingStructureId: undefined,
};

const reducer = createReducer(initialState, {
  closeDrawer: () => ({
    isDrawerOpen: false,
    isEdit: false,
    editingStructureId: undefined,
  }),

  openDrawer: (state, action) => ({
    isDrawerOpen: true,
    isEdit:
      typeof action.editingStructureId === 'number' &&
      action.editingStructureId !== undefined,
    editingStructureId: action.editingStructureId,
  }),
});

function Structure(props) {
  const {
    structuresSectionHandle,
    structuresSearchHandle,
    isLoadingExport,
    exportFileDownloadHandle,
    fetchStructures,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;

  const [{ isDrawerOpen, isEdit, editingStructureId }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const history = useHistory();
  const location = useLocation();
  const [filters, onFilter] = useFilterHandle(
    {
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => fetchStructures(filters)
  );

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  const openDrawer = id =>
    dispatch({ type: 'openDrawer', editingStructureId: id });

  const closeDrawer = () =>{
    history.push({
      search: '',
  });
     dispatch({ type: 'closeDrawer' })};

  useEffect(() => () => structuresSearchHandle(''), []);
  const handleMenuClick = ({ key }) => {
    history.push({
      pathname: location.pathName,
      search: `?tkn_unit=${key == 'null' ? 0 : key}`,
  });
  };
  const menu = (
    <Menu 
    style={{ maxHeight: '500px', overflowY: 'auto' }}
    onClick={handleMenuClick}>
      {profile.businessUnits?.length === 0
        ? businessUnits?.map(item => (
            <Menu.Item
              key={item.id}
              onClick={openDrawer}
              style={{ fontSize: '18px', display: 'flex', alignItems: 'end' }}
            >
              <BiUnite style={{ marginRight: '5px' }} />
              {item.name}
            </Menu.Item>
          ))
        : profile?.businessUnits?.map(item => (
            <Menu.Item
              key={item.id}
              onClick={openDrawer}
              style={{ fontSize: '18px', display: 'flex', alignItems: 'end' }}
            >
              <BiUnite style={{ marginRight: '5px' }} />
              {item.name}
            </Menu.Item>
          ))}
    </Menu>
  );
  return (
    <section>
      <Sidebar title="Struktur">
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
        <ProSidebarItem label="Bölmənin adı">
          <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          structuresSectionHandle('')
                        }
                    }} onSearch={structuresSectionHandle} />
        </ProSidebarItem>
        <ProSidebarItem label="Aid olan struktur">
          <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          structuresSearchHandle('')
                        }
                    }} onSearch={structuresSearchHandle} />
        </ProSidebarItem>
      </Sidebar>

      <StructureDrawer
        {...{ isDrawerOpen, closeDrawer, isEdit, editingStructureId }}
      />

      <section className="scrollbar aside">
        <div className="container">
          <NavigationButtons>
            <Col span={10} style={{ textAlign: 'right' }}>
              <Can I={accessTypes.manage} a={permissions.structure}>
                <ExcelButton
                  loading={isLoadingExport}
                  onClick={() =>
                    exportFileDownloadHandle(
                      'exportStructures',
                      `/structures/export`
                    )
                  }
                />{' '}
                {profile.businessUnits?.length > 1 ? (
                  <Dropdown className={styles.newDropdownBtn} overlay={menu}>
                    <NewButton
                      label="Yeni bölmə"
                      style={{ marginLeft: '10px' }}
                      icon={<AiOutlineDown style={{ marginLeft: '5px' }} />}
                    />
                  </Dropdown>
                ) : profile.businessUnits?.length === 1 ? (
                  <NewButton
                    label="Yeni bölmə"
                    onClick={openDrawer}
                    style={{ marginLeft: '10px' }}
                  />
                ) : businessUnits?.length === 1 ? (
                  <NewButton
                    label="Yeni bölmə"
                    onClick={openDrawer}
                    style={{ marginLeft: '10px' }}
                  />
                ) : (
                  <Dropdown className={styles.newDropdownBtn} overlay={menu}>
                    <NewButton
                      label="Yeni bölmə"
                      style={{ marginLeft: '10px' }}
                      icon={<AiOutlineDown style={{ marginLeft: '5px' }} />}
                    />
                  </Dropdown>
                )}
              </Can>
            </Col>
          </NavigationButtons>

          <SectionsTable openDrawer={openDrawer} />
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  isLoading: state.structureReducer.isLoading,
  isLoadingExport: !!state.loadings.exportStructures,
  structures: state.structureReducer.structures,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    structuresSectionHandle,
    structuresSearchHandle,
    exportFileDownloadHandle,
    fetchStructures,
    fetchBusinessUnitList,
  }
)(Structure);
