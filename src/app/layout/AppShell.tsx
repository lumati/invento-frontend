import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

import { SHADOWS, SIDEBAR_NAVY } from '@/theme';

import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from './layoutConstants';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Authenticated application shell: a fixed 265px navy rail on desktop, an
 * off-canvas drawer below the tablet breakpoint, a white fixed topbar and the
 * routed content on the canvas background.
 */
export default function AppShell() {
  const [navigationOpen, setNavigationOpen] = useState(false);

  const closeNavigation = () => {
    setNavigationOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${SIDEBAR_WIDTH}px`,
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        <Sidebar />
      </Box>

      <Drawer
        open={navigationOpen}
        onClose={closeNavigation}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: `${SIDEBAR_WIDTH}px`,
            bgcolor: SIDEBAR_NAVY,
            backgroundImage: 'none',
            boxShadow: SHADOWS.sidebar,
          },
        }}
      >
        <Sidebar onNavigate={closeNavigation} />
      </Drawer>

      <Topbar onOpenNavigation={() => setNavigationOpen(true)} />

      <Box
        component="main"
        sx={{
          ml: { md: `${SIDEBAR_WIDTH}px` },
          pt: `${TOPBAR_HEIGHT}px`,
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
