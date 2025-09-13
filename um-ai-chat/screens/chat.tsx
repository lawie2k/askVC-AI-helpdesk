import React from "react";
import { View, Text } from "react-native";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  Composer,
  Send,
  Bubble,
} from "react-native-gifted-chat";

export default function Chat({ messages, setMessages }: { 
  messages: IMessage[], 
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>> 
}) {

  const onSend = React.useCallback(async (messages: IMessage[] = []) => {
    setMessages((prev) => GiftedChat.append(prev, messages));
    const userText = messages[0].text;
    try {
      const response = await fetch("http://127.0.0.1:5050/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });

      const data = await response.json();

      const aiMessage: IMessage = {
        _id: Date.now(),
        text: data.answer,
        createdAt: new Date(),
        user: { _id: 2, name: "UM AI" },
      };
      setMessages((prev) => GiftedChat.append(prev, [aiMessage]));
    } catch (e) {
      const errorMessage: IMessage = {
        _id: Date.now(),
        text: "Error fetching AI response",
        createdAt: new Date(),
        user: { _id: 2 },
      };
      setMessages((prev) => GiftedChat.append(prev, [errorMessage]));
    }
  }, [setMessages]);

  return (
    <View className="flex-1">
      {messages.length === 0 && (
        <View className="px-4 pt-6">
          <Text className="text-white text-[16px] font-extrabold">
            Hi, welcome to VC AI – your AI companion here at UM Tagum Visayan
            Campus!
          </Text>
          <Text className="text-white text-[16px] font-extrabold mt-3">
            I can help you with our school’s mission, vision, rules, events, and
            more. What would you like to know today?
          </Text>
        </View>
      )}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
        }}
        renderUsernameOnMessage
        placeholder="Ask UM"
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: "#3C3C3C", // Gray-800 - input container bg
              borderTopColor: "#374151", // Gray-700 - border color
            }}
          />
        )}
        minComposerHeight={37}
        maxComposerHeight={200}
        renderComposer={(props) => (
          <Composer
            {...props}
            textInputProps={{
              multiline: true,
              blurOnSubmit: false,
            }}
            textInputStyle={{
              backgroundColor: "#3C3C3C", // Gray-700 - input field bg
              paddingHorizontal: 16,
              marginHorizontal: 8,
              paddingBottom: 8,
              fontSize: 16,
              color: "#F9FAFB", // Gray-50 - text color

              borderColor: "#3C3C3C", // Gray-600 - border color
            }}
          />
        )}
        renderSend={(props) => (
          <Send
            {...props}
            containerStyle={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
              marginRight: 8,
              paddingTop: 8,
            }}
            textStyle={{
              color: "white",
            }}
          />
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: "#3C3C3C",
              },
              left: {
                backgroundColor: "#292929",
                marginLeft: -50,
                maxWidth: 250,
              },
            }}
            textStyle={{
              left: {
                color: "white",
              },
            }}
            containerStyle={{
              left: {
                marginLeft: 0,
                marginRight: 0,
                alignSelf: "flex-start",
              },
            }}
          />
        )}
      />
    </View>
  );
}
