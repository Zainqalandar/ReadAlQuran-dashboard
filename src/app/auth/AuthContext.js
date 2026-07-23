import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import { logoutUser, setUser } from 'app/store/userSlice';
import jwtService from './services/jwtService';

const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [waitAuthCheck, setWaitAuthCheck] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const success = (user) => {
      dispatch(setUser(user)).finally(() => {
        setWaitAuthCheck(false);
        setIsAuthenticated(true);
      });
    };

    const pass = () => {
      setWaitAuthCheck(false);
      setIsAuthenticated(false);
    };

    const logout = () => {
      dispatch(logoutUser());
      pass();
    };

    jwtService.on('onAutoLogin', success);
    jwtService.on('onLogin', success);
    jwtService.on('onUserUpdated', success);
    jwtService.on('onLogout', logout);
    jwtService.on('onNoAccessToken', pass);

    jwtService.init();

    return () => {
      jwtService.removeListener('onAutoLogin', success);
      jwtService.removeListener('onLogin', success);
      jwtService.removeListener('onUserUpdated', success);
      jwtService.removeListener('onLogout', logout);
      jwtService.removeListener('onNoAccessToken', pass);
    };
  }, [dispatch]);

  return waitAuthCheck ? (
    <FuseSplashScreen />
  ) : (
    <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
