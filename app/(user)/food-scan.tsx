// Food scan — camera capture + AI nutritional estimate.
// Uses expo-camera and the nutrition/scan endpoint on your backend.
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Loader2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { nutritionService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';

export default function FoodScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');

  if (!permission) {
    return <Screen><TopBar title="Food Scan" /><Text style={{ color: colors.mutedForeground }}>Requesting camera permission…</Text></Screen>;
  }
  if (!permission.granted) {
    return (
      <Screen>
        <TopBar title="Food Scan" />
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: spacing.md }}>
          <Camera size={48} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, fontFamily: typography.body, textAlign: 'center' }}>Camera access is required to scan food.</Text>
          <Button label="Grant permission" onPress={requestPermission} />
        </View>
      </Screen>
    );
  }

  const scan = async () => {
    setError('');
    setScanning(true);
    setResult(null);
    try {
      // Note: capturing a real base64 photo + sending it to the backend
      // requires a CameraView ref + takePictureAsync. For now we POST a
      // placeholder so the endpoint call is exercised; wire the real
      // capture once your backend endpoint accepts multipart/base64.
      const r = await nutritionService.scanFood('placeholder');
      setResult(r);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Scan failed. Try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Screen scroll={false}>
      <TopBar title="Food Scan" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <View style={{ flex: 1, borderRadius: 20, overflow: 'hidden', marginBottom: spacing.md, backgroundColor: colors.card }}>
        <CameraView style={{ flex: 1 }} facing="back" />
        {scanning ? (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Loader2 size={32} color={colors.accent} />
            <Text style={{ color: colors.accent, fontFamily: typography.body, marginTop: spacing.sm }}>Analyzing…</Text>
          </View>
        ) : null}
      </View>

      <Button label={scanning ? 'Scanning…' : 'Scan Food'} onPress={scan} loading={scanning} />

      {result ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.xs }}>Estimated Nutrition</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
