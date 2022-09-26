import React from 'react';

import DownloadIcon from '../download-icon';

function RenderDownload({ personData }) {
  const { id, detail } = personData || {};

  const { name, surname } = detail || {};

  return (
    <>
      <DownloadIcon id={id} name={name} surname={surname} />
    </>
  );
}

export default RenderDownload;
