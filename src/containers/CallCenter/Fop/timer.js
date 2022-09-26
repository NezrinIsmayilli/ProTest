import React from 'react';

export const Timer = ({ activitiDate }) => {
    const [time, setTime] = React.useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const formatter = value =>
        value > 0 && value <= 9
            ? `0${value}`
            : value > 0 && value >= 10
                ? value
                : '00';

    React.useEffect(() => {
        const timer = setInterval(() => {
            const dateNow = new Date();
            const activiti = new Date(activitiDate);

            let seconds = Math.floor((dateNow - activiti) / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            hours -= days * 24;
            minutes = minutes - days * 24 * 60 - hours * 60;
            seconds =
                seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

            setTime({
                days,
                hours,
                minutes,
                seconds,
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activitiDate]);

    return (
        <span>{`${time.days > 0 ? `${formatter(time.days)}:` : ''}${formatter(
            time.hours
        )}:${formatter(time.minutes)}:${formatter(time.seconds)}`}</span>
    );
};
