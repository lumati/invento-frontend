import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { resolveApiErrorMessage } from '@/api/errors';

import { useAuth } from './AuthProvider';

const LOGIN_ERROR_FALLBACK = 'Unable to sign in. Please try again.';

/** Login screen: email + password, backend error messages and a loading state. */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(resolveApiErrorMessage(error, LOGIN_ERROR_FALLBACK));
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h4" component="h1">
                Invento Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue to your dashboard.
              </Typography>
            </Stack>

            {errorMessage !== null ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Box
              component="form"
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
              noValidate
            >
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  fullWidth
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            edge="end"
                            onClick={() => {
                              setShowPassword((current) => !current);
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting}
                  aria-busy={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  Sign in
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
