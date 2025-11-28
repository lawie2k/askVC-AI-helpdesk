import React from "react";
import {View, Text, Platform, TouchableOpacity} from "react-native";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  Composer,
  Send,
  Bubble,
  Time,
  Message,
} from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage extends IMessage {
    retryText?: string;
}

export function Chat({messages, setMessages}: {
    messages: IMessage[],
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
}) {

    const BASE_URL = Platform.select({
        ios: "http://192.168.1.6:5050",
        android: "http://192.168.1.6:5050",
        default: "http://192.168.1.6:5050",
    });

    const [isThinking, setIsThinking] = React.useState(false);

    const renderEmailHighlightedText = (text: string) => {
        const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let segmentIndex = 0;

        const matches = [...text.matchAll(emailRegex)];
        matches.forEach((m) => {
            const match = m[0];
            const offset = m.index ?? 0;
            if (offset > lastIndex) {
                parts.push(
                    <Text key={`t-${segmentIndex++}`}>{text.slice(lastIndex, offset)}</Text>
                );
            }
            parts.push(
                <Text key={`e-${segmentIndex++}`} className="text-blue-400">{match}</Text>
            );
            lastIndex = offset + match.length;
        });

        if (lastIndex < text.length) {
            parts.push(<Text key={`t-${segmentIndex++}`}>{text.slice(lastIndex)}</Text>);
        }

        return <Text className="text-white">{parts}</Text>;
    };

    const handleAsk = React.useCallback(async (userText: string, retryMessageId?: string | number) => {
        setIsThinking(true);

        if (retryMessageId) {
            setMessages((prev) => prev.filter((msg) => msg._id !== retryMessageId));
        }
        
        try {
            const token = await AsyncStorage.getItem("token");
            const headers: Record<string, string> = {"Content-Type": "application/json"};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/ask`, {
                method: "POST",
                headers,
                body: JSON.stringify({question: userText}),
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => "");
                throw new Error(`HTTP ${response.status} ${response.statusText} ${errText}`);
            }

            const data = await response.json().catch((err) => {
                throw new Error(`Invalid JSON: ${String(err)}`);
            });

            const answerText = (data && typeof data.answer === "string") ? data.answer : undefined;
            if (!answerText) {
                console.error("Unexpected response shape from /ask:", data);
                throw new Error("Missing 'answer' in response");
            }

            const aiMessage: IMessage = {
                _id: Date.now(),
                text: answerText,
                createdAt: new Date(),
                user: {_id: 2, name: "UM AI"},
            };
            setMessages((prev) => GiftedChat.append(prev, [aiMessage]));

        } catch (e: any) {
            console.error("AI fetch failed:", e);
            let errorText = "Error fetching AI response";
            if (e?.name === "AbortError" || (e?.message || "").includes("Network request failed")) {
                errorText = "No internet connection";
            }
            const errorMessage: ChatMessage = {
                _id: Date.now(),
                text: errorText,
                createdAt: new Date(),
                user: {_id: 2},
                retryText: userText,
            };
            setMessages((prev) => GiftedChat.append(prev, [errorMessage]));
        } finally {
            setIsThinking(false);
        }
    }, [BASE_URL, setMessages]);

    const onSend = React.useCallback((messages: IMessage[] = []) => {
        setMessages((prev) => GiftedChat.append(prev, messages));
        const userText = messages[0].text;
        handleAsk(userText);
    }, [handleAsk, setMessages]);

    const handleRetry = React.useCallback((retryText: string, messageId: string | number) => {
        handleAsk(retryText, messageId);
    }, [handleAsk]);

    return (
        <View className="flex-1">
            {messages.length === 0 && (
                <View className="flex-col">
                    <View className=" flex items-center px-4 pt-32">
                        <Text className="text-[28px] text-white font-extrabold">Hi, welcome to askVC</Text>
                        <Text className="text-white text-[18px] text-center w-[180px] mt-2 font-extrabold">
                             your AI companion here at UM Tagum Visayan
                            Campus!
                        </Text>
                    </View>
                </View>
            )}
            {messages.length === 0 && null}
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: 1,
                }}
                placeholder="Ask UM"
                isTyping={isThinking}
                renderTime={(props) => {
                    return (
                        <View className="pr-[-3px] pt-1">
                            <Time
                                {...props}
                                timeTextStyle={{
                                    left: { color: "#9CA3AF" },
                                    right: { color: "#9CA3AF" },
                                }}
                            />
                        </View>
                    );
                }}
                renderMessageText={(props) => {
                    const { key, ...messageTextProps } = props as any;
                    const msg = (messageTextProps.currentMessage || {}) as IMessage;
                    if (msg && (msg.user as any)?._id === 2 && typeof msg.text === 'string') {
                        return (
                            <View className="pr-0">
                                {renderEmailHighlightedText(msg.text)}
                            </View>
                        );
                    }
                    return <Text className="text-white">{(msg && msg.text) || ''}</Text>;
                }}
                renderInputToolbar={(props) => {
                    const { key, ...toolbarProps } = props as any;
                    return (
                    <InputToolbar
                        key={key}
                        {...toolbarProps}
                        containerStyle={{
                            marginTop: 1,
                            borderRadius:50,
                            backgroundColor: "#3C3C3C",// Gray-800 - input container bg
                            borderTopColor: "#374151", // Gray-700 - border color
                        }}
                    />
                    );
                }}
                minComposerHeight={37}
                maxComposerHeight={200}
                renderComposer={(props) => {
                    const { key, ...composerProps } = props as any;
                    return (
                    <Composer
                        key={key}
                        {...composerProps}
                        textInputProps={{
                            blurOnSubmit: false,
                        }}
                        textInputStyle={{
                            backgroundColor: "#3C3C3C", // Gray-700 - input field bg
                            paddingHorizontal: 16,
                            marginHorizontal: 8,
                            paddingTop:10,
                            fontSize: 16,
                            color: "#F9FAFB", // Gray-50 - text color
                            borderColor: "#3C3C3C", // Gray-600 - border color
                        }}
                    />
                    );
                }}
                renderSend={(props) => {
                    const { key, ...sendProps } = props as any;
                    return (
                    <Send
                        key={key}
                        {...sendProps}
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
                    );
                }}
                renderBubble={(props) => {
                    const { key, ...restProps } = props as any;
                    const bubble = (
                        <Bubble
                            key={key}
                            {...restProps}
                            wrapperStyle={{
                                right: {
                                    backgroundColor: "#3C3C3C",
                                    textAlign: "right",
                                    paddingHorizontal: 8,
                                    paddingVertical: 8,
                                    maxWidth: 200,
                                    width:"auto",
                                    textSize: 12,
                                },
                                left: {
                                    backgroundColor: "#292929",
                                    marginLeft: -50,
                                    maxWidth: 250,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    textSize: 12,
                                },
                            }}
                            textStyle={{
                                left: {
                                    color: "white"
                                },
                            }}
                            containerStyle={{
                                left: {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    backgroundColor: "transparent",
                                    alignSelf: "flex-start",
                                },
                            }}
                        />
                    );

                    const currentMessage = restProps.currentMessage as ChatMessage;
                    if (currentMessage?.retryText) {
                        return (
                            <View className="flex-row items-center">
                                {bubble}
                                <TouchableOpacity
                                    className="ml-1 bg-[#C70039] px-2 py-1.5 rounded-full"
                                    onPress={() => handleRetry(currentMessage.retryText!, currentMessage._id)}
                                >
                                    <Text className="text-white text-[10px] font-bold">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return bubble;
                }}
                renderMessage={(props) => {
                    const { key, ...messageProps } = props as any;
                    return <Message key={key} {...messageProps} />;
                }}
                renderFooter={() =>
                    isThinking ? (
                        <View className="px-2 py-1 pb-3 items-start">
                            <View className="bg-[#292929] rounded-[18px] py-2 px-3 max-w-[250px] h-[30px]">
                                <Text className="text-white">UM AI is thinking…</Text>
                            </View>
                        </View>
                    ) : null
                }
            />
            {messages.length === 0 && (
                <View className="absolute left-3 bottom-[72px] z-40 flex-row flex-wrap gap-3 max-w-[80%]">
                    <TouchableOpacity
                        onPress={() => {
                            setIsThinking(true);
                            const msg: IMessage = {
                                _id: Date.now(),
                                text: "What is the vision of UM Tagum Visayan Campus?",
                                createdAt: new Date(),
                                user: { _id: 1 },
                            };
                            onSend([msg]);
                        }}
                        className="bg-[#3C3C3C] px-3 py-2 rounded-full"
                    >
                        <Text className="text-white font-bold">🎯 Vision</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsThinking(true);
                            const msg: IMessage = {
                                _id: Date.now(),
                                text: "What is the mission of UM Tagum Visayan Campus?",
                                createdAt: new Date(),
                                user: { _id: 1 },
                            };
                            onSend([msg]);
                        }}
                        className="bg-[#3C3C3C] px-3 py-2 rounded-full"
                    >
                        <Text className="text-white font-bold">🏆 Mission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsThinking(true);
                            const msg: IMessage = {
                                _id: Date.now(),
                                text: "who are the professors in IT?",
                                createdAt: new Date(),
                                user: { _id: 1 },
                            };
                            onSend([msg]);

                        }}
                        className="bg-[#3C3C3C] px-3 py-2 rounded-full"
                    >
                        <Text className="text-white font-bold">👨‍🏫 Professors in IT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsThinking(true);
                            const msg: IMessage = {
                                _id: Date.now(),
                                text: "what are the rules of UM",
                                createdAt: new Date(),
                                user: { _id: 1 },
                            };
                            onSend([msg]);
                        }}
                        className="bg-[#3C3C3C] px-3 py-2 rounded-full"
                    >
                        <Text className="text-white font-bold">📚 Rules</Text>
                    </TouchableOpacity>

                </View>
            )}
        </View>
    );
}
