import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

export default function ResetPass() {
    const navigation = useNavigation();
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);
    
    const isFormValid = () => {
        return currentPassword.trim() !== '' && 
               newPassword.trim() !== '' && 
               confirmPassword.trim() !== '';
    };
 
    const resetPassword = useCallback(async () => {
        // First: Do all validation checks
        if (!currentPassword.trim()) {
            setError('Please enter your current password');
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
            setError("New password and confirm password do not match");
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            // Get the logged-in user's ID
            const storedUser = await AsyncStorage.getItem("auth_user");
            if (!storedUser) {
                setError('Please log in first');
                return;
            }
            
            const user = JSON.parse(storedUser);
            const userId = user.id;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch('http://172.20.10.12:5050/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                    userid: userId
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            const data = await response.json();

            if(response.ok){
                setSuccess('Password reset successfully');
                navigation.navigate('MainChat' as never);
            }else{
                setError(data.error || 'Failed to reset password');
            }
        }catch(e: any){
            if (e.name === 'AbortError') {
                setError('Request timed out. Please check your connection.');
            } else {
                setError('An error occurred: ' + (e.message || 'Unknown error'));
            }
        }finally{
            setLoading(false);
        }
    }, [currentPassword, newPassword, confirmPassword, navigation]);

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
                <View>
                <TextInput className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-16 px-5 text-white"
                           placeholder="Old Password"
                           placeholderTextColor="#9CA3AF"
                           secureTextEntry={!showCurrentPassword}
                           autoCapitalize="none"
                           autoCorrect={false}
                           autoComplete="password"
                           textContentType="password"
                           returnKeyType="done"
                           value={currentPassword}
                           onChangeText={setCurrentPassword}
                />
                 <TouchableOpacity
                        className="absolute right-4 mt-[70px] h-5 w-6 items-center justify-center"
                        onPress={() => setShowCurrentPassword(v => !v)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={1}
                            >
                         <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color="white" />
                        </TouchableOpacity>
                </View>
              <View>
              <TextInput className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
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
              <TextInput className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
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

                <Pressable className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${
                    loading 
                        ? 'bg-gray-500' 
                        : 'bg-[#900C27]'
                }`}
                           onPress={resetPassword}
                           disabled={loading}
                >
                    <Text className="flex text-center py-4 text-white text-[16px] font-extrabold">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Text>
                </Pressable>
                
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}


