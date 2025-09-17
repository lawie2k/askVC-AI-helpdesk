import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {View, Text, Pressable} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import React from "react";
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
                        <View className=" w-[360px] h-[140px] bg-[#3C3C3C] rounded-lg">
                            <Text className="text-white text-[18px] px-3 py-4 font-extrabold">
                                Email
                            </Text>
                            <Text className="text-white text-[16px] px-3 font-bold">
                                {email || "—"}
                            </Text>

                        </View>
                    </View>
                </View>

            </SafeAreaView>
        </SafeAreaProvider>
    )
}