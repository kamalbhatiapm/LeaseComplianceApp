import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase.js'
import '../styles/auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/app')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Sign in instead.')
        } else if (data?.session) {
          // Email confirmation not required — signed in immediately
          navigate('/app')
        } else {
          setMessage('Account created — check your email to confirm, then sign in.')
          setMode('signin')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">LegalGraph<sup>®</sup></Link>
        <p className="auth-tagline">AI-powered lease compliance</p>

        <h1 className="auth-heading">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </h1>

        {error   && <div className="auth-alert auth-alert--error">{error}</div>}
        {message && <div className="auth-alert auth-alert--success">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label htmlFor="auth-password">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  className="auth-forgot"
                  onClick={async () => {
                    if (!email) { setError('Enter your email first.'); return }
                    setError(null)
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/auth/reset`,
                    })
                    if (error) setError(error.message)
                    else setMessage('Password reset email sent — check your inbox.')
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || !email || !password}
          >
            {loading
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(null); setMessage(null) }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" onClick={() => { setMode('signin'); setError(null); setMessage(null) }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
