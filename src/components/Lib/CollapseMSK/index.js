import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaAngleDown } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';
import styles from './styles.module.scss';

export function CollapesMSK({ title, children, isOpen }) {
  const [show, setShow] = useState(isOpen);
  const collapse = useRef(null);

  useEffect(() => {
    function focusHandler(e) {
      const key = e.keyCode || e.swich;
      if (
        (key === 32 || key === 13) &&
        collapse.current === document.activeElement
      ) {
        setShow(!show);
      }
    }
    document.addEventListener('keyup', focusHandler, { passive: true });
    return () => {
      document.removeEventListener('keyup', focusHandler);
    };
  }, [show]);

  return (
    <div className={styles.collapse}>
      <div
        ref={collapse}
        aria-controls="content-1"
        aria-expanded={show}
        role="button"
        tabIndex={0}
        className={styles.header}
        onClick={() => setShow(!show)}
        onKeyUp={() => {}}
      >
        <div className={styles.titleWrapper}>
          <div className={styles.title}>{title}</div>
          <CSSTransition
            in={show}
            timeout={350}
            classNames={{
              enter: styles['rotate-enter'],
              enterActive: styles['rotate-enter-active'],
              enterDone: styles['rotate-enter-done'],
              exit: styles['rotate-exit'],
              exitActive: styles['rotate-exit-active'],
              exitDone: styles['rotate-exit-done'],
            }}
          >
            <span className={styles.icon}>
              <FaAngleDown />
            </span>
          </CSSTransition>
        </div>
      </div>
      <CSSTransition
        in={show}
        timeout={350}
        appear
        classNames={{
          appear: styles['collapse-appear'],
          enter: styles['collapse-enter'],
          enterActive: styles['collapse-enter-active'],
          enterDone: styles['collapse-enter-done'],
          exit: styles['collapse-exit'],
          exitActive: styles['collapse-exit-active'],
          exitDone: styles['collapse-exit-done'],
        }}
      >
        <div className={styles.body} aria-hidden={show} id="content-1">
          <div className={styles.contentWrapper}>
            <div className={styles.content}>{children}</div>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

CollapesMSK.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
};

CollapesMSK.defaultProps = {
  title: '',
  children: '',
  isOpen: false,
};
