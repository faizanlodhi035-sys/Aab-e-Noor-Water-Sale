import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { 
  Droplets, 
  ShieldCheck, 
  Truck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react'

export default function Login() {
  const { user, login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

    if (!res?.success) {
      setError(res?.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#12304A] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Decorative Ambient Water Blobs & Wave Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#EAF6FF] rounded-full blur-3xl opacity-70 animate-soft-glow pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#087FE8]/10 rounded-full blur-3xl opacity-60 animate-soft-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#EAF6FF]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Main Split Screen Container */}
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-[#087FE8]/10 border border-[#EAF6FF] grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        
        {/* ================================================== */}
        {/* LEFT SIDE: HERO BRANDING & VISUALS (~50% / 6 cols)  */}
        {/* ================================================== */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#F5FAFF] via-[#EAF6FF] to-[#D8EDFF] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Background Water Drop Accents */}
          <div className="absolute top-6 right-6 text-[#087FE8]/15 animate-float pointer-events-none">
            <Droplets className="w-32 h-32" />
          </div>
          <div className="absolute bottom-20 left-4 text-[#0F4C81]/10 animate-float-reverse pointer-events-none">
            <Droplets className="w-24 h-24" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#087FE8]/20 shadow-sm mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F4C81] to-[#087FE8] flex items-center justify-center shadow-md">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#0F4C81]">
                Aab-e-Noor Water Sales
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#12304A] leading-[1.15] mb-4">
              Fresh Water <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#087FE8] to-[#0F4C81]">
                Brighter Tomorrow
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-[#6B8299] text-base leading-relaxed max-w-md mb-8">
              Quality water for a healthier you. Manage your orders, track deliveries and stay connected — all in one place.
            </p>

            {/* 3 Key Feature Items */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-[#087FE8]/15 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#087FE8]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#087FE8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#12304A]">Safe & Trusted</h4>
                  <p className="text-xs text-[#6B8299]">Certified quality & rigorous purification standards</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-[#087FE8]/15 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#087FE8]/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#087FE8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#12304A]">Fast & Reliable Delivery</h4>
                  <p className="text-xs text-[#6B8299]">Scheduled route deliveries right to your door</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-[#087FE8]/15 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#087FE8]/10 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-[#087FE8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#12304A]">Clean & Pure Water</h4>
                  <p className="text-xs text-[#6B8299]">Refreshing taste guaranteed every day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Water Visual Image Container */}
          <div className="relative mt-8 lg:mt-10 rounded-2xl overflow-hidden shadow-lg border border-white/60">
            <img 
              src="/images/water_hero.png" 
              alt="Fresh drinking water" 
              className="w-full h-44 sm:h-52 object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81]/70 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
                <span>Pure Water • Healthy Life</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================================================== */}
        {/* RIGHT SIDE: MODERN LOGIN CARD (~50% / 6 cols)      */}
        {/* ================================================== */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white relative">
          
          <div className="max-w-md w-full mx-auto">
            
            {/* Header / Logo Badge */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAF6FF] to-[#D8EDFF] flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#087FE8]/20 group">
                <Droplets className="w-8 h-8 text-[#087FE8] group-hover:scale-110 transition-transform" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12304A] tracking-tight">
                Aab-e-Noor <span className="text-[#087FE8]">Water Sales</span>
              </h2>
              <p className="text-sm text-[#6B8299] mt-1.5 font-medium">
                Login to your account
              </p>
            </div>

            {/* Error Alert Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#12304A] mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B8299]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales1@local"
                    className="w-full pl-11 pr-4 py-3 bg-[#F5FAFF] border border-[#EAF6FF] focus:border-[#087FE8] focus:bg-white focus:ring-4 focus:ring-[#087FE8]/15 rounded-xl text-sm font-medium text-[#12304A] placeholder-[#6B8299]/60 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#12304A] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B8299]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3 bg-[#F5FAFF] border border-[#EAF6FF] focus:border-[#087FE8] focus:bg-white focus:ring-4 focus:ring-[#087FE8]/15 rounded-xl text-sm font-medium text-[#12304A] placeholder-[#6B8299]/60 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B8299] hover:text-[#087FE8] transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between pt-1">
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }}
                  className="text-xs font-semibold text-[#087FE8] hover:text-[#0F4C81] hover:underline transition-colors"
                >
                  Forgot Password?
                </a>
                <span className="text-xs text-[#6B8299] font-mono">v1.0.0</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#087FE8] to-[#0F4C81] hover:from-[#076ec9] hover:to-[#0b3c66] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-[#087FE8]/25 hover:shadow-xl hover:shadow-[#087FE8]/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Demo Credentials Footer Area */}
            <div className="mt-8 pt-6 border-t border-[#EAF6FF]">
              <div className="bg-[#F5FAFF] border border-[#EAF6FF] rounded-xl p-3.5 text-center">
                <p className="text-xs font-semibold text-[#6B8299] mb-1">
                  Demo Credentials
                </p>
                <div className="text-xs font-mono font-medium text-[#0F4C81] select-all bg-white py-1.5 px-3 rounded-lg border border-[#EAF6FF] inline-block">
                  Salesman: sales1@local / secret123
                </div>
              </div>

              <div className="mt-4 text-center text-[11px] text-[#6B8299]/70 font-medium">
                Pure Water • Healthy Life • Aab-e-Noor Water Sales
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}