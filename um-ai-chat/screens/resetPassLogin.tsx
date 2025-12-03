import React, {useState, useCallback, useEffect} from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';


export default function ResetPassLogin() {
    const navigation = useNavigation();
    const API_URL = "https://askvc-backend-0b6f10fad280.herokuapp.com";

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const requestCode = useCallback(async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${API_URL}/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Unable to send reset code');
                return;
            }

            setCodeSent(true);
            setSuccess('Verification code sent. Please check your email.');
            setResendCooldown(60);
        } catch (e: any) {
            setError('Unable to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_URL, email]);

    const submitNewPassword = useCallback(async () => {
        if (!code.trim() || code.trim().length < 4) {
            setError('Enter the code sent to your email');
            return;
        }
        if (!newPassword.trim()) {
            setError('Please enter a new password');
            return;
        }
        if (!isStrongPassword(newPassword)) {
            setError('Password must have min 8 chars, 1 uppercase, 1 number');
            return;
        }
        if (!confirmPassword.trim()) {
            setError('Please confirm your new password');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/auth/verify-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: code.trim(),
                    newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Unable to reset password');
                return;
            }

            setSuccess('Password updated! You can now log in.');
            setTimeout(() => navigation.navigate('Login' as never), 1500);
        } catch (e: any) {
            setError('Unable to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_URL, code, confirmPassword, email, navigation, newPassword, isStrongPassword]);

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#292929]">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1">
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

                    <TextInput
                        className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        inputMode="email"
                        autoCapitalize="none"
                        textContentType="emailAddress"
                        value={email}
                        editable={!codeSent}
                        onChangeText={setEmail}
                    />

                    {codeSent ? (
                        <>
                            <TextInput
                                className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white tracking-[4px]"
                                placeholder="Verification Code"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={code}
                                onChangeText={setCode}
                            />

                            <View>
                                <TextInput
                                    className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                                    placeholder="New Password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    textContentType="password"
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
                                    textContentType="password"
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
                        </>
                    ) : null}

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

                    {codeSent ? (
                        <>
                            <Pressable
                                className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${loading ? 'bg-gray-500' : 'bg-[#900C27]'}`}
                                onPress={submitNewPassword}
                                disabled={loading}
                            >
                                <Text className="flex text-center py-4 text-white text-[16px] font-extrabold">
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </Pressable>
                            <TouchableOpacity
                                className="mt-4"
                                disabled={resendCooldown > 0 || loading}
                                onPress={requestCode}
                            >
                                <Text className={`text-center ${resendCooldown > 0 ? 'text-gray-400' : 'text-white'} underline`}>
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Pressable
                            className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${loading ? 'bg-gray-500' : 'bg-[#900C27]'}`}
                            onPress={requestCode}
                            disabled={loading}
                        >
                            <Text className="flex text-center py-4 text-white text-[16px] font-extrabold">
                                {loading ? 'Sending...' : 'Send Code'}
                            </Text>
                        </Pressable>
                    )}

                </View>
                </View>
                </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}


