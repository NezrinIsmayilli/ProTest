import React, { useState, createContext } from 'react';
import io from 'socket.io-client';
import { cookies } from 'utils/cookies';

export const SocketContext = createContext();

export const SocketContextProvider = props => {
    const endPoint = process.env.REACT_APP_SOCKET_URL;
    const token = cookies.get('_TKN_');
    const tenantId = cookies.get('__TNT__');
    const callToken = cookies.get('_TKN_CALL_');

    const [socket, setSocket] = useState(() =>
        io(endPoint, {
            query: `X-AUTH-PROTOKEN=${token}&X-CALL-TOKEN=${callToken}&X-TENANT-ID=${tenantId}&X-TENANT-CLIENT=1&PAGE-ID=106537401858714`,
        })
    );

    return (
        <SocketContext.Provider value={[socket, setSocket]}>
            {props.children}
        </SocketContext.Provider>
    );
};
