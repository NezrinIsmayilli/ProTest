/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, Spin, Row, Col, InputNumber, Checkbox } from 'antd';
import {
  ProFormItem,
  ProSelect,
  ProModal,
  ProButton,
  ProInput,
  ProDatePicker,
  ProTextArea,
} from 'components/Lib';
import { createTask, editTask, fetchTasks } from 'store/actions/tasks';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import { toast } from 'react-toastify';
import moment from 'moment';
import { fullDateTimeWithSecond } from 'utils';

// responsiblePerson
// taskTitle
// taskDescription
// taskDate
// taskType

const AddMembers = props => {
  const {
    form,
    type,
    task,
    taskTypes,
    members,
    users,
    visible,
    handleModal,
    onMemberChange,
    data,
    onConfirm,
    loadings,
  } = props;
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    resetFields,
  } = form;

  const { submittingModal } = loadings;

  const [isTaskUrgent, setIsTaskUrgent] = useState(false);

  const handleWarehouseFormSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { projectMembers } = values;
        onConfirm(projectMembers);
      }
    });
  };

  useEffect(() => {
    setFieldsValue({
      projectMembers: members,
    });
  }, [members]);
  return (
    <ProModal
      isVisible={visible}
      padding
      centered
      width={600}
      handleModal={handleModal}
      destroyOnClose
    >
      <div>
        <Spin spinning={false}>
          <div style={{ marginBottom: '20px' }}>
            <h2>Üzv əlavə et</h2>
          </div>
          <Form onSubmit={handleWarehouseFormSubmit} noValidate>
            <ProFormItem
              label="Məsul şəxs"
              name="projectMembers"
              autoHeight
              help={getFieldError('projectMembers')?.[0]}
            >
              {getFieldDecorator('projectMembers', {
                rules: [requiredRule],
              })(
                <ProSelect
                  data={data}
                  mode="multiple"
                  keys={['name', 'lastName']}
                />
              )}
            </ProFormItem>

            <ProButton size="large" htmlType="submit" loading={submittingModal}>
              Təsdiq et
            </ProButton>
          </Form>
        </Spin>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  { createTask, editTask, fetchTasks }
)(Form.create({ name: 'AddMembers' })(AddMembers));
