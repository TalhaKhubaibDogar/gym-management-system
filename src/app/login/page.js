'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Link from 'next/link'
import axios from 'axios'

const theme = createTheme()

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (event) => {
    event.preventDefault()
    axios
      .post('https://api.candypaint.us/api/v1/users/login/', {
        email: email,
        password: password,
      })
      .then((res) => {
        // Handle successful login, e.g., save token and navigate to the account page
        const data = res.data.data
        localStorage.setItem('id', data.id)
        localStorage.setItem('first_name', data.first_name)
        localStorage.setItem('last_name', data.last_name)
        localStorage.setItem('email', data.email)
        localStorage.setItem('full_name', data.full_name)
        localStorage.setItem('role', data.role)
        localStorage.setItem('referral_code', data.referral_code)
        localStorage.setItem('is_new', data.is_new)
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('expire_on', data.expire_on)
        localStorage.setItem('isLoggedIn', true)

        // Navigate to the account page
        router.push('/dashboard')
      })
      .catch((error) => {
        console.log(error)
        // Handle login error, e.g., show an error message
        alert('Login failed. Please check your credentials and try again.')
      })
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign in
          </Typography>
          <Box
            component='form'
            onSubmit={handleLogin}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox value='remember' color='primary' />}
              label='Remember me'
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              style={{ backgroundColor: '#272727', color: '#fff' }}
            >
              Sign In
            </Button>
            <Grid
              container
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Grid item>
                <Link href='/signup' legacyBehavior>
                  <a>{"Don't have an account? Sign Up"}</a>
                </Link>
              </Grid>
              <Grid item xs>
                <Link href='/forgotPassword' legacyBehavior>
                  <a>Forgot password?</a>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
