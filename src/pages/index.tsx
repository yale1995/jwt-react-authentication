import { GetServerSideProps } from 'next'
import { FormEvent, useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import {parseCookies} from 'nookies'
import styles from '../styles/Home.module.css'
import Head from 'next/head'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {signIn, isAuthenticated} = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const data = {
      email,
      password,
    }
    await signIn(data)
  }

  return (
    <>
      <Head>
        <title>JTW React Authentication</title>
      </Head>
      <div className={styles.wrapper}>
        <form onSubmit={handleSubmit} className={styles.container}>
          <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
          <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type='submit'>Entrar</button>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx)

  if(cookies['nextauth.token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false
      }
    }
  }
  return {
    props: {}
  }
}