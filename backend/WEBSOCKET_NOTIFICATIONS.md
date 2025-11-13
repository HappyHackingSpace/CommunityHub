# WebSocket Notification System

This document describes the real-time WebSocket notification system implemented for CommunityHub.

## Overview

The WebSocket notification system provides real-time push notifications to connected clients. It follows the same Domain-Driven Design (DDD) architecture as the rest of the application and integrates seamlessly with the existing notification infrastructure.

## Architecture

### Components

1. **NotificationsGateway** - WebSocket gateway handling connections and events
2. **NotificationWebSocketService** - Service managing client connections and message delivery
3. **WsJwtAuthGuard** - JWT authentication guard for WebSocket events
4. **WsAuthAdapter** - Custom WebSocket adapter with handshake authentication
5. **NotificationProcessor** - Updated to send real-time notifications to online users

### Flow

```
User connects → JWT Authentication → Register connection → Ready to receive notifications

Domain Event (e.g., TaskAssigned)
  → NotificationService creates notification
  → Queued via Bull
  → NotificationProcessor processes
  → If user online: Send via WebSocket
  → If user offline: Store in DB for later retrieval
```

## WebSocket Endpoint

- **Namespace**: `/notifications`
- **URL**: `ws://localhost:3000/notifications` (development)
- **URL**: `wss://your-domain.com/notifications` (production)

## Authentication

WebSocket connections require JWT authentication. You can provide the token in three ways:

### 1. Authorization Header (Recommended)
```javascript
const socket = io('http://localhost:3000/notifications', {
  extraHeaders: {
    Authorization: `Bearer ${jwtToken}`
  }
});
```

### 2. Auth Object
```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: jwtToken
  }
});
```

### 3. Query Parameter
```javascript
const socket = io('http://localhost:3000/notifications', {
  query: {
    token: jwtToken
  }
});
```

## Client Implementation

### JavaScript/TypeScript (socket.io-client)

#### Installation
```bash
npm install socket.io-client
```

#### Basic Connection
```typescript
import { io, Socket } from 'socket.io-client';

class NotificationClient {
  private socket: Socket;

  constructor(jwtToken: string) {
    this.socket = io('http://localhost:3000/notifications', {
      extraHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });

    this.setupListeners();
  }

  private setupListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    this.socket.on('connection:success', (data) => {
      console.log('Authentication successful:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      this.handleNewNotification(notification);
    });

    this.socket.on('notifications:unread-count', (data) => {
      console.log('Unread count:', data.count);
      this.updateUnreadBadge(data.count);
    });
  }

  private handleNewNotification(notification: any) {
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png'
      });
    }

    // Update UI
    this.addNotificationToUI(notification);
  }

  private updateUnreadBadge(count: number) {
    // Update badge in UI
    document.getElementById('notification-badge')!.textContent = count.toString();
  }

  private addNotificationToUI(notification: any) {
    // Add to notification list in UI
    console.log('Add to UI:', notification);
  }

  // Fetch recent notifications
  fetchNotifications(limit: number = 20) {
    this.socket.emit('notifications:fetch', { limit }, (response) => {
      console.log('Notifications:', response.data);
    });
  }

  // Fetch unread notifications
  fetchUnreadNotifications() {
    this.socket.emit('notifications:fetch-unread', {}, (response) => {
      console.log('Unread notifications:', response.data);
    });
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    this.socket.emit('notifications:mark-read', { notificationId }, (response) => {
      if (response.data.success) {
        console.log('Marked as read:', notificationId);
      }
    });
  }

  // Mark all as read
  markAllAsRead() {
    this.socket.emit('notifications:mark-all-read', {}, (response) => {
      if (response.data.success) {
        console.log('All notifications marked as read');
      }
    });
  }

  // Archive notification
  archiveNotification(notificationId: string) {
    this.socket.emit('notifications:archive', { notificationId }, (response) => {
      if (response.data.success) {
        console.log('Archived:', notificationId);
      }
    });
  }

  // Get connection statistics
  getStats() {
    this.socket.emit('notifications:stats', {}, (response) => {
      console.log('Connection stats:', response.data);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const jwtToken = 'your-jwt-token';
const notificationClient = new NotificationClient(jwtToken);
```

### React Hook Example

```typescript
// useNotifications.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  readAt?: string;
}

export const useNotifications = (jwtToken: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!jwtToken) return;

    const newSocket = io('http://localhost:3000/notifications', {
      extraHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connection:success', (data) => {
      console.log('Connected to notifications:', data);
    });

    // Notification events
    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message
        });
      }
    });

    newSocket.on('notifications:unread-count', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    // Fetch initial notifications
    newSocket.emit('notifications:fetch', { limit: 20 }, (response: any) => {
      setNotifications(response.data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [jwtToken]);

  const markAsRead = (notificationId: string) => {
    if (!socket) return;
    socket.emit('notifications:mark-read', { notificationId });
  };

  const markAllAsRead = () => {
    if (!socket) return;
    socket.emit('notifications:mark-all-read', {});
    setUnreadCount(0);
  };

  const archiveNotification = (notificationId: string) => {
    if (!socket) return;
    socket.emit('notifications:archive', { notificationId });
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    archiveNotification
  };
};
```

### React Component Example

```typescript
// NotificationCenter.tsx
import React from 'react';
import { useNotifications } from './useNotifications';

export const NotificationCenter: React.FC<{ jwtToken: string }> = ({ jwtToken }) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useNotifications(jwtToken);

  return (
    <div className="notification-center">
      <div className="header">
        <h3>Notifications</h3>
        {isConnected ? (
          <span className="badge online">Online</span>
        ) : (
          <span className="badge offline">Offline</span>
        )}
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
        <button onClick={markAllAsRead}>Mark All Read</button>
      </div>

      <div className="notification-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${notification.readAt ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span className="time">{new Date(notification.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## WebSocket Events

### Server → Client Events

#### `connection:success`
Sent when client successfully connects and authenticates.
```typescript
{
  message: string;
  userId: string;
  timestamp: string;
}
```

#### `notification:new`
Sent when a new notification is created for the user.
```typescript
{
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata: Record<string, any>;
  actionButtons?: ActionButton[];
  createdAt: string;
  readAt?: string;
  sentAt?: string;
}
```

#### `notifications:unread-count`
Sent when unread count changes.
```typescript
{
  count: number;
}
```

#### `notifications:list`
Response to `notifications:fetch` event.
```typescript
{
  event: 'notifications:list';
  data: Notification[];
}
```

#### `error`
Sent when an error occurs.
```typescript
{
  message: string;
}
```

### Client → Server Events

#### `notifications:fetch`
Request recent notifications.
```typescript
// Emit
{ limit?: number }

// Response
{
  event: 'notifications:list';
  data: Notification[];
}
```

#### `notifications:fetch-unread`
Request unread notifications.
```typescript
// Emit
{}

// Response
{
  event: 'notifications:unread';
  data: Notification[];
}
```

#### `notifications:mark-read`
Mark a notification as read.
```typescript
// Emit
{ notificationId: string }

// Response
{
  event: 'notifications:marked-read';
  data: { notificationId: string; success: boolean };
}
```

#### `notifications:mark-all-read`
Mark all notifications as read.
```typescript
// Emit
{}

// Response
{
  event: 'notifications:all-marked-read';
  data: { success: boolean };
}
```

#### `notifications:archive`
Archive a notification.
```typescript
// Emit
{ notificationId: string }

// Response
{
  event: 'notifications:archived';
  data: { notificationId: string; success: boolean };
}
```

#### `notifications:stats`
Get connection statistics (admin).
```typescript
// Emit
{}

// Response
{
  event: 'notifications:stats';
  data: {
    totalUsers: number;
    totalConnections: number;
    averageConnectionsPerUser: number;
  };
}
```

## Features

### Multi-Device Support
- Users can connect from multiple devices simultaneously
- Notifications are delivered to all connected devices
- Each device maintains its own socket connection

### Automatic Reconnection
Socket.io automatically handles reconnection with exponential backoff.

### Offline Support
- If user is offline, notifications are stored in database
- User can fetch missed notifications when reconnecting
- Unread count is sent immediately upon connection

### Authentication
- JWT-based authentication
- Token verification during handshake
- Token validation on each message event
- Automatic disconnection on invalid token

### Scalability
- Connection state managed in-memory
- For production, consider Redis adapter for multi-server deployments

## Production Deployment

### Redis Adapter (Multi-Server)

For production deployments with multiple server instances, use the Redis adapter:

```typescript
// main.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

// In bootstrap()
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

### Environment Variables

```env
# WebSocket Configuration
FRONTEND_URL=https://your-frontend.com
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Redis (for multi-server deployments)
REDIS_URL=redis://localhost:6379
```

### HTTPS/WSS

In production, WebSocket connections will automatically upgrade to WSS when using HTTPS.

## Testing

### Manual Testing with wscat

```bash
# Install wscat
npm install -g wscat

# Connect with authentication
wscat -c ws://localhost:3000/notifications -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send events
> {"event": "notifications:fetch", "data": {"limit": 10}}
```

### Unit Testing

```typescript
import { Test } from '@nestjs/testing';
import { NotificationWebSocketService } from './notification-websocket.service';

describe('NotificationWebSocketService', () => {
  let service: NotificationWebSocketService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationWebSocketService],
    }).compile();

    service = module.get(NotificationWebSocketService);
  });

  it('should register client', () => {
    const mockSocket = { id: 'socket-1', join: jest.fn() } as any;
    service.registerClient('user-1', mockSocket);
    expect(service.isUserOnline('user-1')).toBe(true);
  });

  it('should send notification to online user', () => {
    const mockSocket = {
      id: 'socket-1',
      join: jest.fn(),
      emit: jest.fn()
    } as any;

    service.registerClient('user-1', mockSocket);
    service.sendNotificationToUser('user-1', mockNotification);

    expect(mockSocket.emit).toHaveBeenCalledWith('notification:new', expect.any(Object));
  });
});
```

## Troubleshooting

### Connection Issues

1. **Authentication Failed**
   - Verify JWT token is valid and not expired
   - Check JWT_SECRET environment variable matches

2. **CORS Errors**
   - Ensure FRONTEND_URL is correctly set
   - Check browser console for specific CORS errors

3. **Connection Drops**
   - Check network stability
   - Verify server is running
   - Check firewall/proxy settings

### No Notifications Received

1. **Check user is online**
   ```typescript
   socket.emit('notifications:stats');
   ```

2. **Verify notification was created**
   - Check database for notification
   - Check Bull queue for job processing

3. **Check processor logs**
   - Look for "Sent real-time notification" messages
   - Check for any errors in NotificationProcessor

## Performance Considerations

- Each user connection uses ~10KB of memory
- WebSocket connections are stateful and use one server connection per client
- For high-traffic applications, use Redis adapter for horizontal scaling
- Consider implementing connection throttling for DDoS protection
- Monitor connection count and memory usage

## Security

- All connections require valid JWT tokens
- Tokens are verified on connection and each event
- Users can only access their own notifications
- Rate limiting can be added via throttler guard
- Consider implementing connection limits per user

## Future Enhancements

- [ ] Add typing indicators for comments
- [ ] Add presence system (online/offline status)
- [ ] Add read receipts for notifications
- [ ] Add notification groups/categories
- [ ] Add push notification service (FCM/APNS)
- [ ] Add email notification fallback
- [ ] Add notification preferences UI
- [ ] Add notification sound customization
