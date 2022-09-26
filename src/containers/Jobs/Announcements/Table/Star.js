import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Icon, Button } from 'antd';

// actions
import {
  addToBookmarks,
  removeFromBookmarks,
} from 'store/actions/jobs/announcements';

import styles from './styles.module.scss';

function Star(props) {
  const {
    addToBookmarks,
    removeFromBookmarks,
    // props
    id,
    bookmarked,
    permissionsList,
  } = props;

  const currentURL = window.location.pathname === '/recruitment/announcements';

  const [innerBookmarked, setInnerBookmarked] = useState(bookmarked);
  const canRequestRef = useRef(true);

  let title = 'Seçilmişlərə əlavə et';

  let buttonStyles = styles.starButton;
  let iconStyles = styles.star;

  if (innerBookmarked) {
    title = 'Seçilmişlərə əlavə edilmişdir';
    buttonStyles = `${styles.starButton} ${styles.starButtonActive}`;
    iconStyles = styles.starActive;
  }

  const onSuccessCallback = () => (canRequestRef.current = true);

  const onFailureCallback = () => {
    setInnerBookmarked(bookmarked);
    canRequestRef.current = true;
  };

  function onClickStar(e) {
    e.stopPropagation();
    e.preventDefault();

    if (canRequestRef.current) {
      setInnerBookmarked(!innerBookmarked);
      canRequestRef.current = false;

      if (innerBookmarked) {
        removeFromBookmarks(id, onSuccessCallback, onFailureCallback);
      } else {
        addToBookmarks(id, onSuccessCallback, onFailureCallback);
      }
    }
  }

  return (
    <>
      <Button
        title={title}
        type="link"
        className={buttonStyles}
        onClick={onClickStar}
        disabled={
          currentURL
            ? permissionsList.projobs_job_seekers.permission !== 2
            : permissionsList.projobs_advertisements.permission !== 2
        }
      >
        <Icon type="star" theme="filled" className={iconStyles} />
      </Button>
    </>
  );
}

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { addToBookmarks, removeFromBookmarks }
)(Star);
