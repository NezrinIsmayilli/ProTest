/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { messages } from 'utils';
import { toast } from 'react-toastify';

// components
import { Modal, TimePicker, Row, Col, Input, Icon, Button, Form } from 'antd';
import { ProDatePicker, ProFormItem, ProMaskedInput } from 'components/Lib';

// actions
import { createInterview, resetInterview } from 'store/actions/jobs/interview';
import {
  fetchAnnouncements,
  resetAnnouncementsData,
} from 'store/actions/jobs/announcements';

// context
import { useFilters } from '../FiltersContext';

import styles from './styles.module.scss';

const { requiredText } = messages;
const rule = { required: true, message: requiredText };

function InterviewForm(props, ref) {
  const {
    visible,
    setIsVisible,
    // parent
    form,

    // redux data
    selectedAnnouncement,
    isLoading,

    // actions
    createInterview,
    fetchAnnouncements,
    resetAnnouncementsData,
    resetInterview,
  } = props;

  const { getFieldDecorator } = form;
  const { id } = selectedAnnouncement || {};
  const { filters } = useFilters();

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // expose drawer handling to the parent without extra rerender
  useImperativeHandle(ref, () => ({
    open: openDrawer,
    close: closeDrawer,
  }));

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function openDrawer() {
    setDrawerOpen(true);
  }

  function handleSubmit() {
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { meetAt, meetTime, address, phoneNumber } = values;

        const data = {
          meetAt: `${meetAt.format('YYYY-MM-DD')} ${meetAt.format('HH:mm:ss')}`, // '2019-10-26 16:00:00',
          address,
          phoneNumber,
        };

        createInterview(id, 'announcements', data, onSuccess);
      }
    });
  }

  function onSuccess() {
    closeDrawer();
    resetAnnouncementsData();
    fetchAnnouncements({ filters });
    form.resetFields();
    toast.success('Müsahibəyə dəvət göndərildi.', {
      className: 'success-toast',
    });
  }

  // close drawer if selected row changed
  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
      resetInterview();
      form.resetFields();
    }
  }, [selectedAnnouncement]);

  return (
    <Modal
      visible={visible}
      footer={null}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '32px 24px',
        }}
      >
        <div className={`${styles.tabContent} scrollbar`}>
          <Form>
            <p className={styles.title}>Müsahibənin vaxtını təyin edin</p>

            {/* Başlama */}
            <ProFormItem label="Başlama vaxtı">
              {getFieldDecorator('meetAt', {
                rules: [rule],
              })(
                <ProDatePicker
                  format="DD-MM-YYYY HH:mm:ss"
                  showTime={{ defaultValue: moment('HH:mm:ss') }}
                  style={{ width: '100%' }}
                  placeholder="vaxt seçin"
                  getPopupContainer={trigger => trigger.parentNode}
                />
              )}
            </ProFormItem>

            {/*  Ünvan */}
            <ProFormItem label="Ünvan">
              {getFieldDecorator('address', {
                rules: [rule],
              })(
                <Input
                  prefix={<Icon type="environment" />}
                  style={{ width: '100%' }}
                  placeholder="Baku, Azerbaijan"
                />
              )}
            </ProFormItem>

            {/* Əlaqə nömrəsi */}
            <ProFormItem label="Əlaqə nömrəsi">
              {getFieldDecorator('phoneNumber', {
                rules: [rule],
              })(
                <ProMaskedInput
                  style={{ height: 32 }}
                  mask="mobilePhoneMask"
                  placeholder="+(xxx) xx xxx xx xx"
                />
              )}
            </ProFormItem>
          </Form>
        </div>

        {/* action buttons */}
        <Button.Group size="large" className={styles.buttonGroup}>
          <Row>
            <Col>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                block
                loading={isLoading}
                onClick={handleSubmit}
              >
                Dəvət et
              </Button>
            </Col>
          </Row>
        </Button.Group>
      </div>
    </Modal>
  );
}

const EnhancedInterviewForm = Form.create({ name: 'interviewForm' })(
  forwardRef(InterviewForm)
);

const mapStateToProps = state => ({
  selectedAnnouncement: state.announcementsReducer.selectedAnnouncement,
  isLoading: !!state.loadings.createInterview,
});

export default connect(
  mapStateToProps,
  {
    createInterview,
    resetInterview,

    fetchAnnouncements,
    resetAnnouncementsData,
  },
  null,
  { forwardRef: true }
)(EnhancedInterviewForm);
