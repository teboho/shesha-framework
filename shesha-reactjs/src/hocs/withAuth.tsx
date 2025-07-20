import React, { ComponentType, FC, Fragment, useEffect } from 'react';
import { useAuth, useShaRouting } from '@/providers';
import { useLoginUrl } from '@/hooks/useLoginUrl';
import SheshaLoader from '@/components/sheshaLoader';
import { AutoLogoutHandler } from '@/components';

export interface IComponentWithAuthProps {
  unauthorizedRedirectUrl: string;
  landingPage: string;
  children: (query: NodeJS.Dict<string | string[]>) => React.ReactElement;
}
export const ComponentWithAuth: FC<IComponentWithAuthProps> = (props) => {
  const { landingPage, unauthorizedRedirectUrl } = props;
  const { state: authState, isLoggedIn, checkAuthAsync: checkAuth } = useAuth();
  const [, forceUpdate] = React.useState({});

  const { router } = useShaRouting();

  const loginUrl = useLoginUrl({ homePageUrl: landingPage, unauthorizedRedirectUrl });

  useEffect(() => {
    if (!isLoggedIn) {      
      checkAuth(loginUrl).then(() => {
        forceUpdate({});
      });
    }
  }, [checkAuth, loginUrl, isLoggedIn]);

  return isLoggedIn
    ? <Fragment>{props.children(router?.query)}</Fragment> 
    : <SheshaLoader message={authState.hint || "Initializing..."} />;
};

/**
 * Ensures that a particular page cannot be accessed if you're not authenticated
 */
export const withAuth =
  <P extends object>(Component: ComponentType<P>, unauthorizedRedirectUrl = '/login', landingPage = '/'): FC<P> =>
    (props) => {
      const propsObj = Array.isArray(props) ? props[0] : props;

      return (
        <ComponentWithAuth landingPage={landingPage} unauthorizedRedirectUrl={unauthorizedRedirectUrl}>
          {(query) => (
            <AutoLogoutHandler>
              <Component {...propsObj} id={query?.id} />
            </AutoLogoutHandler>
          )}
        </ComponentWithAuth>
      );
    };