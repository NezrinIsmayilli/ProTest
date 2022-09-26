import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { cookies } from 'utils/cookies';

const useSocket = () => {
    const endPoint = process.env.REACT_APP_SOCKET_URL;
    const token = cookies.get('_TKN_');
    const tenantId = cookies.get('__TNT__');
    const callToken = cookies.get('_TKN_CALL_');

    const [socket, setSocket] = useState(() =>
        io(endPoint, {
            query: `X-AUTH-PROTOKEN=${token}&X-CALL-TOKEN=${callToken}&X-TENANT-ID=${tenantId}&X-TENANT-CLIENT=1&PAGE-ID=106537401858714`,
        })
    );

    socket.on('connect', () => {
        console.log(socket.id);
    });

    socket.on('disconnect', () => {
        console.log(socket.id);
    });

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
