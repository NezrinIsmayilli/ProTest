import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

import { abilities } from 'config/ability';

import styles from './styles.module.scss';

const ButtonWithIcon = ({ text, Icon, disabled }) => (
  <button disabled={disabled} type="button">
    <span className={styles.text}>{text}</span>
    <i className={styles.icon}>
      <Icon />
    </i>
  </button>
);

export function ProFab(props) {
  const { data } = props;

  return (
    <div className={styles.fab}>
      <ul
        className={styles.icons}
        style={{
          top: `-${data.length * 44 + 50}px`,
          height: `${data.length * 44 + 50}px`,
        }}
      >
        {data.map(({ text, link, icon: Icon, key }, index) => (
          <li
            key={index + link}
            style={{
              transitionDelay: `${100 / (index + 1)}ms`,
              transform: `translateY(${data.length * 44 + 50}px)`,
            }}
          >
            {abilities.can('manage', key) ? (
              <Link to={link} aria-label={text}>
                <ButtonWithIcon text={text} Icon={Icon} />
              </Link>
            ) : (
              <ButtonWithIcon text={text} disabled Icon={Icon} />
            )}
          </li>
        ))}
      </ul>
      <button type="button" aria-label="Əlavə et" className={styles.plus}>
        <span>
          <FiPlus />
        </span>
      </button>
    </div>
  );
}

ProFab.displayName = 'ProFab';

ProFab.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string,
      text: PropTypes.string,
      icon: PropTypes.any,
    })
  ),
};
