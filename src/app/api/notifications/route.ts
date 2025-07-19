import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { authenticateRequest } from '@/lib/api-middleware';


export async function GET(request: NextRequest) {
  try {
    // Authentication
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const { data, error } = await DatabaseService.getActivities(user.id, type || undefined);
    
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
      userId: user.id,
      title: activity.title,
      message: activity.content || '',
      type: activity.type === 'notification' ? 'general' : 
            activity.type === 'meeting' ? 'meeting' : 'club',
      isRead: activity.metadata?.read_by?.includes(user.id) || false,
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

    // Persist the metadata changes to the database
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('activities')
      .update({ metadata: updatedMetadata })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Bildirim güncellenemedi' },
        { status: 500 }
      );
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