import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ProCollapse, ProPanel } from 'components/Lib';
import { CustomerTypeDetail } from 'containers/Jobs/Announcements/CustomerTypeDetail';
import Detail from '../detail';
import styles from '../styles.module.scss';

export default function DetailsTab({ person }) {
  const languagesDegress = ['Ana dili', 'Yaxşı', 'Orta yaxşı', 'Orta', 'Kafi'];
  return (
    <div style={{ margin: '5px' }}>
      <ul className={styles.detailsList}>
        <Detail
          primary="A.S.A"
          secondary={`${person.detail.name}${' '}${
            person.detail.surname
          }${' '}${person.detail.patronymic}`}
        />
        <Detail
          primary="Cinsi"
          secondary={person.detail.gender === 1 ? 'Kişi' : 'Qadın'}
        />
        <Detail
          primary="Doğum tarixi"
          secondary={moment(person.detail.birthDate).format('DD-MM-YYYY')}
        />
        <Detail primary="Doğulduğu yer" secondary={person.detail.birthCity} />
        <Detail primary="Yaşadığı şəhər" secondary={person.detail.city.name} />
        <Detail primary="Yaşadığı ünvan" secondary={person.detail.address} />

        {person.skills.length > 0 ? (
          <ProCollapse defaultActiveKey="1">
            <ProPanel header="Bacarıqlar" key="1">
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

        {person.educations.length > 0 ? (
          <ProCollapse defaultActiveKey="2">
            <ProPanel header="Təhsil" key="2">
              {person.educations.map(
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
                    text={`${degree?.name} təhsil` || '-'}
                  />
                )
              )}
            </ProPanel>
          </ProCollapse>
        ) : (
          <Detail primary="Təhsil" secondary="-" />
        )}

        {person.experiences.length > 0 ? (
          <ProCollapse defaultActiveKey="3">
            <ProPanel header="İş təcrübəsi" key="3">
              {person.experiences.map(
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

        {person.languages.length > 0 ? (
          <ProCollapse defaultActiveKey="4">
            <ProPanel header="Dil bilikləri" key="4">
              {person.languages.map(({ language, score }) => (
                <CustomerTypeDetail
                  date={
                    <div style={{ textTransform: 'capitalize' }}>
                      {language && language.name}
                    </div>
                  }
                  secondary={languagesDegress[score - 1]}
                />
              ))}
            </ProPanel>
          </ProCollapse>
        ) : (
          <Detail primary="Dil bilikləri" secondary="-" />
        )}

        <Detail primary="Email" secondary={`${person.username}`} />
        <Detail
          primary="Mobil telefon"
          secondary={
            person.contact === null ? '-' : person.contact.mobileNumber
          }
        />
      </ul>
    </div>
  );
}

DetailsTab.propTypes = {
  person: PropTypes.object,
};
