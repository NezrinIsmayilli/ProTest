import React from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';

export function ProEmpty({ description = 'Məlumat yoxdur', ...rest }) {
  return <Empty {...rest} description={description} />;
}

ProEmpty.propTypes = {
  description: PropTypes.string,
};
