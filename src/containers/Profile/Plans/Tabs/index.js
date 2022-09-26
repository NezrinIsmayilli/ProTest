/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useEffect } from 'react';

// icons
import { ReactComponent as ProTaskIcon } from 'assets/img/icons/protask.svg';
import { ReactComponent as ProSalesIcon } from 'assets/img/icons/prosales.svg';
import { ReactComponent as ProHRMIcon } from 'assets/img/icons/prohrm.svg';
import { ReactComponent as ProJobsIcon } from 'assets/img/icons/projobs.svg';

import { usePlansContext } from '../plans-context';

import styles from '../styles.module.scss';

export const tabsHelper = {
  transactions: {
    title: 'Maliyyə',
    icon: <ProSalesIcon className={styles.tabButtonIcon} />,
    BgIcon: <ProSalesIcon className={styles.tabButtonBgIcon} />,
    info: [
      'Mədaxil və Məxaric əməliyyatları',
      'Xərc Ödənişləri',
      'Pul-Transfer',
      'Əməkhaqqı ödənişi',
      'Debitor borclar üzrə hesabat',
      'Kreditor borclar üzrə hesabat',
      'Vergi Hesabatı',
      'Pul axınları hesabatı(Cashflow)',
    ],
  },
  sales: {
    icon: <ProTaskIcon className={styles.tabButtonIcon} />,
    BgIcon: <ProTaskIcon className={styles.tabButtonBgIcon} />,
    title: 'Ticarət',
    info: [
      'Alış və satış əməliyyatları',
      'Müştəridən Geri alma',
      'Təchizatçıya Geri qaytarma',
      'Anbar fəaliyyətlərinin təşkili',
      'Məhsul və Kataloqlar',
      'Müqavilələr',
      'Alınmış məhsullar üzrə hesabat',
      'Satılmış məhsullar üzrə hesabat',
      'Məhsul dövriyyəsi',
      'Əlaqələr',
    ],
  },
  hrm: {
    icon: <ProHRMIcon className={styles.tabButtonIcon} />,
    BgIcon: <ProHRMIcon className={styles.tabButtonBgIcon} />,
    title: 'Əməkdaşlar',
    info: [
      'Əməkdaşlar jurnalı',
      'Əmrlər(məzuniyyət,ezamiyyət,icazə və s.)',
      'Şirkət strukturunun yaradılması',
      'Ştat cədvəli',
      'Davamiyyət jurnalı',
      'İş rejimləri',
      'İstehsalat təqvimi',
      'Əməkhaqqı hesabatı(Payroll)',
      'Bonuslar',
      'Cərimələr',
      'İş vaxtının uçotu',
    ],
  },
  order: {
    icon: <ProJobsIcon className={styles.tabButtonIcon} />,
    BgIcon: <ProJobsIcon className={styles.tabButtonBgIcon} />,
    title: 'Sifariş',
    info: [
      'Sifarişin idarə edilməsi',
      'Sifariş emalı',
      'Hesabatlar',
      'Kontragentlərlə ilə effektiv qarşılıqlı əlaqə',
      'Biznes proseslərin təhlili',
      'Yol vərəqələrinin formalaşdırılması',
      'Fakturaların avtomatik yaradılması',
    ],
  },
};

function Tabs(props) {
  const { packageKeys = [], packages } = props;

  const { activeModule, activeModuleChangeHandle } = usePlansContext();

  useEffect(() => {
    if (activeModule === undefined) {
      activeModuleChangeHandle(packageKeys[0]);
    }
  }, [packages]);

  const Modules = useMemo(
    () =>
      packageKeys.map(key => {
        const activeTab = activeModule || packageKeys[0];
        const { title, icon, BgIcon } = tabsHelper[key] || {};

        return (
          <button
            key={key}
            type="button"
            className={`${styles.tabButton} ${
              activeTab === key ? styles.activeTab : ''
            }`}
            onClick={() => activeModuleChangeHandle(key)}
          >
            {icon}
            {BgIcon}
            <span className={styles.tabButtonTitle}>{title}</span>
          </button>
        );
      }),
    [activeModule, packageKeys.length]
  );

  return <div className={styles.tabsWrapper}>{Modules}</div>;
}

export default Tabs;
