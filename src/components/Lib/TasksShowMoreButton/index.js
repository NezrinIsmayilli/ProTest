import React from 'react';
import PropTypes from 'prop-types';

export function TasksShowMoreButton({ showMoreClickHandle }) {
  return (
    <li style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
      <button
        onClick={showMoreClickHandle}
        type="button"
        className="js-more-tasks-btn"
      >
        <i className="fa fa-chevron-down" aria-hidden="true" />
      </button>
    </li>
  );
}

TasksShowMoreButton.propTypes = {
  showMoreClickHandle: PropTypes.func,
};
