
import { Notification } from '@/features/notifications/types/notification.types';
import { NotificationItem } from './NotificationItem';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { EmptyState } from '@/shared/components/common/EmptyState';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

export function NotificationList({ notifications, isLoading, onMarkAsRead, onArchive }: NotificationListProps) {
  if (isLoading) {
    return <div className="p-4"><LoadingSpinner /></div>;
  }

  if (!notifications || notifications.length === 0) {
    return <EmptyState title="No Notifications" message="You're all caught up!" />;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
