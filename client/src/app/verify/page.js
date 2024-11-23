'use client'
import React, { useState, useEffect } from 'react'
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

export default function Verify() {
  const [otp, setOtop] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  // const handleLogin = (event) => {
  //     event.preventDefault();
  //     router.push('/dashboard');
  // };
  useEffect(() => {
    // Assuming email is stored in localStorage after signup
    const storedEmail = localStorage.getItem('email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect to signup if email is not found
      router.push('/signup')
    }
  }, [router])

  const handleVerify = (event) => {
    event.preventDefault()
    axios
      .post('https://api.candypaint.us/api/v1/users/verifyotp/', {
        email: email,
        otp: otp,
      })
      .then((response) => {
        // Handle successful OTP verification
        console.log(response.data)
        router.push('/login')
      })
      .catch((error) => {
        console.error('OTP verification error:', error)
        // Handle OTP verification error
        alert('OTP verification failed. Please try again.')
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
            Verify OTP
          </Typography>
          <Box
            component='form'
            onSubmit={handleVerify}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='otp'
              label='OTP'
              name='otp'
              autoComplete='otp'
              value={otp}
              onChange={(e) => setOtop(e.target.value)}
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              style={{ backgroundColor: '#272727', color: '#fff' }}
            >
              Verify OTP
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
