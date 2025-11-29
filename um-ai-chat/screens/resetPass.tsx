import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, TextInput, Pressable, TouchableOpacity, Platform} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ResetPass() {
    const navigation = useNavigation();
    const API_URL = Platform.select({
        ios: "http://192.168.1.6:5050",
        android: "http://192.168.1.6:5050",
        default: "http://192.168.1.6:5050",
    });

    const [userId, setUserId] = useState<number | null>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [showOldPassword, setShowOldPassword] = React.useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem("auth_user");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && typeof parsed.id === "number") {
                        setUserId(parsed.id);
                    }
                }
            } catch (e) {
                console.error("Failed to load auth_user for reset password:", e);
            }
        })();
    }, []);

    const handleChangePassword = useCallback(async () => {
        if (!userId) {
            setError("User information not found. Please log in again.");
            return;
        }
        if (!oldPassword.trim()) {
            setError("Please enter your current password");
            return;
        }
        if (!newPassword.trim()) {
            setError("Please enter a new password");
            return;
        }
        if (!isStrongPassword(newPassword)) {
            setError("Password must have min 8 chars, 1 uppercase, 1 number");
            return;
        }
        if (!confirmPassword.trim()) {
            setError("Please confirm your new password");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                    userid: userId,
                }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                setError((data && data.error) || "Unable to reset password");
                return;
            }

            setSuccess("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                navigation.goBack();
            }, 1200);
        } catch (e: any) {
            console.error("Profile reset password failed:", e);
            setError("Unable to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [API_URL, confirmPassword, isStrongPassword, navigation, newPassword, oldPassword, userId]);

  return (
    <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#292929]">
            <View className="px-8 py-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesomeIcon
                        icon={faArrowLeft as IconProp}
                        size={24}
                        style={{ color: "#C70039" }}
                    />
                </Pressable>
            </View>
            <View className="flex items-center pb-6">
                    <Text className="text-white text-[28px] py-4 font-bold">Reset Password</Text>
                <View className="mt-10">
                    <View>
                        <TextInput
                            className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full px-5 text-white"
                            placeholder="Current Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showOldPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="done"
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 mt-[14px] h-5 w-6 items-center justify-center"
                            onPress={() => setShowOldPassword(v => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={1}
                        >
                            <Ionicons name={showOldPassword ? 'eye-off' : 'eye'} size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TextInput
                            className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                            placeholder="New Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="done"
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 mt-[32px] h-5 w-6 items-center justify-center"
                            onPress={() => setShowNewPassword(v => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={1}
                        >
                            <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TextInput
                            className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                            placeholder="Confirm New Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="done"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 mt-[32px] h-5 w-6 items-center justify-center"
                            onPress={() => setShowConfirmPassword(v => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={1}
                        >
                            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {error ? (
                    <Text className="text-red-500 text-center mt-4 px-4">
                        {error}
                    </Text>
                ) : null}

                {success ? (
                    <Text className="text-green-500 text-center mt-4 px-4">
                        {success}
                    </Text>
                ) : null}

                <Pressable
                    className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${loading ? 'bg-gray-500' : 'bg-[#900C27]'}`}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    <Text className="flex text-center py-4 text-white text-[16px] font-extrabold">
                        {loading ? 'Saving...' : 'Save New Password'}
                    </Text>
                </Pressable>
                
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}


