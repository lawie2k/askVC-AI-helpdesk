import React, { useState } from "react";
import Login from "./screens/login"
import MainChat from "./screens/mainchat";
import Signup from "./screens/signup";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();


export function App() {


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={Login as any} />
                    <Stack.Screen name="Signup" component={Signup as any} />
                    <Stack.Screen name="MainChat" component={MainChat as any} />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}
