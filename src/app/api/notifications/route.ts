import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase-client';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.getActivities(userId, type || undefined);
    
    if (error) {
      console.error('Notifications fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Bildirimler yüklenemedi' },
        { status: 500 }
      );
    }

    // Transform activities to notifications format
    const notifications = data?.map(activity => ({
      id: activity.id,
      userId: userId,
      title: activity.title,
      message: activity.content || '',
      type: activity.type === 'notification' ? 'general' : 
            activity.type === 'meeting' ? 'meeting' : 'club',
      isRead: activity.metadata?.read_by?.includes(userId) || false,
      createdAt: activity.created_at,
      actionUrl: activity.metadata?.action_url || null,
    })) || [];

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirimler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, clubId, targetUsers, actionUrl, createdBy } = body;
    
    if (!title || !targetUsers || targetUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Başlık ve hedef kullanıcılar gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.createActivity({
      title,
      content,
      type: type || 'notification',
      club_id: clubId,
      created_by: createdBy,
      target_users: targetUsers,
      metadata: actionUrl ? { action_url: actionUrl } : {},
    });

    if (error) {
      console.error('Notification creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Bildirim oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Bildirim oluşturuldu'
    });
  } catch (error) {
    console.error('Notification creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, action } = body;
    
    if (!notificationId || !userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Gerekli parametreler eksik' },
        { status: 400 }
      );
    }

    // Get current activity
    const { data: activity, error: fetchError } = await DatabaseService.getActivities(userId);
    const targetActivity = activity?.find(a => a.id === notificationId);
    
    if (!targetActivity) {
      return NextResponse.json(
        { success: false, error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    let updatedMetadata = targetActivity.metadata || {};
    
    if (action === 'mark_read') {
      const readBy = updatedMetadata.read_by || [];
      if (!readBy.includes(userId)) {
        updatedMetadata.read_by = [...readBy, userId];
      }
    }



    return NextResponse.json({
      success: true,
      message: 'Bildirim güncellendi'
    });
  } catch (error) {
    console.error('Notification update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim güncellenemedi' },
      { status: 500 }
    );
  }
}