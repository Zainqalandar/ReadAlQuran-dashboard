import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { memo } from 'react';

const Root = styled('div')(({ theme }) => ({
  padding: '0 7px',
  fontSize: 11,
  fontWeight: 600,
  height: 20,
  minWidth: 20,
  borderRadius: 20,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  position: 'relative',
  '&.fuse-nav-badge--pulse': {
    animation: 'fuseNavBadgePulse 1.55s ease-in-out infinite',
    boxShadow: '0 0 0 1px rgba(220, 38, 38, .22), 0 0 14px rgba(220, 38, 38, .46)',
  },
  '@keyframes fuseNavBadgePulse': {
    '0%, 100%': {
      transform: 'scale(1)',
      boxShadow: '0 0 0 1px rgba(220, 38, 38, .24), 0 0 10px rgba(220, 38, 38, .36)',
    },
    '50%': {
      transform: 'scale(1.06)',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, .14), 0 0 18px rgba(220, 38, 38, .62)',
    },
  },
}));

function FuseNavBadge(props) {
  const { className, badge } = props;

  return (
    <Root
      className={clsx('item-badge', className, badge?.classes, badge?.effect === 'pulse' && 'fuse-nav-badge--pulse')}
      style={{
        backgroundColor: badge.bg,
        color: badge.fg,
      }}
    >
      {badge.title}
    </Root>
  );
}

FuseNavBadge.propTypes = {
  badge: PropTypes.shape({
    title: PropTypes.node,
    bg: PropTypes.string,
    fg: PropTypes.string,
    effect: PropTypes.string,
  }),
};
FuseNavBadge.defaultProps = {};

export default memo(FuseNavBadge);
