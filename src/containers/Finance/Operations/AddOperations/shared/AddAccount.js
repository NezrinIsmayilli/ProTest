/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Modal,Input } from 'antd';
import { ProFormItem } from 'components/Lib';
import {minLengthRule, requiredRule } from 'utils/rules';

import styles from '../styles.module.scss';
import {
  createCashboxNames
} from 'store/actions/settings/kassa';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
const AddAccount = props => {
  const {
    form,
    accountVisible,
    SetaccountVisible,
    Account,
    createCashboxNames,
    SetAddedAccount,
    isLoading,
    actionLoading,
   
    activeTab
  } = props;
  const { getFieldDecorator, getFieldError, validateFields,setFieldsValue } = form;
  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    inputRef,
    onKeyUp,
} = useToggledInputHandle(activeTab, (index, name) =>
    createCashboxNames(index, name, activeTab)
);

 const [account,SetAccount]=useState(null)
  const completeOperation=(event)=>{
    event.preventDefault();
   validateFields((errors, values) => {
    if (!errors) {
      handleSubmit(event);
        const {
          AddedAccount
        } = values;
        
          SetAccount(AddedAccount);
        
       
    }
});
  }

  useEffect(()=>{
    if(!isLoading&&!Account.find(person=>person.name==account)){
      SetAddedAccount(account);
    }
  },[isLoading])
  return (
    <Modal
      visible={accountVisible}
      onCancel={() => SetaccountVisible(false)}
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
        onClick={() => SetaccountVisible(false)}
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
          <span className={styles.header}>Yeni hesab</span>
        </div>
        <Form   onSubmit={(event)=>completeOperation(event)} autoComplete='off' >
        
          <ProFormItem
            label="Hesab"
            help={getFieldError('AddedAccount')?.[0]}
            customStyle={styles.formItem}
            
          >
            {getFieldDecorator('AddedAccount', {
              rules: [requiredRule,
                      minLengthRule,
                      {
                        max:50,
                        message:"50 simvoldan çox olmamalıdır."
                      }],
            })(
              <Input
                  size="large"
                  value={value}
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
            className={styles.sumbitBtn}
            style={{ width: '100%', color:'#fff', marginTop: 'unset',backgroundColor:'#55ab80' }}
            htmlType="submit"
            loading={isLoading}
           
          >
            {'Əlavə et'}
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.kassaReducer.isLoading,
});

export default connect(mapStateToProps,
  {
    createCashboxNames,
  })(
  Form.create({ name: 'AddAccount' })(AddAccount)
);
