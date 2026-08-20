import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

export default function Login() {
  const { user, login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()

    setError(null)

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    const res = await login({
      email,
      password,
    })

    setLoading(false)

    if (!res.success) {
      setError(res.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">

        <div className="text-center mb-4">
          <div className="text-2xl font-bold">
            Aab-e-Noor Water Sales
          </div>

          <div className="text-sm text-gray-500">
            Order • Save • Deliver
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sales1@local"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <a className="text-xs text-purifly">
              Forgot Password?
            </a>

            <div className="text-xs text-gray-500">
              v1.0.0
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Salesman: sales1@local / secret123
        </div>

      </div>
    </div>
  )
}