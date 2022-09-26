/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'antd';
import swal from '@sweetalert/with-react';
// actions
import {
  fetchApplyTypes,
  deleteApplyType,
  editApplyType,
  createApplyType,
} from 'store/actions/settings/applyTypes';
import { toast } from 'react-toastify';
import SubApplyType from './subApplyType';
import ApplyTypes from './applyType';
import { UpdateApplyModal } from './updateApplyType';

function ApplyType(props) {
  const { fetchApplyTypes, deleteApplyType, applyTypes } = props;

  const [subApplyTypes, setSubApplyTypes] = useState([]);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(undefined);
  const [editApplyTypeDefaults, setEditApplyTypeDefaults] = useState({});
  const [selectedItemId, setSelectedItemId] = useState(undefined);
  const [parentApplyTypeName, setParentApplyTypeName] = useState(undefined);
  const [applyTypeModalIsVisible, setApplyTypeModalIsVisible] = useState(false);
  const [applyTypeModalType, setApplyTypeModalType] = useState('');
  const [edit, setEdit] = useState('add');

  useEffect(() => {
    if (applyTypes.length <= 0) {
      fetchApplyTypes({});
    }
  }, []);
  useEffect(() => {
    if (selectedItemId)
      setSubApplyTypes(
        applyTypes.filter(applyType => applyType.id === selectedItemId)[0]
          ?.children
      );
  }, [applyTypes]);
  const handleNewApplyType = type => {
    setApplyTypeModalType(type);
    setApplyTypeModalIsVisible(true);
    setEdit('add');
  };
  const handleSelectRootCatalog = vals => {
    setSelectedItemId(vals.id);
    setParentApplyTypeName(vals.name);
    setSubApplyTypes(
      applyTypes.filter(applyType => applyType.id === vals.id)[0]?.children
    );
  };
  const onSuccessAddModal = () => {};
  const removeApplyType = applyId => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteApplyType(
          applyId,
          ({ data }) => {
            if (applyId === selectedItemId) setSelectedItemId(undefined);
            fetchApplyTypes();
          },
          ({ error }) => {
            if (
              error?.response?.data?.error?.type ===
              'appeal_type.delete.linked_children'
            ) {
              return toast.error('Bu müraciət növü silinə bilməz');
            }
          }
        );
      }
    });
  };
  const onUpdate = (id, data, type) => {
    setApplyTypeModalType(type);
    setEditApplyTypeDefaults({ ...data });
    setSelectedItemForUpdate(id);
    setEdit('edit');
    setApplyTypeModalIsVisible(true);
  };
  useEffect(() => {
    if (applyTypes?.length > 0) {
      const firstCatalog = applyTypes[0];
      setSubApplyTypes(
        applyTypes.filter(applyType => applyType.id === firstCatalog.id)[0]
          ?.children
      );
      setSelectedItemId(firstCatalog.id);
      setParentApplyTypeName(firstCatalog.name);
    }
  }, [applyTypes[0]?.id]);
  return (
    <>
      <UpdateApplyModal
        isVisible={applyTypeModalIsVisible}
        setIsVisible={setApplyTypeModalIsVisible}
        type={applyTypeModalType}
        parentApplyTypeId={selectedItemId}
        parentApplyTypeName={parentApplyTypeName}
        setParentApplyTypeName={setParentApplyTypeName}
        onSuccessAddModal={onSuccessAddModal}
        editApplyTypeDefaults={editApplyTypeDefaults}
        edit={edit}
        selectedItemForUpdate={selectedItemForUpdate}
      />
      <section style={{ padding: '10px' }}>
        <Row gutter={8}>
          <Col md={12}>
            <ApplyTypes
              deleteClick={removeApplyType}
              editClick={onUpdate}
              altClick={() => handleNewApplyType('catalog')}
              selectItem={handleSelectRootCatalog}
              {...{
                selectedItemId,
              }}
            />
          </Col>
          <Col md={12}>
            <SubApplyType
              deleteClick={removeApplyType}
              editClick={onUpdate}
              disabledCreate={selectedItemId === undefined}
              altClick={() => handleNewApplyType('sub-catalog')}
              items={subApplyTypes}
              {...{
                selectedItemId,
                parentApplyTypeName,
              }}
            />
          </Col>
        </Row>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  applyTypes: state.applyTypesReducer.applyTypes,
});

export default connect(
  mapStateToProps,
  {
    fetchApplyTypes,
    deleteApplyType,
    editApplyType,
    createApplyType,
  }
)(ApplyType);
