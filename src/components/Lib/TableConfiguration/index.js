import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Card, Checkbox, Icon, Modal, Tooltip } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import ReactDragListView from 'react-drag-listview';
import { GoListUnordered } from 'react-icons/go';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import styles from './styles.module.scss';

export function TableConfiguration({
    columnSource,
    AllStandartColumns,
    visible,
    setVisible,
    saveSetting,
}) {
    const SortableItem = sortableElement(({ value }) => (
        <div className={styles.listItem}>{value}</div>
    ));

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));
    const [allCheck, setAllCheck] = useState(true);
    const [allColumn, setAllColumn] = useState(columnSource);
    const handleCheckboxChange = index => {
        const newColums = _.cloneDeep(allColumn);
        const selectedIndex = newColums.findIndex(
            column => column.dataIndex === index
        );
        newColums[selectedIndex].visible = !newColums[selectedIndex].visible;
        setAllColumn(newColums);
    };

    const selectStandartColumns = () => {
        setAllCheck(prevState => !prevState);
        setAllColumn(AllStandartColumns);
    };

    const getSelectedCount = () => {
        const selectedColumnsCount = allColumn.filter(
            column => column.visible === true
        ).length;
        return selectedColumnsCount;
    };

    const dragProps = {
        onDragEnd(fromIndex, toIndex) {
            if (toIndex < 0) return; // Ignores if outside designated area
            const items = [...allColumn];
            const item = items.splice(fromIndex, 1)[0];
            items.splice(toIndex, 0, item);
            setAllColumn(items);
        },
        nodeSelector: '.ant-checkbox-wrapper',
    };

    const onSortEnd = (oldIndex, newIndex) => {
        if (newIndex < 0) return; // Ignores if outside designated area
        const items = [...allColumn];
        const item = items.splice(oldIndex, 1)[0];
        items.splice(newIndex, 0, item);
        setAllColumn(items);
    };

    const isStandartHidden = () => {
        const isStandart = columnSource
            .filter(col => col.standart === true)
            .some(col => col.visible === false);
        const nonStandart = columnSource
            .filter(col => col.standart === false)
            .some(col => col.visible === true);
        return isStandart || nonStandart;
    };

    useEffect(() => {
        getSelectedCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allColumn]);

    useEffect(() => {
        if (isStandartHidden()) {
            setAllCheck(false);
        }
        setAllColumn(columnSource);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnSource]);

    // reset modal
    useEffect(() => {
        if (isStandartHidden()) {
            setAllCheck(false);
        }
        setAllColumn(columnSource);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            visible={visible}
            onCancel={() => setVisible(false)}
            closable={false}
            centered
            footer={null}
            className={styles.settingModal}
            destroyOnClose
        >
            <div className={styles.settingModalHeader}>
                <p>Tənzimləmələr</p>
                <Button
                    className={styles.settingCloseButton}
                    size="large"
                    icon="close"
                    onClick={() => setVisible(false)}
                ></Button>
            </div>

            <div className={styles.settingModalContent}>
                <Card
                    size="small"
                    title={
                        <>
                            <span className={styles.selectedColumns}>
                                Seçilmiş sütunlar
                            </span>
                            <Tooltip
                                placement="top"
                                title="Sətirləri sürüşdürərək, sütunların ardıcılığını seçə bilərsiz"
                            >
                                <Icon component={FaInfoCircle} />
                            </Tooltip>
                        </>
                    }
                    extra={
                        <span>
                            {`${getSelectedCount()} / ${columnSource.length}`}
                        </span>
                    }
                >
                    <Checkbox
                        className={styles.selectAllColumns}
                        checked={allCheck}
                        onChange={selectStandartColumns}
                    >
                        Standart sütunlar
                    </Checkbox>

                    {/* <ReactDragListView  {...dragProps}>
						<div className={styles.standartColumns}>
							{
								allCheck ? allColumn.filter(col => col.standart === true).map(({ name, dataIndex, visible, fixed }, index) => (
									<Checkbox disabled={allCheck || fixed} checked={visible} onChange={() => handleCheckboxChange(dataIndex)}>
										{name}
									</Checkbox>
								)) : allColumn.map(({ name, dataIndex, visible, fixed }, index) => (
									<Checkbox disabled={allCheck || fixed} checked={visible} onChange={() => handleCheckboxChange(dataIndex)}>
										{name}
									</Checkbox>
								))
							}
						</div>
					</ReactDragListView> */}
                    <SortableContainer
                        onSortEnd={({ oldIndex, newIndex }) =>
                            onSortEnd(oldIndex, newIndex)
                        }
                        pressDelay={100}
                        helperClass={styles.draggableItem}
                    >
                        <div className={styles.standartColumns}>
                            {allCheck
                                ? allColumn
                                      .filter(col => col.standart === true)
                                      .map(
                                          (
                                              {
                                                  name,
                                                  dataIndex,
                                                  visible,
                                                  fixed,
                                              },
                                              index
                                          ) => (
                                              <>
                                                  <SortableItem
                                                      key={`item-${index}`}
                                                      index={index}
                                                      value={
                                                          <>
                                                              <Checkbox
                                                                  disabled={
                                                                      allCheck ||
                                                                      fixed
                                                                  }
                                                                  checked={
                                                                      visible
                                                                  }
                                                                  onChange={() =>
                                                                      handleCheckboxChange(
                                                                          dataIndex
                                                                      )
                                                                  }
                                                              >
                                                                  {name}
                                                              </Checkbox>

                                                              <GoListUnordered
                                                                  size={16}
                                                              />
                                                          </>
                                                      }
                                                  />
                                              </>
                                          )
                                      )
                                : allColumn.map(
                                      (
                                          { name, dataIndex, visible, fixed },
                                          index
                                      ) => (
                                          <>
                                              <SortableItem
                                                  key={`item-${index}`}
                                                  index={index}
                                                  value={
                                                      <>
                                                          <Checkbox
                                                              disabled={
                                                                  allCheck ||
                                                                  fixed
                                                              }
                                                              checked={visible}
                                                              onChange={() =>
                                                                  handleCheckboxChange(
                                                                      dataIndex
                                                                  )
                                                              }
                                                          >
                                                              {name}
                                                          </Checkbox>
                                                          <GoListUnordered
                                                              size={16}
                                                          />
                                                      </>
                                                  }
                                              />
                                          </>
                                      )
                                  )}
                        </div>
                    </SortableContainer>
                    {
                        allColumn
                        .find(col => col.standart === false)&&
                    allCheck && (
                        <div
                            className={styles.otherColumns}
                            style={
                                allCheck
                                    ? {
                                          borderTop: '1px solid #e8e8e8',
                                          paddingTop: '12px',
                                      }
                                    : { paddingTop: '0' }
                            }
                        >
                            {allColumn
                                .filter(col => col.standart === false)
                                .map(({ name, dataIndex, visible, fixed }) => (
                                    <Checkbox
                                        disabled={allCheck || fixed}
                                        checked={visible}
                                        onChange={() =>
                                            handleCheckboxChange(dataIndex)
                                        }
                                    >
                                        {name}
                                    </Checkbox>
                                ))}
                        </div>
                    )}
                </Card>
                <span className={styles.settingSaveButton}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => saveSetting(allColumn)}
                    >
                        Yadda Saxla{' '}
                    </Button>
                </span>
            </div>
        </Modal>
    );
}
