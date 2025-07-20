import React, { FC, PropsWithChildren, useState, useEffect, useCallback } from 'react';
import {
  getPercentage,
  getStatus,
  getTimeFormat,
  MIN_TIME,
  ONE_SECOND,
  SIXTY
} from '../idleTimerRenderer/util';
import { IdleTimerComponent } from 'react-idle-timer';
import { ISettingIdentifier } from '@/providers/settings/models';
import { Modal, Progress, Statistic } from 'antd';
import { useAuth } from '@/providers/auth';
import { useInterval } from 'react-use';
import { useSettingValue } from '@/providers/settings';
import { useStyles } from '../idleTimerRenderer/styles/styles';

export interface IAutoLogoutHandlerProps { }

interface IAutoLogoutState {
  readonly isIdle: boolean;
  readonly remainingTime: number;
  readonly showInactivityCountdown: boolean;
}

const INIT_STATE: IAutoLogoutState = {
  isIdle: false,
  remainingTime: SIXTY,
  showInactivityCountdown: false,
};

// Setting identifiers for auto logout features
const securitySettingsId: ISettingIdentifier = { name: 'Shesha.Security', module: 'Shesha' };

export const AutoLogoutHandler: FC<PropsWithChildren<IAutoLogoutHandlerProps>> = ({ children }) => {
  const { styles } = useStyles();
  const { value: securitySettings } = useSettingValue<any>(securitySettingsId);
  
  const { logoutUser, loginInfo } = useAuth();

  const [state, setState] = useState<IAutoLogoutState>(INIT_STATE);
  const { isIdle, remainingTime: rt, showInactivityCountdown } = state;

  // Extract settings with defaults
  const autoLogoffTimeout = securitySettings?.autoLogoffTimeout ?? 0;
  const logoutWhenBrowserClosed = securitySettings?.logoutWhenBrowserClosed ?? false;
  const logoutTimeoutSecondsBrowserClose = securitySettings?.logoutTimeoutSecondsBrowserClose ?? 30;
  const logoutWhenUserInactive = securitySettings?.logoutWhenUserInactive ?? false;
  const logoutTimeoutMinutesUserInactive = securitySettings?.logoutTimeoutMinutesUserInactive ?? 15;

  // Use user inactivity settings if enabled, otherwise fall back to legacy auto logoff timeout
  const inactivityTimeoutSeconds = logoutWhenUserInactive ? logoutTimeoutMinutesUserInactive * 60 : autoLogoffTimeout;
  const isInactivityTimeoutSet = (logoutWhenUserInactive ? inactivityTimeoutSeconds : autoLogoffTimeout) >= MIN_TIME && !!loginInfo;
  const timeout = getTimeFormat(inactivityTimeoutSeconds);
  const visible = isIdle && isInactivityTimeoutSet;

  // Browser close/reload detection
  useEffect(() => {
    if (!logoutWhenBrowserClosed || !loginInfo) return;

    let timeoutId: NodeJS.Timeout;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Set a timeout that will trigger logout after the specified seconds
      timeoutId = setTimeout(async () => {
        try {
          await logoutUser();
        } catch (error) {
          console.error('Error during auto logout on browser close:', error);
        }
      }, logoutTimeoutSecondsBrowserClose * 1000);

      // Store the timestamp when the user is leaving
      sessionStorage.setItem('userLeftTimestamp', Date.now().toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User came back, clear the logout timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Check if enough time has passed while away to trigger logout
        const leftTimestamp = sessionStorage.getItem('userLeftTimestamp');
        if (leftTimestamp) {
          const timeAway = Date.now() - parseInt(leftTimestamp);
          if (timeAway >= logoutTimeoutSecondsBrowserClose * 1000) {
            logoutUser();
            return;
          }
        }
        sessionStorage.removeItem('userLeftTimestamp');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [logoutWhenBrowserClosed, logoutTimeoutSecondsBrowserClose, loginInfo, logoutUser]);

  // Calculate inactivity countdown display time  
  const inactivityCountdownMinutes = Math.ceil((inactivityTimeoutSeconds - rt) / 60);

  const onAction = (_event: Event) => {
    /*nop*/
  };

  const onActive = (_event: Event) => {
    /*nop*/
  };

  const onIdle = (_event: Event) => setState(s => ({ ...s, isIdle: true }));

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setState(INIT_STATE);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logoutUser]);

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

  // Show inactivity countdown in the UI when user inactivity logout is enabled
  const showCountdownDisplay = logoutWhenUserInactive && loginInfo && !isIdle;

  if (!isInactivityTimeoutSet) {
    return (
      <>
        {children}
        {showCountdownDisplay && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 1000, 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '8px 12px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px'
          }}>
            <Statistic 
              title="Session expires in" 
              value={inactivityCountdownMinutes} 
              suffix="min" 
              valueStyle={{ fontSize: '14px' }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.shaIdleTimerRenderer}>
      <IdleTimerComponent onAction={onAction} onActive={onActive} onIdle={onIdle} timeout={timeout}>
        {children}
        {showCountdownDisplay && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 1000, 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '8px 12px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px'
          }}>
            <Statistic 
              title="Session expires in" 
              value={inactivityCountdownMinutes} 
              suffix="min" 
              valueStyle={{ fontSize: '14px' }}
            />
          </div>
        )}
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
              <strong> Keep me signed in</strong> button, else you'll be automatically signed out in
            </span>
            <Progress type="circle" percent={getPercentage(rt)} status={getStatus(rt)} format={() => <>{rt}</>} />
            <span className={styles.idleTimerContentBottomHint}>
              <strong>seconds</strong>
            </span>
          </div>
        </Modal>
      </IdleTimerComponent>
    </div>
  );
};

export default AutoLogoutHandler;