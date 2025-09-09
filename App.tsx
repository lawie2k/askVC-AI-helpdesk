import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Chat from "./screens/chat";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faListUl, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function App() {
  const [sideBar, setSideBar] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#292929]">
        <View className="flex-1 p-4 shadow-2xl">
          <View className="flex-row items-center gap-5 border-b-2 border-gray-600 pb-4">
            <TouchableOpacity onPress={() => setSideBar(!sideBar)}>
              <FontAwesomeIcon icon={faListUl} color="#ffffff" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-[24px] text-center font-extrabold">
              ASK <Text className="text-[#900C27]">UM</Text>
            </Text>
          </View>

          {sideBar && (
            <View className="absolute top-0 left-0 w-64 h-full bg-[#292929] z-50 shadow-lg">
              <TouchableOpacity
                onPress={() => setSideBar(false)}
                className=" w-5 p-4"
              >
                <FontAwesomeIcon icon={faXmark} style={{ color: "#ffffff" }} />
              </TouchableOpacity>
              <View className="p-4">
                <Text className="text-white text-3xl mb-4">Menu</Text>
                <TouchableOpacity className="py-2">
                  <Text className="text-gray-300 text-2xl font-black">
                    New chat
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-300 text-2xl font-extrabold">
                  History
                </Text>
                <TouchableOpacity className="py-2">
                  <Text className="text-gray-300">....</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Chat />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
