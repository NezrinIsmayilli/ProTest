import React, { useState } from 'react';

export const useTimer = () => {
    const [millis, setMillis] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const interval = React.useRef(null);
    const minutes = Math.floor(millis / 1000 / 60) % 60;
    const seconds = Math.floor(millis / 1000) % 60;

    const setTime = () => {
        setMillis(time => {
            const timeLeft = time + 1000;
            return timeLeft;
        });
    };

    const reset = () => {
        setMillis(0);
    };

    const start = () => {
        if (isStarted) {
            return;
        }
        setIsStarted(true);
        if (!interval.current) {
            interval.current = setInterval(setTime, 1000);
        }
    };
    const pause = () => clearInterval(interval.current);

    return {
        seconds,
        minutes,
        start,
        pause,
        reset,
    };
};
