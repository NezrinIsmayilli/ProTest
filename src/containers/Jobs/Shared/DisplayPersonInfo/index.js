import React, { Fragment } from 'react';
import moment from 'moment';

// components
import { Avatar, Icon, Divider, Tag } from 'antd';

// utils
import {
  GenderStatus,
  // FamilyStatus,
  messages,
  languagesPossessionData,
} from 'utils';

import { ProCollapse, ProPanel } from 'components/Lib';
import { CustomerTypeDetail } from 'containers/Jobs/Announcements/CustomerTypeDetail';
import Detail from './detail';
import styles from './styles.module.scss';

const { notDefined } = messages;

function formatDate(date) {
  return date ? moment(date).format('DD.MM.YYYY') : ' - ';
}

const renderDateInfo = (startDate, endDate, onGoing) => (
  <Fragment>
    <div>{`Başlama tarixi: ${formatDate(startDate)}`}</div>
    <div>{`Bitmə tarixi: ${onGoing ? 'davam edir' : formatDate(endDate)}`}</div>
  </Fragment>
);

function getEducationInfo(educations) {
  return () => {
    const educationList = educations.map((education, i, arr) => {
      const {
        educationalInstitution,
        profession,
        endDate,
        startDate,
        degree,
        onGoing,
      } = education;

      return (
        <Fragment key={i}>
          <div>{educationalInstitution}</div>
          <div>
            {profession}, {degree.name}
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
      const {
        organization,
        startDate,
        endDate,
        position,
        notes,
        onGoing,
      } = item;

      return (
        <Fragment key={i}>
          <div>{organization}</div>
          <div>Vəzifə: {position !== 'Unknown' ? position : ' - '}</div>
          {renderDateInfo(startDate, endDate, onGoing)}
          <div>Qeyd: {notes} </div>
          {/* divider */}
          {i < arr.length - 1 && <Divider className={styles.divider} />}
        </Fragment>
      );
    });

    return experienceList.length > 0 ? experienceList : notDefined;
  };
}

export default function DisplayPersonInfo(props) {
  const { person } = props;

  const {
    username,
    detail,
    contact,
    experiences,
    educations,
    languages,
    skills,
  } = person || {};

  const {
    name,
    surname,
    gender,
    birthDate,
    birthCity,
    address,
    apartment,
    image,
  } = detail || {};

  const { mobileNumber, phoneNumber, skype, facebook, linkedin } =
    contact || {};

  return (
    <div className={styles.detailsList}>
      <Detail primary="Email" secondary={username || '-'} />
      <Detail primary="Cins" secondary={GenderStatus?.[gender] || '-'} />
      <Detail primary="Mobil telefon" secondary={mobileNumber || '-'} />
      <Detail primary="Ev telefon" secondary={phoneNumber || '-'} />
      <Detail primary="Ünvan" secondary={address || '-'}>
        {apartment || ''}
      </Detail>
      <Detail primary="Doğulduğu şəhər" secondary={birthCity || '-'} />
      <Detail
        primary="Yaş"
        secondary={moment().diff(moment(birthDate), 'years')}
      />

      <Detail
        primary="Doğulduğu tarix"
        secondary={formatDate(birthDate) || '-'}
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

      <ProCollapse defaultActiveKey="4">
        <ProPanel header="Dil bilikləri" key="4">
          {languages.map(({ language, possession }) => (
            <CustomerTypeDetail
              date={
                <div style={{ textTransform: 'capitalize' }}>
                  {language && language.name}
                </div>
              }
              secondary={languagesPossessionData[possession]}
            />
          ))}
        </ProPanel>
      </ProCollapse>
      {skills.length > 0 ? (
        <ProCollapse defaultActiveKey="5">
          <ProPanel header="Bacarıqlar" key="5">
            <CustomerTypeDetail
              text={person.skills.map(({ skill }) => (
                <h6>{skill}</h6>
              ))}
            />
          </ProPanel>
        </ProCollapse>
      ) : (
        <Detail primary="Bacarıqlar" secondary="-" />
      )}

      <Detail
        primary="Sosial Hesablar"
        secondary={() => (
          <>
            <div>
              <Icon type="facebook" /> {facebook || '-'}
            </div>

            <div>
              <Icon type="skype" /> {skype || '-'}
            </div>

            <div>
              <Icon type="linkedin" /> {linkedin || '-'}
            </div>
          </>
        )}
      />
    </div>
  );
}
