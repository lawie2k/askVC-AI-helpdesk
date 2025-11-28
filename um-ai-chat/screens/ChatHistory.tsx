import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faClock, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMessage } from "react-native-gifted-chat";

interface Conversation {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export default function ChatHistory() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = Platform.select({
    ios: "http://172.20.10.12:5050",
    android: "http://172.20.10.12:5050",
    default: "http://172.20.10.12:5050",
  });

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/chat-history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.history) {
          setConversations(data.history);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const loadConversation = (conversation: Conversation) => {
    // Convert conversation to GiftedChat format
    const messages: IMessage[] = [
      {
        _id: `user-${conversation.id}`,
        text: conversation.question,
        createdAt: new Date(conversation.created_at),
        user: { _id: 1 },
      },
      {
        _id: `ai-${conversation.id}`,
        text: conversation.answer,
        createdAt: new Date(conversation.created_at),
        user: { _id: 2, name: "UM AI" },
      },
    ];

    // Navigate back to MainChat with the conversation messages
    navigation.navigate("MainChat" as never, { loadMessages: messages } as never);
  };

  const clearChatHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all your chat history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Not Logged In", "Please log in to clear chat history");
                return;
              }

              const response = await fetch(`${BASE_URL}/api/chat-history`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setConversations([]);
                Alert.alert("Success", "Chat history cleared");
              } else {
                Alert.alert("Error", "Failed to clear chat history");
              }
            } catch (error) {
              console.error("Failed to clear chat history:", error);
              Alert.alert("Error", "Failed to clear chat history");
            }
          },
        },
      ]
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const preview = item.question.length > 60 
      ? item.question.substring(0, 60) + "..." 
      : item.question;

    return (
      <TouchableOpacity
        onPress={() => loadConversation(item)}
        className="bg-[#3C3C3C] rounded-lg p-4 mb-3 mx-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-white text-base font-semibold mb-1" numberOfLines={2}>
              {preview}
            </Text>
            <View className="flex-row items-center mt-2">
              <FontAwesomeIcon 
                icon={faClock as IconProp} 
                size={12} 
                color="#9CA3AF" 
                style={{ marginRight: 6 }}
              />
              <Text className="text-gray-400 text-xs">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#292929]">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <FontAwesomeIcon icon={faArrowLeft as IconProp} size={24} color="#C70039" />
            </TouchableOpacity>
            <Text className="text-white text-[24px] font-extrabold">Chat History</Text>
          </View>
          {conversations.length > 0 && (
            <TouchableOpacity
              onPress={clearChatHistory}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesomeIcon icon={faTrash as IconProp} size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#900C27" />
            <Text className="text-white mt-4">Loading history...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-gray-400 text-lg text-center">
              No chat history yet. Start a conversation to see it here!
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

