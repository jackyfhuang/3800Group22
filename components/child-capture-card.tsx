import React from 'react';
import { View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { AppText } from '@/components/ui/app-text';
import { addChildStyles as styles } from '@/styles';
import type { ChildFormData } from '@/app/(tabs)/add_child';

export type ChildCaptureCardProps = {
viewShotRef: React.RefObject<ViewShot>;
data: ChildFormData | null;
};

export function ChildCaptureCard({ viewShotRef, data }: ChildCaptureCardProps) {
return (
    <ViewShot
    ref={viewShotRef}
    options={{ format: 'png', quality: 1 }}
    style={styles.hiddenCapture}>
        <View style={styles.captureCard}>
            <AppText variant="heading" style={styles.captureTitle}>
                Child Guard ID
            </AppText>
            <AppText variant="label" style={styles.captureName}>
                {(data?.fullName || '').trim() || 'Name missing'}
            </AppText>
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>Age</AppText>
                <AppText style={styles.captureValue}>{data?.age ?? ''}</AppText>
            </View>
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>Gender</AppText>
                <AppText style={styles.captureValue}>{data?.gender || '—'}</AppText>
            </View>
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>Height (cm)</AppText>
                <AppText style={styles.captureValue}>{data?.height ?? ''}</AppText>
            </View>
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>Weight (kg)</AppText>
                <AppText style={styles.captureValue}>{data?.weight ?? ''}</AppText>
            </View>
            {data?.lastKnownLocation && (
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>Last Known Location</AppText>
                <AppText style={styles.captureValue}>{data.lastKnownLocation}</AppText>
            </View>
            )}
            {data?.schoolDaycareType && data.schoolDaycareType !== 'none' && (
            <View style={styles.captureRow}>
                <AppText style={styles.captureLabel}>
                    {data.schoolDaycareType === 'school' ? 'School' : 'Daycare'}
                </AppText>
                <AppText style={styles.captureValue}>
                    {data.schoolDaycareName || '—'}
                </AppText>
            </View>
            )}
            {(data?.hasBirthmarks === 'yes' ||
                data?.hasScars === 'yes' ||
                data?.hasIdentifyingFeatures === 'yes') && (
            <>
                <AppText style={styles.captureSection}>Identifying Features</AppText>
                {data.hasBirthmarks === 'yes' && data.birthmarksDescription && (
                    <AppText style={styles.captureNotes}>
                        <AppText style={styles.captureLabel}>Birthmarks: </AppText>
                        {data.birthmarksDescription}
                    </AppText>
                )}
                {data.hasScars === 'yes' && data.scarsDescription && (
                <AppText style={styles.captureNotes}>
                    <AppText style={styles.captureLabel}>Scars: </AppText>
                    {data.scarsDescription}
                </AppText>
                )}
                {data.hasIdentifyingFeatures === 'yes' &&
                data.identifyingFeaturesDescription && (
                    <AppText style={styles.captureNotes}>
                    <AppText style={styles.captureLabel}>Other Features: </AppText>
                    {data.identifyingFeaturesDescription}
                    </AppText>
                )}
            </>
            )}
            <AppText style={styles.captureSection}>Medical Notes</AppText>
            <AppText style={styles.captureNotes}>
                {data?.medicalNotes || 'None provided'}
            </AppText>
            {data?.emergencyContacts && data.emergencyContacts.length > 0 && (
            <>
                <AppText style={styles.captureSection}>Emergency Contacts</AppText>
                {data.emergencyContacts.map((contact, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                    <AppText style={styles.captureNotes}>
                        <AppText style={styles.captureLabel}>
                            {contact.name || '—'}
                        </AppText>
                        {contact.relationship && ` (${contact.relationship})`}
                        {contact.phone && ` - ${contact.phone}`}
                    </AppText>
                </View>
                ))}
            </>
            )}
        </View>
    </ViewShot>
  );
}
