import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, Linking, Image } from "react-native";
import { Audio } from "expo-av";
import { Play, Pause, Heart, MessageSquare, Share2, ExternalLink, ShieldCheck, HeartOff } from "lucide-react-native";

export interface User {
  id: string;
  name: string;
  role: "USER" | "VERIFIED_CREATOR" | "NGO_PARTNER";
}

export interface VoiceReply {
  id: string;
  audioUrl: string;
  duration: number;
  transcript: string;
}

export interface AudioPod {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  category: "MENTAL_HEALTH" | "CAREER" | "CLIMATE" | "LEGAL_RIGHTS" | "INTERGENERATIONAL_WISDOM";
  transcript: string;
  partnerLink?: string;
  user: User;
  replies: VoiceReply[];
}

interface PodCardProps {
  pod: AudioPod;
  onPressReply: (pod: AudioPod) => void;
}

const CATEGORY_STYLES = {
  MENTAL_HEALTH: { label: "Mental Health", color: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  CAREER: { label: "Career & Money", color: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  CLIMATE: { label: "Climate & Nature", color: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  LEGAL_RIGHTS: { label: "Legal Rights", color: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  INTERGENERATIONAL_WISDOM: { label: "Sankofa Wisdom", color: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
};

const ROLE_STYLES = {
  USER: { label: "Sister", color: "#F3F4F6", text: "#4B5563" },
  VERIFIED_CREATOR: { label: "Verified Leader", color: "#FAF5FF", text: "#7E22CE" },
  NGO_PARTNER: { label: "NGO Partner", color: "#F0FDF4", text: "#15803D" },
};

export default function PodCard({ pod, onPressReply }: PodCardProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 45) + 5);

  const cat = CATEGORY_STYLES[pod.category] || CATEGORY_STYLES.MENTAL_HEALTH;
  const role = ROLE_STYLES[pod.user.role] || ROLE_STYLES.USER;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlayAudio = async () => {
    try {
      if (sound === null) {
        // Initialize expo-av sound instance
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: pod.audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn("Could not play sound: ", error);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      loadAndPlayAudio();
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || pod.duration * 1000);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to "${pod.title}" by ${pod.user.name} on VoxSphere — Voice-First Support for Women Empowerment!`,
        url: pod.partnerLink || "",
      });
    } catch (error) {
      console.warn("Error sharing:", error);
    }
  };

  const handlePartnerPress = async () => {
    if (pod.partnerLink) {
      const supported = await Linking.canOpenURL(pod.partnerLink);
      if (supported) {
        await Linking.openURL(pod.partnerLink);
      } else {
        console.warn("Don't know how to open URI: " + pod.partnerLink);
      }
    }
  };

  // Waveform Bar rendering
  const renderWaveform = () => {
    const barCount = 18;
    const progress = duration > 0 ? position / duration : 0;
    const bars = [];
    
    // Deterministic pseudo-random heights for the waveform
    for (let i = 0; i < barCount; i++) {
      const height = 15 + Math.sin(i * 1.2) * 12 + Math.cos(i * 0.7) * 8;
      const isActive = i / barCount < progress;
      bars.push(
        <View
          key={i}
          style={[
            styles.waveformBar,
            {
              height: Math.max(6, height),
              backgroundColor: isActive ? "#10B981" : "#D1D5DB",
            },
          ]}
        />
      );
    }
    return <View style={styles.waveformContainer}>{bars}</View>;
  };

  const formatTime = (millis: number) => {
    if (isNaN(millis) || millis <= 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.cardContainer}>
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{pod.user.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{pod.user.name}</Text>
            {pod.user.role !== "USER" && (
              <ShieldCheck size={14} color="#7E22CE" style={{ marginLeft: 4 }} />
            )}
          </View>
          <View style={[styles.roleBadge, { backgroundColor: role.color }]}>
            <Text style={[styles.roleText, { color: role.text }]}>{role.label}</Text>
          </View>
        </View>
        {/* Category Badge */}
        <View style={[styles.catBadge, { backgroundColor: cat.color, borderColor: cat.border }]}>
          <Text style={[styles.catText, { color: cat.text }]}>{cat.label}</Text>
        </View>
      </View>

      {/* Main content body */}
      <Text style={styles.title}>{pod.title}</Text>
      <Text style={styles.transcript} numberOfLines={4}>
        "{pod.transcript}"
      </Text>

      {/* Audio Controller Section */}
      <View style={styles.audioControlsRow}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          {isPlaying ? (
            <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>
        
        {/* Waveform Visualization */}
        {renderWaveform()}

        <Text style={styles.timeLabel}>
          {formatTime(position)} / {formatTime(duration || pod.duration * 1000)}
        </Text>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          {/* Like Action */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => {
              setIsLiked(!isLiked);
              setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
            }}
          >
            <Heart size={18} color={isLiked ? "#EF4444" : "#4B5563"} fill={isLiked ? "#EF4444" : "none"} />
            <Text style={[styles.actionLabel, isLiked && { color: "#EF4444" }]}>{likeCount}</Text>
          </TouchableOpacity>

          {/* Voice Replies Trigger */}
          <TouchableOpacity style={styles.actionButton} onPress={() => onPressReply(pod)}>
            <MessageSquare size={18} color="#4B5563" />
            <Text style={styles.actionLabel}>{pod.replies?.length || 0}</Text>
          </TouchableOpacity>

          {/* Share Action */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Partner Link Button */}
        {pod.partnerLink && (
          <TouchableOpacity style={styles.partnerBtn} onPress={handlePartnerPress}>
            <ExternalLink size={14} color="#15803D" style={{ marginRight: 4 }} />
            <Text style={styles.partnerBtnText}>Deepen on Partner</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#DB2777",
    fontWeight: "bold",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "500",
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  catText: {
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  transcript: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 14,
    fontStyle: "italic",
  },
  audioControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    height: 36,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  timeLabel: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#6B7280",
    width: 58,
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
    marginLeft: 5,
  },
  partnerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  partnerBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803D",
  },
});
