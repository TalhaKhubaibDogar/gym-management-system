'use client'
import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa'; // React Icon for lock
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Import the SCSS file
import styles from './SignUp.module.scss'; // Assuming the file is named SignUp.module.scss

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8).required('Password is required'),
  reenterPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').min(8).required('Re-enter Password is required'),
  userType: Yup.string().required('User Type is required'),
});

export default function SignUp() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
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
      console.log(response.data);
      localStorage.setItem('email', values.email);
      router.push('/verify');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.response.data.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.avatar}>
          <FaLock size={50} color="#fff" />
        </div>
        <h1>Sign Up</h1>
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
          {({ isSubmitting, touched, setFieldTouched, setFieldValue, errors }) => (
            <Form>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <Field
                  type="text"
                  name="firstName"
                  id="firstName"
                  onChange={(e) => {
                    setFieldValue('firstName', e.target.value);
                    setFieldTouched('firstName', true, false);
                  }}
                />
                {touched.firstName && errors.firstName && <div className={styles.error}>{errors.firstName}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <Field
                  type="text"
                  name="lastName"
                  id="lastName"
                  onChange={(e) => {
                    setFieldValue('lastName', e.target.value);
                    setFieldTouched('lastName', true, false);
                  }}
                />
                {touched.lastName && errors.lastName && <div className={styles.error}>{errors.lastName}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  onChange={(e) => {
                    setFieldValue('email', e.target.value);
                    setFieldTouched('email', true, false);
                  }}
                />
                {touched.email && errors.email && <div className={styles.error}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  onChange={(e) => {
                    setFieldValue('password', e.target.value);
                    setFieldTouched('password', true, false);
                  }}
                />
                {touched.password && errors.password && <div className={styles.error}>{errors.password}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reenterPassword">Re-enter Password</label>
                <Field
                  type="password"
                  name="reenterPassword"
                  id="reenterPassword"
                  onChange={(e) => {
                    setFieldValue('reenterPassword', e.target.value);
                    setFieldTouched('reenterPassword', true, false);
                  }}
                />
                {touched.reenterPassword && errors.reenterPassword && <div className={styles.error}>{errors.reenterPassword}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="userType">User Type</label>
                <Field as="select" name="userType" id="userType" onChange={(e) => {
                  setFieldValue('userType', e.target.value);
                  setFieldTouched('userType', true, false);
                }}>
                  <option value="">Select User Type</option>
                  <option value="2">User</option>
                  <option value="1">Hotspot</option>
                </Field>
                {touched.userType && errors.userType && <div className={styles.error}>{errors.userType}</div>}
              </div>

              <button className={styles.button1} type="submit" disabled={isSubmitting}>
                Sign Up
              </button>
            </Form>
          )}
        </Formik>
        <div className={styles.linkContainer}>
          <Link href="/login">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
