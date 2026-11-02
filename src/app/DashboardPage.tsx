import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

/**
 * Dashboard route inside the authenticated shell. It is a placeholder that
 * keeps the shell's layout, page title and card styling visible until the
 * real dashboard widgets are built.
 */
export default function DashboardPage() {
  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: '30px' }, py: '30px' }}>
      <Typography
        component="h1"
        sx={{ fontSize: '23px', fontWeight: 600, lineHeight: 1.5, mb: '20px', color: 'text.primary' }}
      >
        Dashboard
      </Typography>
      <Card>
        <CardContent sx={{ p: '15px', '&:last-child': { pb: '15px' } }}>
          <Typography variant="body2" color="text.secondary">
            Dashboard widgets will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
