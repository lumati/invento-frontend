import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Placeholder screen proving the scaffold, theme and CssBaseline render.
 * The auth flow and app shell replace it in later tasks.
 */
export default function App() {
  return (
    <Stack
      component="main"
      sx={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Invento Admin
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scaffold ready. The login flow and app shell arrive in the next tasks.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
