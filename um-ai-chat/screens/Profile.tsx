import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
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
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#292929]">

                <View>
                    <View className="px-8 py-6">

                        <Pressable onPress={() => navigation.goBack()}>
                            <FontAwesomeIcon
                                icon={faArrowLeft as IconProp}
                                size={24}
                                style={{ color: "#C70039" }}
                            />
                        </Pressable>

                        <Text className="text-white text-[28px] font-extrabold pt-10">Profile</Text>
                    </View>

                    <View className="flex items-center ">
                        <View className=" w-[360px] h-[100px] bg-[#3C3C3C] rounded-lg px-3">
                            <Text className="text-white text-[18px] py-4 font-extrabold">
                                Email
                            </Text>
                            <Text className="text-white text-[16px] font-bold">
                                {email || "—"}
                            </Text>
                        </View>

                            <TouchableOpacity
                                className="w-[360px] h-[40px] mt-5 bg-[#3C3C3C] rounded-lg px-3"
                                onPress={() =>{
                                navigation.navigate("ResetPass" as never)
                            }}>
                                <Text className="text-white py-4 font-bold">Reset Password</Text>
                            </TouchableOpacity>

                    </View>
                </View>

            </SafeAreaView>
        </SafeAreaProvider>
    )
}