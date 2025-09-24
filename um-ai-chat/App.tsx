import React, { useState } from "react";
import Login from "./screens/login"
import MainChat from "./screens/mainchat";
import Signup from "./screens/signup";
import Profile from "./screens/Profile";
import ResetPass from "./screens/resetPass";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync()


export default function App() {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            try {
                // TODO: load fonts/assets or init storage here
                // await Font.loadAsync(...);
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
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={Login as any} />
                        <Stack.Screen name="Signup" component={Signup as any} />
                        <Stack.Screen name="MainChat" component={MainChat as any} />
                        <Stack.Screen name="Profile" component={Profile as any} />
                        <Stack.Screen name="ResetPass" component={ResetPass as any} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
