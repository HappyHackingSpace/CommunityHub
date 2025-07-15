// import { NextRequest } from 'next/server';
// import { User, Permission } from '@/types/auth';
// import { hasPermission } from '@/lib/permissions';

// /**
//  * API route'larında permission kontrolü için middleware
//  */
// export async function checkPermission(
//   request: NextRequest,
//   permission: Permission,
//   context?: {
//     clubId?: string;
//     resourceOwnerId?: string;
//   }
// ): Promise<{ authorized: boolean; user: User | null; error?: string }> {
//   try {
//     // Token'ı header'dan al
//     const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return { authorized: false, user: null, error: 'Token bulunamadı' };
//     }

//     // Token'ı verify et ve user'ı al (bu kısım auth sistemine göre değişir)
//     // Şimdilik mock data kullanalım
//     const user: User = {
//       id: 'eb535194-fa87-4813-a295-b9c1e1c3a3ca',
//       name: 'Test User',
//       email: 'test@test.com',
//       role: 'admin',
//       createdAt: new Date().toISOString()
//     };

//     const authorized = hasPermission(user, permission, context);

//     return { authorized, user };
//   } catch (error) {
//     return { authorized: false, user: null, error: 'Token doğrulama hatası' };
//   }
// }

// /**
//  * API response helper'ları
//  */
// export class ApiResponse {
//   static unauthorized(message = 'Bu işlem için yetkiniz yok') {
//     return new Response(
//       JSON.stringify({ success: false, error: message }),
//       { status: 403, headers: { 'Content-Type': 'application/json' } }
//     );
//   }

//   static forbidden(message = 'Yasak') {
//     return new Response(
//       JSON.stringify({ success: false, error: message }),
//       { status: 403, headers: { 'Content-Type': 'application/json' } }
//     );
//   }

//   static success(data: any, message?: string) {
//     return new Response(
//       JSON.stringify({ success: true, data, message }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );
//   }

//   static error(message: string, status = 500) {
//     return new Response(
//       JSON.stringify({ success: false, error: message }),
//       { status, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }
