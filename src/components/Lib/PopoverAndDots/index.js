/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Popover } from 'antd';
import PropTypes from 'prop-types';
import { GoKebabVertical } from 'react-icons/go';
import styles from './styles.module.scss';

export function PopoverAndDots({ content: Content }) {
  // const [visible, setvisible] = useState(false);

  // function toggle() {
  //   setvisible(!visible);
  // }

  // function close() {
  //   setvisible(false);
  // }

  return (
    <Popover
      placement="leftTop"
      content={<Content />}
      trigger="focus"
      // trigger="click"
      // visible={visible}
      // onClick={toggle}
      // onBlur={close}
      getPopupContainer={trigger => trigger.parentNode.parentNode}
    >
      <button
        type="button"
        className={styles.dots}
        onClick={e => e.stopPropagation()}
      >
        <GoKebabVertical />
      </button>
    </Popover>
  );
}

PopoverAndDots.displayName = 'PopoverAndDots';
PopoverAndDots.propTypes = {
  content: PropTypes.func,
};

PopoverAndDots.defaultProps = {
  content: () => null,
};
