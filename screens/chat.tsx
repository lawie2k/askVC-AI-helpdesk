import React from "react";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  Composer,
  Send,
} from "react-native-gifted-chat";

export default function Chat() {
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const onSend = React.useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: 1,
      }}
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
      renderComposer={(props) => (
        <Composer
          {...props}
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
    />
  );
}
