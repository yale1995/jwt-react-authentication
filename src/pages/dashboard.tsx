import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect } from 'react'
import { api } from '../services/api'

export default function Dashboard() {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me').then(response => console.log(response)).catch((Error) => (console.log(Error)))
    }, [])
    return (
        <div>User Logged {user?.email}</div>
    )
}