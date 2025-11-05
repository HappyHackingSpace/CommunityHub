'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';

const preferencesSchema = z.object({
  channels: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    in_app: z.boolean(),
  }),
  doNotDisturb: z.object({
    enabled: z.boolean(),
    schedule: z.object({
        startTime: z.string(),
        endTime: z.string(),
    }).optional(),
  }),
  bypassDndForCritical: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export function NotificationSettingsForm() {
  const { preferences, isLoading, updateChannel, updateDnd, setBypass } = useNotificationPreferences();

  const { control, handleSubmit, reset, watch } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      channels: { email: false, sms: false, in_app: true },
      doNotDisturb: { enabled: false, schedule: { startTime: '22:00', endTime: '08:00' } },
      bypassDndForCritical: true,
    },
  });

  useEffect(() => {
    if (preferences) {
      reset(preferences);
    }
  }, [preferences, reset]);

  // Automatically save on change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type !== 'change' || !name) return;

      if (name.startsWith('channels.')) {
        const channel = name.split('.')[1] as keyof PreferencesFormValues['channels'];
        const enabled = value.channels?.[channel];
        if (enabled !== undefined) {
          updateChannel({ channel, enabled });
        }
      } else if (name === 'doNotDisturb.enabled') {
        const enabled = value.doNotDisturb?.enabled;
        if (enabled !== undefined) {
          updateDnd({ enabled });
        }
      } else if (name.startsWith('doNotDisturb.schedule')) {
        const schedule = value.doNotDisturb?.schedule;
        const enabled = value.doNotDisturb?.enabled;
        if (enabled !== undefined && schedule?.startTime && schedule?.endTime) {
          updateDnd({ enabled, ...schedule });
        }
      } else if (name === 'bypassDndForCritical') {
        const bypass = value.bypassDndForCritical;
        if (bypass !== undefined) {
          setBypass(bypass);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateChannel, updateDnd, setBypass]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h3 className="font-medium">Channels</h3>
            <p className="text-sm text-muted-foreground">Choose where you receive notifications.</p>
            <div className="space-y-2 pt-2">
                <Controller
                    name="channels.in_app"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="in_app" checked={field.value} onCheckedChange={field.onChange} />
                            <label htmlFor="in_app" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">In-App</label>
                        </div>
                    )}
                />
                <Controller
                    name="channels.email"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="email" checked={field.value} onCheckedChange={field.onChange} />
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                        </div>
                    )}
                />
                 <Controller
                    name="channels.sms"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="sms" checked={field.value} onCheckedChange={field.onChange} />
                            <label htmlFor="sms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">SMS</label>
                        </div>
                    )}
                />
            </div>
        </div>
        <div className="space-y-2">
            <h3 className="font-medium">Do Not Disturb</h3>
             <Controller
                name="doNotDisturb.enabled"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="dnd" checked={field.value} onCheckedChange={field.onChange} />
                        <label htmlFor="dnd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Enable Do Not Disturb mode</label>
                    </div>
                )}
            />
        </div>
      </CardContent>
    </Card>
  );
}
