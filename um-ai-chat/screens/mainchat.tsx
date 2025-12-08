import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
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
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
        await AsyncStorage.multiRemove(['token', 'auth_user', 'remember_me', 'remembered_email', 'last_login_at']);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-[#292929]">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 pt-4 px-4 pb-10 shadow-2xl relative">
                <View className="flex-row items-center gap-5 border-b-2 border-gray-600 pb-4">
                    <TouchableOpacity onPress={() => setSideBar(!sideBar)}>
                        <FontAwesomeIcon icon={faListUl} color="#ffffff" size={24}/>
                    </TouchableOpacity>
                    <Text className="text-white text-[24px] text-center font-extrabold">
                        ask<Text className="text-[#900C27]">VC</Text>
                    </Text>
                </View>

                {sideBar && (
                    <View className="absolute inset-0 flex-row z-50 h-screen">
                        {/* Sidebar on the left - full height */}
                        <View className="w-64 bg-[#292929] shadow-lg">
                            <TouchableOpacity
                                onPress={() => setSideBar(false)}
                                className="w-5 p-4"
                            >
                                <FontAwesomeIcon icon={faTimes} color="#ffffff" size={20} />
                            </TouchableOpacity>
                            <View className="p-4">
                                <Text className="text-[#900C27] font-black text-3xl mb-4">Menu</Text>

                                <Pressable
                                    className="py-2"
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
                                    onPress={() => {
                                        setSideBar(false);
                                        navigation.navigate("Feedback" as never);
                                    }}
                                >
                                    <Text className="text-gray-300 text-2xl font-black">
                                        Feedback
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="py-2"
                                    onPress={() => {
                                        setShowLogoutConfirm(true);
                                    }}
                                >
                                    <Text className="text-gray-300 text-2xl font-black">
                                        log out
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Backdrop covering the rest of the screen */}
                        <TouchableOpacity
                            className="flex-1 bg-black/40"
                            activeOpacity={1}
                            onPress={() => setSideBar(false)}
                        />
                    </View>
                )}

                <Chat key={chatKey} messages={messages} setMessages={setMessages}/>

                {/* Custom logout confirmation popup */}
                {showLogoutConfirm && (
                    <View className="absolute inset-0 z-50 items-center justify-center bg-black/50">
                        <View className="w-[300px] bg-[#3C3C3C] rounded-2xl px-5 py-6 border border-white/20">
                            <Text className="text-white text-[18px] font-extrabold mb-2">
                                Log out
                            </Text>
                            <Text className="text-gray-200 mb-5">
                                Are you sure you want to log out?
                            </Text>
                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity
                                    className="px-4 py-2 rounded-full bg-gray-600"
                                    onPress={() => setShowLogoutConfirm(false)}
                                >
                                    <Text className="text-white font-bold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-4 py-2 rounded-full bg-[#900C27]"
                                    onPress={async () => {
                                        setShowLogoutConfirm(false);
                                        setSideBar(false);
                                        try { await logout(); } catch {}
                                    }}
                                >
                                    <Text className="text-white font-bold">Log out</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}


                <View className="absolute bottom-4 left-0 right-0 items-center pointer-events-none">
                    <Text className="text-white text-[12px] text-center">
                        © 2025 All Rights Reserved. By askVC Team
                    </Text>
                </View>
            </View>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
