'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaLock } from "react-icons/fa";
import { HiOutlineMail } from 'react-icons/hi'
import { MdLockOutline } from 'react-icons/md'
import Link from 'next/link'
import axios from 'axios'
import styles from './Login.module.scss'
import { BASE_URL } from '@/helper/CONST';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (event) => {
    event.preventDefault()
    axios
      .post(`${BASE_URL}/api/v1/auth/login`, {
        email: email,
        password: password,
      })
      .then((res) => {
        console.log(res)
        const data = res.data
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('isLoggedIn', true);

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
