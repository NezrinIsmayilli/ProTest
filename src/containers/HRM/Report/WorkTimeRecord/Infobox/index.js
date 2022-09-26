import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Affix } from 'antd';
import { InfoCard } from 'components/Lib';

import styles from '../styles.module.scss';

function Infobox(props) {
  const { selectedEmployee } = props;

  const {
    employeeName,
    employeeSurname,
    occupationName,
    image,
    employeePatronymic,
    totalActualWorkingSeconds,
    totalWorkingDaySeconds,
    totalLeaveBusinessTripDays,
    totalLeaveSickLeaveDays,
    totalLeaveVacationDays,
    totalLatenessSeconds,
  } = selectedEmployee || {};

  return (
    <Affix
      offsetTop={10}
      target={() => document.getElementById('timecardArea')}
    >
      <div className={`${styles.infoboxWrap} infoContainer scrollbar`}>
        <div className={`${styles.padding24} ${styles.header}`}>
          <InfoCard
            name={employeeName}
            surname={employeeSurname}
            patronymic={employeePatronymic}
            occupationName={occupationName}
            attachmentUrl={image}
            width="48px"
            height="48px"
          />
        </div>

        <ul className={styles.infoStats}>
          <li>
            <span>Norma</span>
            <span>
              {moment
                .duration(totalWorkingDaySeconds, 'seconds')
                .asHours()
                .toFixed('0')}{' '}
              saat
            </span>
          </li>

          <li>
            <span>Faktiki</span>
            <span>
              {moment
                .duration(totalActualWorkingSeconds, 'seconds')
                .asHours()
                .toFixed('0')}{' '}
              saat
            </span>
          </li>

          <li>
            <span>Məzuniyyət </span>
            <span>{totalLeaveVacationDays} gün</span>
          </li>

          <li>
            <span>Ezamiyyət</span>
            <span>{totalLeaveBusinessTripDays} gün</span>
          </li>

          <li>
            <span>Xəstəlik</span>
            <span>{totalLeaveSickLeaveDays} gün</span>
          </li>

          <li>
            <span>Gecikmələr</span>
            <span>
              {moment
                .duration(totalLatenessSeconds, 'seconds')
                .asMinutes()
                .toFixed('0')}{' '}
              dəq
            </span>
          </li>
        </ul>
      </div>
    </Affix>
  );
}

const mapStateToProps = state => ({
  selectedEmployee: state.hrmTimecardReducer.selectedEmployee,
});

export default connect(
  mapStateToProps,
  {}
)(Infobox);
