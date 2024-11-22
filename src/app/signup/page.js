'use client'
import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import CandyModal from '../components/CandyModal';

const defaultTheme = createTheme();
const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().min(8).required('Password is required'),
  reenterPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .min(8)
    .required('Re-enter Password is required'),
  userType: Yup.string().required('User Type is required'),
});

export default function SignUp() {
  const router = useRouter();
  const [totalCandy, setTotalCandy] = useState(0);
  const [candyOpen, setCandyOpen] = useState(false);

  useEffect(() => {
    try {
      axios.get('/api/CandyPayments').then((res) => {
        setTotalCandy(res?.data?.totalDonations / 100);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSubmit = (values, { setSubmitting }) => {
    if (values.userType === '2') {
      handleSubmitAPI(values, { setSubmitting });
    } else {
      localStorage.setItem('signupData', JSON.stringify(values));
      setCandyOpen(true);
      setSubmitting(false);
    }
  };

  const handleSubmitAPI = async (values, { setSubmitting }) => {
    const signupData = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      password: values.password,
      password2: values.reenterPassword,
      role: values.userType,
    };

    try {
      const response = await axios.post('https://api.candypaint.us/api/v1/users/signup/', signupData);
      // Handle successful signup, e.g., navigate to the verification page or login page
      console.log(response.data);
      localStorage.setItem('email', values.email);
      router.push('/verify');
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup error, e.g., show an error message
      alert(error.response.data.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
            Sign up
          </Typography>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              reenterPassword: '',
              userType: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              isSubmitting,
              touched,
              setFieldTouched,
              setFieldValue,
              errors,
            }) => (
              <Form noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      autoComplete='given-name'
                      name='firstName'
                      required
                      fullWidth
                      id='firstName'
                      label='First Name'
                      onChange={(e) => {
                        setFieldValue('firstName', e.target.value);
                        setFieldTouched('firstName', true, false);
                      }}
                      helperText={
                        touched.firstName && errors.firstName ? (
                          <ErrorMessage name='firstName' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(touched.firstName && errors.firstName)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      id='lastName'
                      label='Last Name'
                      name='lastName'
                      autoComplete='family-name'
                      onChange={(e) => {
                        setFieldValue('lastName', e.target.value);
                        setFieldTouched('lastName', true, false);
                      }}
                      helperText={
                        touched.lastName && errors.lastName ? (
                          <ErrorMessage name='lastName' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(touched.lastName && errors.lastName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      id='email'
                      label='Email Address'
                      name='email'
                      autoComplete='email'
                      onChange={(e) => {
                        setFieldValue('email', e.target.value);
                        setFieldTouched('email', true, false);
                      }}
                      helperText={
                        touched.email && errors.email ? (
                          <ErrorMessage name='email' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(touched.email && errors.email)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      name='password'
                      label='Password'
                      type='password'
                      id='password'
                      autoComplete='new-password'
                      onChange={(e) => {
                        setFieldValue('password', e.target.value);
                        setFieldTouched('password', true, false);
                      }}
                      helperText={
                        touched.password && errors.password ? (
                          <ErrorMessage name='password' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(touched.password && errors.password)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      required
                      fullWidth
                      name='reenterPassword'
                      label='Re-enter Password'
                      type='password'
                      id='reenterPassword'
                      autoComplete='new-password'
                      onChange={(e) => {
                        setFieldValue('reenterPassword', e.target.value);
                        setFieldTouched('reenterPassword', true, false);
                      }}
                      helperText={
                        touched.reenterPassword && errors.reenterPassword ? (
                          <ErrorMessage name='reenterPassword' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(
                        touched.reenterPassword && errors.reenterPassword
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      required
                      fullWidth
                      id='userType'
                      label='Select User Type'
                      name='userType'
                      onChange={(e) => {
                        setFieldValue('userType', e.target.value);
                        setFieldTouched('userType', true, false);
                      }}
                      helperText={
                        touched.userType && errors.userType ? (
                          <ErrorMessage name='userType' />
                        ) : (
                          ''
                        )
                      }
                      error={Boolean(touched.userType && errors.userType)}
                    >
                      <MenuItem value='2'>User</MenuItem>
                      <MenuItem value='1'>Hotspot</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, mb: 2 }}
                  style={{ backgroundColor: '#272727', color: '#fff' }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent='center'>
                  <Grid item>
                    <Link href='/login' legacyBehavior>
                      <a>{'Already have an account? Sign in'}</a>
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
      <CandyModal open={candyOpen} setOpen={setCandyOpen} />
    </ThemeProvider>
  );
}
