import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('User Info API: Getting current user info');
    
    // Tüm kullanıcıları alalım
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    console.log('All users:', { allUsers, usersError });
    
    // Club members tablosunu kontrol edelim
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('*');
    
    console.log('Club members:', { clubMembers, membersError });
    
    // Specific club'ın member'larını alalım
    const { data: specificClubMembers, error: specificError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', '735b540d-57cd-45dc-a534-662c556abefb');
    
    console.log('Specific club members:', { specificClubMembers, specificError });
    
    return NextResponse.json({
      success: true,
      data: {
        allUsers,
        usersError,
        clubMembers,
        membersError,
        specificClubMembers,
        specificError,
        targetClubId: '735b540d-57cd-45dc-a534-662c556abefb',
        targetLeaderId: 'eb535194-fa87-4813-a295-b9c1e1c3a3ca'
      }
    });
  } catch (error) {
    console.error('User Info API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
