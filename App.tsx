import { SafeAreaView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Chat from "./screens/chat";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#292929]">
        <View className="flex-1 p-4 shadow-2xl">
          <View className="flex-row items-center gap-5 border-b-2 border-white pb-4">
            <FontAwesomeIcon icon={faListUl} color="#ffffff" size={24} />
            <Text className="text-white text-[24px] text-center font-extrabold">
              ASK <Text className="text-[#900C27]">UM</Text>
            </Text>
          </View>
          <Chat />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
