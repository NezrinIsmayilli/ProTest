import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { exportFileDownloadHandle } from 'utils';

import DownLoad from 'assets/img/icons/downloadCv.svg';
import PdfIcon from 'assets/img/icons/pdf-icon.png';
import WordIcon from 'assets/img/icons/word-icon.png';
import { Button } from 'antd';
import styles from './styles.module.scss';

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

function DownloadIcon(props) {
  const { id, name, surname, downloadLoading } = props;

  const [iconType, setIconType] = useState('download');

  useEffect(() => {
    if (iconType === 'loading' && !downloadLoading) {
      setIconType('download');
    }
  }, [downloadLoading, iconType]);

  const dispatch = useDispatch();

  // download Word Cv
  const downloadHandleWord = e => {
    e.stopPropagation();

    setIconType('loading');

    dispatch(
      exportFileDownloadHandle(
        // label
        'jobsProfileExportLoading',
        // url
        `${url}/persons/${id}?export=word`,
        // file type
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // file name
        `${name}-${surname}-CV.docx`
      )
    );
  };
  // download Pdf Cv
  const downloadHandlePdf = e => {
    e.stopPropagation();

    setIconType('loading');

    dispatch(
      exportFileDownloadHandle(
        // label
        'jobsProfileExportLoading',
        // url
        `${url}/persons/${id}?export=pdf`,
        // file type
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // file name
        `${name}-${surname}-CV.pdf`
      )
    );
  };

  return (
    <div className={styles.modalListCv}>
      <div className={styles.exportIcon}>
        <img src={DownLoad} alt="Paylaş" />
      </div>
      <div className={styles.modalHeader}>CV İxrac et</div>
      <div className={styles.modalList}>
        <ul>
          <li>
            <Button onClick={downloadHandleWord}>
              <img src={WordIcon} alt="Word formatında ixrac et" />
            </Button>
          </li>
          <li>
            <Button onClick={downloadHandlePdf}>
              <img src={PdfIcon} alt="Pdf formatında ixrac et" />
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  downloadLoading: !!state.loadings.jobsProfileExportLoading,
});

export default connect(mapStateToProps)(DownloadIcon);
