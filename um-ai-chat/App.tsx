import React, { useState } from "react";
import Login from "./screens/login"
import MainChat from "./screens/mainchat";
import Signup from "./screens/signup";
import Profile from "./screens/Profile";
import ResetPass from "./screens/resetPass";
import ResetPassLogin from "./screens/resetPassLogin";
import ChatHistory from "./screens/ChatHistory";
import FeedbackScreen from "./screens/Feedback";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync()


export default function App() {
    const [ready, setReady] = React.useState(false);
    const [initialRoute, setInitialRoute] = React.useState<"Login" | "MainChat">("Login");

    React.useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const lastLoginStr = await AsyncStorage.getItem("last_login_at");

                if (token && lastLoginStr) {
                    const lastLogin = parseInt(lastLoginStr, 10);
                    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

                    if (!isNaN(lastLogin) && (Date.now() - lastLogin) <= THREE_DAYS_MS) {
                        setInitialRoute("MainChat");
                    } else {
                        // Session expired - clear stored auth
                        await AsyncStorage.multiRemove(["token", "auth_user", "last_login_at"]);
                    }
                }
            } catch (e) {
                console.warn("Failed to restore session", e);
            } finally {
                setReady(true);
                await SplashScreen.hideAsync();
            }
        })();
    }, []);

    if (!ready) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={Login as any} />
                        <Stack.Screen name="Signup" component={Signup as any} />
                        <Stack.Screen name="MainChat" component={MainChat as any} />
                        <Stack.Screen name="Profile" component={Profile as any} />
                        <Stack.Screen name="ResetPass" component={ResetPass as any} />
                        <Stack.Screen name="ResetPassLogin" component={ResetPassLogin as any} />
                        <Stack.Screen name="ChatHistory" component={ChatHistory as any} />
                        <Stack.Screen name="Feedback" component={FeedbackScreen as any} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
