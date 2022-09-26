/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

// components
import { Button, Spin, Icon, Modal, Radio, Col, Row } from 'antd';
import { ProWrapper, ProWarningModal } from 'components/Lib';

// icons
import { IoIosClose } from 'react-icons/io';
import { ReactComponent as PaymentIcon } from 'assets/img/icons/payment.svg';

// utils
import { today, formItemSize, toastHelper } from 'utils';
import { history } from 'utils/history';

// actions
import {
  createVacancies,
  editVacancyById,
  fetchVacancyById,
} from 'store/actions/jobs/vacancies';
import { createPayment } from 'store/actions/jobs/payment';
import {
  // fetchCities,
  // fetchCategories,
  fetchPositions,
  // fetchCurrencies,
  // fetchLanguages,
} from 'store/actions/jobs/parameters';

import VacancyPermissionControl from 'containers/Jobs/Shared/VacancyPermissionControl';
import MainForm from './MainForm';
import ContactForm from './ContactForm';

import styles from './vacancyCreate.module.scss';

const returnUrl = '/recruitment/vacancies';
const returnUrlPermission = '/recruitment';

function getNumber(value) {
  return value === null ? value : Number(value);
}

function sanitizeFields(values) {
  const sanitizeValues = {};

  Object.keys(values).forEach(key => {
    const value = values[key];
    sanitizeValues[key] = value !== undefined ? value : null;
  });

  const {
    fromAge,
    toAge,
    minExperience,
    maxExperience,
    minSalary,
    maxSalary,
  } = sanitizeValues;

  sanitizeValues.fromAge = getNumber(fromAge);
  sanitizeValues.toAge = getNumber(toAge);
  sanitizeValues.minExperience = getNumber(minExperience);
  sanitizeValues.maxExperience = getNumber(maxExperience);
  sanitizeValues.minSalary = getNumber(minSalary);
  sanitizeValues.maxSalary = getNumber(maxSalary);

  sanitizeValues.experience = null;

  return sanitizeValues;
}

function VacancyCreate(props) {
  const {
    tenant,
    profile,
    vacancy,
    cities,
    sectors,
    languages,

    actionLoading,
    paymentLoading,
    vacancyFetching,

    // actions
    createPayment,
    createVacancies,
    editVacancyById,
    fetchVacancyById,
    fetchPositions,
    permissionsList,
  } = props;

  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCardType, setPaymentCardType] = useState('v');
  const [paymentStatus, setPaymentStatus] = useState(false);

  // EDIT: if vacancyId have, Edit mode is true
  const { id: vacancyId } = useParams();

  const mainFormRef = useRef(null);
  const contactFormRef = useRef(null);

  async function handleSubmit() {
    const [mainForm, contactForm] = await Promise.all([
      mainFormRef.current.form.validateFieldsAndScroll(),
      contactFormRef.current.form.validateFields(),
    ]);

    // delete category key
    const { category, ...copyMainFormData } = mainForm;

    const data = {
      ...sanitizeFields(copyMainFormData),
      ...contactForm,
    };

    if (vacancyId) {
      editVacancyById(data, vacancyId, onSuccesCallback);
    } else {
      createVacancies(data, onErrorCallback, onSuccesCallback);
    }
  }

  // handling user page leave
  function handleCancel() {
    if (
      mainFormRef.current.form.isFieldsTouched() ||
      contactFormRef.current.form.isFieldsTouched()
    ) {
      setCancelModalOpen(true);
    } else if (permissionsList.projobs_vacancies.permission === 1) {
      leavePage();
    } else {
      leavePagePermission();
    }
  }

  function leavePage() {
    history.replace(returnUrl);
  }
  function leavePagePermission() {
    history.replace(returnUrlPermission);
  }

  // if user payment required error have, show payment modal
  function onErrorCallback({ error }) {
    setPaymentStatus(false);

    // payment feature deactivated until accepted again not delete
    // if (error?.response?.data?.error?.code === 402) {
    //   setPaymentModalOpen(true);
    // }
  }

  function onSuccesCallback() {
    return toastHelper(
      history,
      returnUrl,
      `Vakansiya admin tərəfindən təsdiqləndikdən sonra dərc olunacaq.`
    );
  }

  function cancelPayment() {
    setPaymentModalOpen(false);
  }

  function handlePayment() {
    createPayment(paymentCardType, data => {
      setPaymentStatus(true);

      // sometimes new popup window blocked by browser due to it was opened by ajax call result
      const otherWindow = window.open(data.redirectUrl, '_blank');
      otherWindow.opener = null;
    });
  }

  // fetchVacancyById in EDIT
  useEffect(() => {
    if (vacancyId) {
      fetchVacancyById(vacancyId);
    }
  }, [vacancyId]);

  // setfields values
  useEffect(() => {
    if (vacancyId && vacancy) {
      const {
        companyName,
        name,
        fromAge,
        toAge,
        education,
        description,
        website,
        requirements,
        minExperience,
        maxExperience,
        position,
        gender,
        minSalary,
        maxSalary,
        familyStatus,
        currency,
        workGraphic,
        email,
        phoneNumber,
        category,
      } = vacancy;

      const categoryId = category?.id;

      mainFormRef.current.form.setFieldsValue({
        name,
        companyName,
        fromAge,
        toAge,
        description,
        requirements,
        minSalary,
        maxSalary,
        gender,
        minExperience,
        maxExperience,
        familyStatus,
        education: education?.id,
        workGraphic: workGraphic?.id,
        category: categoryId,
        currency: currency?.id,
      });

      contactFormRef.current.form.setFieldsValue({
        website,
        email,
        phoneNumber,
      });

      if (categoryId) {
        fetchPositions(categoryId, () => {
          mainFormRef.current.form.setFieldsValue({
            position: position?.id,
          });
        });
      }
    }
  }, [vacancyId, vacancy]);

  useEffect(() => {
    if (vacancyId && vacancy && cities.length > 0) {
      mainFormRef.current.form.setFieldsValue({
        city: vacancy?.city?.id,
      });
    }
  }, [cities, vacancy]);

  useEffect(() => {
    if (vacancyId && vacancy && sectors.length > 0) {
      mainFormRef.current.form.setFieldsValue({
        sector: vacancy?.sector?.id,
      });
    }
  }, [sectors, vacancy]);

  useEffect(() => {
    if (vacancyId && vacancy && languages.length > 0) {
      const langsId = vacancy?.languages || [];

      mainFormRef.current.form.setFieldsValue({
        languages_ul: langsId.map(lang => lang.id),
      });
    }
  }, [languages, vacancy]);

  // set initial default values for UX
  useEffect(() => {
    if (!vacancyId) {
      mainFormRef.current.form.setFieldsValue({
        companyName: tenant.name,
      });

      contactFormRef.current.form.setFieldsValue({
        email: profile.email,
      });
    }
  }, [tenant, profile, vacancyId]);

  return (
    <ProWrapper>
      {/* modal for leaving page */}
      <ProWarningModal
        open={isCancelModalOpen}
        titleIcon={<Icon type="warning" />}
        okFunc={leavePage}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* payment modal */}
      <Modal
        title={<PaymentIcon />}
        visible={isPaymentModalOpen}
        wrapClassName={styles.deleteModal}
        centered
        closeIcon={<IoIosClose className={styles.closeIcon} />}
        maskClosable
        mask
        width={484}
        footer={null}
        onCancel={cancelPayment}
      >
        <h3 className={styles.title}>Ödəniş</h3>
        <div className={styles.desc}>
          <p>
            Bir elan üçün ödəniş <strong> 20 AZN </strong> təşkil edir. Elanın
            qüvvədə qalma müddəti <strong>30 gündür</strong>.
          </p>
          <Radio.Group
            onChange={e => setPaymentCardType(e.target.value)}
            value={paymentCardType}
          >
            <Radio value="v">Visa</Radio>
            <Radio value="m">Master Card</Radio>
          </Radio.Group>
        </div>

        <div className={styles.modalButtons}>
          <Button
            type="button"
            className={styles.payButton}
            loading={actionLoading || paymentLoading}
            onClick={paymentStatus ? handleSubmit : handlePayment}
          >
            {paymentStatus ? 'Dərc et' : 'Davam et'}
          </Button>

          <Button
            type="button"
            className={styles.cancelButton}
            onClick={cancelPayment}
          >
            Geri
          </Button>
        </div>
      </Modal>

      <section className="operationsWrapper">
        <div className={styles.containerFluid}>
          <VacancyPermissionControl>
            <Row>
              <Col span={24} style={{ fontSize: '14px', fontWeight: '500' }}>
                <Link to="/recruitment/vacancies">
                  <img
                    width={8}
                    height={13}
                    src="/img/icons/left-arrow.svg"
                    alt="trash"
                    className={styles.icon}
                    style={{ marginRight: '12px' }}
                  />
                  Vakansiyalar
                </Link>
              </Col>
            </Row>
          </VacancyPermissionControl>

          <Spin spinning={vacancyFetching}>
            <div>
              <div className={styles.nameCode}>
                {vacancyId ? 'Redaktə et' : 'Yeni vakansiya'}
                <div className={styles.nameAndDate}>
                  <span className={styles.date}>{today}</span>
                  <span className={styles.dot}>&bull;</span>
                  <span className={styles.userName}>{tenant.name || ''}</span>
                </div>
              </div>

              {/* 1. Əsas */}
              <MainForm wrappedComponentRef={mainFormRef} />

              {/* 2. Əlaqə */}
              <ContactForm wrappedComponentRef={contactFormRef} />

              {/* action buttons */}
              <div className={styles.actionBtns}>
                <Button
                  loading={actionLoading}
                  disabled={false}
                  type="primary"
                  size={formItemSize}
                  onClick={handleSubmit}
                >
                  Dərc et
                </Button>
                <Button
                  style={{
                    marginLeft: 10,
                  }}
                  size={formItemSize}
                  onClick={handleCancel}
                >
                  İmtina
                </Button>
              </div>
            </div>
          </Spin>
        </div>
      </section>
    </ProWrapper>
  );
}

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
  vacancy: state.vacanciesReducer.vacancy,
  cities: state.parametersReducer.cities,
  sectors: state.parametersReducer.sectors,
  languages: state.parametersReducer.languages,

  actionLoading:
    !!state.loadings.createVacancy || !!state.loadings.editVacancyById,
  paymentLoading: !!state.loadings.createPayment,
  vacancyFetching: !!state.loadings.fetchVacancyById,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    createVacancies,
    createPayment,
    editVacancyById,
    fetchVacancyById,
    fetchPositions,
  }
)(VacancyCreate);
