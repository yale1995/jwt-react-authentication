import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { SignOut } from '../contexts/AuthContext'

interface AxiosErrorResponse {
    code?: string;
}


let isRefreshing = false
let failedRequestQueue = []

export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx)
    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    })

    api.interceptors.response.use(response => {
        return response;
    }, (Error: AxiosError<AxiosErrorResponse>) => {
        if (Error.response?.status === 401) {
            if (Error.response.data?.code === 'token.expired') {
                cookies = parseCookies(ctx)
                const { 'nextauth.refreshToken': refreshToken } = cookies
                const originalConfig = Error.config

                if (!isRefreshing) {
                    isRefreshing = true
                    console.log('refresh')
                    api.post('refresh', {
                        refreshToken
                    }).then(response => {
                        const { token } = response.data

                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })

                        api.defaults.headers['Authorization'] = `Bearer ${token}`;
                        failedRequestQueue.forEach((request) => request.onSuccess(token))
                        failedRequestQueue = []
                    }).catch(Error => {
                        failedRequestQueue.forEach((request) => request.onFailure(Error))
                        failedRequestQueue = []

                        if (process.browser) {
                            SignOut()
                        }
                    }).finally(() => { isRefreshing = false })
                }
                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            resolve(api(originalConfig))
                        },

                        onFailure: (Error: AxiosError) => {
                            reject(Error)
                        }
                    })
                })
            } else {
                if (process.browser) {
                    SignOut()
                }
            }
        }
        return Promise.reject(Error)
    })
    return api;
}