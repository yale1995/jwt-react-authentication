import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect } from 'react'
import { withSSRAuth } from '../utils/withSSRAuth'
import { api } from '../services/apiClient'
import { setupAPIClient } from '../services/api'

export default function Dashboard() {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me').then(response => console.log(response)).catch((Error) => (console.log(Error)))
    }, [])
    return (
        <div>User Logged {user?.email}</div>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response  = await apiClient.get('/me')
    console.log(response.data)

    return {
      props: {}
    }
  })