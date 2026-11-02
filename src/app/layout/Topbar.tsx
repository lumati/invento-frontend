import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import { useAuth } from '@/features/auth/AuthProvider';
import { COLORS, RADII } from '@/theme';

import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from './layoutConstants';

export type TopbarProps = {
  /** Opens the off-canvas navigation below the tablet breakpoint. */
  onOpenNavigation: () => void;
};

/**
 * White topbar with the mobile navigation trigger, a decorative search field,
 * the signed-in user and the sign-out action.
 */
export default function Topbar({ onOpenNavigation }: TopbarProps) {
  const { user, logout } = useAuth();
  const displayName = user?.username ?? 'Unknown user';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
        right: 0,
        height: `${TOPBAR_HEIGHT}px`,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, md: '30px' },
      }}
    >
      <IconButton
        aria-label="Open navigation"
        onClick={onOpenNavigation}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'text.secondary' }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: 38,
          px: 1.5,
          flexGrow: { xs: 1, sm: 0 },
          width: { xs: 'auto', sm: 280 },
          minWidth: 0,
          maxWidth: 320,
          bgcolor: COLORS.backgroundDefault,
          borderRadius: `${RADII.pill}px`,
        }}
      >
        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <InputBase
          placeholder="Search"
          slotProps={{ input: { 'aria-label': 'Search' } }}
          sx={{ flexGrow: 1, fontSize: '0.875rem', color: 'text.primary' }}
        />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.95rem' }}>
          {avatarInitial}
        </Avatar>
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, fontSize: '0.875rem' }}>
          {displayName}
        </Typography>
        <IconButton
          aria-label="Sign out"
          onClick={() => {
            void logout();
          }}
          sx={{ color: 'text.secondary' }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
