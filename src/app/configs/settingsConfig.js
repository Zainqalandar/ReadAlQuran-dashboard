import themesConfig from 'app/configs/themesConfig';
import i18n from '../../i18n';
import authRoles from '../auth/authRoles';

const settingsConfig = {
  layout: {
    style: 'defaultLayout',
    config: {
      navbar: {
        display: true,
      },
      footer: {
        display: false,
      },
      leftSidePanel: {
        display: true,
      },
      rightSidePanel: {
        display: false,
      },
    },
  },
  customScrollbars: true,
  direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
  theme: {
    main: themesConfig.defaultDark,
    navbar: themesConfig.defaultDark,
    toolbar: themesConfig.defaultDark,
    footer: themesConfig.defaultDark,
  },
  defaultAuth: authRoles.all,
  loginRedirectUrl: '/',
};

export default settingsConfig;
