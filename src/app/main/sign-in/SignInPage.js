import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import * as yup from 'yup';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import JwtService from '../../auth/services/jwtService';

const schema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  password: yup.string().required('Password is required.'),
});

const defaultValues = {
  email: '',
  password: '',
  remember: true,
};

const BRAND_LOGO = '/logos/logo1.png';

function SignInPage() {
  const [signInError, setSignInError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { control, formState, handleSubmit } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setSignInError('');

    try {
      await JwtService.signInWithCredentials(data);
    } catch (error) {
      setSignInError(error.message);
    }
  };

  return (
    <div
      className="relative flex min-h-full min-w-0 flex-1 overflow-hidden"
      sx={{
        background:
          'linear-gradient(135deg, #09090b 0%, #0f0f12 52%, #141419 100%)',
      }}
    >
      <Box
        component="aside"
        className="relative hidden w-[48%] min-w-[480px] overflow-hidden border-r lg:flex lg:flex-col lg:justify-between"
        sx={{
          borderColor: '#27272a',
          background:
            'radial-gradient(circle at 14% 14%, rgba(201, 162, 39, .16), transparent 31%), radial-gradient(circle at 85% 75%, rgba(31, 88, 67, .22), transparent 34%), #0f0f12',
        }}
      >
        <Box
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          sx={{
            backgroundImage:
              'linear-gradient(rgba(201, 162, 39, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, .08) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage: 'linear-gradient(to bottom, black, transparent 72%)',
          }}
        />

        <Box className="relative px-48 py-44 xl:px-64 xl:py-56">
          <Box
            component="img"
            alt="ReadAlQuran"
            className="h-48 w-48 rounded-12 object-cover"
            src={BRAND_LOGO}
            sx={{
              boxShadow: '0 18px 34px -20px rgba(201, 162, 39, .8)',
              border: '1px solid rgba(201, 162, 39, .34)',
            }}
          />

          <Typography className="mt-28 text-20 font-bold tracking-tight">
            ReadAlQuran
          </Typography>
          <Typography
            className="mt-4 text-11 font-semibold uppercase tracking-[0.22em]"
            color="primary.light"
          >
            Website intelligence
          </Typography>

          <Typography className="mt-64 max-w-[490px] text-4xl font-extrabold leading-tight xl:text-5xl">
            Understand how people find, read and return to the Quran.
          </Typography>
          <Typography
            className="mt-20 max-w-[450px] text-16 leading-relaxed"
            color="text.secondary"
          >
            A calm, private workspace for improving the experience at
            readalquran.online.
          </Typography>

          <Box
            className="mt-48 max-w-[440px] rounded-16 p-20"
            sx={{
              backgroundColor: 'rgba(20, 20, 25, .8)',
              border: '1px solid rgba(201, 162, 39, .2)',
            }}
          >
            <Box className="flex items-center gap-12">
              <Box
                aria-hidden="true"
                className="rounded-10 flex h-36 w-36 shrink-0 items-center justify-center"
                sx={{
                  backgroundColor: 'rgba(201, 162, 39, .14)',
                  color: 'primary.light',
                }}
              >
                <FuseSvgIcon size={19}>
                  heroicons-outline:shield-check
                </FuseSvgIcon>
              </Box>
              <Box>
                <Typography className="text-13 font-semibold">
                  Designed for responsible insight
                </Typography>
                <Typography
                  className="mt-3 text-11 leading-relaxed"
                  color="text.secondary"
                >
                  Start with the data sources you choose, and keep reader
                  privacy at the center.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="relative px-48 py-36 xl:px-64">
          <Typography
            className="text-11 leading-relaxed"
            color="text.secondary"
          >
            readalquran.online · Insights for the people behind the platform
          </Typography>
        </Box>
      </Box>

      <div className="relative flex min-w-0 flex-1 items-center justify-center px-16 py-32 sm:px-32 lg:px-48">
        <Paper
          className="w-full max-w-[440px] rounded-20 p-28 sm:p-40"
          elevation={0}
          sx={{
            backgroundColor: '#141419',
            border: '1px solid #27272a',
            boxShadow: '0 28px 72px -40px rgba(0, 0, 0, .85)',
          }}
        >
          <Box className="flex items-center gap-12 lg:hidden">
            <Box
              component="img"
              alt="ReadAlQuran"
              className="h-40 w-40 shrink-0 rounded-10 object-cover"
              src={BRAND_LOGO}
              sx={{
                border: '1px solid rgba(201, 162, 39, .34)',
              }}
            />
            <Box>
              <Typography className="text-15 font-bold">
                ReadAlQuran
              </Typography>
              <Typography
                className="mt-2 text-10 font-semibold uppercase tracking-widest"
                color="primary.light"
              >
                Analytics
              </Typography>
            </Box>
          </Box>

          <Typography className="mt-32 text-3xl font-extrabold leading-tight lg:mt-0">
            Welcome back
          </Typography>
          <Typography
            className="mt-8 text-14 leading-relaxed"
            color="text.secondary"
          >
            Sign in to your analytics workspace.
          </Typography>

          <form
            className="mt-32 flex w-full flex-col"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoComplete="email"
                  autoFocus
                  className="mb-20"
                  error={Boolean(formState.errors.email)}
                  fullWidth
                  helperText={formState.errors.email?.message}
                  label="Email address"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, .018)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                      { borderColor: '#c9a227' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#dbb84a' },
                  }}
                  type="email"
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoComplete="current-password"
                  error={Boolean(formState.errors.password)}
                  fullWidth
                  helperText={formState.errors.password?.message}
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          edge="end"
                          onClick={() => setShowPassword((visible) => !visible)}
                          size="small"
                        >
                          <FuseSvgIcon size={18}>
                            {showPassword
                              ? 'heroicons-outline:eye-off'
                              : 'heroicons-outline:eye'}
                          </FuseSvgIcon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, .018)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                      { borderColor: '#c9a227' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#dbb84a' },
                  }}
                />
              )}
            />

            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  className="mt-12 self-start"
                  control={
                    <Checkbox
                      checked={field.value}
                      color="primary"
                      onChange={(event) => field.onChange(event.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography className="text-12" color="text.secondary">
                      Keep me signed in
                    </Typography>
                  }
                />
              )}
            />

            {signInError && (
              <Typography className="mt-16 text-12" color="error" role="alert">
                {signInError}
              </Typography>
            )}

            <Button
              className="rounded-10 mt-24 min-h-48 text-13 font-bold"
              color="primary"
              endIcon={
                <FuseSvgIcon size={18}>
                  heroicons-outline:arrow-right
                </FuseSvgIcon>
              }
              size="large"
              type="submit"
              variant="contained"
            >
              Continue to analytics
            </Button>
          </form>

          <Box
            className="mt-28 flex items-start gap-8 border-t pt-20"
            sx={{ borderColor: '#27272a' }}
          >
            <FuseSvgIcon
              className="mt-1 shrink-0"
              size={16}
              sx={{ color: '#a1a1aa' }}
            >
              heroicons-outline:lock-closed
            </FuseSvgIcon>
            <Typography
              className="text-11 leading-relaxed"
              color="text.secondary"
            >
              This area is for the ReadAlQuran team. Your session is protected
              and private.
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

export default SignInPage;
