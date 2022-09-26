import React from 'react';
import { connect } from 'react-redux';

import { usePlansContext } from '../plans-context';

import Package from './package';
import InfoItem from './info-item';

import { tabsHelper } from '../Tabs';

import styles from '../styles.module.scss';

function PriceTable(props) {
  const { packages } = props;

  const {
    activeModule,
    selectedPacks,
    packSelectHandle,
    priceType,
    editMode,
  } = usePlansContext();

  const packs = packages[activeModule] || [];
  const selectedPack = selectedPacks[activeModule] || {};

  const infoArray = tabsHelper[activeModule]?.info || [];

  return (
    <div className={styles.priceTableWrap}>
      {/* titles column left */}
      <div className={styles.titleCol}>
        <div className={styles.titleHeadCell}>
          <div>
            <div className={styles.boldGreen}>Modulun</div>
            sizə uyğun planını seçin
          </div>
        </div>

        {infoArray.map(text => (
          <InfoItem key={text}>{text}</InfoItem>
        ))}
      </div>

      {/* plan column small */}
      {packs.map(pack => (
        <Package
          key={pack.id}
          selected={selectedPack}
          setSelected={editMode ? () => packSelectHandle(pack.key, pack) : null}
          priceType={priceType}
          editMode={editMode}
          pack={pack}
          infoArray={infoArray}
        />
      ))}
    </div>
  );
}

const mapStateToProps = state => ({
  packages: state.subscriptionReducer.packages,
});

export default connect(mapStateToProps)(PriceTable);
