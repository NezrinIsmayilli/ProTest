import React from 'react';
import { Modal } from 'antd';
// import { FaTimes } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { IoIosClose } from 'react-icons/io';
import { ReactComponent as Trash } from '../../../assets/img/icons/trash.svg';
import styles from './styles.module.scss';

// icons
export function ProDeleteModal(props) {
  const { ...rest } = props;

  return (
    <Modal
      title={<Trash />}
      visible
      wrapClassName={styles.deleteModal}
      // onOk={() => this.setModal1Visible(false)}
      // onCancel={() => this.setModal1Visible(false)}
      // cancelText
      centered
      closeIcon={<IoIosClose className={styles.closeIcon} />}
      maskClosable
      mask
      width={484}
      footer={null}
      {...rest}
    >
      <h3 className={styles.title}>İşçini silmək</h3>
      <p className={styles.desc}>
        Bu işçiyə bağlı istifadəçi mövcuddur, xitam edərkən işçinin bağlı olduğu
        istifadəçi silinsinmi?
      </p>
      <div className={styles.modalButtons}>
        <button type="button" className={styles.deleteButton}>
          <span>
            <FiTrash />
          </span>
          <span>Bəli</span>
        </button>
        <button type="button" className={styles.cancelButton}>
          <span className={styles.xIcon}>
            <IoIosClose />
          </span>
          <span>Xeyr</span>
        </button>
      </div>
    </Modal>
  );
}

ProDeleteModal.displayName = 'ProDeleteModal';

ProDeleteModal.propTypes = {};
