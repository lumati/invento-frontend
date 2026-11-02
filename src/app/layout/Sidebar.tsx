import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';

import { SHADOWS, SIDEBAR_NAVY } from '@/theme';

import { TOPBAR_HEIGHT } from './layoutConstants';
import { NAV_GROUPS } from './navigation';

export type SidebarProps = {
  /** Called after a navigation item is clicked, so the mobile drawer can close. */
  onNavigate?: () => void;
};

/**
 * Navy navigation rail shared by the fixed desktop layout and the mobile
 * drawer. Links are plain router navigations because all routes live in the
 * app shell.
 */
export default function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: SIDEBAR_NAVY,
        color: '#FFFFFF',
        boxShadow: SHADOWS.sidebar,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          height: `${TOPBAR_HEIGHT}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          px: '20px',
        }}
      >
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          Invento Admin
        </Typography>
      </Box>

      <Box sx={{ px: '10px', py: '10px' }}>
        {NAV_GROUPS.map((group) => (
          <Box key={group.label} component="section" aria-label={group.label}>
            <Typography
              component="p"
              sx={{
                m: 0,
                px: '14px',
                pt: '18px',
                pb: '6px',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: '18px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: '#727275',
              }}
            >
              {group.label}
            </Typography>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;

              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onNavigate?.();
                  }}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    px: '14px',
                    py: '10px',
                    mb: '2px',
                    borderRadius: '5px',
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                    bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                  {item.label}
                </ButtonBase>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
