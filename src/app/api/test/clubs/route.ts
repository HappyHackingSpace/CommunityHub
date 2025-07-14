import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Test API: Checking clubs table directly');
    
    // Test Supabase connection - basit sorgu
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    console.log('Connection test:', { connectionTest, connectionError });
    
    // Önce tüm kulüpleri alalım (filter olmadan)
    const { data: allClubs, error: allClubsError } = await supabase
      .from('clubs')
      .select('*');
    
    console.log('All clubs (no filter):', { allClubs, allClubsError });
    
    // Sonra sadece aktif kulüpleri alalım
    const { data: activeClubs, error: activeClubsError } = await supabase
      .from('clubs')
      .select('*')
      .eq('is_active', true);
    
    console.log('Active clubs:', { activeClubs, activeClubsError });
    
    // Join ile alalım
    const { data: clubsWithJoin, error: joinError } = await supabase
      .from('clubs')
      .select(`
        *,
        leader:users!clubs_leader_id_fkey(name),
        club_members(user_id)
      `)
      .eq('is_active', true);
    
    console.log('Clubs with join:', { clubsWithJoin, joinError });
    
    return NextResponse.json({
      success: true,
      data: {
        connectionTest,
        connectionError,
        allClubs,
        allClubsError,
        activeClubs,
        activeClubsError,
        clubsWithJoin,
        joinError
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('Test API: Creating the exported club');
    
    // Export ettiğiniz kulübü ekleyelim
    const exportedClub = {
      id: '735b540d-57cd-45dc-a534-662c556abefb',
      name: 'Teknoloji ve İnovasyon Kulübü',
      description: 'Yazılım geliştirme, yapay zeka, mobil uygulama geliştirme ve teknolojik yenilikler üzerine çalışan dinamik bir topluluk. Üyelerimiz birlikte projeler geliştiriyor, teknoloji trendlerini takip ediyor ve birbirlerinden öğreniyor.',
      leader_id: 'eb535194-fa87-4813-a295-b9c1e1c3a3ca',
      type: 'project' as const,
      is_active: true,
      settings: {
        maxFileSize: 26214400,
        publicVisible: true,
        meetingDuration: 120,
        requireApproval: false,
        allowMemberTasks: true,
        allowedFileTypes: ["pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "zip"],
        taskDeadlineReminder: true
      },
      created_at: '2025-07-11 08:39:09.442408+00',
      updated_at: '2025-07-11 08:39:09.442408+00'
    };
    
    console.log('Inserting exported club:', exportedClub);
    
    const { data: createdClub, error: createError } = await supabase
      .from('clubs')
      .insert(exportedClub)
      .select()
      .single();
    
    console.log('Created club result:', { createdClub, createError });
    
    // Ayrıca leader'ı da users tablosuna ekleyelim (eğer yoksa)
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', exportedClub.leader_id)
      .single();
    
    console.log('User check:', { existingUser, userCheckError });
    
    if (!existingUser) {
      const { data: createdUser, error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: exportedClub.leader_id,
          name: 'Kulüp Lideri',
          email: 'leader@test.com',
          role: 'club_leader'
        })
        .select()
        .single();
      
      console.log('Created user:', { createdUser, userCreateError });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        createdClub,
        createError
      }
    });
  } catch (error) {
    console.error('Test create club error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
