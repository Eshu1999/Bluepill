
'use client';

import * as React from 'react';
import { Medication, UserProfile, AdherenceLog } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { logAdherence } from '@/app/actions';
import { auth } from '@/lib/firebase';

interface NotificationHandlerProps {
  medications: Medication[];
  profile: UserProfile | null;
  viewingWhoseMeds: string; // The UID of the person whose meds are being viewed
}

// A simple in-memory store for tracking which notifications have been scheduled.
// This prevents re-scheduling notifications on every re-render.
const scheduledNotifications = new Set<string>();

// Store for active alarms and timeouts to manage them
let activeAlarm: { oscillator: OscillatorNode; gainNode: GainNode; context: AudioContext } | null = null;
const activeTimeouts = new Map<string, NodeJS.Timeout>();

const playAlarm = () => {
  if (activeAlarm) {
    stopAlarm();
  }

  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'square';
  oscillator.frequency.value = 440; // A4 pitch
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1); // Lower volume
  
  oscillator.start(audioContext.currentTime);
  
  activeAlarm = { oscillator, gainNode, context: audioContext };
};

const stopAlarm = () => {
  if (activeAlarm) {
    const { oscillator, gainNode, context } = activeAlarm;
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    oscillator.stop(context.currentTime + 0.5);
    activeAlarm = null;
  }
};

const handleAdherenceAction = async (med: Medication, timeStr: string, action: 'taken' | 'skipped') => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        console.error("User not authenticated to log adherence.");
        return;
    }

    const logData: Omit<AdherenceLog, 'id' | 'loggedAt' | 'userId'> = {
        userId: med.userId!,
        medicationId: med.id,
        medicationName: med.name,
        scheduledTime: timeStr,
        action: action,
    };
    
    try {
        const idToken = await firebaseUser.getIdToken(true);
        logAdherence(idToken, logData);
    } catch (error) {
        console.error("Failed to get ID token for adherence log:", error);
    }
}


export function NotificationHandler({ medications, profile, viewingWhoseMeds }: NotificationHandlerProps) {
  const { toast } = useToast();

  const scheduleNotification = React.useCallback((med: Medication, timeStr: string, isSnooze = false, isRetry = false) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const scheduledTime = new Date();
    if (isSnooze) {
      scheduledTime.setMinutes(scheduledTime.getMinutes() + 15);
    } else {
      scheduledTime.setHours(hours, minutes, 0, 0);
    }

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();
    
    // Unique key for this notification
    const baseKey = `${med.id}-${scheduledTime.toISOString().split('T')[0]}-${timeStr}`;
    const notificationKey = isSnooze ? `${baseKey}-snooze-${Date.now()}` : baseKey;

    if (delay > 0 && !scheduledNotifications.has(notificationKey)) {

        const timerId = setTimeout(() => {
            
            const notification = new Notification('Time for your medication!', {
                body: `It's time to take your ${med.name} (${med.dosage}).`,
                icon: '/logo.png',
                requireInteraction: true,
                tag: notificationKey, // Use tag to replace existing notifications
                actions: [
                    { action: 'taken', title: 'Mark as Taken' },
                    { action: 'snooze', title: 'Snooze (15 min)' }
                ]
            });
            
            playAlarm();

            // When user closes notification, stop the alarm.
            notification.onclose = () => {
                stopAlarm();
                handleAdherenceAction(med, timeStr, 'skipped');
                // Clear any pending retry for this notification
                const retryTimerId = activeTimeouts.get(`${notificationKey}-retry`);
                if (retryTimerId) {
                    clearTimeout(retryTimerId);
                    activeTimeouts.delete(`${notificationKey}-retry`);
                }
            };
            
            // When user clicks the main body of the notification.
            notification.onclick = (event) => {
                const target = event.target as Notification;
                
                if (event.action === 'snooze') {
                    scheduleNotification(med, timeStr, true);
                    toast({
                      title: 'Snoozed!',
                      description: `You'll be reminded about ${med.name} in 15 minutes.`
                    });
                } else if (event.action === 'taken') {
                    handleAdherenceAction(med, timeStr, 'taken');
                     toast({
                      title: 'Great!',
                      description: `Logged ${med.name} as taken.`
                    });
                }
                
                window.focus();
                target.close(); // This will also trigger onclose event
            };


            // If it's the first notification (not a retry), schedule a retry in 1 minute.
            if (!isRetry && !isSnooze) {
                 const retryTimerId = setTimeout(() => {
                    console.log(`Retrying notification for ${med.name}`);
                    scheduleNotification(med, timeStr, false, true);
                }, 60 * 1000); // 1 minute
                activeTimeouts.set(`${notificationKey}-retry`, retryTimerId);
            }
            
            scheduledNotifications.delete(notificationKey);

        }, delay);
        
        scheduledNotifications.add(notificationKey);
        activeTimeouts.set(notificationKey, timerId);
    }
  }, [toast]);


  React.useEffect(() => {
    // This entire block of code will now only run on the client, after hydration.
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast({ title: 'Notifications enabled!', description: 'You will now receive medication reminders.' });
        } else {
          toast({ variant: 'destructive', title: 'Notifications denied', description: 'You will not receive reminders.' });
        }
      });
    }

    if (Notification.permission !== 'granted' || (profile && profile.id !== viewingWhoseMeds)) {
        // Do not schedule notifications if permission is not granted,
        // or if a caregiver is viewing someone else's meds.
        // Clear existing notifications to prevent them from firing.
        activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeouts.clear();
        scheduledNotifications.clear();
        return;
    }

    // Clear all previously scheduled timeouts to avoid duplicates on re-render.
    activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    activeTimeouts.clear();
    scheduledNotifications.clear();

    medications.forEach((med) => {
      med.times.forEach((timeStr) => {
        scheduleNotification(med, timeStr);
      });
    });
    
    // Cleanup on component unmount
    return () => {
      activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    }

  }, [medications, scheduleNotification, profile, viewingWhoseMeds, toast]);

  return null; // This component does not render anything
}
