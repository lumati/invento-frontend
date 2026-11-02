import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Placeholder for the authenticated area: proves the session works if a real
 * shell is not in place yet. The app shell replaces it in a later task.
 */
export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Signed in as {user?.username ?? 'unknown user'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            void logout();
          }}
        >
          Sign out
        </Button>
      </Stack>
    </Container>
  );
}
