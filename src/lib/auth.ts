import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_leader' | 'member';
  isActive: boolean;
}

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    console.log('🔑 AuthService.login called for:', email);
    
    // ✅ Supabase Auth ile giriş yap
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔑 Supabase auth result:', { 
      user: !!authData.user, 
      session: !!authData.session, 
      error: authError?.message 
    });

    if (authError || !authData.user || !authData.session) {
      await this.logSecurityEvent('login_failed', email, authError?.message || 'Invalid credentials');
      throw new Error('Geçersiz email veya şifre');
    }

    // ✅ let kullan, const değil
    let userData;
    const { data: fetchedUserData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    console.log('🔑 Custom user data:', { fetchedUserData, userError });

    if (userError || !fetchedUserData) {
      // ✅ Eğer custom tabloda yoksa oluştur
      if (userError?.code === 'PGRST116') { // No rows returned
        console.log('🔄 Creating user profile in custom table...');
        
        const newUserData = {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          role: 'member' as const,
          is_active: true,
          permissions: []
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create user profile:', createError);
          throw new Error('Kullanıcı profili oluşturulamadı');
        }

        userData = createdUser; // ✅ Artık çalışır
      } else {
        await this.logSecurityEvent('login_failed', email, 'User profile not found or inactive');
        throw new Error('Kullanıcı bulunamadı veya pasif');
      }
    } else {
      userData = fetchedUserData; // ✅ Normal case
    }

    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
    };

    await this.logSecurityEvent('login_success', email, 'User logged in successfully');

    return { user, token: authData.session.access_token };
  }

  // ✅ Token validation'ı da düzelt
  static async validateToken(token: string): Promise<AuthUser> {
    console.log('🔍 Validating token...');
    
    // ✅ Supabase auth ile token'ı kontrol et
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    console.log('🔍 Token validation result:', { 
      user: !!authUser, 
      error: error?.message 
    });
    
    if (error || !authUser) {
      throw new Error('Geçersiz veya süresi dolmuş token');
    }
    
    // ✅ Custom users tablosundan fresh data al
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      throw new Error('Kullanıcı bulunamadı veya pasif');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
    };
  }

  // ✅ Logout'u da düzelt
  static async logout(email: string): Promise<void> {
    await supabase.auth.signOut();
    await this.logSecurityEvent('logout_success', email, 'User logged out');
  }


  private static async logSecurityEvent(
    event: string, 
    email: string, 
    details: string, 
    ipAddress?: string
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        event_type: event,
        user_email: email,
        details,
        ip_address: ipAddress,
        user_agent: 'Web App',
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}