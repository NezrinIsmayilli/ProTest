import React, { useEffect, useRef, useState, useContext } from 'react';
import * as JsSIP from 'jssip';
import Wave from 'wave-visualizer';

import { Input, Avatar, Tooltip } from 'antd';

import { ImPhoneHangUp, ImPhone, ImAddressBook, ImUndo2 } from 'react-icons/im';
import { BiMicrophone, BiMicrophoneOff, BiSupport } from 'react-icons/bi';
import {
	MdPhoneLocked,
	MdPhonePaused,
	MdPhoneForwarded,
	MdDialpad,
} from 'react-icons/md';
import { GrFormClose } from 'react-icons/gr';

import { useTimer } from 'hooks';

import styled from 'styled-components';
import styles from './styles.module.scss';

const { Search } = Input;

// const initBeforeUnLoad = () => {
// 	window.onbeforeunload = event => {
// 		const e = event || window.event;
// 		e.preventDefault();
// 		if (e) {
// 			e.returnValue = '';
// 		}
// 		return '';
// 	};
// };

const ProPhone = ({ setRecords, sipCredentials, callAccepted, operators }) => {
	const {
		seconds,
		minutes,
		start: startTimer,
		reset: resetTimer,
	} = useTimer();

	// window.onload = function () {
	// 	initBeforeUnLoad();
	// };

	// useEffect(() => {
	// 	initBeforeUnLoad();
	// }, []);

	const [state, setState] = useState({
		ua: null,
		sipStatus: null,
		sipErrorType: null,
		sipErrorMessage: null,
		rtcSession: null,
		callStatus: null,
		callDirection: null,
		callCounterpart: null,
		remoteAudio: null,
		recorder: [],
		callerModal: false,
	});

	const [call, setCall] = useState({
		type: null,
		direction: null,
		info: null,
		reguest: null,
	});

	const [internalCalling, setInternalCalling] = useState({});

	const callRef = React.useRef(call);

	const setCallRef = data => {
		callRef.current = data;
	};

	const [wave] = useState(new Wave());

	const ringtoneRef = useRef(undefined);
	const keytoneRef = useRef(undefined);
	const internalRingingRef = useRef(undefined);

	const createAudioElement = () => {
		if (window.document.getElementById('sip-provider-audio')) {
			// throw new Error(
			//     `Creating two SipProviders in one application is forbidden. If that's not the case ` +
			//     `then check if you're using "sip-provider-audio" as id attribute for any existing ` +
			//     `element`
			// );

			window.document.getElementById('sip-provider-audio').remove();
		}

		const remoteAudioo = window.document.createElement('audio');
		remoteAudioo.id = 'sip-provider-audio';
		window.document.body.appendChild(remoteAudioo);

		setState(prevState => ({
			...prevState,
			remoteAudio: remoteAudioo,
		}));
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const register = sipCredentials => {
		const {
			subdomain,
			number: sipNumber,
			password,
			tlsPort,
			wssPort,
		} = sipCredentials;
		if (state.ua) {
			// state.ua.stop();
			state.ua = null;
		}
		const wwsUrl =
			process.env.NODE_ENV === 'production'
				? process.env.REACT_APP_WSS_URL
				: process.env.REACT_APP_WSS_DEV_URL;
		try {
			const socket = new JsSIP.WebSocketInterface(
				`wss://${subdomain}.${wwsUrl}:${wssPort}`
			);

			state.ua = new JsSIP.UA({
				sockets: [socket],
				uri: `sip:${sipNumber}@${subdomain}.${wwsUrl}:${tlsPort}`,
				password,
				authorization_user: sipNumber,
			});
		} catch (error) {
			console.log('Error', error.message, error);

			setState(prevState => ({
				...prevState,
				sipStatus: 'error',
				sipErrorType: 'error',
				sipErrorMessage: error.message,
			}));
		}

		state.ua.on('connecting', () => {
			console.log('UA "connecting" event');

			setState(prevState => ({
				...prevState,
				sipStatus: 'SIP_STATUS_CONNECTING',
				sipErrorType: null,
				sipErrorMessage: 'yoxlama',
			}));
		});

		state.ua.on('connected', () => {
			console.log('UA "connected" event');

			setState(prevState => ({
				...prevState,
				sipStatus: 'SIP_STATUS_CONNECTED',
				sipErrorType: null,
				sipErrorMessage: null,
			}));
		});

		state.ua.on('disconnected', () => {
			console.log('UA "disconnected" event');

			setState(prevState => ({
				...prevState,
				sipStatus: 'SIP_STATUS_ERROR',
				sipErrorType: 'SIP_ERROR_TYPE_CONNECTION',
				sipErrorMessage: 'disconnected',
			}));
		});

		state.ua.on('registered', data => {
			console.log('UA "registered" event', data);

			setState(prevState => ({
				...prevState,
				sipStatus: 'SIP_STATUS_REGISTERED',
				callStatus: 'CALL_STATUS_IDLE',
			}));
		});

		state.ua.on('unregistered', () => {
			console.log('UA "unregistered" event');

			if (state.ua.isConnected()) {
				setState(prevState => ({
					...prevState,
					sipStatus: 'SIP_STATUS_CONNECTED',
					callStatus: 'CALL_STATUS_IDLE',
					callDirection: null,
				}));
			} else {
				setState(prevState => ({
					...prevState,
					sipStatus: 'SIP_STATUS_DISCONNECTED',
					callStatus: 'CALL_STATUS_IDLE',
					callDirection: null,
				}));
			}
		});

		state.ua.on('registrationFailed', data => {
			console.log('UA "registrationFailed" event');

			setState(prevState => ({
				...prevState,
				sipStatus: 'SIP_STATUS_ERROR',
				sipErrorType: 'SIP_ERROR_TYPE_REGISTRATION',
				sipErrorMessage: data,
			}));
		});

		state.ua.on(
			'newRTCSession',
			({ originator, session: rtcSession, request: rtcRequest }) => {
				console.log('call type', callRef.current.type);

				if (callRef.current.type) {
					rtcSession.terminate({
						status_code: 486,
						reason_phrase: 'Busy Here',
					});
					return;
				}

				// identify call direction
				if (originator === 'local') {
					const foundUri = rtcRequest.to.toString();
					const delimiterPosition = foundUri.indexOf(';') || null;
					setState(prevState => ({
						...prevState,
						callDirection: 'CALL_DIRECTION_OUTGOING',
						callStatus: 'CALL_STATUS_STARTING',
						callCounterpart:
							foundUri.substring(0, delimiterPosition) ||
							foundUri,
					}));

					setCall(prevState => ({
						...prevState,
						type: 'outgoing',
						info: rtcSession,
						reguest: rtcRequest,
					}));

					setCallRef({ type: 'outgoing' });

					internalRingingRef.current.play();
				} else if (originator === 'remote') {
					const foundUri = rtcRequest.from.toString();
					const delimiterPosition = foundUri.indexOf(';') || null;
					setCall(prevState => ({
						...prevState,
						type: 'incoming',
						info: rtcSession,
						reguest: rtcRequest,
					}));

					setCallRef({ type: 'incoming' });
					setState(prevState => ({
						...prevState,
						callDirection: 'CALL_DIRECTION_INCOMING',
						callStatus: 'CALL_STATUS_STARTING',
						callCounterpart:
							foundUri.substring(0, delimiterPosition) ||
							foundUri,
					}));

					internalRingingRef.current.pause();

					ringtoneRef.current.play();
				}

				const { rtcSession: rtcSessionInState } = state;

				// Avoid if busy or other incoming
				if (rtcSessionInState) {
					console.log('incoming call replied with 486 "Busy Here"');
					rtcSession.terminate({
						status_code: 486,
						reason_phrase: 'Busy Here',
					});
					setCall(prevState => ({
						...prevState,
						type: null,
						info: null,
						request: null,
					}));
					setCallRef({ type: null });
					ringtoneRef.current.pause();
					internalRingingRef.current.pause();
					return;
				}

				setState(prevState => ({
					...prevState,
					rtcSession,
				}));

				rtcSession.on('failed', () => {
					setState(prevState => ({
						...prevState,
						rtcSession: null,
						callStatus: 'CALL_STATUS_IDLE',
						callDirection: null,
						callCounterpart: null,
					}));
					setCall({
						type: null,
						info: null,
						request: null,
					});
					setCallRef({ type: null });
					ringtoneRef.current.pause();
					internalRingingRef.current.pause();
					handleSearch({ target: { value: '' } });
					setInternalCalling({});
				});

				rtcSession.on('ended', () => {
					setState(prevState => ({
						...prevState,
						rtcSession: null,
						callStatus: 'CALL_STATUS_IDLE',
						callDirection: null,
						callCounterpart: null,
					}));
					setCall(prevState => ({
						...prevState,
						type: null,
						info: null,
						request: null,
					}));
					setCallRef({ type: null });
					ringtoneRef.current.pause();
					internalRingingRef.current.pause();
					handleSearch({ target: { value: '' } });
					setInternalCalling({});
				});

				rtcSession.on('accepted', () => {
					internalRingingRef.current.pause();

					const remoteStreams = rtcSession.connection.getRemoteStreams();

					[state.remoteAudio.srcObject] = remoteStreams; // rtcSession.connection.getRemoteStreams();

					const played = state.remoteAudio.play();

					if (typeof played !== 'undefined') {
						played
							.catch(() => {
								/**/
								// console.log(played);
							})
							.then(() => {
								state.remoteAudio.play();
							});

						setState(prevState => ({
							...prevState,
							callStatus: 'CALL_STATUS_ACTIVE',
						}));

						setCall(prevState => ({
							...prevState,
							type: 'onCall',
						}));
						setCallRef({ type: 'onCall' });
						resetTimer();
						startTimer();

						navigator.mediaDevices
							.getUserMedia({
								audio: true,
							})
							.then(function (stream) {
								wave.fromStream(stream, 'output', {
									type: ['shine'],
									colors: ['#FA374F', '#FA374F', '#FA374F'],
								});
							})
							.catch(function (err) {
								console.log(err.message);
							});

						return;
					}

					state.remoteAudio.play();

					setState(prevState => ({
						...prevState,
						callStatus: 'CALL_STATUS_ACTIVE',
					}));

					setCall(prevState => ({
						...prevState,
						type: 'onCall',
					}));

					setCallRef({ type: 'onCall' });

					startTimer();

					navigator.mediaDevices
						.getUserMedia({
							audio: true,
						})
						.then(function (stream) {
							wave.fromStream(stream, 'output', {
								stroke: 3,
								type: ['shine'],
								colors: ['#FA374F', '#FA374F', '#FA374F'],
							});
						})
						.catch(function (err) {
							console.log(err.message);
						});
				});
			}
		);
		state.ua.start();
	};

	useEffect(() => {
		createAudioElement();
		JsSIP.debug.enable('JsSIP:*');
	}, []);

	const startCall = destination => {
		if (!destination) {
			throw new Error(
				`Destination must be defined (${destination} given)`
			);
		}
		if (
			state.sipStatus !== 'SIP_STATUS_CONNECTED' &&
			state.sipStatus !== 'SIP_STATUS_REGISTERED'
		) {
			throw new Error(
				`Calling startCall() is not allowed when sip status is ${state.sipStatus
				} (expected ${'SIP_STATUS_CONNECTED'} or ${'SIP_STATUS_REGISTERED'})`
			);
		}

		if (state.callStatus !== 'CALL_STATUS_IDLE') {
			throw new Error(
				`Calling startCall() is not allowed when call status is ${state.callStatus
				} (expected ${'CALL_STATUS_IDLE'})`
			);
		}

		const options = {
			mediaConstraints: { audio: true, video: false },
			rtcOfferConstraints: { iceRestart: false },
			sessionTimersExpires: 120,
		};

		const operator = operatorsList.find(
			oper => oper.number === destination
		);

		setInternalCalling({
			name: `${operator?.prospectTenantPerson?.name}
			${operator?.prospectTenantPerson?.lastName}`,
			number: operator?.number,
		});

		state.ua.call(destination, options);
		setState(prevState => ({
			...prevState,
			callStatus: 'CALL_STATUS_STARTING',
		}));
	};

	const acceptCall = () => {
		state.rtcSession.answer({
			mediaConstraints: {
				audio: true, // only audio calls
				video: false,
			},
		});
		setCall(prevState => ({
			...prevState,
			type: 'onCall',
		}));
		setCallRef({ type: 'onCall' });
		ringtoneRef.current.pause();
		internalRingingRef.current.pause();
		startTimer();

		callAccepted(call);
	};

	const declineAnsweredCall = () => {
		resetTimer();
		state.rtcSession.terminate();
		internalRingingRef.current.pause();
		setInternalCalling({});
	};

	const declineIncomingCall = () => {
		state.rtcSession.terminate();
		internalRingingRef.current.pause();
		setInternalCalling({});
	};

	const toogleHold = () => {
		if (state.rtcSession.isOnHold().local) {
			state.rtcSession.unhold();
		} else {
			state.rtcSession.hold();
		}
	};

	const toogleMute = () => {
		if (state.rtcSession.isMuted().audio) {
			state.rtcSession.unmute();
		} else {
			state.rtcSession.mute();
		}
	};

	const toogleCaller = () => {
		setState({
			...state,
			callerModal: !state.callerModal,
		});
		setShowAddressBook(true);
		handleSearch({ target: { value: '' } });
	};

	const [number, setNumber] = React.useState({
		destination: '',
	});

	const dialing = num => {
		if (num !== 'remove') {
			setNumber(prevState => ({
				...prevState,
				destination: `${number.destination}${num}`,
			}));
		} else {
			setNumber(prevState => ({
				...prevState,
				destination: number.destination.slice(0, -1),
			}));
		}

		keytoneRef.current.play();
	};

	React.useEffect(() => {
		if (
			sipCredentials &&
			sipCredentials.subdomain &&
			sipCredentials.number &&
			sipCredentials.password &&
			sipCredentials.tlsPort &&
			sipCredentials.wssPort &&
			state.sipStatus === null
		) {
			setTimeout(() => {
				register(sipCredentials);
			}, 1500);
		}
	}, [register, sipCredentials, state.sipStatus]);

	const [showAddressBook, setShowAddressBook] = React.useState(true);
	const [operatorsList, setOperatorsList] = React.useState([]);

	React.useEffect(() => {
		setOperatorsList(operators);
	}, [operators]);

	const handleSearch = item => {
		if (
			item.target.value &&
			(item.target.value.length > 3 || item.target.value.length <= 0)
		) {
			const { value } = item.target;
			const filtered = operators.filter(operator => {
				const fullName = `${operator.prospectTenantPerson.name.toLowerCase()} ${operator.prospectTenantPerson.lastName.toLowerCase()}`;

				return fullName.includes(value.toLowerCase());
			});
			setOperatorsList(filtered);
		} else {
			setOperatorsList(operators);
		}
	};

	return (
		<PhoneContainer
			opened={
				state.callerModal ||
				call?.type === 'incoming' ||
				call?.type === 'onCall'
			}
		>
			<div className={styles.flyingProPhone}>
				{/* <Dropdown overlay={menu} placement="bottomRight"> */}
				<div className={styles.flyingDropdown}>
					<button
						type="button"
						className={styles.flyingDropdownButton}
						onClick={() => toogleCaller()}
					>
						<Status
							state={state.sipStatus === 'SIP_STATUS_REGISTERED'}
						>
							<ImPhone />
						</Status>
					</button>
				</div>
				{/* </Dropdown> */}
			</div>
			<audio
				style={{ display: 'none' }}
				src="https://mirids.net/iphone_7.mp3"
				ref={ringtoneRef}
				id="specter"
			/>
			<audio
				style={{ display: 'none' }}
				src="https://mirids.net/button.mp3"
				ref={keytoneRef}
			/>
			<audio
				style={{ display: 'none' }}
				src="https://mirids.net/internal_ringing.mp3"
				ref={internalRingingRef}
			/>

			{!call.type && state.callerModal ? (
				<div className={styles.callerContainer}>
					<div className={styles.phoneOnCallHeader}>
						<button
							type="button"
							className={styles.callerCloser}
							onClick={() => toogleCaller()}
						>
							<GrFormClose />
						</button>
					</div>
					{showAddressBook ? (
						<div className={styles.phoneOnCallBody}>
							<div className={styles.phoneOnCallBodyHeader}>
								İstifadəçi siyahısı
							</div>
							<div className={styles.phoneOnCallSearch}>
								<Search
									placeholder="Axtarış üçün açar sözü daxil edin"
									onChange={handleSearch}
									size="large"
									allowClear
								/>
							</div>
							<ul className={styles.phoneOnCallOperatorsList}>
								{operatorsList.map((item, index) => (
									<>
										{item.number !==
											sipCredentials.number &&
											item.prospectTenantPerson && (
												<li key={index}>
													<div
														className={
															styles.phoneOnCallOperatorInfo
														}
													>
														<Avatar
															size={40}
															src={
																item
																	?.prospectTenantPerson
																	?.attachment
															}
															icon={
																<BiSupport color="#ffffff" />
															}
														/>
														<div
															className={
																styles.phoneOnCallOperatorName
															}
														>
															<div
																className={
																	styles.phoneOnCallOperatorNameText
																}
															>
																{
																	item
																		?.prospectTenantPerson
																		?.name
																}{' '}
																{
																	item
																		?.prospectTenantPerson
																		?.lastName
																}
															</div>
															<span>
																{item?.number}
															</span>
														</div>
													</div>
													<Tooltip title="Zəng et">
														<button
															type="button"
															onClick={() => {
																startCall(
																	item?.number
																);

																setInternalCalling(
																	{
																		name: `${item?.prospectTenantPerson?.name}
																	${item?.prospectTenantPerson?.lastName}`,
																		number:
																			item?.number,
																	}
																);
															}}
														>
															<ImPhone color="#00e491" />
														</button>
													</Tooltip>
												</li>
											)}
									</>
								))}
							</ul>
							<div className={styles.phoneOnCallReturnPad}>
								<button
									type="button"
									onClick={() => setShowAddressBook(false)}
								>
									<MdDialpad size={24} color="#ffd741" />
								</button>
							</div>
						</div>
					) : (
						<div className={styles.phoneOnCallBody}>
							<div className={styles.phoneDisplay}>
								<input
									type="text"
									value={number.destination}
									disabled
								/>
							</div>

							<div className={styles.phoneControls}>
								<div className={styles.phoneNumbers}>
									<button
										type="button"
										onClick={() => dialing(1)}
									>
										1
									</button>
									<button
										type="button"
										onClick={() => dialing(2)}
									>
										2
									</button>
									<button
										type="button"
										onClick={() => dialing(3)}
									>
										3
									</button>
								</div>
								<div className={styles.phoneNumbers}>
									<button
										type="button"
										onClick={() => dialing(4)}
									>
										4
									</button>
									<button
										type="button"
										onClick={() => dialing(5)}
									>
										5
									</button>
									<button
										type="button"
										onClick={() => dialing(6)}
									>
										6
									</button>
								</div>
								<div className={styles.phoneNumbers}>
									<button
										type="button"
										onClick={() => dialing(7)}
									>
										7
									</button>
									<button
										type="button"
										onClick={() => dialing(8)}
									>
										8
									</button>
									<button
										type="button"
										onClick={() => dialing(9)}
									>
										9
									</button>
								</div>
								<div className={styles.phoneNumbers}>
									<button type="button">*</button>
									<button
										type="button"
										onClick={() => dialing(0)}
									>
										0
									</button>
									<button type="button">#</button>
								</div>
								<div className={styles.phoneNumbers}>
									<button
										type="button"
										className={
											styles.phoneNumersAddressBook
										}
										onClick={() => setShowAddressBook(true)}
									>
										<ImAddressBook />
									</button>
									<button
										type="button"
										className={styles.phoneNumersCall}
										onClick={() =>
											startCall(number.destination)
										}
									>
										<ImPhone />
									</button>
									<button
										type="button"
										className={styles.phoneNumersClear}
										onClick={() => dialing('remove')}
									>
										<ImUndo2 />
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			) : null}

			{call.type ? (
				<div
					className={`
						${styles.phoneContainer}
						${call.type === 'onCall' && styles.ontop}`}
				>
					{call.type === 'onCall' && (
						<>
							<div className={styles.phoneOnCallHeader}>
								<div className={styles.phoneCallerNameAndType}>
									<div className={styles.phoneCallerName}>
										{call &&
											call.info._direction === 'incoming'
											? call?.reguest?.from?._display_name
											: call &&
												call._direction === 'outgoing'
												? call?.reguest?.to?._display_name
												: null}
									</div>
									<div className={styles.phoneCallerType}>
										---
									</div>
								</div>
								<div
									className={styles.phoneCallerNumberAndTimer}
								>
									<div className={styles.phoneCallerNumber}>
										{call &&
											call.info._direction === 'incoming'
											? call.reguest.from._uri._user
											: call &&
												call.info._direction ===
												'outgoing'
												? call.reguest.to._uri._user
												: null}
									</div>
									<div className={styles.phoneCallerTimer}>
										{minutes <= 9 ? `0${minutes}` : minutes}
										{':'}
										{seconds <= 9 ? `0${seconds}` : seconds}
									</div>
								</div>
							</div>
							<div className={styles.phoneOnCallBody}>
								<div className={styles.spectumContainer}>
									<canvas
										id="output"
										height="50"
										width="360"
									></canvas>
								</div>

								<div className={styles.phoneCallControls}>
									<button
										type="button"
										className={`${styles.phoneMute} ${state.rtcSession?.isMuted().audio
											? styles.active
											: null
											}`}
										onClick={() => toogleMute()}
									>
										{state.rtcSession?.isMuted().audio ? (
											<BiMicrophoneOff />
										) : (
											<BiMicrophone />
										)}
										Mute
									</button>
									<button
										type="button"
										className={`${styles.phoneHold} ${state.rtcSession?.isOnHold().local
											? styles.active
											: null
											}`}
										onClick={() => toogleHold()}
									>
										{state.rtcSession?.isOnHold().local ? (
											<MdPhoneLocked />
										) : (
											<MdPhonePaused />
										)}
										Hold
									</button>
									<button
										type="button"
										className={styles.phoneEnd}
										onClick={() => declineAnsweredCall()}
									>
										<ImPhoneHangUp />
										End
									</button>
								</div>
							</div>
						</>
					)}
					{call.type === 'outgoing' && (
						<div className={styles.phoneIncomingBody}>
							<div className={styles.phoneIncomingWrapper}>
								<div className={styles.phoneIncomingHangUp}>
									<button
										type="button"
										onClick={() => declineIncomingCall()}
									>
										<GrFormClose />
									</button>
								</div>
								<div
									className={
										styles.phoneIncomingNameAndNumber
									}
								>
									<div className={styles.phoneIncoming}>
										Çıxış zəngi
									</div>
									<div className={styles.phoneIncomingName}>
										{internalCalling?.number}
										<span>{internalCalling?.name}</span>
									</div>
								</div>
								<button
									type="button"
									className={styles.phoneOutgoingAnswer}
									onClick={() => declineIncomingCall()}
								>
									<ImPhone />
									İmtina et
								</button>
							</div>
						</div>
					)}
					{call.type === 'incoming' && (
						<div className={styles.phoneIncomingBody}>
							<div className={styles.phoneIncomingWrapper}>
								<div className={styles.phoneIncomingHangUp}>
									<button
										type="button"
										onClick={() => declineIncomingCall()}
									>
										<GrFormClose />
									</button>
								</div>
								<div
									className={
										styles.phoneIncomingNameAndNumber
									}
								>
									<div className={styles.phoneIncoming}>
										Daxil olan zəng
									</div>
									<div className={styles.phoneIncomingName}>
										{call?.reguest?.from?._display_name}
										<span>
											{call?.reguest?.from?._uri?._user ||
												'Təyin edilmyib'}
										</span>
									</div>
								</div>
								<button
									type="button"
									className={styles.phoneIncomingAnswer}
									onClick={() => acceptCall()}
								>
									<ImPhone />
									Cavabla
								</button>
							</div>
						</div>
					)}
				</div>
			) : null}
		</PhoneContainer>
	);
};

export default ProPhone;

const Status = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 15px;
    border: 0;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: rgb(0 0 0 / 5%) 0px 6px 24px 0px,
        rgb(0 0 0 / 8%) 0px 0px 0px 1px;
    color: ${props => (props.state ? '#00E491' : '#FA374F')};

    margin-right: 10px;
`;

const PhoneContainer = styled.div`
    position: fixed;
    top: 15px;
    left: 408px;
    z-index: 1000;

	@media (max-width: 768px) {
        display: none;
    }
`;
