import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { cookies } from 'utils/cookies';

const useSocket = () => {
  const endPoint = process.env.REACT_APP_SOCKET_URL;
  const token = cookies.get('_TKN_');
  const tenantId = cookies.get('__TNT__');

  const [socket, setSocket] = useState(() =>
    io(endPoint, {
      query: `X-AUTH-PROTOKEN=${token}&X-TENANT-ID=${tenantId}`,
    })
  );

  useEffect(
    () => () => {
      socket.removeAllListeners();
      socket.close();
    },
    [socket]
  );

  return [socket, setSocket];
};

export { useSocket };
