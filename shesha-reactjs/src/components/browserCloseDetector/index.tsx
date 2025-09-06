import React, { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { ISettingIdentifier } from '@/providers/settings/models';
import { useAuth } from '@/providers/auth';
import { useSettingValue } from '@/providers/settings';

export interface IBrowserCloseDetectorProps { }

const logoutOnBrowserCloseSettingId: ISettingIdentifier = { name: 'Shesha.Security.LogoutOnBrowserClose', module: 'Shesha' };
const logoutOnBrowserCloseTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security.LogoutOnBrowserCloseTimeout', module: 'Shesha' };

export const BrowserCloseDetector: FC<PropsWithChildren<IBrowserCloseDetectorProps>> = ({ children }) => {
  const { value: logoutOnBrowserClose } = useSettingValue<boolean>(logoutOnBrowserCloseSettingId);
  const { value: logoutOnBrowserCloseTimeout } = useSettingValue<number>(logoutOnBrowserCloseTimeoutSettingId);
  const { logoutUser, loginInfo } = useAuth();
  
  const browserCloseTimeoutMinutes = logoutOnBrowserCloseTimeout ?? 5; // Default 5 minutes
  const browserCloseTimeoutSeconds = browserCloseTimeoutMinutes * 60; // Convert to seconds
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const isUserActiveRef = useRef<boolean>(true);

  useEffect(() => {
    if (!logoutOnBrowserClose || !loginInfo) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Browser tab/window is hidden or minimized
        isUserActiveRef.current = false;
        timeoutIdRef.current = setTimeout(() => {
          if (!isUserActiveRef.current) {
            logoutUser();
          }
        }, browserCloseTimeoutSeconds * 1000);
      } else {
        // Browser tab/window is visible again
        isUserActiveRef.current = true;
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = undefined;
        }
      }
    };

    const handleBeforeUnload = () => {
      // This runs when the user is actually closing the browser/tab
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      // Set a shorter timeout for actual browser close
      setTimeout(() => {
        logoutUser();
      }, 1000);
    };

    const handlePageShow = () => {
      // User returned to the page (e.g., via back button)
      isUserActiveRef.current = true;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = undefined;
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [logoutOnBrowserClose, browserCloseTimeoutSeconds, loginInfo, logoutUser]);

  return <>{children}</>;
};

export default BrowserCloseDetector;
