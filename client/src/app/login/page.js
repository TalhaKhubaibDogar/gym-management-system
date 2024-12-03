'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaLock } from "react-icons/fa";
import { HiOutlineMail } from 'react-icons/hi'
import { MdLockOutline } from 'react-icons/md'
import Link from 'next/link'
import axios from 'axios'
import styles from './Login.module.scss'

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

        router.push('/dashboard')
      })
      .catch((error) => {
        console.log(error)
        alert('Login failed. Please check your credentials')
      })
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-form']}>
        <div className={styles.avatar}>
          <FaLock />
        </div>
        <h1>Sign in</h1>
        <form onSubmit={handleLogin}>
          <div className={styles['input-group']}>
            <HiOutlineMail />
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles['input-group']}>
            <MdLockOutline />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles['remember-me']}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <button type="submit">Sign In</button>
        </form>
        <div className={styles.links}>
          <Link href="/signup">Don't have an account? Sign Up</Link>
          <Link href="/forgotPassword">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}
