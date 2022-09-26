import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Form } from 'antd';
import { ProFormItem, AddButton, ProModal } from 'components/Lib';
import { createCatalog } from 'store/actions/catalog';
import {
  createUnitOfMeasurements,
  fetchUnitOfMeasurements,
} from 'store/actions/settings/mehsul';
import { requiredRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from '../../styles.module.scss';

const AddMeasurement = props => {
  const {
    form,
    fromSales = false,
    isVisible,
    setIsVisible,
    createUnitOfMeasurements,
    fetchUnitOfMeasurements,
    actionLoading,
    setMainFormValues,
    fetchMeasurements,
    fetchMeasurementsAdded,
    onSuccessAddMeasurementModal
  } = props;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    resetFields,
    setFields,
    getFieldValue,
  } = form;

  useEffect(() => {
    if (isVisible) {
      resetFields();
    }
  }, [isVisible]);
  const addCatalog = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { name, keyword } = values;
        createUnitOfMeasurements(
          name,
          keyword,
          ({ data }) => {
            toast.success('Əməliyyat uğurla tamamlandı.');
            setIsVisible(false);
            if (fromSales) {
              fetchMeasurementsAdded(data.id)
            }
            else {
              fetchUnitOfMeasurements();
            }
            setMainFormValues({ measurement: data.id });
            onSuccessAddMeasurementModal(data)
            resetFields();
          },
          ({ error }) => {
            let messageKey = error?.response?.data?.error?.message;

            if (messageKey === 'This unit of measurement is already exists.') {
              setFields({
                name: {
                  value: getFieldValue('name'),
                  errors: ['Bu ölçü vahidi artıq əlavə edilmişdir.'],
                },
              });
            } else if (
              messageKey === 'This unit of measurement key is already exists.'
            ) {
              setFields({
                keyword: {
                  value: getFieldValue('keyword'),
                  errors: ['Bu açar söz artıq əlavə edilmişdir.'],
                },
              });
            }
          }
        );
      }
    });
  };
  return (
    <ProModal
      maskClosable
      padding
      centered
      width={600}
      isVisible={isVisible}
      handleModal={() => setIsVisible(false)}
    >
      <h2>Yeni ölçü vahidi</h2>
      <Form onSubmit={event => addCatalog(event)}>
        <ProFormItem
          label="Ölçü vahidinin adı"
          customStyle={styles.formItem}
          help={getFieldError('name')?.[0]}
          style={{ height: '80px' }}
        >
          {getFieldDecorator('name', {
            rules: [requiredRule],
          })(<Input size="large" placeholder="Yazın" maxLength={15} />)}
        </ProFormItem>
        <ProFormItem
          label="Açar söz"
          customStyle={styles.formItem}
          help={getFieldError('keyword')?.[0]}
          style={{ height: '80px' }}
        >
          {getFieldDecorator('keyword', {
            rules: [requiredRule],
          })(<Input size="large" placeholder="Yazın"  maxLength={25}/>)}
        </ProFormItem>
        <AddButton
          label="Ölçü vahidi əlavə et"
          loading={actionLoading}
          htmlType="submit"
        />
      </Form>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.mehsulReducer.isLoading,
  actionLoading: state.mehsulReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    createCatalog,
    createUnitOfMeasurements,
    fetchUnitOfMeasurements,
  }
)(Form.create({ name: 'MeasurementForm' })(AddMeasurement));
