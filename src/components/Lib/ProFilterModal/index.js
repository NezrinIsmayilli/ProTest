import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Button, Checkbox } from 'antd';
import { ProCollapse, ProFilterHideOver } from 'components/Lib';
import { FiX } from 'react-icons/fi';
import { IoMdFunnel } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.scss';

export function ProFilterModal({
  chekboxes,
  onFilterClick = () => {},
  onResetClick = () => {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  // const [list, setList] = useState([]);

  function filterToggle() {
    setIsVisible(!isVisible);
  }

  function handleFilterChange(item, checked) {
    // list.find(item => item.key === key);
    // if (checked) {
    //   console.log(checked);
    // }
  }

  return (
    <div className={styles.filter}>
      <div className={styles.tools}>
        <button
          type="button"
          className={`${styles.filterButton} ${
            isVisible ? styles.activeFilterButton : ''
          }`}
          onClick={filterToggle}
        >
          <IoMdFunnel />
        </button>

        <div className={styles.selectedFilters}>
          <ProFilterHideOver
            show={2}
            list={['emin', 'hesen', 'kecen', 'husen', 'elcin']}
          />
        </div>
      </div>

      {/* AnimatePresence for unmount from Dom in the end */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="just key"
          >
            <div className={styles.popContent}>
              <p className={styles.header}>
                <span>ƏTRAFLI FİLTR</span>
                <button
                  type="button"
                  className={styles.close}
                  onClick={filterToggle}
                >
                  <FiX />
                </button>
              </p>
              <ProCollapse
                onChange={() => {
                  setIsCollapseOpen(!isCollapseOpen);
                }}
              >
                {/* not need ProPanel */}
                <Collapse.Panel
                  header={
                    <div
                      style={{
                        color: isCollapseOpen ? '#55ab80' : '#464a4b',
                      }}
                    >
                      İSTEHSALÇI
                    </div>
                  }
                  key="1"
                  className={styles.panel}
                >
                  <form className={styles.checkboxes}>
                    {chekboxes.map(item => (
                      <p key={item.key}>
                        <Checkbox
                          onChange={e =>
                            handleFilterChange(item.key, e.target.checked)
                          }
                        >
                          {item.value}
                        </Checkbox>
                      </p>
                    ))}
                  </form>
                </Collapse.Panel>
              </ProCollapse>
              <div className={styles.footer}>
                <Button type="primary" size="large" onClick={onFilterClick}>
                  FİLTR ET
                </Button>
                <Button
                  type="link"
                  size="large"
                  //   style={{ color: '#337ab7' }}
                  onClick={onResetClick}
                >
                  Sıfırla
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ProFilterModal.propTypes = {
  onFilterClick: PropTypes.func,
  onResetClick: PropTypes.func,
  chekboxes: PropTypes.array,
};
