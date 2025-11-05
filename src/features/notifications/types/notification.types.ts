
export interface NotificationAction {
  label: string;
  action: string; 
}

export interface Notification {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'critical' | 'reminder';
  actions?: NotificationAction[];
}

export type NotificationChannel = 'email' | 'sms' | 'in_app';

export interface DoNotDisturbSchedule {
  startTime: string; 
  endTime: string;   
}

export interface NotificationPreferences {
  channels: {
    [key in NotificationChannel]: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    schedule?: DoNotDisturbSchedule;
  };
  bypassDndForCritical: boolean;
}
