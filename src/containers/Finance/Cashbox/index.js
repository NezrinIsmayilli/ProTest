import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import Accounts from './accounts';

function Kassa(props) {
  const { fetchBusinessUnitList, businessUnits, profile } = props;

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  return (
    // <section>
    //   <Collapse
    //     accordion
    //     bordered={false}
    //     style={customCollapseStyle}
    //     defaultActiveKey={['1']}
    //     expandIconPosition="right"
    //     expandIcon={({ isActive }) => (
    //       <Icon type="caret-right" rotate={isActive ? 90 : 0} />
    //     )}
    //   >
    //     <Panel
    //       header={<CustomHeader title={`Hesablar (${cashBoxNamesLength})`} />}
    //       key="1"
    //       style={customPanelStyle}
    //     >
    //     </Panel>
    //   </Collapse>
    // </section>
    <Accounts allBusinessUnits={businessUnits} />
  );
}

const mapStateToProps = state => ({
  businessUnits: state.businessUnitReducer.businessUnits,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  { fetchBusinessUnitList }
)(Kassa);
