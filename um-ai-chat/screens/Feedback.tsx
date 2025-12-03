import React from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

const API_URL = "https://askvc-backend-0b6f10fad280.herokuapp.com";

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = React.useState("");
  const [rating, setRating] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Feedback", "Please enter your feedback first.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          rating,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Feedback error:", text);
        throw new Error("Failed to send feedback");
      }

      setMessage("");
      setRating(null);
      Alert.alert("Thank you!", "Your feedback has been submitted.");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to send feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#292929]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
        {/* Header (match ChatHistory 1:1 style) */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <FontAwesomeIcon icon={faArrowLeft as IconProp} size={24} color="#C70039" />
            </TouchableOpacity>
            <Text className="text-white text-[24px] font-extrabold">Feedback</Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-4">
          <Text className="text-white text-[20px] font-extrabold mb-2">
            Help us improve ask<Text className="text-[#900C27]">VC</Text>
          </Text>
          <Text className="text-gray-300 mb-4">
            Tell us what you like, what is confusing, or what we should fix.
          </Text>

          <Text className="text-white mb-2">How was your experience?</Text>
          <View className="flex-row mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                className={`w-10 h-10 mr-2 rounded-full items-center justify-center ${
                  rating === value ? "bg-[#900C27]" : "bg-[#3C3C3C]"
                }`}
              >
                <Text className="text-white font-bold">{value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-white mb-2">Your feedback</Text>
          <TextInput
            className="w-full h-40 bg-[#3C3C3C] rounded-2xl px-4 py-3 text-white text-sm"
            placeholder="Type your feedback here..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            className={`w-full h-12 rounded-full mt-5 items-center justify-center ${
              submitting ? "bg-gray-500" : "bg-[#900C27]"
            }`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text className="text-white text-base font-extrabold">
              {submitting ? "Sending..." : "Submit feedback"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


