'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import axios from 'axios'

const theme = createTheme()

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  // const handleLogin = (event) => {
  //     event.preventDefault();
  //     router.push('/dashboard');
  // };
  const handleForgotPassword = (event) => {
    event.preventDefault()
    axios
      .post('https://api.candypaint.us/api/v1/users/reset-password/', {
        email: email,
      })
      .then((response) => {
        // Handle successful OTP verification
        console.log(response.data)
        alert('Check your email to Reset Password')
        router.push('/login')
      })
      .catch((error) => {
        console.error('OTP verification error:', error)
        // Handle OTP verification error
        alert('Reset Password Failed. Please try again.')
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
            Forgot Password
          </Typography>
          <Box
            component='form'
            onSubmit={handleForgotPassword}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Your Email Address'
              name='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              style={{ backgroundColor: '#272727', color: '#fff' }}
            >
              Send Email
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
