import React from 'react';

import { Avatar } from 'antd';
import girlsLogo from 'assets/img/girls_logo.png';
import boysLogo from 'assets/img/boy_logo.png';

import { avatar } from './styles.module.scss';

function RenderAvatar({ person }) {
  const { id, detail } = person || {};

  const { image, name, surname, patronymic, gender } = detail || {};

  return (
    <>
      <span>
        <Avatar
          icon="user"
          src={image !== null ? image : gender === 2 ? girlsLogo : boysLogo}
          className={avatar}
        />
        <span
          title={`${name || ''} ${surname || ''} ${patronymic || ''}`}
        >{`${name || ''} ${surname || ''} ${patronymic || ''}`}</span>
      </span>
    </>
  );
}

export default RenderAvatar;
