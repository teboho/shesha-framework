import React, { FC, PropsWithChildren, useState, useEffect, useRef } from 'react';
import {
  getPercentage,
  getStatus,
  getTimeFormat,
  MIN_TIME,
  ONE_SECOND,
  SIXTY
  } from './util';
import { IdleTimerComponent } from 'react-idle-timer';
import { ISettingIdentifier } from '@/providers/settings/models';
import { Modal, Progress } from 'antd';
import { useAuth } from '@/providers/auth';
import { useInterval } from 'react-use';
import { useSettingValue } from '@/providers/settings';
import { useStyles } from './styles/styles';

export interface IIdleTimerRendererProps { }

interface IIdleTimerState {
  readonly isIdle: boolean;
  readonly remainingTime: number;
  readonly isUserInactivityWarning: boolean;
  readonly userInactivityRemainingTime: number;
}

const INIT_STATE: IIdleTimerState = {
  isIdle: false,
  remainingTime: SIXTY,
  isUserInactivityWarning: false,
  userInactivityRemainingTime: SIXTY,
};

const autoLogoffTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security.AutoLogoffTimeout', module: 'Shesha' };
const logoutOnUserInactiveSettingId: ISettingIdentifier = { name: 'Shesha.Security.LogoutOnUserInactive', module: 'Shesha' };
const logoutOnUserInactiveTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security.LogoutOnUserInactiveTimeout', module: 'Shesha' };

export const IdleTimerRenderer: FC<PropsWithChildren<IIdleTimerRendererProps>> = ({ children }) => {
  const { styles } = useStyles();
  const { value: autoLogoffTimeout } = useSettingValue<number>(autoLogoffTimeoutSettingId);
  const { value: logoutOnUserInactive } = useSettingValue<boolean>(logoutOnUserInactiveSettingId);
  const { value: logoutOnUserInactiveTimeout } = useSettingValue<number>(logoutOnUserInactiveTimeoutSettingId);
  const timeoutSeconds = autoLogoffTimeout ?? 0;
  const inactiveTimeoutMinutes = logoutOnUserInactiveTimeout ?? 30;
  const inactiveTimeoutSeconds = inactiveTimeoutMinutes * 60;

  const { logoutUser, loginInfo } = useAuth();

  const [state, setState] = useState<IIdleTimerState>(INIT_STATE);
  const { isIdle, remainingTime: rt, isUserInactivityWarning, userInactivityRemainingTime } = state;

  const isLegacyTimeoutSet = timeoutSeconds >= MIN_TIME && !!loginInfo;
  const isUserInactiveTimeoutSet = logoutOnUserInactive && inactiveTimeoutSeconds >= MIN_TIME && !!loginInfo;
  const isAnyTimeoutSet = isLegacyTimeoutSet || isUserInactiveTimeoutSet;
  
  // Use the user inactive timeout if enabled, otherwise fall back to legacy timeout
  const effectiveTimeoutSeconds = isUserInactiveTimeoutSet ? inactiveTimeoutSeconds : timeoutSeconds;
  const timeout = getTimeFormat(effectiveTimeoutSeconds);
  const visible = isIdle && isAnyTimeoutSet;
  
  const userInactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const userInactivityCountdownRef = useRef<NodeJS.Timeout>();
  const warningTimeSeconds = 60; // Show warning 60 seconds before logout

  // User Activity Detection for new inactivity feature
  useEffect(() => {
    if (!isUserInactiveTimeoutSet) {
      return undefined;
    }

    let inactivityTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const resetUserInactivityTimer = () => {
      setState(s => ({ ...s, isUserInactivityWarning: false, userInactivityRemainingTime: SIXTY }));
      
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (countdownTimer) clearInterval(countdownTimer);

      // Set timer to detect user inactivity (minus warning time)
      const timeToWarning = (inactiveTimeoutMinutes * 60 - warningTimeSeconds) * 1000;
      inactivityTimer = setTimeout(() => {
        startUserInactivityWarning();
      }, timeToWarning);
    };

    const startUserInactivityWarning = () => {
      setState(s => ({ ...s, isUserInactivityWarning: true, userInactivityRemainingTime: warningTimeSeconds }));
      
      let timeLeft = warningTimeSeconds;
      countdownTimer = setInterval(() => {
        timeLeft -= 1;
        setState(s => ({ ...s, userInactivityRemainingTime: timeLeft }));
        
        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          logoutUser();
        }
      }, 1000);
    };

    const handleUserActivity = () => {
      if (isUserInactivityWarning) {
        resetUserInactivityTimer();
      }
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initialize timer
    resetUserInactivityTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isUserInactiveTimeoutSet, inactiveTimeoutMinutes, loginInfo, isUserInactivityWarning, logoutUser]);

  const onAction = (_event: Event) => {
    /*nop*/
  };

  const onActive = (_event: Event) => {
    /*nop*/
  };

  const onIdle = (_event: Event) => setState(s => ({ ...s, isIdle: true }));

  const logout = () => logoutUser().then(() => setState(INIT_STATE));

  const doCountdown = () => {
    if (!rt) {
      logout();
    } else {
      setState(({ remainingTime: r, ...s }) => ({ ...s, remainingTime: r - 1 }));
    }
  };

  useInterval(() => {
    if (isIdle) {
      doCountdown();
    }
  }, ONE_SECOND);

  const onOk = () => logout();

  const onCancel = () => setState(s => ({ ...s, isIdle: false, remainingTime: SIXTY }));

  const onUserInactivityOk = () => logoutUser();

  const onUserInactivityCancel = () => {
    setState(s => ({ ...s, isUserInactivityWarning: false, userInactivityRemainingTime: SIXTY }));
    // Reset the inactivity timer
    const timeToWarning = (inactiveTimeoutMinutes * 60 - warningTimeSeconds) * 1000;
    if (userInactivityTimeoutRef.current) clearTimeout(userInactivityTimeoutRef.current);
    if (userInactivityCountdownRef.current) clearInterval(userInactivityCountdownRef.current);
    
    userInactivityTimeoutRef.current = setTimeout(() => {
      setState(s => ({ ...s, isUserInactivityWarning: true, userInactivityRemainingTime: warningTimeSeconds }));
      
      let timeLeft = warningTimeSeconds;
      userInactivityCountdownRef.current = setInterval(() => {
        timeLeft -= 1;
        setState(s => ({ ...s, userInactivityRemainingTime: timeLeft }));
        
        if (timeLeft <= 0) {
          clearInterval(userInactivityCountdownRef.current);
          logoutUser();
        }
      }, 1000);
    }, timeToWarning);
  };

  if (!isAnyTimeoutSet) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shaIdleTimerRenderer}>
      <IdleTimerComponent onAction={onAction} onActive={onActive} onIdle={onIdle} timeout={timeout}>
        {children}
        
        {/* Legacy Idle Timer Modal */}
        <Modal
          title="You have been idle"
          open={visible}
          cancelText="Keep me signed in"
          okText="Logoff"
          onOk={onOk}
          onCancel={onCancel}
        >
          <div className={styles.idleTimerContent}>
            <span className={styles.idleTimerContentTopHint}>
              You have not been using the application for sometime. Please click on the
              <strong> Keep me signed in </strong> button, else you'll be automatically signed out in
            </span>
            <Progress type="circle" percent={getPercentage(rt)} status={getStatus(rt)} format={() => <>{rt}</>} />
            <span className={styles.idleTimerContentBottomHint}>
              <strong>seconds</strong>
            </span>
          </div>
        </Modal>

        {/* New User Inactivity Warning Modal */}
        <Modal
          title="Session Timeout Warning"
          open={isUserInactivityWarning}
          cancelText="Stay logged in"
          okText="Logout now"
          onOk={onUserInactivityOk}
          onCancel={onUserInactivityCancel}
          centered
          closable={false}
          maskClosable={false}
          width={460}
        >
          <div className={styles.idleTimerContent}>
            <span className={styles.idleTimerContentTopHint}>
              You have been inactive for {inactiveTimeoutMinutes - 1} minutes. 
              For your security, you will be automatically logged out in
            </span>
            <Progress 
              type="circle" 
              percent={getPercentage(userInactivityRemainingTime)} 
              status={getStatus(userInactivityRemainingTime)} 
              format={() => <>{userInactivityRemainingTime}</>} 
              strokeColor={userInactivityRemainingTime <= 20 ? '#ff4d4f' : userInactivityRemainingTime <= 40 ? '#faad14' : '#52c41a'}
              size={120}
            />
            <span className={styles.idleTimerContentBottomHint}>
              <strong>seconds</strong>
            </span>
            <div style={{ marginTop: 16, fontSize: 12, color: '#666', textAlign: 'center' }}>
              Click "Stay logged in" to continue your session or move your mouse to dismiss this warning.
            </div>
          </div>
        </Modal>
      </IdleTimerComponent>
    </div>
  );
};

export default IdleTimerRenderer;
