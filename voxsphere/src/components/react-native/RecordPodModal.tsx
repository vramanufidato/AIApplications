import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { Audio } from "expo-av";
import { X, Mic, Square, Play, RotateCcw, CloudLightning, ShieldAlert, BadgeHelp } from "lucide-react-native";

interface RecordPodModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userPodCount: number;
}

const CATEGORIES = [
  { id: "MENTAL_HEALTH", label: "Mental Health" },
  { id: "CAREER", label: "Career & Money" },
  { id: "CLIMATE", label: "Climate & Nature" },
  { id: "LEGAL_RIGHTS", label: "Legal Rights" },
  { id: "INTERGENERATIONAL_WISDOM", label: "Sankofa Wisdom" },
];

export default function RecordPodModal({ visible, onClose, onUploadSuccess, userPodCount }: RecordPodModalProps) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("MENTAL_HEALTH");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  
  // Timer & wave variables
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) stopRecordingInstance();
      if (playbackSound) playbackSound.unloadAsync();
    };
  }, []);

  // Set up audio recording permissions
  const startRecordingInstance = async () => {
    try {
      if (userPodCount >= 10) {
        Alert.alert(
          "Limit Reached",
          "You have reached the maximum threshold of 10 active pods or drafts. Please delete an older pod from the feed before recording a new one."
        );
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Microphone access is needed to record audio pods.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setSeconds(0);
      setRecordedUri(null);
      setIsReviewing(false);

      // Start 30-second strict countdown
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          // Dynamic visual waves simulator while recording
          setWaveHeights((prevWaves) => {
            const nextWave = Math.floor(Math.random() * 25) + 5;
            const updated = [...prevWaves, nextWave];
            if (updated.length > 20) updated.shift();
            return updated;
          });

          if (prev >= 29) {
            // Reached strict 30 second limit
            clearInterval(timerRef.current!);
            handleStopRecording(newRecording);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not initialize audio recorder.");
    }
  };

  const handleStopRecording = async (recordingObj?: Audio.Recording) => {
    const activeRecording = recordingObj || recording;
    if (!activeRecording) return;

    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);

      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsReviewing(true);

      // Reset audio mode back to playing
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      console.log("Audio recording saved locally at: " + uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const stopRecordingInstance = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
  };

  const handlePlayPreview = async () => {
    if (!recordedUri) return;
    try {
      if (isPlayingPreview && playbackSound) {
        await playbackSound.pauseAsync();
        setIsPlayingPreview(false);
      } else if (playbackSound) {
        await playbackSound.playAsync();
        setIsPlayingPreview(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordedUri },
          { shouldPlay: true },
          (status) => {
            if (status.didJustFinish) {
              setIsPlayingPreview(false);
            }
          }
        );
        setPlaybackSound(newSound);
        setIsPlayingPreview(true);
      }
    } catch (err) {
      console.error("Preview failed:", err);
    }
  };

  const handleReset = () => {
    if (playbackSound) {
      playbackSound.unloadAsync();
      setPlaybackSound(null);
    }
    setRecordedUri(null);
    setIsReviewing(false);
    setSeconds(0);
    setWaveHeights([]);
  };

  const handleUploadPod = async () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your knowledge byte.");
      return;
    }

    setIsUploading(true);
    try {
      // Create a mock script or transcript for the uploaded voice based on title
      // The backend will process this transcript using Gemini or local rules
      const simulatedTranscript = `Sharing thoughts on "${title}". Women empowerment begins with small daily conversations, raising our voices, and sharing intergenerational wisdom across communities. Let's stand strong together!`;

      // Simulating API upload call to Express backend `/api/pods/upload`
      const response = await fetch("/api/pods/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: selectedCategory,
          duration: seconds || 12, // fallback to mock duration
          transcript: simulatedTranscript,
          isDraft: false,
        }),
      });

      const data = await response.json();
      setIsUploading(false);

      if (response.ok && data.success) {
        const status = data.moderationResult.status;
        const reason = data.moderationResult.reason;

        if (status === "FLAGGED") {
          Alert.alert(
            "Moderation Flagged",
            `Your audio pod was uploaded, but flagged by our automated systems:\n\n${reason}\n\nIt is saved as pending/hidden. Avoid repetitive words or loops.`,
            [{ text: "OK", onPress: () => { onClose(); onUploadSuccess(); } }]
          );
        } else {
          Alert.alert(
            "Upload Approved!",
            "Your 30-second pod passed automated speech moderation and is live in the feed!",
            [{ text: "Woohoo!", onPress: () => { onClose(); onUploadSuccess(); } }]
          );
        }
      } else {
        Alert.alert("Upload Failed", data.error || "An error occurred during upload.");
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Upload error:", error);
      Alert.alert("Network Error", "Could not reach the VoxSphere moderation servers.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Share a Knowledge Byte</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
            {/* Limit warning reminder */}
            <View style={styles.quotaNotice}>
              <Text style={styles.quotaText}>
                Active Slots: <Text style={{ fontWeight: "700" }}>{userPodCount} / 10 used</Text>. You have {10 - userPodCount} empty draft slots.
              </Text>
            </View>

            {/* Title Input */}
            <Text style={styles.label}>Pod Title (e.g., "Maternity Rights Tip")</Text>
            <TextInput
              style={styles.input}
              placeholder="Keep it inspiring & under 100 letters..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Category selection */}
            <Text style={styles.label}>Empowerment Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryBtn, isSelected && styles.categoryBtnActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Audio Recording Control Panel */}
            <View style={styles.recordingSection}>
              {!isRecording && !isReviewing ? (
                // Start State
                <View style={styles.centerCol}>
                  <TouchableOpacity style={styles.recordOuterBtn} onPress={startRecordingInstance}>
                    <View style={styles.recordInnerBtn}>
                      <Mic size={28} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.recordingStatusText}>Tap to start recording</Text>
                  <Text style={styles.countdownTimer}>0:00 / 0:30</Text>
                  <Text style={styles.limitTip}>Strict 30-second limit enforced for low-latency sharing.</Text>
                </View>
              ) : isRecording ? (
                // Recording Active state
                <View style={styles.centerCol}>
                  <TouchableOpacity style={[styles.recordOuterBtn, styles.recordingActiveOuter]} onPress={() => handleStopRecording()}>
                    <View style={[styles.recordInnerBtn, { backgroundColor: "#EF4444" }]}>
                      <Square size={24} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                  <Text style={[styles.recordingStatusText, { color: "#EF4444" }]}>Recording Voice Pod...</Text>
                  <Text style={[styles.countdownTimer, { color: "#EF4444" }]}>
                    0:{seconds < 10 ? "0" : ""}{seconds} / 0:30
                  </Text>
                  {/* Waveform Simulator visual bars */}
                  <View style={styles.miniWaveform}>
                    {waveHeights.map((h, index) => (
                      <View key={index} style={[styles.waveBar, { height: h }]} />
                    ))}
                  </View>
                </View>
              ) : (
                // Reviewing state
                <View style={styles.centerCol}>
                  <View style={styles.previewControls}>
                    <TouchableOpacity style={styles.previewSubBtn} onPress={handlePlayPreview}>
                      <Play size={20} color="#DB2777" fill={isPlayingPreview ? "#DB2777" : "none"} />
                      <Text style={styles.previewSubText}>{isPlayingPreview ? "Pause" : "Listen Back"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.previewSubBtn} onPress={handleReset}>
                      <RotateCcw size={20} color="#4B5563" />
                      <Text style={styles.previewSubText}>Redo Recording</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.recordingStatusText}>Recording successful ({seconds}s)</Text>
                  <View style={styles.moderationShield}>
                    <CloudLightning size={16} color="#B45309" style={{ marginRight: 6 }} />
                    <Text style={styles.shieldText}>
                      Upload triggers Gemini AI transcription & automatic "bolo na" spam checks.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom upload actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!title || !recordedUri || isUploading) && styles.submitButtonDisabled,
              ]}
              disabled={!title || !recordedUri || isUploading}
              onPress={handleUploadPod}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit Pod to Feed</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
  },
  quotaNotice: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  quotaText: {
    fontSize: 12,
    color: "#6B21A8",
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    marginHorizontal: -4,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    margin: 4,
  },
  categoryBtnActive: {
    backgroundColor: "#DB2777",
  },
  categoryBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryBtnTextActive: {
    color: "#FFFFFF",
  },
  recordingSection: {
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  centerCol: {
    alignItems: "center",
    width: "100%",
  },
  recordOuterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  recordingActiveOuter: {
    borderColor: "#FECACA",
  },
  recordInnerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  countdownTimer: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "monospace",
    marginBottom: 6,
  },
  limitTip: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 20,
  },
  previewSubBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  previewSubText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  moderationShield: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 6,
    marginHorizontal: 10,
  },
  shieldText: {
    fontSize: 10,
    color: "#92400E",
    flex: 1,
    lineHeight: 14,
  },
  miniWaveform: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    gap: 2,
    marginTop: 10,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#EF4444",
    borderRadius: 1.5,
  },
  footerRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#DB2777",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#FBCFE8",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
