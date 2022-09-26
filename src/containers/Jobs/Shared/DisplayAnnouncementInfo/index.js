import React, { Fragment } from 'react';
import moment from 'moment';

// components
import { Icon, Divider } from 'antd';

// utils
import { GenderStatus, WorkGraphicStatus, messages } from 'utils';

import { ProCollapse, ProPanel } from 'components/Lib';
import { CustomerTypeDetail } from 'containers/Jobs/Announcements/CustomerTypeDetail';
import Detail from './detail';
import styles from './styles.module.scss';

const { notDefined } = messages;

function formatDate(date) {
  return date ? moment(date).format('DD.MM.YYYY') : '';
}

const renderDateInfo = (startDate, endDate, onGoing) => (
  <Fragment>
    <h6>{`${formatDate(startDate)}`}</h6>
    <h6>{`${onGoing ? 'davam edir' : formatDate(endDate)}`}</h6>
  </Fragment>
);

function getEducationsInfo(educations) {
  return () => {
    const educationList = educations.map((education, i, arr) => {
      const {
        educationalInstitution,
        profession,
        startDate,
        endDate,
        degree,
        onGoing,
      } = education || {};

      return (
        <Fragment key={i}>
          <div>{educationalInstitution}</div>
          <div>
            {profession}, {degree?.name}
          </div>
          {renderDateInfo(startDate, endDate, onGoing)}

          {/* divider */}
          {i < arr.length - 1 && <Divider className={styles.divider} />}
        </Fragment>
      );
    });

    return educationList.length > 0 ? educationList : notDefined;
  };
}

function getExperiencesInfo(experiences) {
  return () => {
    const experienceList = experiences.map((item, i, arr) => {
      const { organization, startDate, endDate, notes, onGoing } = item || {};

      return (
        <Fragment key={i}>
          <div>{organization}</div>
          {renderDateInfo(startDate, endDate, onGoing)}
          <div> {notes} </div>
          {/* divider */}
          {i < arr.length - 1 && <Divider className={styles.divider} />}
        </Fragment>
      );
    });

    return experienceList.length > 0 ? experienceList : notDefined;
  };
}

export default function DisplayAnnouncementInfo(props) {
  const { announcement } = props;
  const {
    name = '',
    surname = '',
    gender = '',
    birthDate = '',
    birthCity = '',
    address = '',
    apartment = '',
    image = '',
    mobileNumber = '',
    phoneNumber = '',

    skype = '',
    facebook = '',
    linkedin = '',

    educations = [],
    experiences = [],
    languages = [],

    note = '',
    email = '',
    minAndMaxSalary = '',
    minSalary = '',
    maxSalary = '',
    currency = '',
    workGraphic = '',
    announcementName = '',
    createdAt = '',
    city = '',
    position = '',
  } = announcement || {};

  const languagesDegress = ['Ana dili', 'Yaxşı', 'Orta', 'Kafi'];
  return (
    <div className={styles.detailsList}>
      {/* personal infos */}
      <Detail primary="Cins" secondary={GenderStatus?.[gender] || '-'} />
      <Detail primary="Yaşadığı şəhər" secondary={city?.name || '-'} />
      <Detail primary="Ünvan" secondary={address}>
        {apartment}
      </Detail>
      <Detail primary="Doğulduğu yer" secondary={birthCity || '-'} />
      <Detail
        primary="Doğulduğu tarixi"
        secondary={formatDate(birthDate) || '-'}
      />
      <Detail
        primary="Yaş"
        secondary={moment().diff(moment(birthDate), 'years') || '-'}
      />
      <Detail
        primary="Əmək haqqı"
        secondary={` ${minSalary || ''}${' '}
        ${!minSalary && !maxSalary ? '-' : !maxSalary ? ' ' : '-'}${' '}
        ${maxSalary || ''}${' '}
        ${
          minSalary && maxSalary && currency
            ? currency.name
            : !minSalary && !maxSalary
            ? ''
            : 'AZN'
        }`}
      />

      <Detail
        primary="İş qrafiki"
        secondary={
          WorkGraphicStatus[(workGraphic?.id)]
            ? WorkGraphicStatus[(workGraphic?.id)]
            : '-'
        }
      />

      {educations.length > 0 ? (
        <ProCollapse defaultActiveKey="2">
          <ProPanel header="Təhsil" key="2">
            {educations.map(
              ({
                educationalInstitution,
                profession,
                startDate,
                endDate,
                onGoing,
                degree,
              }) => (
                <CustomerTypeDetail
                  date={
                    <div
                      className={styles.expYears}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {startDate !== null && startDate !== ''
                        ? moment(startDate).format('MMM YYYY')
                        : ''}{' '}
                      -{' '}
                      {onGoing ? (
                        <span style={{ textTransform: 'none' }}>
                          Davam edir
                        </span>
                      ) : endDate !== null && endDate !== '' ? (
                        moment(endDate).format('MMM YYYY')
                      ) : (
                        '-'
                      )}
                    </div>
                  }
                  secondary={`${educationalInstitution}${' / '}${profession}`}
                  text={degree?.name}
                />
              )
            )}
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Təhsil" secondary="-" />
      )}

      {experiences.length > 0 ? (
        <ProCollapse defaultActiveKey="3">
          <ProPanel header="İş təcrübəsi" key="3">
            {experiences.map(
              ({ organization, startDate, endDate, onGoing }) => (
                <CustomerTypeDetail
                  date={
                    <div
                      className={styles.expYears}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {startDate !== null && startDate !== ''
                        ? moment(startDate).format('MMM YYYY')
                        : '-'}{' '}
                      -{' '}
                      {onGoing ? (
                        <span style={{ textTransform: 'none' }}>
                          Davam edir
                        </span>
                      ) : endDate !== null && endDate !== '' ? (
                        moment(endDate).format('MMM YYYY')
                      ) : (
                        ''
                      )}
                    </div>
                  }
                  secondary={organization}
                />
              )
            )}
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="İş təcrübəsi" secondary="-" />
      )}

      {languages.length > 0 ? (
        <ProCollapse defaultActiveKey="4">
          <ProPanel header="Dil bilikləri" key="4">
            {languages.map(({ language, possession }) => (
              <CustomerTypeDetail
                date={
                  <div style={{ textTransform: 'capitalize' }}>
                    {language && language.name}
                  </div>
                }
                secondary={languagesDegress[possession - 1]}
              />
            ))}
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Dil bilikləri" secondary="-" />
      )}
      {/* contacts */}
      <Detail primary="Email" secondary={email || '-'} />
      <Detail primary="Mobil telefon" secondary={mobileNumber || '-'} />
      <Detail primary="Ev telefon" secondary={phoneNumber || '-'} />
      <Detail
        primary="Sosial Hesablar"
        secondary={() => (
          <Fragment>
            <div>
              <Icon type="facebook" />{' '}
              {facebook || notDefined ? facebook || notDefined : '-'}
            </div>

            <div>
              <Icon type="skype" />{' '}
              {skype || notDefined ? skype || notDefined : '-'}
            </div>

            <div>
              <Icon type="linkedin" />{' '}
              {linkedin || notDefined ? linkedin || notDefined : '-'}
            </div>
          </Fragment>
        )}
      />
      {note ? (
        <ProCollapse defaultActiveKey="6">
          <ProPanel header="Qeyd" key="6">
            <CustomerTypeDetail text={note} />
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Qeyd" secondary="-" />
      )}
    </div>
  );
}
