import React from 'react';
import { connect } from 'react-redux';

import { Affix } from 'antd';
import { InfoBox, InfoBoxItem } from 'components/Lib';

import { parseDate } from 'utils/parseDate';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';

function DetailsBox(props) {
  const { sectionRef, infoCardData } = props;

  if (infoCardData) {
    const {
      serialNumber = '',
      createdAt,
      createdByName = '',
      createdByLastname = '',
      receiverName = '',
      receiverSurname = '',
      senderSurname = '',
      senderName = '',
      amount = '',
      currencyCode = '',
      description = '',
    } = infoCardData;

    return (
      <Affix offsetTop={10} target={() => sectionRef.current}>
        <InfoBox title={serialNumber}>
          <InfoBoxItem label="Tarix" text={parseDate(createdAt)} />
          <InfoBoxItem
            label="Əməliyyatçı"
            text={`${createdByName || ''} ${createdByLastname || ''}`}
          />
          <InfoBoxItem
            label="Qəbul edən"
            text={`${receiverName || ''} ${receiverSurname || ''}`}
          />
          <InfoBoxItem
            label="Göndərən"
            text={`${senderName || ''} ${senderSurname || ''}`}
          />
          <InfoBoxItem
            label="Məbləğ"
            text={`${formatNumberToLocale(
              defaultNumberFormat(amount)
            )} ${currencyCode}`}
          />
          <InfoBoxItem label="Ətraflı" text={description} />
        </InfoBox>
      </Affix>
    );
  }

  return null;
}

const mapStateToProps = state => ({
  infoCardData: state.financeOperationsReducer.infoCardData,
});

export default connect(mapStateToProps)(DetailsBox);
