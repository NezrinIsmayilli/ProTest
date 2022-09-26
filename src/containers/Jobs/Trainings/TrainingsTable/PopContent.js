import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// components
import { DeleteModal, ProDots, ProDotsItem } from 'components/Lib';
// actions
import {
  deleteTrainingById,
  changeTrainingStatus,
} from 'store/actions/jobs/training';

// utils
import swal from '@sweetalert/with-react';
import { useTrainingsFilters } from '../Sidebar/FiltersContext';

// styles
import styles from '../trainings.module.scss';

export const PopContent = ({ id }) => {
  const dispatch = useDispatch();
  const { filters } = useTrainingsFilters();
  const { status } = filters;

  const isActive = status === 1;
  const isPending = status === 3;

  const history = useHistory();
  const operationsDeleteHandle = DeleteModal(id, () =>
    dispatch(deleteTrainingById(id, filters))
  );

  const statusChangeHandle = () =>
    swal({
      title: 'Statusu dəyişmək istədiyinizə əminsinizmi?',
      icon: 'info',
      buttons: ['İmtina', 'Dəyiş'],
    }).then(willDelete => {
      if (willDelete) {
        dispatch(changeTrainingStatus(id, filters));
      }
    });

  const editStock = () => {
    history.push(`/recruitment/trainings/edit/${id}`);
  };

  if (isPending) {
    return (
      <div className={styles.popContent}>
        <>
          <ProDots>
            <>
              <ProDotsItem
                label="Düzəliş et"
                icon="pencil"
                onClick={() => editStock(id)}
              />
              <ProDotsItem
                label="Sil"
                icon="trash"
                onClick={() => operationsDeleteHandle()}
              />
            </>
          </ProDots>
        </>
      </div>
    );
  }

  return (
    <div className={styles.popContent}>
      <ProDots>
        <>
          <ProDotsItem
            label={isActive ? 'Dayandır' : 'Yenidən dərc et'}
            icon={isActive ? 'close' : 'arrowright'}
            onClick={() => statusChangeHandle()}
          />
          <ProDotsItem
            label="Sil"
            icon="trash"
            onClick={() => operationsDeleteHandle()}
          />
        </>
      </ProDots>
    </div>
  );
};
