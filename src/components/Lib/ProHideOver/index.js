import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import styles from './styles.module.scss';

export function ProHideOver(props) {
  const {
    show,
    list,
    visibleListItem: VisibleListItem,
    hiddenListItem: HiddenListItem,
    moreButton: MoreButton,
  } = props;

  const [visible, setVisible] = useState(false);
  const showList = list.slice(0, show);
  const hideList = list.slice(show);

  function toggleVisible(e) {
    e.stopPropagation();
    setVisible(!visible);
  }

  function hide() {
    setVisible(false);
  }

  return (
    <>
      {showList.map((item, i) => (
        <VisibleListItem key={i} item={item} />
      ))}
      {hideList.length > 0 && (
        <Popover
          placement="bottomRight"
          overlayClassName={styles.popover}
          content={hideList.map((item, i) => (
            <HiddenListItem key={i} item={item} />
          ))}
          trigger="click"
          visible={visible}
          onClick={toggleVisible}
          onBlur={hide}
          getTooltipContainer={trigger => trigger.parentNode}
        >
          {/* Dont delete !!! empty */}{' '}
          <MoreButton count={hideList.length} visible={visible} />
        </Popover>
      )}
    </>
  );
}

ProHideOver.propTypes = {
  show: PropTypes.number,
  list: PropTypes.array,
  visibleListItem: PropTypes.elementType,
  hiddenListItem: PropTypes.elementType,
  moreButton: PropTypes.elementType,
};

//  these are custom styled ProTableHideOver elements
const VisibleListItemTable = ({ item }) => <span>{item}</span>;

const HiddenListItemTable = ({ item }) => (
  <li className={styles.tableHiddenItem}>{item}</li>
);

const MoreButtonTable = ({ count }) => (
  <button
    type="button"
    className={styles.moreTableButton}
  >{`+ ${count}`}</button>
);

//  for Tables
export function ProTableHideOver({ list, show }) {
  return (
    <ProHideOver
      show={show}
      list={list}
      visibleListItem={VisibleListItemTable}
      hiddenListItem={HiddenListItemTable}
      moreButton={MoreButtonTable}
    />
  );
}

ProTableHideOver.propTypes = {
  show: PropTypes.number,
  list: PropTypes.array,
};

//  these are custom styled ProFilterHideOver elements
const VisibleListItemFilter = ({ item }) => (
  <li className={`${styles.filterItem} ${styles.filterVisibleItem}`}>
    <span>{item}</span>
    <div>{item}</div>
  </li>
);

const HiddenListItemFilter = ({ item }) => (
  <li className={styles.filterItem}>
    <span>{item}</span>
    <div>{item}</div>
  </li>
);

const MoreButtonFilter = ({ count, visible }) => (
  <button
    type="button"
    className={`${styles.moreFilterButton} ${
      visible ? styles.activeMoreFilterButton : ''
    }`}
  >{`+ ${count}`}</button>
);

//  for Filter
export function ProFilterHideOver({ list, show }) {
  return (
    <ProHideOver
      show={show}
      list={list}
      visibleListItem={VisibleListItemFilter}
      hiddenListItem={HiddenListItemFilter}
      moreButton={MoreButtonFilter}
    />
  );
}

ProFilterHideOver.propTypes = {
  show: PropTypes.number,
  list: PropTypes.array,
};
