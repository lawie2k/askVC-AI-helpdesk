import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TextInput, Pressable, TouchableOpacity} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";


export default function ResetPassLogin() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);

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

                    <TextInput
                        className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        inputMode="email"
                        autoCapitalize="none"
                        textContentType="emailAddress"
                        value={email}
                        onChangeText={(t) => setEmail(t)}
                    />

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
                               onPress={null}
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


