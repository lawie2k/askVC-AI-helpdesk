import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {View, Text, TextInput, TouchableOpacity, Pressable} from "react-native";
import React from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useNavigation} from "@react-navigation/native";

export default function Signup() {
    const navigation = useNavigation();

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
                                          onPress={() => {}}>
                            <Text className="flex text-white text-[16px] font-extrabold text-center py-4">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}