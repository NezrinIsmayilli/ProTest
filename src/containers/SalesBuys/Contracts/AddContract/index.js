/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Row, Col } from 'antd';
import { ProWrapper } from 'components/Lib';
import { Link, useHistory } from 'react-router-dom';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { fetchCatalogs } from 'store/actions/catalog';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import { fetchContracts, fetchContract } from 'store/actions/contracts';
import { fetchUsers } from 'store/actions/users';
import { fetchContacts } from 'store/actions/contact';
import ContactForm from './forms';
import styles from '../../../Warehouse/styles.module.scss';

function SalesOperationsAdd(props) {
  const {
    currencies,
    contacts,
    contracts,
    fetchCurrencies,
    fetchUsers,
    fetchContacts,
    fetchContract,
    fetchContracts,
  } = props;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
  const id = urlParams.get('id');
  const history = useHistory();

  const [editItemId, setEditItemId] = useState(0);

  useEffect(() => {
    if (id) {
      fetchContract(id);
      setEditItemId(id);
      fetchContracts({ limit: 1000 });
    }
    fetchCurrencies();

    if (contacts.length === 0) fetchContacts({});
  }, []);
  useEffect(() => {
    if (id) {
      if (contracts && contracts.length > 0) {
        const businessUnit = contracts?.find(contract => contract.id == id)
          ?.business_unit_id;
        fetchUsers({
          filters: {
            businessUnitIds: businessUnit === null ? [0] : [businessUnit],
          },
        });
      }
    } else if (BUSINESS_TKN_UNIT) {
      fetchUsers({
        filters: { businessUnitIds: [BUSINESS_TKN_UNIT] },
      });
    } else {
      fetchUsers({});
    }
  }, [BUSINESS_TKN_UNIT, id, contracts]);
  return (
    <ProWrapper>
      <section
        className="operationsWrapper paper"
        style={{ marginBottom: 110 }}
      >
        <div className={styles.salesContainer}>
          <Row>
            <Col
              span={12}
              offset={6}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <a onClick={history.goBack} className={styles.backBtn}>
                <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
                Müqavilə siyahısı
              </a>
              <label className={styles.newProductTitle}>
                {editItemId ? 'Düzəliş et' : 'Yeni müqavilə'}
              </label>
              <ContactForm editItemId={editItemId} />
            </Col>
          </Row>
        </div>
      </section>
    </ProWrapper>
  );
}

const mapStateToProps = state => ({
  catalogs: state.catalogsReducer.catalogs,
  products: state.productReducer.products,
  currencies: state.kassaReducer.currencies,
  stocks: state.stockReducer.stocks,
  contracts: state.contractsReducer.contracts,

  users: state.usersReducer.users,
  contacts: state.contactsReducer.contacts,
});

export default connect(
  mapStateToProps,
  {
    fetchCatalogs,
    fetchCurrencies,
    fetchProducts,
    fetchStocks,

    fetchUsers,
    fetchContacts,

    fetchContract,
    fetchContracts,
  }
)(SalesOperationsAdd);
