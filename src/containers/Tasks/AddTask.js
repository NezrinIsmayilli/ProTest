/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, Spin, Row, Col, InputNumber, Checkbox, Select } from 'antd';
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
import { VscCircleFilled } from 'react-icons/vsc';
import moment from 'moment';
import styles from './styles.module.scss';

// responsiblePerson
// taskTitle
// taskDescription
// taskDate
// taskType

const AddTask = props => {
  const {
    form,
    type,
    task,
    taskTypes,
    users,
    profile,
    visible,
    handleModal,
    createTask,
    editTask,
    fetchTasks,
    projects,
  } = props;
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    getFieldValue,
    setFieldsValue,
    resetFields,
  } = form;

  const handleTaskPriority = value => {
    if (value && !getFieldValue('taskDate')) {
      setFieldsValue({
        taskDate: moment(),
      });
    }
  };
  const handleWarehouseFormSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const {
          responsiblePerson,
          taskTitle,
          taskDescription,
          isUrgent,
          taskProject,
          taskDate,
          taskType,
        } = values;

        const newTask = {
          status: taskType,
          title: taskTitle,
          taskExecutors_ul: responsiblePerson || null,
          description: taskDescription || '',
          priority: isUrgent ? 1 : 0,
          deadlineAt: taskDate ? taskDate.format('YYYY-MM-DD HH:mm:ss') : '',
          willProgressAt: '',
          project: taskProject || '',
          attachment: '',
        };
        if (task) {
          return editTask({
            id: task.id,
            data: newTask,
            callback: () => {
              toast.success('Tap????r??q u??urla yenil??ndi.');
              fetchTasks({ type });
              handleModal();
            },
          });
        }
        return createTask({
          data: newTask,
          callback: () => {
            toast.success('Tap????r??q u??urla yarad??ld??.');
            fetchTasks({ type });
            handleModal();
          },
        });
      }
    });
  };

  useEffect(() => {
    if (!visible) {
      resetFields();
      setFieldsValue({
        taskType: 1,
        responsiblePerson: profile.id,
      });
    } else {
      if (task) {
        const {
          deadlineAt,
          description,
          priority,
          status,
          projectId,
          toTenantPersonId,
          title,
        } = task;
        setFieldsValue({
          responsiblePerson: toTenantPersonId,
          taskTitle: title,
          taskProject: projectId,
          taskDescription: description,
          isUrgent: priority ? 1 : undefined,
          taskDate: deadlineAt
            ? moment(deadlineAt, 'YYYY-MM-DD HH:mm:ss')
            : undefined,
          taskType: status || 0,
        });
      } else {
        setFieldsValue({
          taskType: 1,
        });
      }
    }
  }, [visible]);
  return (
    <ProModal
      isVisible={visible}
      padding
      centered
      width={600}
      handleModal={handleModal}
      destroyOnClose
    >
      <div className={styles.WarehouseModal}>
        <Spin spinning={false}>
          <div style={{ marginBottom: '20px' }}>
            <h2>{task ? 'D??z??li?? et' : 'Yeni Tap????r??q'}</h2>
          </div>
          <Form
            onSubmit={handleWarehouseFormSubmit}
            className={styles.form}
            noValidate
          >
            <ProFormItem
              label="??cra???? ????xs"
              name="responsiblePerson"
              help={getFieldError('responsiblePerson')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('responsiblePerson', {
                rules: [requiredRule],
              })(
                <ProSelect
                  data={[
                    { ...profile, lastName: profile.lastname },
                    ...users.filter(user => user?.id !== profile?.id),
                  ].map(user =>
                    user.id === profile?.id
                      ? { ...user, lastName: `${user?.lastName} (M??n)` }
                      : user
                  )}
                  mode="multiple"
                  keys={['name', 'lastName']}
                />
              )}
            </ProFormItem>

            <ProFormItem
              label="Ba??l??q"
              name="taskTitle"
              help={getFieldError('taskTitle')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('taskTitle', {
                rules: [requiredRule, minLengthRule, shortTextMaxRule],
              })(
                <ProInput
                  size="large"
                  className={styles.select}
                  placeholder="Yaz??n"
                />
              )}
            </ProFormItem>
            <ProFormItem
              label="??trafl??"
              autoHeight
              name="taskDescription"
              help={getFieldError('taskDescription')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('taskDescription', {
                rules: [],
              })(
                <ProTextArea
                  size="large"
                  maxLength={256}
                  className={styles.select}
                  placeholder="Yaz??n"
                />
              )}
            </ProFormItem>
            <ProFormItem
              label="Layih??"
              name="taskProject"
              help={getFieldError('taskProject')?.[0]}
              customStyle={styles.formItem}
            >
              {getFieldDecorator('taskProject', {
                rules: [],
              })(<ProSelect data={projects} />)}
            </ProFormItem>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ProFormItem
                label="Son icra tarixi"
                name="taskDate"
                help={getFieldError('taskDate')?.[0]}
                customStyle={styles.formItem}
                style={{ width: '80%' }}
              >
                {getFieldDecorator('taskDate', {
                  rules: [],
                })(
                  <ProDatePicker
                    size="large"
                    format="DD-MM-YYYY HH:mm:ss"
                    allowClear
                    showTime
                  />
                )}
              </ProFormItem>
              <ProFormItem
                label="T??cili"
                name="isUrgent"
                style={{ width: '18%' }}
                help={getFieldError('isUrgent')?.[0]}
                customStyle={styles.formItem}
              >
                {getFieldDecorator('isUrgent', {
                  getValueFromEvent: value => {
                    handleTaskPriority(value);
                    return value;
                  },
                  rules: [],
                })(
                  <Select
                    showArrow={false}
                    size="large"
                    allowClear
                    className={styles.urgent}
                    getPopupContainer={trigger => trigger.parentNode}
                  >
                    <Select.Option
                      value={1}
                      className={styles.isUrgent}
                      key={1}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VscCircleFilled
                          fill="red"
                          width={10}
                          height={10}
                          style={{ marginRight: '5px' }}
                        />{' '}
                        T??cili
                      </div>
                    </Select.Option>
                  </Select>
                )}
              </ProFormItem>
            </div>
            <ProFormItem
              label="Status"
              name="taskType"
              help={getFieldError('taskType')?.[0]}
            >
              {getFieldDecorator('taskType', {
                rules: [],
              })(<ProSelect data={taskTypes} />)}
            </ProFormItem>
            <ProButton size="large" className={styles.button} htmlType="submit">
              {task ? 'D??z??li?? et' : '??lav?? et'}
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
)(Form.create({ name: 'UpdateTask' })(AddTask));
