import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// actions
import {
  fetchNotifications,
  resetNotifications,
  // readNotificationById,
} from 'store/actions/apiNotifications';

function useNotificationsHandle() {
  // const [socket] = useSocket();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotifications());

    return () => {
      dispatch(resetNotifications());
    };
  }, [dispatch]);

  // useEffect(() => {
  //   socket.on('new notification', notification =>
  //     dispatch(onNewNotification(notification))
  //   );
  // }, [socket, dispatch]);
}

export { useNotificationsHandle };
