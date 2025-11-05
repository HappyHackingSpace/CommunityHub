
import { Notification } from '@/features/notifications/types/notification.types';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onArchive }: NotificationItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-200">
      <div className="flex-grow">
        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
          {notification.content}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onArchive(notification.id)}
          title="Archive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
