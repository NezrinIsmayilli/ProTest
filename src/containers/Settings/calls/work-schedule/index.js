import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, ProButton, ProModal, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { Button } from 'antd';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import {
  fetchWorkSchedulesCall,
  editWorkSchedule,
} from 'store/actions/settings/work-schedule';
import { cookies } from 'utils/cookies';
import swal from '@sweetalert/with-react';
import AddSchedule from './addSchedule';
import styles from './styles.module.scss';

const { manage } = accessTypes;

const token = cookies.get('_TKN_CALL_');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
const WorkSchedule = props => {
  const {
    isLoading,
    workScheduleCall,
    fetchWorkSchedulesCall,
    editWorkSchedule,
  } = props;
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [selectedId, setSelectedId] = useState(undefined);
  const [data, setData] = useState([]);
  useEffect(() => {
    if (roleModalIsVisible === false) {
      setSelectedId(undefined);
      setSelectedSchedule([]);
    }
  }, [roleModalIsVisible]);
  useEffect(() => {
    fetchWorkSchedulesCall({
      onSuccessCallback: response => {
        [response?.data].map(index =>
          index.nonWorkingTimeAttachment !== null
            ? fetch(
                `${url}/attachments/${index.nonWorkingTimeAttachment?.id}/download`,
                {
                  method: 'GET',
                  headers: {
                    'X-AUTH-PROTOKEN': token,
                  },
                }
              )
                .then(response => response.blob())
                .then(blob => {
                  const objectUrl = window.URL.createObjectURL(blob);
                  setData(prevState => [
                    ...prevState,
                    {
                      id: index.nonWorkingTimeAttachment?.id,
                      record: objectUrl,
                    },
                  ]);
                })
            : null
        );
      },
    });
  }, []);

  const editClick = id => {
    if (id) {
      fetchWorkSchedulesCall({
        onSuccessCallback: ({ data }) => {
          setSelectedSchedule([data]);
        },
      });
      setSelectedId(id);
    }
    toggleRoleModal();
  };
  const handleRemoveCallSchedule = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      const data = {
        nonWorkingTimeAttachment: null,
        prospectWorkSchedule: null,
      };
      if (willDelete) {
        editWorkSchedule(data, () => {
          fetchWorkSchedulesCall({
            onSuccessCallback: response => {
              [response?.data].map(index =>
                index.nonWorkingTimeAttachment !== null
                  ? fetch(
                      `${url}/attachments/${index.nonWorkingTimeAttachment?.id}/download`,
                      {
                        method: 'GET',
                        headers: {
                          'X-AUTH-PROTOKEN': token,
                        },
                      }
                    )
                      .then(response => response.blob())
                      .then(blob => {
                        const objectUrl = window.URL.createObjectURL(blob);
                        setData(prevState => [
                          ...prevState,
                          {
                            id: index.nonWorkingTimeAttachment?.id,
                            record: objectUrl,
                          },
                        ]);
                      })
                  : null
              );
            },
          });
        });
      }
    });
  };
  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 80,
      render: (value, item, index) => index + 1,
    },
    {
      title: `İş rejimi`,
      dataIndex: 'name',
      width: 200,
      align: 'left',
      render: (value, row) => row.prospectWorkSchedule.name || '',
    },
    {
      title: (
        <Can I={manage} a={permissions.msk_callcenter}>
          Qeyri-iş vaxtı sələnəcək səs yazısı
        </Can>
      ),
      dataIndex: 'nonWorkingTimeAttachment',
      align: 'left',
      width: 700,
      render: (value, row) => (
        <Can I={manage} a={permissions.msk_callcenter}>
          <audio
            src={data?.find(item => item?.id === value?.id)?.record}
            type="audio/ogg"
            style={{ width: '50%', height: '40px' }}
            controls
          />
        </Can>
      ),
    },
    {
      title: (
        <Can I={manage} a={permissions.msk_callcenter}>
          Seç
        </Can>
      ),
      dataIndex: 'id',
      key: 'delete',
      align: 'left',
      width: 100,
      render: (value, row) => (
        <Can I={manage} a={permissions.msk_callcenter}>
          <div style={{ display: 'flex' }}>
            <Button
              style={{ padding: '5px' }}
              type="button"
              className={styles.trashIcon}
              onClick={() =>
                handleRemoveCallSchedule(row.prospectWorkSchedule.id)
              }
            >
              <FaTrash />
            </Button>
            <Button
              style={{ padding: '5px' }}
              type="button"
              className={styles.editIcon}
              onClick={() => editClick(row.prospectWorkSchedule)}
            >
              <FaPencilAlt />
            </Button>
          </div>
        </Can>
      ),
    },
  ];
  return (
    <div>
      <ProModal
        maskClosable
        padding
        centered
        width={600}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <AddSchedule
          setData={setData}
          toggleRoleModal={toggleRoleModal}
          workScheduleCall={workScheduleCall}
          selectedId={selectedId}
          selectedSchedule={selectedSchedule}
        />
      </ProModal>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Can I={manage} a={permissions.msk_callcenter}>
          <ProButton
            style={{ margin: '10px 0' }}
            disabled={workScheduleCall?.[0]?.prospectWorkSchedule !== null}
            onClick={() => toggleRoleModal()}
          >
            İş rejimi əlavə et
          </ProButton>
        </Can>
      </div>
      <Table
        columns={columns}
        dataSource={
          workScheduleCall?.length > 0
            ? workScheduleCall?.[0].prospectWorkSchedule !== null
              ? [workScheduleCall?.[0]]
              : []
            : []
        }
        scroll={{ x: 'none' }}
        loading={isLoading}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchWorkSchedulesCall,
  workScheduleCall: state.WorkScheduleReducer.workSchedule,
});

export default connect(
  mapStateToProps,
  { fetchWorkSchedulesCall, editWorkSchedule }
)(WorkSchedule);
