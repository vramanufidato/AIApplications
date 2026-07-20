import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from "react-native";
import { Mic, Globe, Info, RefreshCw, Layers } from "lucide-react-native";
import PodCard, { AudioPod } from "./PodCard";

const CATEGORIES = [
  { id: "ALL", label: "All Pods" },
  { id: "MENTAL_HEALTH", label: "Mental Health" },
  { id: "CAREER", label: "Career & Money" },
  { id: "CLIMATE", label: "Climate & Nature" },
  { id: "LEGAL_RIGHTS", label: "Legal Rights" },
  { id: "INTERGENERATIONAL_WISDOM", label: "Sankofa Wisdom" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "bn", label: "Bengali (বাংলা)" },
];

interface FeedScreenProps {
  onOpenRecord: () => void;
  onOpenReplyModal: (pod: AudioPod) => void;
  userPodCount: number; // passed down to track the 10 pod limit
}

export default function FeedScreen({ onOpenRecord, onOpenReplyModal, userPodCount = 4 }: FeedScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [podsList, setPodsList] = useState<AudioPod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch pods from simulated Express API backend
  const fetchPods = async (cat: string, lang: string, isAppend = false) => {
    try {
      if (!isAppend) setIsLoading(true);
      
      // Simulate API call to backend Endpoint
      const response = await fetch(`/api/pods/feed?category=${cat}&language=${lang}`);
      const data = await response.json();
      
      if (data.success) {
        if (isAppend) {
          setPodsList(prev => [...prev, ...data.pods]);
        } else {
          setPodsList(data.pods);
        }
      } else {
        Alert.alert("Error", "Failed to fetch audio pods feed.");
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPods(selectedCategory, selectedLanguage);
  }, [selectedCategory, selectedLanguage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchPods(selectedCategory, selectedLanguage);
  };

  const handleLoadMore = () => {
    if (isLoading) return;
    // Simulate paginating further pages
    setPage(prev => prev + 1);
    fetchPods(selectedCategory, selectedLanguage, true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Brand Nav Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.brandTitle}>VoxSphere</Text>
          <Text style={styles.brandSubtitle}>Voices of Support, Sisters of Wisdom</Text>
        </View>
        
        {/* Language selector toggle button */}
        <TouchableOpacity 
          style={styles.langButton}
          onPress={() => setShowLangDropdown(!showLangDropdown)}
        >
          <Globe size={16} color="#DB2777" />
          <Text style={styles.langButtonText}>
            {LANGUAGES.find(l => l.code === selectedLanguage)?.label.split(" ")[0]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection List popup simulator */}
      {showLangDropdown && (
        <View style={styles.langDropdown}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langOption,
                selectedLanguage === lang.code && styles.langOptionSelected
              ]}
              onPress={() => {
                setSelectedLanguage(lang.code);
                setShowLangDropdown(false);
              }}
            >
              <Text style={[
                styles.langOptionText,
                selectedLanguage === lang.code && styles.langOptionTextSelected
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Storage and draft limit tracker bar */}
      <View style={styles.quotaBar}>
        <Layers size={14} color="#6B7280" />
        <Text style={styles.quotaText}>
          Local Pod Quota: <Text style={styles.quotaValue}>{userPodCount} / 10</Text> slots filled.
        </Text>
        <TouchableOpacity 
          onPress={() => Alert.alert(
            "Local Storage Limit", 
            "VoxSphere enforces a 10 active pods or drafts threshold per user to keep cloud hosting costs optimal and ensure focused micro-podcasts. Delete old pods to free up slots."
          )}
        >
          <Info size={14} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Category horizontal filters */}
      <View style={styles.categoriesRow}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.catFilterBtn,
                selectedCategory === category.id && styles.catFilterBtnActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.catFilterText,
                selectedCategory === category.id && styles.catFilterTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Micro-Podcast Feed List */}
      {isLoading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#DB2777" />
          <Text style={styles.loadingText}>Tuning in to the sisterhood...</Text>
        </View>
      ) : (
        <FlatList
          data={podsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PodCard pod={item} onPressReply={onOpenReplyModal} />
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <ActivityIndicator size="small" color="#DB2777" style={{ marginVertical: 15 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Audio Pods Yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to share a 30-second knowledge byte in this category!
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={onOpenRecord}>
                <Mic size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyBtnText}>Record Pod</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) to Record Pod */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={onOpenRecord}
        activeOpacity={0.8}
      >
        <Mic size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Record 30s</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#DB2777",
  },
  brandSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 1,
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  langButtonText: {
    fontSize: 12,
    color: "#DB2777",
    fontWeight: "600",
    marginLeft: 4,
  },
  langDropdown: {
    position: "absolute",
    top: 55,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 999,
    width: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  langOptionSelected: {
    backgroundColor: "#FFF1F2",
  },
  langOptionText: {
    fontSize: 12,
    color: "#4B5563",
  },
  langOptionTextSelected: {
    color: "#DB2777",
    fontWeight: "600",
  },
  quotaBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  quotaText: {
    fontSize: 11,
    color: "#1E3A8A",
    fontWeight: "500",
    flex: 1,
    marginLeft: 8,
  },
  quotaValue: {
    fontWeight: "700",
  },
  categoriesRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  categoriesContent: {
    paddingHorizontal: 12,
  },
  catFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: "#F3F4F6",
  },
  catFilterBtnActive: {
    backgroundColor: "#DB2777",
  },
  catFilterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  catFilterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: "#4B5563",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginHorizontal: 30,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB2777",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#DB2777",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#DB2777",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DB2777",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
});
