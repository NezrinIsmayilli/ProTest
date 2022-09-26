import React from 'react';

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './style.css';

function Notifications() {
  return (
    <ToastContainer
      draggable={false}
      autoClose={2600}
      hideProgressBar
      newestOnTop
      toastClassName="toast"
    />
  );
}

export default Notifications;
