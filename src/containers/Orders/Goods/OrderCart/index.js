import React from 'react';
import { ProModal } from 'components/Lib';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

// layouts
import Header from './Header';
import Table from './Table';
import Footer from './Footer';

const OrderList = props => {
  const { orderActions, orderStates } = props;
  const { toggleCart } = orderActions;
  const { cartIsVisible } = orderStates;

  return (
    <ProModal maskClosable isVisible={cartIsVisible} handleModal={toggleCart}>
      <div className={styles.OrderList}>
        <Header orderActions={orderActions} orderStates={orderStates} />
        <Table orderActions={orderActions} orderStates={orderStates} />
        <Footer orderActions={orderActions} orderStates={orderStates} />
      </div>
    </ProModal>
  );
};

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(OrderList);
