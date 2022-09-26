import React from 'react';
import { connect } from 'react-redux';
import { Affix } from 'antd';
import { ProEmpty, InfoCard } from 'components/Lib';

import styles from '../styles.module.scss';

function FinesDetails(props) {
  const { selectedPerson } = props;

  if (selectedPerson) {
    const {
      name,
      surname,
      penalties,
      attachmentUrl,
      patronymic,
      occupationName,
    } = selectedPerson;
    let tableContent = null;

    if (penalties.length) {
      tableContent = (
        <table className={styles.infoTable}>
          <tr className={styles.tableRow}>
            <th>№</th>
            <th>Tarix</th>
            <th>Gecikmə, dəq.</th>
          </tr>

          {penalties.map(({ date, minutes } = {}, index) => (
            <tr key={date} className={styles.tableRow}>
              <td>{index + 1}</td>
              <td>{date}</td>
              <td>{minutes}</td>
            </tr>
          ))}
        </table>
      );
    } else {
      tableContent = <ProEmpty description="Gecikmə yoxdur" />;
    }

    return (
      <Affix
        offsetTop={10}
        target={() => document.getElementById('penalties-area')}
      >
        <div className={`scrollbar ${styles.infoBox}`}>
          <div className={`${styles.padding24} ${styles.header}`}>
            <InfoCard
              name={name}
              surname={surname}
              patronymic={patronymic}
              occupationName={occupationName}
              attachmentUrl={attachmentUrl}
              width="48px"
              height="48px"
            />
          </div>
          <div className={styles.padding24}>{tableContent}</div>
        </div>
      </Affix>
    );
  }

  return null;
}

const mapStateToProps = state => ({
  selectedPerson: state.hrmFinesReducer.selectedPerson,
  penaltiesLoading: !!state.loadings.fetchHrmPenalties,
});

export default connect(mapStateToProps)(FinesDetails);
