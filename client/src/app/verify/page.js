'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaLock } from 'react-icons/fa' // React Icon for lock
import Link from 'next/link'
import axios from 'axios'

// Import the SCSS file
import styles from './Verify.module.scss'

export default function Verify() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

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
      .post('https://api.candypaint.us/api/v1/users/verifyotp/', { email, otp })
      .then((response) => {
        console.log(response.data)
        router.push('/login')
      })
      .catch((error) => {
        console.error('OTP verification error:', error)
        alert('OTP verification failed. Please try again.')
      })
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.avatar}>
          <FaLock size={50} color="#fff" />
        </div>
        <h1 className={styles.title}>Verify OTP</h1>
        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Verify OTP
          </button>
        </form>
        <div className={styles.linkContainer}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
