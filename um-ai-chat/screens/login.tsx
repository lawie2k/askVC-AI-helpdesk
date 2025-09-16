import {View, Text, TextInput, TouchableOpacity, Pressable} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import { useNavigation } from "@react-navigation/native";


export default function Login(){
    const navigation = useNavigation();
    const [loginPressed, setLoginPressed] = React.useState(false);
    const [signUpPressed, setSignUpPressed] = React.useState(false);

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
                               textContentType="emailAddress"
                           />

                           <TextInput className="w-[310px] h-[50px] bg-[#3C3C3C] rounded-full mt-5 px-5 text-white"
                                      placeholder="Password"
                                      placeholderTextColor="#9CA3AF"
                                      secureTextEntry
                                      autoCapitalize="none"
                                      autoCorrect={false}
                                      autoComplete="password"
                                      textContentType="password"
                                      returnKeyType="done"
                           />

                           <TouchableOpacity className="w-[310px] h-[50px] bg-[#900C27] rounded-full mt-5 px-5 "
                           onPress={() => {
                               setLoginPressed(true);
                               navigation.navigate("MainChat" as never);
                           }}>
                               <Text className="flex text-white text-[16px] font-extrabold text-center py-4">Login</Text>
                           </TouchableOpacity>
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
