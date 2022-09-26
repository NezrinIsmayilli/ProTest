import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.sass';

// wrap content Without header navigation and left navigation top: 80px; left: 94px
export function ProWrapper(props) {
  const {onScroll, children} = props
  return <div onScroll={onScroll} className={`${style.wrapper} scrollbar`}>{children}</div>;
}

ProWrapper.propTypes = {
  children: PropTypes.any,
};

export function Row({ children }) {
  return <div className={style.row}>{children}</div>;
}

Row.propTypes = {
  children: PropTypes.any,
};

export function Col({ children }) {
  return <div className={style.col}>{children}</div>;
}

Col.propTypes = {
  children: PropTypes.any,
};

export function Container({ children }) {
  return <div className={style.containerFluid}>{children}</div>;
}

export function MyLayout({ children }) {
  return (
    <section className={style.content}>
      <div className={style.containerFluid}>{children}</div>
    </section>
  );
}

MyLayout.propTypes = {
  children: PropTypes.any,
};
