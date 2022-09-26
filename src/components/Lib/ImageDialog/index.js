import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export function ImageDialog({ close, imageSrc }) {
  useEffect(() => {
    document.addEventListener('mousedown', close);

    return () => {
      document.removeEventListener('mousedown', close);
    };
  }, [close]);
  return (
    <div
      id="invite"
      className="modal fade invite-modal in"
      role="dialog"
      style={{
        display: 'flex',
        paddingRight: '0px',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="modal-dialog modal-m">
        {/* Modal content */}
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              onClick={close}
              className="close"
              data-dismiss="modal"
            >
              <i className="fa fa-times" />
            </button>
          </div>
          <div
            className="modal-body"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img src={imageSrc} className="img-responsive" alt="task" />
          </div>
        </div>
      </div>
    </div>
  );
}

ImageDialog.propTypes = {
  close: PropTypes.func,
  imageSrc: PropTypes.string,
};
