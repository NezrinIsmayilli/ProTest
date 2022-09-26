import React from 'react';
import { connect } from 'react-redux';
import { DetailButton, Table as ProTable } from 'components/Lib';
import { Tooltip } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import styles from '../styles.module.scss';

const Table = props => {
  const { isLoading, tableData, getTime, filters, handleDetailClick } = props;

  const { months: filteredMonths } = filters;

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
      for (let index = 1; index < 29; index++) {
        columns.push({
          title: `${index < 10 ? '0' + index : index} / ${
            filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
          }`,
          dataIndex: index,
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
                    onClick={() => handleDetailClick(row, index)}
                    className={styles.detailButton}
                  />
                </Tooltip>
              </div>
            ) : (
              value
            ),
        });
      }

      if (tableData[0]?.[29] !== undefined) {
        columns.push({
          title: `29 / ${
            filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
          }`,
          dataIndex: 29,
          width: 200,
          align: 'center',
          render: (value, row) =>
            row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)' ? (
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
                    onClick={() => handleDetailClick(row, 29)}
                    className={styles.detailButton}
                  />
                </Tooltip>
              </div>
            ) : (
              value
            ),
        });
      }
      if (tableData[0]?.[30] !== undefined) {
        columns.push({
          title: `30 / ${
            filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
          }`,
          dataIndex: 30,
          width: 200,
          align: 'center',
          render: (value, row) =>
            row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)' ? (
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
                    onClick={() => handleDetailClick(row, 30)}
                    className={styles.detailButton}
                  />
                </Tooltip>
              </div>
            ) : (
              value
            ),
        });
      }
      if (tableData[0]?.[31] !== undefined) {
        columns.push({
          title: `31 / ${
            filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
          }`,
          dataIndex: 31,
          width: 200,
          align: 'center',
          render: (value, row) =>
            row[0] === '60 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === '30 saniyə içərisində cavablandırılmış zənglər' ||
            row[0] === 'Cavablandırılmış zənglər' ||
            row[0] === 'Buraxılmış zənglər' ||
            row[0] === 'İtirilmiş zənglər' ||
            row[0] === 'Geri yığılmış zənglər' ||
            row[0] === 'Unikal müştəri sayı' ||
            row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
            row[0] === 'Unikal müştəri sayı (cavablandırılmış)' ? (
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
                    onClick={() => handleDetailClick(row, 31)}
                    className={styles.detailButton}
                  />
                </Tooltip>
              </div>
            ) : (
              value
            ),
        });
      }

      columns.push(
        {
          title: 'Toplam',
          dataIndex: 32,
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
                ? formatNumberToLocale(defaultNumberFormat(row[33]))
                : formatNumberToLocale(defaultNumberFormat(value))}
            </span>
          ),
        },

        {
          title: 'Ortalama',
          dataIndex: 33,
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
