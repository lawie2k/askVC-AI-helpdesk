import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {View, Text, TextInput, TouchableOpacity, Pressable, Alert} from "react-native";
import React from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.254.119:5050";

const isUmEmail = (value: string) => {
    const trimmed = value.trim();
    const atIndex = trimmed.lastIndexOf("@");
    if (atIndex <= 0) return false;
    const domain = trimmed.slice(atIndex + 1).toLowerCase();
    return domain === "umindanao.edu.ph";
};

export default function Signup() {
    const navigation = useNavigation();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);
    const [pwError, setPwError] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    
    const isFormValid = () => {
        return email.trim() !== '' && password.trim() !== '';
    };

    async function handleSignup() {
        setLoading(true);
        try {
            const normalizedEmail = email.trim();
            if (!isUmEmail(normalizedEmail)) {
                throw new Error("Use your @umindanao.edu.ph email");
            }
            if (!isStrongPassword(password)) {
                setPwError("Min 8 chars, 1 uppercase, 1 number");
                Alert.alert(
                    "Invalid password",
                    "Password must have at least 8 characters, 1 uppercase letter, and 1 number."
                );
                setLoading(false);
                return;
            }
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail, password }),
            });
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || `Failed to sign up (${response.status})`);
            }
            navigation.navigate("Login" as never);
        } catch (error: any) {
            console.error(error);
            alert(error?.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    }
    
    return(
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#292929]">

                <View className=" ml-8 mt-10 ">
                    <Pressable onPress={() => navigation.goBack()}>
                        <FontAwesomeIcon
                            icon={faArrowLeft as IconProp}
                            size={24}
                            style={{ color: "#C70039" }}
                        />
                    </Pressable>
                </View>

                <View className="flex items-center mt-[75px]">
                    <Text className="text-white text-[40px] font-extrabold">Register</Text>
                </View>

                <View className="flex items-center mt-[90px]">
                    <View>
                        <TextInput
                            className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            inputMode="email"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(t) => setEmail(t)}
                        />

                       <View>
                       <TextInput className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 pr-10 text-white"
                                   placeholder="Password"
                                   placeholderTextColor="#9CA3AF"
                                   autoCapitalize="none"
                                   autoCorrect={false}
                                   secureTextEntry={!showPassword}
                                   autoComplete="password"
                                   textContentType="newPassword"
                                   returnKeyType="done"
                                   value={password}
                                   onChangeText={(t) =>{
                                       setPassword(t);
                                       setPwError(isStrongPassword(t) ? "" : "Min 8 chars, 1 uppercase, 1 number");
                        }}
                        /> 
                        <TouchableOpacity
                        className="absolute right-4 mt-[32px] h-5 w-6 items-center justify-center"
                        onPress={() => setShowPassword(v => !v)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={1}
                            >
                         <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="white" />
                        </TouchableOpacity>
                       </View>
                     
                        {pwError ? <Text style={{ color: "red" }}>{pwError}</Text> : null}
                        <TouchableOpacity className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${
                            loading 
                                ? 'bg-gray-500' 
                                : 'bg-[#900C27]'
                        }`}
                                          onPress={handleSignup}
                                          disabled={loading}>
                            <Text className="flex text-white text-[16px] font-extrabold text-center py-4">
                            {loading ? "Registering..." : "Register"}
                            </Text>
                            
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}