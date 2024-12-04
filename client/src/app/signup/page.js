'use client'
import React from 'react';
import { FaLock } from 'react-icons/fa'; // React Icon for lock
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Import the SCSS file
import styles from './SignUp.module.scss'; // Assuming the file is named SignUp.module.scss
import { BASE_URL } from '@/helper/CONST';

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export default function SignUp() {
  const router = useRouter();
  
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log("Submit triggered with values:", values); // Log the submitted form values
    const signupData = {
      email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
      password: values.password,
    };

    console.log("Payload being sent:", signupData); // Log the payload

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, signupData);
      console.log("API response:", response.data); // Log the API response
      localStorage.setItem('email', values.email);
      router.push('/verify');
    } catch (error) {
      console.error("API error:", error.response?.data); // Log the error response
      alert(error.response?.data?.data?.message || "Signup failed. Please try again.");
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
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <Field type="text" name="firstName" id="firstName" />
                {touched.firstName && errors.firstName && <div className={styles.error}>{errors.firstName}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <Field type="text" name="lastName" id="lastName" />
                {touched.lastName && errors.lastName && <div className={styles.error}>{errors.lastName}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <Field type="email" name="email" id="email" />
                {touched.email && errors.email && <div className={styles.error}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <Field type="password" name="password" id="password" />
                {touched.password && errors.password && <div className={styles.error}>{errors.password}</div>}
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
