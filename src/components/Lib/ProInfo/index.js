import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosClose } from 'react-icons/io';
import styles from './styles.module.scss';
import { ReactComponent as InfoIcon } from '../../../assets/img/icons/info.svg';

export function ProInfo(props) {
  const { children, ...rest } = props;
  const [isShow, setIsShow] = useState(true);

  function hideInfo() {
    setIsShow(false);
  }

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          key="info"
          initial={false}
          exit={{ opacity: 0 }}
          className={styles.info}
          {...rest}
        >
          <InfoIcon />
          <p>{children}</p>
          <button type="button" onClick={hideInfo}>
            <IoIosClose />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ProInfo.propTypes = {
  children: PropTypes.any,
};
