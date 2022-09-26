import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';
import { DetailButton, Table as ProTable } from 'components/Lib';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import styles from '../styles.module.scss';

const Table = props => {
  const { isLoading, tableData, getTime, handleDetailClick } = props;

  const getColumns = data => {
    const columns = [];
    if (data.length > 0) {
      columns.push({
        title: 'Əsas çağrı mərkəzi göstəriciləri',
        dataIndex: 0,
        width: 400,
        align: 'left',
        fixed: 'left',
        render: value => <span className={styles.columnsStyle}>{value}</span>,
      });

      columns.push({
        title: 'RÜB I',
        dataIndex: 1,
        width: 200,
        align: 'center',
        render: (value, row) =>
          value !== 0 &&
          (row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)') ? (
            <div className={styles.detailbtn}>
              <span className={styles.rowNumbers}>
                {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
                row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
                row[0] === 'Ortalama cavab vermə müddəti' ||
                row[0] === 'Ortalama emal müddəti' ||
                row[0] === 'Maksimal emal müddəti' ||
                row[0] === 'Cəmi emal müddəti' ||
                row[0] === 'Zəng müddəti' ||
                row[0] === 'ACW müddəti' ||
                row[0] === 'Danışıq müddəti' ||
                row[0] === 'Xəttdə saxlama müddəti' ||
                row[0] === 'AUX' ||
                row[0] === 'Boş qalma müddəti' ||
                row[0] === 'Aktivlik müddəti'
                  ? getTime(value)
                  : value}
              </span>

              <Tooltip title={value} placement="right">
                <DetailButton
                  className={styles.detailButton}
                  onClick={() => handleDetailClick(row, 1)}
                />
              </Tooltip>
            </div>
          ) : (
            value
          ),
      });

      columns.push({
        title: 'RÜB II',
        dataIndex: 2,
        width: 200,
        align: 'center',
        render: (value, row) =>
          value !== 0 &&
          (row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)') ? (
            <div className={styles.detailbtn}>
              <span className={styles.rowNumbers}>
                {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
                row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
                row[0] === 'Ortalama cavab vermə müddəti' ||
                row[0] === 'Ortalama emal müddəti' ||
                row[0] === 'Maksimal emal müddəti' ||
                row[0] === 'Cəmi emal müddəti' ||
                row[0] === 'Zəng müddəti' ||
                row[0] === 'ACW müddəti' ||
                row[0] === 'Danışıq müddəti' ||
                row[0] === 'Xəttdə saxlama müddəti' ||
                row[0] === 'AUX' ||
                row[0] === 'Boş qalma müddəti' ||
                row[0] === 'Aktivlik müddəti'
                  ? getTime(value)
                  : value}
              </span>

              <Tooltip title={value} placement="right">
                <DetailButton
                  className={styles.detailButton}
                  onClick={() => handleDetailClick(row, 2)}
                />
              </Tooltip>
            </div>
          ) : (
            value
          ),
      });

      columns.push({
        title: 'RÜB III',
        dataIndex: 3,
        width: 200,
        align: 'center',
        render: (value, row) =>
          value !== 0 &&
          (row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)') ? (
            <div className={styles.detailbtn}>
              <span className={styles.rowNumbers}>
                {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
                row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
                row[0] === 'Ortalama cavab vermə müddəti' ||
                row[0] === 'Ortalama emal müddəti' ||
                row[0] === 'Maksimal emal müddəti' ||
                row[0] === 'Cəmi emal müddəti' ||
                row[0] === 'Zəng müddəti' ||
                row[0] === 'ACW müddəti' ||
                row[0] === 'Danışıq müddəti' ||
                row[0] === 'Xəttdə saxlama müddəti' ||
                row[0] === 'AUX' ||
                row[0] === 'Boş qalma müddəti' ||
                row[0] === 'Aktivlik müddəti'
                  ? getTime(value)
                  : value}
              </span>

              <Tooltip title={value} placement="right">
                <DetailButton
                  className={styles.detailButton}
                  onClick={() => handleDetailClick(row, 3)}
                />
              </Tooltip>
            </div>
          ) : (
            value
          ),
      });

      columns.push({
        title: 'RÜB IV',
        dataIndex: 4,
        width: 200,
        align: 'center',
        render: (value, row) =>
          value !== 0 &&
          (row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)') ? (
            <div className={styles.detailbtn}>
              <span className={styles.rowNumbers}>
                {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
                row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
                row[0] === 'Ortalama cavab vermə müddəti' ||
                row[0] === 'Ortalama emal müddəti' ||
                row[0] === 'Maksimal emal müddəti' ||
                row[0] === 'Cəmi emal müddəti' ||
                row[0] === 'Zəng müddəti' ||
                row[0] === 'ACW müddəti' ||
                row[0] === 'Danışıq müddəti' ||
                row[0] === 'Xəttdə saxlama müddəti' ||
                row[0] === 'AUX' ||
                row[0] === 'Boş qalma müddəti' ||
                row[0] === 'Aktivlik müddəti'
                  ? getTime(value)
                  : value}
              </span>

              <Tooltip title={value} placement="right">
                <DetailButton
                  className={styles.detailButton}
                  onClick={() => handleDetailClick(row, 4)}
                />
              </Tooltip>
            </div>
          ) : (
            value
          ),
      });

      columns.push(
        {
          title: 'Toplam',
          dataIndex: 5,
          // width: 250,
          align: 'center',
          render: (value, row) => (
            <span className={styles.columnsStyle}>
              {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
              row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
              row[0] === 'Ortalama cavab vermə müddəti' ||
              row[0] === 'Ortalama emal müddəti' ||
              row[0] === 'Maksimal emal müddəti' ||
              row[0] === 'Cəmi emal müddəti' ||
              row[0] === 'Zəng müddəti' ||
              row[0] === 'ACW müddəti' ||
              row[0] === 'Danışıq müddəti' ||
              row[0] === 'Xəttdə saxlama müddəti' ||
              row[0] === 'AUX' ||
              row[0] === 'Boş qalma müddəti' ||
              row[0] === 'Aktivlik müddəti'
                ? getTime(value)
                : row[0] === 'Xidmət səviyyəsi 80/60, %' ||
                  row[0] === 'Xidmət səviyyəsi 80/30, %' ||
                  row[0] === 'Buraxılmış zəng dərəcəsi, %' ||
                  row[0] === 'Cavablandırılmış zəng dərəcəsi, %' ||
                  row[0] === 'Məşğulluq faizi' ||
                  row[0] === 'İstifadə faizi'
                ? formatNumberToLocale(defaultNumberFormat(row[6]))
                : formatNumberToLocale(defaultNumberFormat(value))}
            </span>
          ),
        },

        {
          title: 'Ortalama',
          dataIndex: 6,
          width: 250,
          align: 'center',
          render: (value, row) => (
            <span className={styles.columnsStyle}>
              {row[0] === 'Buraxılmış zənglərin maksimal müddəti' ||
              row[0] === 'Buraxılmış zənglərin ortalama müddəti' ||
              row[0] === 'Ortalama cavab vermə müddəti' ||
              row[0] === 'Ortalama emal müddəti' ||
              row[0] === 'Maksimal emal müddəti' ||
              row[0] === 'Cəmi emal müddəti' ||
              row[0] === 'Zəng müddəti' ||
              row[0] === 'ACW müddəti' ||
              row[0] === 'Danışıq müddəti' ||
              row[0] === 'Xəttdə saxlama müddəti' ||
              row[0] === 'AUX' ||
              row[0] === 'Boş qalma müddəti' ||
              row[0] === 'Aktivlik müddəti'
                ? getTime(value)
                : formatNumberToLocale(defaultNumberFormat(value))}
            </span>
          ),
        }
      );
    }
    return columns;
  };

  return (
    <>
      <ProTable
        loading={isLoading}
        className={styles.tableSupervisor}
        scroll={{ x: 'max-content' }}
        size="default"
        dataSource={tableData}
        columns={getColumns(tableData)}
        rowKey={record => record.id}
      />
    </>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchProfitByMonth,
});
export default connect(
  mapStateToProps,
  {}
)(Table);
