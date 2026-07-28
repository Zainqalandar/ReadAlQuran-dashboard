import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { alpha, styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import FuseNavBadge from '../../FuseNavBadge';
import FuseSvgIcon from '../../../FuseSvgIcon';

const Root = styled(ListItem)(({ theme, ...props }) => ({
  minHeight: 44,
  width: '100%',
  borderRadius: '6px',
  margin: '0 0 4px 0',
  paddingRight: 16,
  paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
  paddingTop: 10,
  paddingBottom: 10,
  color: alpha(theme.palette.text.primary, 0.7),
  cursor: 'pointer',
  textDecoration: 'none!important',
  '&:hover': {
    color: theme.palette.text.primary,
  },
  '&.active': {
    color: theme.palette.primary.light,
    backgroundColor: `${alpha(
      theme.palette.primary.main,
      theme.palette.mode === 'dark' ? 0.16 : 0.1
    )}!important`,
    boxShadow: `inset 0 0 0 1px ${alpha(
      theme.palette.primary.main,
      theme.palette.mode === 'dark' ? 0.24 : 0.18
    )}`,
    pointerEvents: 'none',
    transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
    '& > .fuse-list-item-text-primary': {
      color: 'inherit',
    },
    '& > .fuse-list-item-icon': {
      color: 'inherit',
    },
  },
  '& >.fuse-list-item-icon': {
    marginRight: 16,
    color: 'inherit',
  },
  '& > .fuse-list-item-text': {},
}));

function FuseNavVerticalItem(props) {
  const { item, nestedLevel, onItemClick, showItemTooltips } = props;

  const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

  return useMemo(
    () => (
      <Tooltip
        arrow
        enterDelay={350}
        placement="right"
        title={showItemTooltips ? item.title || '' : ''}
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: 'rgba(24, 24, 27, .96)',
              border: '1px solid rgba(255, 255, 255, .08)',
              borderRadius: '8px',
              boxShadow: '0 12px 28px rgba(0,0,0,.36)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              px: 1,
              py: 0.7,
            },
          },
          arrow: {
            sx: {
              color: 'rgba(24, 24, 27, .96)',
            },
          },
        }}
      >
        <span className="block">
          <Root
            button
            component={NavLinkAdapter}
            to={item.url || ''}
            activeClassName={item.url ? 'active' : ''}
            className={clsx('fuse-list-item', item.active && 'active')}
            onClick={() => onItemClick && onItemClick(item)}
            end={item.end}
            itempadding={itempadding}
            role="button"
            sx={item.sx}
            disabled={item.disabled}
          >
            {item.icon && (
              <FuseSvgIcon
                className={clsx('fuse-list-item-icon shrink-0', item.iconClass)}
                color="action"
              >
                {item.icon}
              </FuseSvgIcon>
            )}

            <ListItemText
              className="fuse-list-item-text"
              primary={item.title}
              secondary={item.subtitle}
              classes={{
                primary: 'text-13 font-medium fuse-list-item-text-primary truncate',
                secondary:
                  'text-11 font-medium fuse-list-item-text-secondary leading-normal truncate',
              }}
            />
            {item.badge && <FuseNavBadge badge={item.badge} />}
          </Root>
        </span>
      </Tooltip>
    ),
    [item, itempadding, onItemClick, showItemTooltips]
  );
}

FuseNavVerticalItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.string,
    url: PropTypes.string,
  }),
};

FuseNavVerticalItem.defaultProps = {};

const NavVerticalItem = FuseNavVerticalItem;

export default NavVerticalItem;
