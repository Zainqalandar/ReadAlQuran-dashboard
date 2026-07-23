import Cookies from 'js-cookie';
import FuseUtils from '@fuse/utils/FuseUtils';

const ACCESS_TOKEN_COOKIE = 'access_token';
const ACCESS_TOKEN = 'fuse-admin-starter-session';
const STARTER_EMAIL = 'zainqalandar@gmail.com';
const STARTER_PASSWORD = '068406';

const starterUser = {
  name: 'Zain Qalandar',
  email: STARTER_EMAIL,
  role: 'admin',
};

class JwtService extends FuseUtils.EventEmitter {
  init() {
    const user = this.getCurrentUserData();

    if (user) {
      this.emit('onAutoLogin', user);
      return;
    }

    this.emit('onNoAccessToken');
  }

  signInWithCredentials = ({ email, password, remember }) => {
    if (email !== STARTER_EMAIL || password !== STARTER_PASSWORD) {
      return Promise.reject(new Error('Incorrect email or password.'));
    }

    Cookies.set(ACCESS_TOKEN_COOKIE, ACCESS_TOKEN, remember ? { expires: 30 } : undefined);
    this.emit('onLogin', starterUser);

    return Promise.resolve(starterUser);
  };

  getCurrentUserData = () => {
    return this.getAccessToken() === ACCESS_TOKEN ? starterUser : null;
  };

  updateUserData = (user) => {
    this.emit('onUserUpdated', user);
    return Promise.resolve(user);
  };

  logout = () => {
    this.removeAccessToken();
    this.emit('onLogout');
  };

  getAccessToken = () => Cookies.get(ACCESS_TOKEN_COOKIE);

  removeAccessToken = () => Cookies.remove(ACCESS_TOKEN_COOKIE);
}

const instance = new JwtService();

export default instance;
