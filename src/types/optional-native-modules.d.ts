declare module 'react-native-health-connect' {
  export const SdkAvailabilityStatus: Record<string, number | string>;
  export function initialize(): Promise<boolean>;
  export function getSdkStatus(): Promise<number | string>;
  export function requestPermission(permissions: Array<{ accessType: 'read' | 'write'; recordType: string }>): Promise<unknown[]>;
  export function getGrantedPermissions(): Promise<Array<{ accessType?: string; recordType?: string; dataType?: string }>>;
  export function readRecords(recordType: string, options?: Record<string, unknown>): Promise<{ records?: unknown[] } | unknown[]>;
  export function insertRecords(records: unknown[]): Promise<unknown>;
  export function openHealthConnectSettings(): Promise<void>;
}

declare module 'react-native-health' {
  const AppleHealthKit: any;
  export default AppleHealthKit;
}

declare module 'expo-notifications' {
  export type Subscription = { remove: () => void };
  export type Notification = unknown;
  export type NotificationResponse = unknown;
  export const AndroidImportance: Record<string, string | number>;
  export function setNotificationHandler(handler: unknown): void;
  export function setNotificationChannelAsync(channelId: string, channel: Record<string, unknown>): Promise<void>;
  export function getPermissionsAsync(): Promise<{ status: string; granted?: boolean; canAskAgain?: boolean }>;
  export function requestPermissionsAsync(): Promise<{ status: string; granted?: boolean; canAskAgain?: boolean }>;
  export function getExpoPushTokenAsync(options?: Record<string, unknown>): Promise<{ data: string }>;
  export function addNotificationReceivedListener(listener: (notification: Notification) => void): Subscription;
  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): Subscription;
  export function scheduleNotificationAsync(options: Record<string, unknown>): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
}

declare module 'expo-device' {
  export const isDevice: boolean;
  export const osName: string | null;
  export const osVersion: string | null;
  export const deviceName: string | null;
  export const modelName: string | null;
}

declare module 'expo-task-manager' {
  export type TaskManagerTaskBody<T = unknown> = { data?: T; error?: Error | null };
  export function defineTask<T = unknown>(taskName: string, taskExecutor: (body: TaskManagerTaskBody<T>) => Promise<unknown> | unknown): void;
  export function isTaskDefined(taskName: string): boolean;
  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
}

declare module 'expo-background-fetch' {
  export const BackgroundFetchResult: Record<string, string | number>;
  export const BackgroundFetchStatus: Record<string, string | number>;
  export function getStatusAsync(): Promise<string | number>;
  export function registerTaskAsync(taskName: string, options?: Record<string, unknown>): Promise<void>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
}
