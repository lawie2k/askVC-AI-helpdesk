import {SafeAreaView} from "react-native-safe-area-context";
import {View, Text, Pressable, TouchableOpacity} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile(){
    const navigation = useNavigation();
    const [email, setEmail] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem("auth_user");
                if (stored) {
                    const user = JSON.parse(stored);
                    if (user && typeof user.email === "string") {
                        setEmail(user.email);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);
    return(
            <SafeAreaView className="flex-1 bg-[#292929]">

                <View className="flex-1">
                    {/* Header matching ChatHistory style */}
                    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={() => navigation.goBack()} className="mr-4">
                                <FontAwesomeIcon
                                    icon={faArrowLeft as IconProp}
                                    size={24}
                                    style={{ color: "#C70039" }}
                                />
                            </Pressable>
                            <Text className="text-white text-[24px] font-extrabold">Profile</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View className="flex-1 items-center pt-6">
                        <View className="w-[360px] bg-[#3C3C3C] rounded-2xl px-4 py-4 mb-4">
                            <Text className="text-white text-[18px] pb-4 font-extrabold">
                                Email:
                            </Text>
                            <Text className="text-white text-[16px] font-bold pb-2">
                                {email || "—"}
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="w-[360px] h-[50px] mt-2 bg-[#900C27] rounded-full px-4 items-center justify-center"
                            onPress={() =>{
                                navigation.navigate("ResetPass" as never)
                            }}>
                            <Text className="text-white text-[16px] font-extrabold">Reset Password</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
    )
}