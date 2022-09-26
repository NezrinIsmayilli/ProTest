/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'react-redux';
import { Button, Form, Modal,Input } from 'antd';
import { ProFormItem, ProSelect } from 'components/Lib';
import { mediumTextMaxRule, minLengthRule, requiredRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from '../../styles.module.scss';
import {
  createProductPriceTypes,
} from 'store/actions/settings/mehsul';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
const AddProItemType = props => {
  const {
    form,
    isVisible,
    SettypeVisible,
    createProductPriceTypes,
    selectData,
    SetAddedType,
    isLoading,
    productPriceTypes,
    actionLoading
  } = props;
  const { getFieldDecorator, getFieldError, validateFields,setFieldsValue } = form;
  const {
    inputChangeHandle,
    handleSubmit,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle('AddproductPriceType', createProductPriceTypes);

 
  const completeOperation=(event)=>{
    event.preventDefault();
   validateFields((errors, values) => {
    if (!errors) {
      handleSubmit(event);
        const {
          priceType
        } = values;
        SetAddedType(priceType);
    }
});
  }
  return (
    <Modal
      visible={isVisible}
      onCancel={() => SettypeVisible(false)}
      closable={false}
      width={450}
      footer={null}
      className={styles.customModal}
      destroyOnClose
      confirmLoading
      // maskClosable={false}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => SettypeVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.demoModal}>
        <div style={{ marginBottom: '20px' }}>
          <span className={styles.header}>Yeni qiymət tipi</span>
        </div>
        <Form   onSubmit={(event)=>completeOperation(event)} >
        
          <ProFormItem
            label="Qiymət tipi"
            help={getFieldError('priceType')?.[0]}
            customStyle={styles.formItem}
            
          >
            {getFieldDecorator('priceType', {
              rules: [requiredRule,
                      minLengthRule,
                      {
                        max:15,
                        message:"15 simvoldan çox olmamalıdır."
                      }],
            })(
              <Input
                  size="large"
                  onKeyUp={onKeyUp}
                  ref={inputRef}
                  onChange={inputChangeHandle}
                  className={styles.select}
                  placeholder="Yazın"
              />
          )}
             
          </ProFormItem>
          
          <Button
            size="large"
            className={styles.button}
            style={{ width: '100%', marginTop: 'unset' }}
            htmlType="submit"
            loading={actionLoading}
           
          >
            {'Əlavə et'}
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  productPriceTypes: state.mehsulReducer.productPriceTypes,
  actionLoading: state.productReducer.actionLoading,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(mapStateToProps,
  {
    createProductPriceTypes,
  })(
  Form.create({ name: 'AddProItemType' })(AddProItemType)
);
