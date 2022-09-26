import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTerminalCommand } from 'store/actions/proTerminal';
import styles from './styles.module.scss';

export function ProTerminal() {

  const dispatch = useDispatch();
  const { terminalCommand } = useSelector(state => state.terminalCommandReducer);

  const handleKeydown = e => {
    if (e.keyCode === 13) {
      if (e.target.value !== '') {
        
        dispatch(fetchTerminalCommand(e.target.value));

        e.target.value = '';
      }
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  const handleTerminal = useCallback(
    event => {
      if (event.altKey && event.keyCode === 192 && !isVisible) {
        setIsVisible(true);
        terminalInput.current.focus();
      }

      if (event.keyCode === 27) {
        setIsVisible(false);
      }
    },
    [isVisible]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleTerminal, false);
    return () => {
      document.removeEventListener('keydown', handleTerminal, false);
    };
  }, [handleTerminal]);


  useEffect(() => {
    if (terminalCommand && terminalCommand !== '') {

      window.location.href = '/' + terminalCommand;

    }
  }, [terminalCommand])

  const terminalInput = useRef(null);

  return (
    <div className={`${styles.content} ${isVisible ? styles.active : null}`}>
      <div className={styles.backDrop} />
      <div className={styles.terminalContainer}>
        <input
          type="text"
          placeholder="Type your command"
          onKeyDown={handleKeydown}
          ref={terminalInput}
        />
      </div>
    </div>
  );
}
