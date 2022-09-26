import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export function ButtonGreenOutline(props) {
  const { type } = props;
  const isPrimary = type === 'primary';

  return (
    <Button
      className={isPrimary ? '' : styles.green}
      {...props}
      style={{
        fontSize: isPrimary && 12,
      }}
    ></Button>
  );
}

export function ButtonYellowOutline(props) {
  return <Button className={styles.yellow} {...props}></Button>;
}

export function ButtonYellowFill(props) {
  return <Button className={styles.yellowFill} {...props}></Button>;
}

export function ButtonRedOutline(props) {
  return <Button className={styles.red} {...props}></Button>;
}
