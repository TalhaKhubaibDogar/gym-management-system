'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaLock } from 'react-icons/fa' // React icon for lock
import Link from 'next/link'
import axios from 'axios'

// Import the SCSS file
import styles from './ForgotPassword.module.scss'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleForgotPassword = (event) => {
    event.preventDefault()
    axios
      .post('https://api.candypaint.us/api/v1/users/reset-password/', { email })
      .then((response) => {
        console.log(response.data)
        alert('Check your email to Reset Password')
        router.push('/login')
      })
      .catch((error) => {
        console.error('Password reset error:', error)
        alert('Reset Password Failed. Please try again.')
      })
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.avatar}>
          <FaLock size={50} color="#fff" />
        </div>
        <h1 className={styles.title}>Forgot Password</h1>
        <form onSubmit={handleForgotPassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Your Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Send Email
          </button>
        </form>
        <div className={styles.linkContainer}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
