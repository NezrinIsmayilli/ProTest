/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { messages } from 'utils';
import { toast } from 'react-toastify';

// components
import {
  Modal,
  TimePicker,
  Row,
  Col,
  Input,
  Icon,
  Button,
  Form,
  Tag,
} from 'antd';
import { ProDatePicker, ProFormItem, ProMaskedInput } from 'components/Lib';

// actions
import {
  createInterview,
  editInterview,
  resetInterview,
  agreeInterview,
} from 'store/actions/jobs/interview';
import { fetchAppeals, resetAppealsData } from 'store/actions/jobs/appeals';

// context
import { useAppealsFilters } from '../../Sidebar/FiltersContext';

import styles from './styles.module.scss';

const { requiredText } = messages;
const rule = { required: true, message: requiredText };

const HeaderActionButtons = props => {
  const { date, fullName, agree, changeToEdit, agreeLoading } = props;
  return (
    <div className={styles.headerButtons}>
      <span>{date}</span>
      <h5>{fullName}</h5>
      <p>Müsahibə günü və vaxtına dəyişiklik etdi</p>
      <Row gutter={12}>
        <Col span={12}>
          <Button
            type="primary"
            shape="round"
            icon="check"
            block
            onClick={agree}
            loading={agreeLoading}
          >
            Təsdiqlə
          </Button>
        </Col>
        <Col span={12}>
          <Button type="link" shape="round" ghost block onClick={changeToEdit}>
            Dəyiş
          </Button>
        </Col>
      </Row>
    </div>
  );
};

// memoize calendar
const MemoCalendar = React.memo(props => {
  const { form, isDrawerOpen, meetAt, isDisabled } = props;

  return (
    <div className={`${styles.dateWrap} ${isDisabled ? styles.disabled : ''}`}>
      {form.getFieldDecorator('meetAt', {
        rules: [rule],
        initialValue: moment.utc(meetAt),
      })(
        <ProDatePicker
          disabledDate={current =>
            current && current < moment().subtract(1, 'day')
          }
          open={isDrawerOpen}
          dropdownClassName={styles.interviewdatePicker}
          getCalendarContainer={trigger => trigger.parentNode}
        />
      )}
    </div>
  );
});

function InterviewForm(props, ref) {
  const {
    visible,
    setIsVisible,
    // parent
    type,
    form,

    // redux data
    selectedAppeal,
    isLoading,
    interview,
    canInterviewChange,
    agreeLoading,

    // actions
    fetchAppeals,
    createInterview,
    resetAppealsData,
    resetInterview,
    editInterview,
    agreeInterview,
  } = props;

  const { getFieldDecorator, getFieldError } = form;

  const { id, typeId, type: appealType, person, createdAt } =
    selectedAppeal || {};

  const { name, surname } = person?.detail || {};
  const { filters } = useAppealsFilters();

  const scrollArea = useRef(null);

  const [state, setState] = useState({
    isDrawerOpen: false,
    isEdit: false,
  });

  const { isDrawerOpen, isEdit } = state;

  // expose drawer handling to the parent without extra rerender
  useImperativeHandle(ref, () => ({
    open: openDrawer,
    close: closeDrawer,
  }));

  function closeDrawer() {
    setState({
      isDrawerOpen: false,
      isEdit: false,
    });
    // reset div scroll position to top ux
    if (scrollArea.current && scrollArea.current.scrollTop) {
      scrollArea.current.scrollTop = 0;
    }
  }

  function openDrawer() {
    setState({
      ...state,
      isDrawerOpen: true,
    });
  }

  function handleSubmit() {
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { meetAt, meetTime, address, phoneNumber } = values;

        const data = {
          meetAt: `${meetAt.format('YYYY-MM-DD')} ${meetAt.format('HH:mm:ss')}`,
          address, // Süleyman Tağızadə D1',
          phoneNumber, // '+994555174849',
        };

        if (type === 'interview' || type === 'wait' || isEdit) {
          editInterview(typeId, data, onSuccess);
        } else {
          createInterview(id, 'appeals', data, onSuccess);
        }
      }
    });
  }

  function onSuccess() {
    closeDrawer();
    resetAppealsData();
    resetInterview();
    fetchAppeals({ filters, attribute: type });
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
  }, [selectedAppeal]);

  useEffect(() => {
    if (
      interview &&
      canInterviewChange &&
      (type === 'interview' || type === 'wait')
    ) {
      openDrawer();
    }
  }, [interview, canInterviewChange]);

  // check calendar form is disabled if interview date changed
  const isDisabled = type === 'new' && appealType === 'interview' && !isEdit;

  useEffect(() => {
    if (isDisabled) {
      openDrawer();
    }
  }, [id, appealType]);

  function changeToEdit() {
    setState({
      ...state,
      isEdit: true,
    });
  }

  function agree() {
    agreeInterview(typeId, onSuccess);
  }

  return (
    <Modal
      visible={visible}
      footer={null}
      width={400}
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
        <div className={`${styles.tabContent}`} ref={scrollArea}>
          {isDisabled && (
            <HeaderActionButtons
              date={moment(createdAt).format('DD-MM-YYYY')}
              fullName={`${name} ${surname}`}
              agree={agree}
              changeToEdit={changeToEdit}
              agreeLoading={agreeLoading}
            />
          )}

          <Form>
            {!isDisabled && (
              <p className={styles.title}>
                {type === 'wait' || type === 'interview'
                  ? 'Dəyiş'
                  : 'Müsahibənin vaxtını təyin edin'}
              </p>
            )}
            {type !== 'new' && (
              <Tag color="green">
                <Icon type="info-circle" />
                Müsahibənin vaxtı təyin edilib
              </Tag>
            )}
            {/* Calendar */}
            {/* <MemoCalendar
            isDrawerOpen={isDrawerOpen}
            form={form}
            meetAt={interview?.meetAt}
            isDisabled={isDisabled}
          />
          {!isDisabled && (
            <p className={styles.title}>Müsahibə vaxtını təyin edin</p>
          )} */}

            {/* meetAt: "2020-01-08T05:00:00+00:00" */}
            {/* Başlama vaxti */}
            <ProFormItem
              label="Başlama vaxtı"
              help={getFieldError('meetAt')?.[0]}
            >
              {getFieldDecorator('meetAt', {
                initialValue: interview?.meetAt
                  ? moment(moment.utc(interview?.meetAt), 'DD-MM-YYYY HH:mm:ss')
                  : undefined,
                rules: [rule],
              })(
                <ProDatePicker
                  format="DD-MM-YYYY HH:mm:ss"
                  showTime={{ defaultValue: moment('HH:mm:ss') }}
                  style={{ width: '100%' }}
                  placeholder="vaxt seçin"
                  disabled={isDisabled}
                  getPopupContainer={trigger => trigger.parentNode}
                />
              )}
            </ProFormItem>

            {/*  Ünvan */}
            <ProFormItem label="Ünvan" help={getFieldError('address')?.[0]}>
              {getFieldDecorator('address', {
                initialValue: interview?.address,
                rules: [rule],
              })(
                <Input
                  suffix={
                    <Icon
                      type="environment"
                      style={{ color: 'rgba(0, 0, 0, 0.25)' }}
                    />
                  }
                  style={{ width: '100%' }}
                  placeholder="Baku, Azerbaijan"
                  disabled={isDisabled}
                />
              )}
            </ProFormItem>

            {/* Əlaqə nömrəsi */}
            <ProFormItem
              label="Əlaqə nömrəsi"
              help={getFieldError('phoneNumber')?.[0]}
            >
              {getFieldDecorator('phoneNumber', {
                initialValue: interview?.phoneNumber,
                rules: [rule],
              })(
                <ProMaskedInput
                  style={{ height: 32 }}
                  mask="mobilePhoneMask"
                  disabled={isDisabled}
                  placeholder="+(xxx) xx xxx xx xx"
                />
              )}
            </ProFormItem>
          </Form>
        </div>

        {/* action buttons */}
        {!isDisabled && (
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
                  {type === 'wait' || type === 'interview'
                    ? 'Dəyiş'
                    : 'Dəvət et'}
                </Button>
              </Col>
            </Row>
          </Button.Group>
        )}
      </div>
    </Modal>
  );
}

const EnhancedInterviewForm = Form.create({ name: 'interviewForm' })(
  forwardRef(InterviewForm)
);

const mapStateToProps = state => ({
  selectedAppeal: state.appealsReducer.selectedAppeal,
  isLoading: !!state.loadings.createInterview || !!state.loadings.editInterview,
  agreeLoading: !!state.loadings.agreeInterview,
  interview: state.interviewReducer.interview,
  canInterviewChange: state.interviewReducer.canInterviewChange,
});

export default connect(
  mapStateToProps,
  {
    resetAppealsData,
    createInterview,
    fetchAppeals,
    resetInterview,
    editInterview,
    agreeInterview,
  },
  null,
  { forwardRef: true }
)(EnhancedInterviewForm);
