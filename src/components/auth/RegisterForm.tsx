// src/components/auth/RegisterForm.tsx - COMPLETE REGISTER FLOW
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Mail } from 'lucide-react'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  clubInterest?: string
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
 
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'form' | 'verification'>('form')
  
  const router = useRouter()
  const supabase = createClient()

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'İsim gerekli'
    if (!formData.email.trim()) return 'Email gerekli'
    if (formData.password.length < 6) return 'Şifre en az 6 karakter olmalı'
    if (formData.password !== formData.confirmPassword) return 'Şifreler eşleşmiyor'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Geçerli bir email adresi girin'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 🚀 STEP 1: Register with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          role: 'member',
            club_interest: formData.clubInterest || null
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (data.user && !data.user.email_confirmed_at) {
        // 🚀 STEP 2: Show verification step
        setStep('verification')
        setSuccess(true)
      } else if (data.user) {
        // 🚀 STEP 3: Auto-login if email already confirmed
        router.push('/dashboard')
      }

    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Kayıt işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })
      
      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Email gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Email Doğrulaması</CardTitle>
            <CardDescription>
              {formData.email} adresine doğrulama emaili gönderdik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Doğrulama emaili tekrar gönderildi!
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Emaili görmüyorsanız spam klasörünü kontrol edin
              </p>
              
              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Emaili Tekrar Gönder
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Giriş Sayfasına Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Hesap Oluştur</CardTitle>
          <CardDescription>
            Community Platform'a katılın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Ad Soyad *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Adınız Soyadınız"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                required
                disabled={loading}
              />
            </div>

          

            

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Şifre *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="En az 6 karakter"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Şifre Tekrar *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Şifrenizi tekrar girin"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hesap Oluşturuluyor...
                </>
              ) : (
                'Hesap Oluştur'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline"
                disabled={loading}
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}