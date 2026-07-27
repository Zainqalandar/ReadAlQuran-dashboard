import FuseUtils from '@fuse/utils/FuseUtils';

function authUrl(path) {
  return `/api/auth/${path}`;
}

function toDashboardUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'admin',
    photo: user.imageUrl || '',
  };
}

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Unable to complete this request.');
  }
  return payload;
}

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.getCurrentUserData()
      .then((user) => this.emit(user ? 'onAutoLogin' : 'onNoAccessToken', user))
      .catch(() => this.emit('onNoAccessToken'));
  }

  signInWithCredentials = async ({ email, password }) => {
    const request = {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    };
    const response = await fetch(authUrl('signin'), request);
    await readResponse(response);
    const sessionResponse = await fetch(authUrl('session'), {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const session = await readResponse(sessionResponse);
    if (!session.user) {
      throw new Error('Dashboard session could not be created.');
    }

    const user = toDashboardUser(session.user);
    this.emit('onLogin', user);
    return user;
  };

  getCurrentUserData = async () => {
    const response = await fetch(authUrl('session'), {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const payload = await readResponse(response);
    return payload.user ? toDashboardUser(payload.user) : null;
  };

  updateUserData = (user) => {
    this.emit('onUserUpdated', user);
    return Promise.resolve(user);
  };

  logout = async () => {
    try {
      await fetch(authUrl('signout'), { method: 'POST', credentials: 'include' });
    } finally {
      this.emit('onLogout');
    }
  };
}

const instance = new JwtService();

export default instance;
