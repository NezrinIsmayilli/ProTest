/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const drawerClassNames = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  enterDone: styles.enterDone,
  exit: styles.exit,
  exitActive: styles.exitActive,
  exitDone: styles.exitDone,
};

const backdropClassNames = {
  enter: styles.enterDrop,
  enterActive: styles.enterActiveDrop,
  enterDone: styles.enterDoneDrop,
  exit: styles.exitDrop,
  exitActive: styles.exitActiveDrop,
  exitDone: styles.exitDoneDrop,
};

export function DrawerRight({
  isDrawerOpen = false,
  closeDrawer = () => {},
  children,
}) {
  return (
    <>
      <CSSTransition
        in={isDrawerOpen}
        timeout={300}
        unmountOnExit
        classNames={drawerClassNames}
      >
        <div className={`scrollbar ${styles.drawer}`}>{children}</div>
      </CSSTransition>
      <CSSTransition
        in={isDrawerOpen}
        timeout={300}
        unmountOnExit
        classNames={backdropClassNames}
      >
        <div
          role="region"
          className={styles.backdrop}
          onClick={() => {
            closeDrawer();
          }}
        ></div>
      </CSSTransition>
    </>
  );
}

DrawerRight.propTypes = {
  isDrawerOpen: PropTypes.bool,
  closeDrawer: PropTypes.func,
  children: PropTypes.any,
};
