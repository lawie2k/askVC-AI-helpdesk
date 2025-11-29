import {View, Text, TextInput, TouchableOpacity, Pressable} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import React, {useState} from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

const API_URL = "https://askvc-ai-helpdesk.onrender.com";

const isUmEmail = (value: string) => {
	const trimmed = value.trim();
	const atIndex = trimmed.lastIndexOf("@");
	if (atIndex <= 0) return false;
	const domain = trimmed.slice(atIndex + 1).toLowerCase();
	return domain === "umindanao.edu.ph";
};


export default function Login(){
    const navigation = useNavigation();
    const [loginPressed, setLoginPressed] = React.useState(false);
    const [signUpPressed, setSignUpPressed] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = useState('');
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isStrongPassword = (pw: string) => PASSWORD_REGEX.test(pw);
    const [pwError, setPwError] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    const isFormValid = () => {
        return email.trim() !== '' && password.trim() !== '';
    };

    React.useEffect(() => {
        (async () => {
            try {
                const storedRemember = await AsyncStorage.getItem("remember_me");
                const shouldRemember = storedRemember === "true";
                if (shouldRemember) {
                    const storedEmail = await AsyncStorage.getItem("remembered_email");
                    if (storedEmail) setEmail(storedEmail);
                }
                setRememberMe(shouldRemember);
            } catch (e) {

            }
        })();
    }, []);

    const toggleRemember = async () => {
        try {
            const next = !rememberMe;
            setRememberMe(next);
            await AsyncStorage.setItem("remember_me", String(next));
            if (!next) {
                await AsyncStorage.removeItem("remembered_email");
            } else if (email) {
                await AsyncStorage.setItem("remembered_email", email);
            }
        } catch (e) {

        }
    };

    async function handleLogin() {
        try {
            setLoginPressed(true);
            setError('');
            
            if (!email || !password) {
                setError("Email and password are required");
                return;
            }

			const normalizedEmail = email.trim();

			if (!isUmEmail(normalizedEmail)) {
				setError("Use your @umindanao.edu.ph email");
				return;
			}

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: normalizedEmail, password }),
            });

            const text = await response.text();
            let data: any = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {

            }

            if (!response.ok) {
                const msg = (data && data.error) || text || `Login failed (${response.status})`;
                if (response.status === 404 || /Account does not exist/i.test(msg)) {
                    throw new Error('Account does not exist');
                }
                throw new Error(msg);
            }

            if (!data || typeof data.token !== "string") {
                throw new Error("Invalid login response");
            }

            const { token, user } = data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("auth_user", JSON.stringify(user));
            if (rememberMe && normalizedEmail) {
                await AsyncStorage.setItem("remembered_email", normalizedEmail);
            }

            navigation.navigate("MainChat" as never);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Failed to login");
        } finally {
            setLoginPressed(false);
        }
    }

    return(
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#292929]">
                <View>
                    <View>
                        <Text className="text-white text-[40px] font-extrabold text-center mt-[75px]">ask
                            <Text className="text-[#900C27]">VC</Text>
                        </Text>
                    </View>

                    <View className="flex items-center mt-[90px]">
                       <View>
                           <Text className="text-white text-[20px] font-bold text-start">Login</Text>
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

                          <View>
                          <TextInput
                                      className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                                      placeholder="Password"
                                      placeholderTextColor="#9CA3AF"
                                      secureTextEntry={!showPassword}
                                      autoCapitalize="none"
                                      autoCorrect={false}
                                      autoComplete="password"
                                      textContentType="password"
                                      returnKeyType="done"
                                      value={password}
                                      onChangeText={(t) => {
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

                           
                           <Pressable
                               onPress={toggleRemember}
                               className="flex-row items-center mt-3"
                               accessibilityRole="checkbox"
                               accessibilityState={{ checked: rememberMe }}
                               hitSlop={8}
                           >
                               <View className="w-5 h-5 mr-2 rounded border border-white items-center justify-center">
                                   {rememberMe ? (
                                       <View className="w-3 h-3 bg-[#900C27]" />
                                   ) : null}
                               </View>
                               <Text className="text-white">Remember me</Text>
                           </Pressable>

                           {error ? (
                               <Text className="text-red-500 text-center mt-4 px-4">
                                   {error}
                               </Text>
                           ) : null}

                           <TouchableOpacity className={`w-[310px] h-[50px] rounded-full mt-5 px-5 ${
                               loginPressed 
                                   ? 'bg-gray-500' 
                                   : 'bg-[#900C27]'
                           }`}
                           onPress={handleLogin}
                           disabled={loginPressed}>
                               <Text className="flex text-white text-[16px] font-extrabold text-center py-4">
                                   {loginPressed ? "Logging in..." : "Login"}
                               </Text>
                           </TouchableOpacity>

                           <Text className="text-center mt-4 text-white"
                           onPress={() => navigation.navigate("ResetPassLogin" as never)}>
                               <Text className="text-[#900C27] font-extrabold text-[16px]">Forgot Password?</Text>
                           </Text>
                       </View>

                        <View className="flex-row justify-center items-center mt-[300px]">
                            <Text className="text-[16px] text-white font-bold">
                                Dont have an account?{" "}
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                hitSlop={10}
                                onPress={() => {
                                    setSignUpPressed(true);
                                    navigation.navigate("Signup" as never);
                                }}
                                disabled={loginPressed}
                            >
                                <Text className="text-[16px] font-extrabold text-[#900C27]">
                                    Sign up
                                </Text>
                            </Pressable>
                            {signUpPressed}
                            {loginPressed}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
