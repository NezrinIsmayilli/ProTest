/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

// components
import { Button, Spin, Col, Row } from 'antd';
import { ProWrapper } from 'components/Lib';

// utils
import { today, formItemSize, toastHelper } from 'utils';
import { history } from 'utils/history';

// actions
import {
  createTrainings,
  editTrainingById,
  fetchTrainingById,
} from 'store/actions/jobs/training';
import { createPayment } from 'store/actions/jobs/payment';
import { fetchDirectionsTrainings } from 'store/actions/jobs/parameters';

import TrainingsPermissionControl from 'containers/Jobs/Shared/TrainingsPermissionControl';
import MainForm from './MainForm';
import ContactForm from './ContactForm';

import styles from './trainingCreate.module.scss';

const returnUrl = '/recruitment/trainings';
const returnUrlPermission = '/recruitment';

function getNumber(value) {
  return value === null ? value : Number(value);
}
function getNumberMaxPrice(value) {
  return value ? Number(value) : null;
}

function sanitizeFields(values) {
  const sanitizeValues = {};

  Object.keys(values).forEach(key => {
    const value = values[key];
    sanitizeValues[key] = value !== undefined ? value : null;
  });

  const { hours, minPrice, maxPrice } = sanitizeValues;

  sanitizeValues.hours = getNumber(hours);
  sanitizeValues.minPrice = getNumber(minPrice);
  sanitizeValues.maxPrice = getNumberMaxPrice(maxPrice);

  return sanitizeValues;
}

function TrainingsCreate(props) {
  const {
    tenant,
    training,
    cities,
    stations,
    formats,
    languages,

    actionLoading,
    vacancyFetching,

    // actions
    createTrainings,
    editTrainingById,
    fetchTrainingById,
    fetchDirectionsTrainings,
    permissionsList,
  } = props;

  // EDIT: if trainingsId have, Edit mode is true
  const { id: trainingsId } = useParams();

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

    if (trainingsId) {
      editTrainingById(data, trainingsId, onSuccesCallback);
    } else {
      createTrainings(data, onErrorCallback, onSuccesCallback);
    }
  }
  // if user payment required error have, show payment modal
  function onErrorCallback({ error }) {
    return false;
  }

  // handling user page leave
  function handleCancel() {
    if (permissionsList.projobs_trainings.permission === 1) {
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

  function onSuccesCallback() {
    return toastHelper(
      history,
      returnUrl,
      `Təlim admin tərəfindən təsdiqləndikdən sonra dərc olunacaq.`
    );
  }

  // fetchTrainingById in EDIT
  useEffect(() => {
    if (trainingsId) {
      fetchTrainingById(trainingsId);
    }
  }, [trainingsId]);

  // setfields values
  useEffect(() => {
    if (trainingsId && training) {
      const {
        name,
        direction,
        category,
        hours,
        minPrice,
        maxPrice,
        certification,
        city,
        languages_ul,
        formats_ul,
        stations_ul,
        free,
        educator,
        description,
        address,
        email,
        phoneNumber,
      } = training;

      const categoryId = category?.id;
      const certificationId = certification ? 1 : 0;

      mainFormRef.current.form.setFieldsValue({
        name,
        direction: direction?.name,
        category: categoryId,
        hours,
        minPrice,
        maxPrice,
        certification: certificationId,
        city,
        languages_ul,
        formats_ul,
        stations_ul,
        free,
        educator,
        description,
      });

      contactFormRef.current.form.setFieldsValue({
        address,
        email,
        phoneNumber,
      });

      if (categoryId) {
        fetchDirectionsTrainings(categoryId, () => {
          mainFormRef.current.form.setFieldsValue({
            direction: direction?.id,
          });
        });
      }
    }
  }, [trainingsId, training]);

  useEffect(() => {
    if (trainingsId && training && cities.length > 0) {
      mainFormRef.current.form.setFieldsValue({
        city: training?.city?.id,
      });
    }
  }, [cities, training]);

  useEffect(() => {
    if (trainingsId && training && stations.length > 0) {
      const stationsId = training?.stations || [];

      mainFormRef.current.form.setFieldsValue({
        stations_ul: stationsId.map(station => station.id),
      });
    }
  }, [stations, training]);

  useEffect(() => {
    if (trainingsId && training && formats.length > 0) {
      const formatsId = training?.formats || [];

      mainFormRef.current.form.setFieldsValue({
        formats_ul: formatsId.map(format => format.id),
      });
    }
  }, [formats, training]);

  useEffect(() => {
    if (trainingsId && training && languages.length > 0) {
      const langsId = training?.languages || [];

      mainFormRef.current.form.setFieldsValue({
        languages_ul: langsId.map(lang => lang.id),
      });
    }
  }, [languages, training]);

  return (
    <ProWrapper>
      <section className="operationsWrapper">
        <div className={styles.containerFluid}>
          <TrainingsPermissionControl>
            <Row>
              <Col span={24} style={{ fontSize: '14px', fontWeight: '500' }}>
                <Link to="/recruitment/trainings">
                  <img
                    width={8}
                    height={13}
                    src="/img/icons/left-arrow.svg"
                    alt="trash"
                    className={styles.icon}
                    style={{ marginRight: '12px' }}
                  />
                  Təlimlər
                </Link>
              </Col>
            </Row>
          </TrainingsPermissionControl>
          <Spin spinning={vacancyFetching}>
            <div>
              <div className={styles.nameCode}>
                {trainingsId ? 'Redaktə et' : 'Yeni təlim'}
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
  training: state.trainingsReducer.training,
  cities: state.parametersReducer.cities,
  sectors: state.parametersReducer.sectors,
  formats: state.parametersReducer.formats,
  stations: state.parametersReducer.stations,
  languages: state.parametersReducer.languages,

  actionLoading:
    !!state.loadings.createTraining || !!state.loadings.editTrainingById,
  paymentLoading: !!state.loadings.createPayment,
  vacancyFetching: !!state.loadings.fetchTrainingById,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    createTrainings,
    createPayment,
    editTrainingById,
    fetchTrainingById,
    fetchDirectionsTrainings,
  }
)(TrainingsCreate);
