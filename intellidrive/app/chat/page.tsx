"use client";

import {
    Box,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

export default function Chat() {
    const { theme } = useTheme();
    const { user } = useUser();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi, I'm the IntelliDrive support assistant. How can I help you today?",
        },
    ]);

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await sendMessage();
        }
    };

    const sendMessage = async () => {
        if (!user) return;

        setMessages((messages) => [
            ...messages,
            { role: "user", content: message },
            { role: "assistant", content: "" },
        ]);
        setMessage("");

        fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
                messages: [...messages, { role: "user", content: message }],
                namespace: user.id,
            }),
        }).then(async (res) => {
            if (!res.body) {
                throw new Error("No response body");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            return reader.read().then(function processText({
                done,
                value,
            }): any {
                if (done) return;

                const text = decoder.decode(value || new Uint8Array(), {
                    stream: true,
                });
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1];
                    let otherMessages = messages.slice(0, messages.length - 1);
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ];
                });

                return reader.read().then(processText);
            });
        });
    };

    const messageEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        console.log("Scrolling....");
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="border-t">
            <Box
                width="100vw"
                height="90vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Stack
                    direction="column"
                    width="600px"
                    height="85vh"
                    boxShadow={2}
                    borderRadius={2}
                    border={theme === "dark" ? 1 : 0}
                    borderColor="grey.600"
                    p={2}
                    spacing={3}
                    my={2}
                >
                    <Stack
                        direction="column"
                        spacing={2}
                        flexGrow={1}
                        overflow="auto"
                        maxHeight="100%"
                    >
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent={
                                    message.role === "assistant"
                                        ? "flex-start"
                                        : "flex-end"
                                }
                            >
                                <Box
                                    bgcolor={
                                        message.role === "assistant"
                                            ? theme === "dark"
                                                ? "grey.800"
                                                : "grey.200"
                                            : "primary.main"
                                    }
                                    color={
                                        theme === "light" &&
                                        message.role === "assistant"
                                            ? "black"
                                            : "white"
                                    }
                                    borderRadius={5}
                                    p={3}
                                >
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </Box>
                            </Box>
                        ))}
                        <div ref={messageEndRef} />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Message"
                            fullWidth
                            multiline
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyUp={handleKeyPress}
                            sx={{
                                bgcolor: theme === "dark" ? "grey.400" : "none",
                                borderRadius: 2,
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment
                                            position="end"
                                            sx={{
                                                position: "absolute",
                                                bottom: 13,
                                                right: 5,
                                            }}
                                        >
                                            <IconButton onClick={sendMessage}>
                                                <Send
                                                    sx={{
                                                        transform:
                                                            "rotate(-45deg)",
                                                    }}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                </Stack>
            </Box>
        </div>
    );
}
