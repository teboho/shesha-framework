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
  const logoutTimeoutMinutesUserInactive = securitySettings?.logoutTimeoutMinutesUserInactive ?? 5;

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

  // Calculate remaining time for display
  const remainingTimeSeconds = inactivityTimeoutSeconds - rt;
  const inactivityCountdownMinutes = Math.ceil(remainingTimeSeconds / 60);
  const inactivityCountdownSecondsDisplay = remainingTimeSeconds % 60;

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
        {showCountdownDisplay && remainingTimeSeconds > 0 && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 1000, 
            background: remainingTimeSeconds <= 60 ? 'rgba(255, 77, 79, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
            padding: '12px 16px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '12px',
            border: remainingTimeSeconds <= 60 ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
            color: remainingTimeSeconds <= 60 ? '#fff' : '#000'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.8 }}>
                Session expires in
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {inactivityCountdownMinutes > 0 ? `${inactivityCountdownMinutes}m` : ''} {inactivityCountdownSecondsDisplay}s
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.shaIdleTimerRenderer}>
      <IdleTimerComponent onAction={onAction} onActive={onActive} onIdle={onIdle} timeout={timeout}>
        {children}
        {showCountdownDisplay && remainingTimeSeconds > 0 && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 1000, 
            background: remainingTimeSeconds <= 60 ? 'rgba(255, 77, 79, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
            padding: '12px 16px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '12px',
            border: remainingTimeSeconds <= 60 ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
            color: remainingTimeSeconds <= 60 ? '#fff' : '#000'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.8 }}>
                Session expires in
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {inactivityCountdownMinutes > 0 ? `${inactivityCountdownMinutes}m` : ''} {inactivityCountdownSecondsDisplay}s
              </div>
            </div>
          </div>
        )}
        <Modal
          title="Session Timeout Warning"
          open={visible}
          cancelText="Keep me signed in"
          okText="Logout Now"
          onOk={onOk}
          onCancel={onCancel}
          closable={true}
          onClose={onCancel}
          maskClosable={false}
          width={480}
        >
          <div className={styles.idleTimerContent}>
            <span className={styles.idleTimerContentTopHint}>
              Your session will expire due to inactivity. You will be automatically logged out in{' '}
              <strong>{rt} seconds</strong> unless you choose to stay logged in.
            </span>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              margin: '20px 0',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Progress 
                type="circle" 
                percent={getPercentage(rt)} 
                status={getStatus(rt)} 
                format={() => <><strong>{rt}</strong><br/><small>seconds</small></>}
                size={120}
                strokeWidth={8}
              />
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  Auto logout in {rt} seconds
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  Click "Keep me signed in" to extend your session
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </IdleTimerComponent>
    </div>
  );
};

export default AutoLogoutHandler;