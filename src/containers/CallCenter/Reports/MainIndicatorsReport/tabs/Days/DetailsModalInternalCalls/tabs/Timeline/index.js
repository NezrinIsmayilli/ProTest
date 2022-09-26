import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Timeline as Timeliner, Row, Col, Spin } from 'antd';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import TimelineItem from './TimelineItem';
import TimelineItemCallStart from './TimelineItemCallStart';
import TimelineItemCallEnd from './TimelineItemCallEnd';
import TimelineItemCallAnswer from './TimelineItemCallAnswer';
import TimelineItemTransfer from './TimelineItemTransfer';

import styles from './styles.module.scss';

const Timeline = ({
  selectedCallDetail,
  selectedCallParticipant,
  isLoading,
  visible = false,
}) => {
  const [transferVisible, setTransferVisible] = useState(false);

  const handleTransferClick = () => {
    setTransferVisible(prevValue => !prevValue);
  };

  return (
    <div className={styles.Timeline} style={visible ? {} : { display: 'none' }}>
      <Spin spinning={isLoading}>
        <Row>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div style={{ height: '250px' }}>
              <div className={styles.date}>Zəngin başlama vaxtı</div>
              <div style={{ fontSize: '19px', marginRight: '20px' }}>
                Dəstəyin qaldırılmasını gözləmə
              </div>
            </div>
            {selectedCallDetail.status === 2 ? null : (
              <div style={{ height: '220px' }}>
                <div className={styles.date}>Dəstəyin qaldırılması</div>
                <div style={{ fontSize: '19px', marginRight: '20px' }}>
                  Xətdə gözləmə müddəti
                </div>
                <div style={{ fontSize: '19px', marginRight: '20px' }}>
                  Danışıq müddəti
                </div>
              </div>
            )}
            {selectedCallParticipant?.length > 2 &&
            selectedCallParticipant?.filter(({ talkTime }) => talkTime > 0)
              .length > 2 ? (
              <div style={{ height: '250px' }}>
                <div className={styles.transfer}>
                  {transferVisible ? (
                    <MdKeyboardArrowUp onClick={() => handleTransferClick()} />
                  ) : (
                    <MdKeyboardArrowDown
                      onClick={() => handleTransferClick()}
                    />
                  )}
                  <p style={{ marginBottom: 0 }}>Transfer</p>
                </div>
                <div style={{ fontSize: '19px', marginRight: '20px' }}>
                  Dəstəyin qaldırılmasını gözləmə
                </div>
              </div>
            ) : null}
            {transferVisible
              ? selectedCallParticipant
                  ?.filter(({ talkTime }) => talkTime > 0)
                  .map((element, index) => {
                    if (index === 2) {
                      if (element.talkTime > 0) {
                        return (
                          <div style={{ height: '220px' }}>
                            <div className={styles.date}>
                              Dəstəyin qaldırılması
                            </div>
                            <div
                              style={{ fontSize: '19px', marginRight: '20px' }}
                            >
                              Xətdə gözləmə müddəti
                            </div>
                            <div
                              style={{ fontSize: '19px', marginRight: '20px' }}
                            >
                              Danışıq müddəti
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div style={{ height: '200px' }}>
                          <div className={styles.date}>Uğursuz transfer</div>
                        </div>
                      );
                    }
                    if (index > 2) {
                      return (
                        <>
                          <div style={{ height: '250px' }}>
                            <div className={styles.transfer}>
                              <p style={{ marginBottom: 0 }}>Transfer</p>
                            </div>
                            <div
                              style={{ fontSize: '19px', marginRight: '20px' }}
                            >
                              Dəstəyin qaldırılmasını gözləmə
                            </div>
                          </div>
                          <div style={{ height: '220px' }}>
                            <div className={styles.date}>
                              Dəstəyin qaldırılması
                            </div>
                            <div
                              style={{ fontSize: '19px', marginRight: '20px' }}
                            >
                              Xətdə gözləmə müddəti
                            </div>
                            <div
                              style={{ fontSize: '19px', marginRight: '20px' }}
                            >
                              Danışıq müddəti
                            </div>
                          </div>
                        </>
                      );
                    }
                  })
              : null}
            <div style={{ height: '250px' }}>
              <div className={styles.date}>Zəngin bitmə vaxtı</div>
              <div style={{ fontSize: '19px', marginRight: '20px' }}>
                Zəngin ümumi müddəti
              </div>
            </div>
          </Col>
          <Col span={15}>
            <Timeliner>
              <Timeliner.Item>
                <TimelineItemCallStart
                  selectedCallDetail={selectedCallDetail}
                  selectedCallParticipant={selectedCallParticipant}
                />
              </Timeliner.Item>
              {selectedCallDetail.status === 2 ? null : (
                <Timeliner.Item>
                  <TimelineItemCallAnswer
                    selectedCallDetail={selectedCallDetail}
                    selectedCallParticipant={selectedCallParticipant}
                  />
                </Timeliner.Item>
              )}
              {selectedCallParticipant?.length > 2 &&
              selectedCallParticipant?.filter(({ talkTime }) => talkTime > 0)
                .length > 2 ? (
                <Timeliner.Item>
                  <TimelineItemTransfer
                    selectedCallDetail={
                      selectedCallParticipant?.filter(
                        ({ talkTime }) => talkTime > 0
                      )[1]
                    }
                    participants={selectedCallParticipant?.filter(
                      ({ talkTime }) => talkTime > 0
                    )}
                    isTransferrer
                    index={2}
                  />
                </Timeliner.Item>
              ) : null}
              {transferVisible
                ? selectedCallParticipant
                    ?.filter(({ talkTime }) => talkTime > 0)
                    .map((element, index) => {
                      if (index === 2) {
                        if (element.talkTime > 0) {
                          return (
                            <Timeliner.Item>
                              <TimelineItemTransfer
                                selectedCallDetail={element}
                                participants={selectedCallParticipant?.filter(
                                  ({ talkTime }) => talkTime > 0
                                )}
                              />
                            </Timeliner.Item>
                          );
                        }
                        return (
                          <Timeliner.Item>
                            <TimelineItemTransfer
                              selectedCallDetail={element}
                              participants={selectedCallParticipant?.filter(
                                ({ talkTime }) => talkTime > 0
                              )}
                            />
                          </Timeliner.Item>
                        );
                      }
                      if (index > 2) {
                        if (element.talkTime > 0) {
                          return (
                            <>
                              <Timeliner.Item>
                                <TimelineItemTransfer
                                  selectedCallDetail={
                                    selectedCallParticipant?.filter(
                                      ({ talkTime }) => talkTime > 0
                                    )[index - 1]
                                  }
                                  participants={selectedCallParticipant?.filter(
                                    ({ talkTime }) => talkTime > 0
                                  )}
                                  isTransferrer
                                  index={index}
                                />
                              </Timeliner.Item>
                              <Timeliner.Item>
                                <TimelineItemTransfer
                                  selectedCallDetail={element}
                                  participants={selectedCallParticipant?.filter(
                                    ({ talkTime }) => talkTime > 0
                                  )}
                                />
                              </Timeliner.Item>
                            </>
                          );
                        }
                        return (
                          <Timeliner.Item>
                            <TimelineItemTransfer
                              selectedCallDetail={element}
                              participants={selectedCallParticipant?.filter(
                                ({ talkTime }) => talkTime > 0
                              )}
                            />
                          </Timeliner.Item>
                        );
                      }
                    })
                : null}
              <Timeliner.Item>
                <TimelineItemCallEnd
                  selectedCallDetail={selectedCallDetail}
                  isTransfer={
                    selectedCallParticipant?.filter(
                      ({ talkTime }) => talkTime > 0
                    ).length > 2
                  }
                  participants={selectedCallParticipant?.filter(
                    ({ talkTime }) => talkTime > 0
                  )}
                />
              </Timeliner.Item>
              {selectedCallDetail.direction === 3 ? null : (
                <Timeliner.Item>
                  <TimelineItem selectedCallDetail={selectedCallDetail} />
                </Timeliner.Item>
              )}
            </Timeliner>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.selectedCall,
});

export default connect(
  mapStateToProps,

  null
)(Timeline);
