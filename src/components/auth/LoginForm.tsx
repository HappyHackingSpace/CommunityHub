// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Giriş sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setMessage(null)
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Kayıt başarılı! Lütfen email adresinizi kontrol edin.')
      }
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Community Platform</CardTitle>
          <CardDescription>
            Kulüp yönetim platformuna giriş yapın veya kayıt olun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">
                    Şifre
                  </label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
  <div className="text-center py-4">
    <p className="text-sm text-gray-600 mb-4">
      Hesap oluşturmak için ayrı sayfamızı kullanın
    </p>
    <Button
      variant="outline"
      onClick={() => router.push('/register')}
      className="w-full"
    >
      Kayıt Sayfasına Git
    </Button>
  </div>
</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}