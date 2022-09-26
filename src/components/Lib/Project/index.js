import React, { useState, useEffect, useMemo } from 'react';
import { Tooltip } from 'antd';
import moment from 'moment';
import { FaPencilAlt, FaSave } from 'react-icons/fa';
import { RiFileList3Fill } from 'react-icons/ri';
import { MdDateRange } from 'react-icons/md';
import { ProDots, ProInput, ProDotsItem } from 'components/Lib';
import swal from 'sweetalert';
import styles from './styles.module.scss';

export function Project(props) {
  const {
    id,
    name,
    members,
    myProject,
    countsOfTaskStatus,
    createdAt,
    deleteHandle,
    projectTasks,
    editHandle,
    memberAddPanelOpen,
    handleGetProjectDetails = () => {},
    onEdit,
    onDelete,
    onMembersChange,
    onAddMemberClick,
  } = props;

  const obj = {
    id,
    name,
    members,
    myProject,
    countsOfTaskStatus,
    createdAt,
    deleteHandle,
    editHandle,
    memberAddPanelOpen,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [newProjectName, setNewProjectName] = useState(undefined);

  const handleEditClick = name => {
    if (isEditing) {
      setNewProjectName(undefined);
    } else {
      setNewProjectName(name);
    }
    setIsEditing(!isEditing);
  };

  const handleNameChange = () => {
    if (name !== newProjectName) {
      onEdit(id, newProjectName);
    } else {
      setNewProjectName(undefined);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        onDelete(id);
      }
    });
  };

  const handleMembersChange = () => {
    onMembersChange(id, members);
  };

  const totalTaskCount = () => {
    let total = 0;
    if (countsOfTaskStatus?.length) {
      countsOfTaskStatus.forEach(count => (total += count));
    }

    setTotalCount(total);
  };
  const handleInputChange = event => {
    setNewProjectName(event.target.value);
  };

  const createdDate = useMemo(
    () => moment(createdAt.date).format('D MMMM YYYY'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    totalTaskCount();
  }, [countsOfTaskStatus]);

  useEffect(() => {
    setIsEditing(false);
    setNewProjectName(undefined);
  }, [name, members]);
  return (
    <div
      className={styles.Card}
      onDoubleClick={
        isEditing
          ? () => {}
          : () => {
              handleGetProjectDetails({
                id,
                name,
                members,
                myProject,
                countsOfTaskStatus,
                createdAt,
                deleteHandle,
                editHandle,
                memberAddPanelOpen,
              });
            }
      }
    >
      <div className={styles.header}>
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ProInput
              style={{ width: '60%' }}
              value={newProjectName}
              onChange={handleInputChange}
            />
            <FaSave
              style={{
                marginLeft: '10px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              onClick={handleNameChange}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className={styles.name}>{name}</span>
            <FaPencilAlt
              style={{
                marginLeft: '10px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
              onClick={() => handleEditClick(name)}
            />
          </div>
        )}
        <ProDots>
          <ProDotsItem
            label="Düzəliş et"
            icon="pencil"
            onClick={() => onAddMemberClick(id, members.map(({ id }) => id))}
          />
          <ProDotsItem
            label="Sil"
            icon="trash"
            onClick={() => handleDelete()}
          />
        </ProDots>
      </div>
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <span className={styles.date} style={{ marginRight: '10px' }}>
            <MdDateRange style={{ marginRight: '5px' }} />
            {createdDate}
          </span>
          <span className={styles.date}>
            <RiFileList3Fill style={{ marginRight: '5px' }} />
            {totalCount} tapşırıq
          </span>
        </div>
      </div>
      <div className={styles.tasks}>
        <div className={styles.task}>
          <span className="badge-sand" />
          <span className={styles.count}> {countsOfTaskStatus[1]}</span>
        </div>
        <div className={styles.task}>
          <span className="badge-flag" />
          <span className={styles.count}> {countsOfTaskStatus[0]}</span>
        </div>
        <div className={styles.task}>
          <span className="badge-check" />
          <span className={styles.count}> {countsOfTaskStatus[2]}</span>
        </div>
      </div>
      <div className={styles.members}>
        {members.map(({ id, name, lastName }, index) => (
          <Tooltip title={`${name || ''} ${lastName || ''}`}>
            <span
              key={`${id}${name}${index}`}
              className={styles.avatar}
            >{`${name[0].toUpperCase()}${
              lastName ? lastName[0].toUpperCase() : ''
            }`}</span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export const ProjectWithModal = props => {
  const { modal } = props;
  return (
    <>
      {modal}
      <Project {...props} />
    </>
  );
};
