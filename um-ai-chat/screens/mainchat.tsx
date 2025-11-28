import {Pressable, Text, TouchableOpacity, View} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faListUl, faTimes} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Chat} from "./chat";
import {IMessage} from "react-native-gifted-chat";
import {CommonActions, useNavigation, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MainChat() {
    const navigation = useNavigation();
    const route = useRoute();
    const [sideBar, setSideBar] = useState(false);
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [chatKey, setChatKey] = React.useState(0);

    // Load messages from navigation params if provided (only when explicitly set)
    React.useEffect(() => {
        const params = route.params as any;
        if (params?.loadMessages && Array.isArray(params.loadMessages)) {
            setMessages(params.loadMessages);
            setChatKey(prev => prev + 1);
            // Clear params after loading to prevent reload on re-render
            navigation.setParams({ loadMessages: undefined } as any);
        }
    }, [route.params]);

    async function logout() {
        await AsyncStorage.multiRemove(['token', 'auth_user', 'remember_me', 'remembered_email']);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-[#292929]">
            <View className="flex-1 p-4 shadow-2xl">
                <View className="flex-row items-center gap-5 border-b-2 border-gray-600 pb-4">
                    <TouchableOpacity onPress={() => setSideBar(!sideBar)}>
                        <FontAwesomeIcon icon={faListUl} color="#ffffff" size={24}/>
                    </TouchableOpacity>
                    <Text className="text-white text-[24px] text-center font-extrabold">
                        ask<Text className="text-[#900C27]">VC</Text>
                    </Text>
                </View>

                {sideBar && (
                    <View className="absolute top-0 left-0 w-64 h-full bg-[#292929] z-50 shadow-lg">
                        <TouchableOpacity
                            onPress={() => setSideBar(false)}
                            className=" w-5 p-4"
                        >
                            <FontAwesomeIcon icon={faTimes} color="#ffffff" size={20} />
                        </TouchableOpacity>
                        <View className="p-4">
                            <Text className="text-[#900C27] text-3xl mb-4">Menu</Text>

                            <Pressable
                                accessibilityRole="button"
                                hitSlop={10}
                                onPress={() => {
                                    setSideBar(false);
                                    navigation.navigate("Profile" as never);
                                }}
                            >
                                <Text className="text-gray-300 text-2xl font-black">
                                    Profile
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                className="py-2"
                                onPress={() => {
                                    setMessages([]);
                                    setChatKey(prev => prev + 1);
                                    setHasLoadedFromParams(false);
                                    // Clear navigation params to prevent reloading
                                    navigation.setParams({ loadMessages: undefined } as any);
                                    setSideBar(false);
                                }}
                            >
                                <Text className="text-gray-300 text-2xl font-black">
                                    New chat
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-2"
                                onPress={() => {
                                    setSideBar(false);
                                    navigation.navigate("ChatHistory" as never);
                                }}
                            >
                                <Text className="text-gray-300 text-2xl font-black">
                                    Chat History
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-2"
                                onPress={async () => {
                                    setSideBar(false);
                                    try { await logout(); } catch {}
                                }}
                            >
                                <Text className="text-gray-300 text-2xl font-black">
                                    log out
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Chat key={chatKey} messages={messages} setMessages={setMessages}/>


                <View className="flex-row justify-center mb-[-35px]">
                    <Text className="text-white text-[12px] text-center">© 2025 All Rights Reserved. By Group 1</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}
