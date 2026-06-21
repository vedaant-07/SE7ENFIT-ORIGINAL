// Gym Owner Advertisements/Promotions Management - SE7EN FIT
// Allows gym owners to create and manage promotions, offers, and announcements targeted ONLY to their own members.

import { useState, useEffect } from 'react';
import { Pressable, Text, View, ScrollView, Modal } from 'react-native';
import { Bell, Plus, Pencil, Trash2, Pause, Play, Megaphone, Tag, Percent, X } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import {
  getGymOwnerAdvertisements,
  createGymOwnerAdvertisement,
  updateGymOwnerAdvertisement,
  deleteGymOwnerAdvertisement,
  pauseGymOwnerAdvertisement,
  activateGymOwnerAdvertisement,
} from '@/services/advertisementService';
import type { Advertisement, AdvertisementType, AdvertisementStatus, AdvertisementTargetType } from '@/src/types/advertisement';

const AD_TYPES: { value: AdvertisementType; label: string; icon: typeof Tag }[] = [
  { value: 'announcement', label: 'Announcement', icon: Bell },
  { value: 'promotion', label: 'Promotion', icon: Megaphone },
  { value: 'offer', label: 'Offer', icon: Percent },
];

const STATUS_COLORS: Record<AdvertisementStatus, string> = {
  active: colors.accent,
  paused: colors.warning,
  scheduled: '#38BDF8',
  expired: colors.mutedForeground,
  draft: colors.mutedForeground,
};

type FormData = {
  title: string;
  description: string;
  type: AdvertisementType;
  ctaText: string;
  ctaTarget: string;
  ctaTargetType: AdvertisementTargetType;
  startAt: string;
  endAt: string;
};

const emptyForm: FormData = {
  title: '',
  description: '',
  type: 'announcement',
  ctaText: '',
  ctaTarget: '',
  ctaTargetType: 'none',
  startAt: '',
  endAt: '',
};

export default function GymOwnerAdvertisements() {
  const { data, loading, error, reload } = useAsync(() => getGymOwnerAdvertisements());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!modalVisible) {
      setForm(emptyForm);
      setEditingId(null);
      setFormError('');
    }
  }, [modalVisible]);

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      ctaText: ad.ctaText || '',
      ctaTarget: ad.ctaTarget || '',
      ctaTargetType: ad.ctaTargetType,
      startAt: ad.startAt.slice(0, 16), // Format for datetime-local
      endAt: ad.endAt.slice(0, 16),
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!form.startAt || !form.endAt) {
      setFormError('Start and end dates are required');
      return;
    }

    setBusy(true);
    setFormError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        ctaText: form.ctaText.trim() || undefined,
        ctaTarget: form.ctaTarget.trim() || undefined,
        ctaTargetType: form.ctaTargetType,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      };

      if (editingId) {
        await updateGymOwnerAdvertisement(editingId, payload);
      } else {
        // IMPORTANT SECURITY NOTE:
        // Frontend does NOT set targetGymId. Backend must automatically
        // target the authenticated gym owner's own gym members only.
        await createGymOwnerAdvertisement(payload);
      }

      setModalVisible(false);
      reload();
    } catch (err) {
      setFormError('Failed to save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGymOwnerAdvertisement(id);
    reload();
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    if (ad.status === 'active') {
      await pauseGymOwnerAdvertisement(ad.id);
    } else if (ad.status === 'paused') {
      await activateGymOwnerAdvertisement(ad.id);
    }
    reload();
  };

  if (loading) return <LoadingScreen />;

  const ads = data || [];

  return (
    <Screen>
      <TopBar
        title="Promotions & Announcements"
        right={
          <Pressable
            onPress={() => setModalVisible(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={18} color={colors.accent} />
          </Pressable>
        }
      />

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {/* Info banner */}
      <Card style={{ marginBottom: spacing.md, borderColor: colors.accentBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Megaphone size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.foreground }}>
              Target Your Members Only
            </Text>
            <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
              Promotions are shown only to members linked to your gym.
            </Text>
          </View>
        </View>
      </Card>

      {ads.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={40} color={colors.mutedForeground} />}
          title="No promotions yet"
          subtitle="Create announcements, offers, or promotions for your gym members."
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
            {ads.map((ad) => {
              const TypeIcon = AD_TYPES.find((t) => t.value === ad.type)?.icon || Bell;
              return (
                <Card key={ad.id}>
                  {/* Header row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <TypeIcon size={16} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>
                        {ad.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: STATUS_COLORS[ad.status] + '20' }}>
                          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: STATUS_COLORS[ad.status], textTransform: 'capitalize' }}>
                            {ad.status}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground, textTransform: 'capitalize' }}>
                          {ad.type}
                        </Text>
                      </View>
                    </View>
                    {/* Actions */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {ad.status === 'active' || ad.status === 'paused' ? (
                        <Pressable onPress={() => handleToggleStatus(ad)} hitSlop={8}>
                          {ad.status === 'active' ? (
                            <Pause size={16} color={colors.warning} />
                          ) : (
                            <Play size={16} color={colors.accent} />
                          )}
                        </Pressable>
                      ) : null}
                      <Pressable onPress={() => handleEdit(ad)} hitSlop={8}>
                        <Pencil size={16} color={colors.mutedForeground} />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(ad.id)} hitSlop={8}>
                        <Trash2 size={16} color={colors.error} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Description */}
                  {ad.description ? (
                    <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 18, marginBottom: spacing.sm }}>
                      {ad.description}
                    </Text>
                  ) : null}

                  {/* Dates */}
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                    {new Date(ad.startAt).toLocaleDateString('en-IN')} - {new Date(ad.endAt).toLocaleDateString('en-IN')}
                  </Text>

                  {/* Stats */}
                  {ad.impressionsCount !== undefined && (
                    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
                      <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                        Views: {ad.impressionsCount}
                      </Text>
                      <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                        Clicks: {ad.clicksCount || 0}
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
              <X size={24} color={colors.foreground} />
            </Pressable>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>
              {editingId ? 'Edit' : 'New Promotion'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {formError ? (
            <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
              <ErrorBanner>{formError}</ErrorBanner>
            </View>
          ) : null}

          {/* Modal Content */}
          <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
              {/* Type Selection */}
              <View>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.foreground, marginBottom: spacing.sm }}>
                  Type
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {AD_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = form.type === t.value;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() => setForm({ ...form, type: t.value })}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          paddingVertical: 12,
                          borderRadius: radius.md,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.accentSoft : colors.card,
                        }}
                      >
                        <Icon size={14} color={isSelected ? colors.accent : colors.mutedForeground} />
                        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: isSelected ? colors.accent : colors.foreground }}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Title */}
              <Input
                label="Title"
                placeholder="e.g. New Year Special Offer"
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />

              {/* Description */}
              <Input
                label="Description"
                placeholder="Describe your promotion or announcement..."
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                style={{ minHeight: 80 }}
              />

              {/* Dates */}
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                    value={form.startAt.slice(0, 10)}
                    onChangeText={(text) => setForm({ ...form, startAt: text + 'T00:00' })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="End Date"
                    placeholder="YYYY-MM-DD"
                    value={form.endAt.slice(0, 10)}
                    onChangeText={(text) => setForm({ ...form, endAt: text + 'T23:59' })}
                  />
                </View>
              </View>

              {/* CTA (Optional */}
              <Input
                label="CTA Button Text (optional)"
                placeholder="e.g. View Offer, Book Now"
                value={form.ctaText}
                onChangeText={(text) => setForm({ ...form, ctaText: text })}
              />

              {/* Submit */}
              <Button
                label={busy ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                onPress={handleSubmit}
                loading={busy}
                style={{ marginTop: spacing.md }}
              />

              {/* Security Note */}
              <Text style={{ fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md }}>
                This promotion will only be shown to members linked to your gym. Targeting other gyms' members is not allowed.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
