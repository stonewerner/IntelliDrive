"use client";

import {
    Box,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Button,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useUser } from "@clerk/nextjs";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";

export default function Chat() {
    const { user } = useUser();
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi, I'm the IntelliDrive support assistant. How can I help you today?",
        },
    ]);

    const scrollToBottom = () => {
        console.log("Scrolling....");
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        async function loadMessages() {
            if (!user) return;

            const allUsersColRef = collection(db, "users");
            const userDocRef = doc(allUsersColRef, user.id);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const prevMessages = userDoc.data().messages || [];
                setMessages([...messages, ...prevMessages]);
            } else {
                await setDoc(userDocRef, { messages: [] });
            }
        }
        loadMessages();
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBubbleBgColor = (role: string) => {
        return role === "assistant" ? "grey.200" : "primary.main";
    };

    const getTextColor = (role: string) => {
        return role === "assistant" ? "black" : "white";
    };

    const getMessageAlignment = (role: string) => {
        return role === "assistant" ? "flex-start" : "flex-end";
    };

    const updateMessagesInFirebase = async (
        messages: { role: string; content: string }[]
    ) => {
        if (!user) return;

        try {
            const allUsersColRef = collection(db, "users");
            const userDocRef = doc(allUsersColRef, user.id);
            const batch = writeBatch(db);

            batch.update(userDocRef, { messages: messages });
            await batch.commit();
        } catch (error) {
            console.error("Error saving messages:", error);
            alert("An error occurred while user messages.");
        }
    };

    const handleSendMessage = async () => {
        if (!user || !message.trim()) return;

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

        await updateMessagesInFirebase(messages.slice(1));
    };

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await handleSendMessage();
        }
    };

    const handleClearChat = async () => {
        await updateMessagesInFirebase([]);
        window.location.reload();
    };

    return (
        <div className="border-t">
            <Box
                width="100vw"
                height={{ xs: "85vh", md: "90vh" }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Stack
                    direction="column"
                    width={{ xs: "95vw", sm: "90vw", md: "800px" }}
                    height={{ xs: "80vh", md: "85vh" }}
                    boxShadow={2}
                    borderRadius={2}
                    border={1}
                    borderColor="grey.300"
                    p={2}
                    spacing={3}
                    my={2}
                    mx={2}
                >
                    <Stack
                        direction="column"
                        spacing={2}
                        flexGrow={1}
                        overflow="auto"
                        maxHeight="100%"
                    >
                        {messages.map((message, index) => {
                            return (
                                <Box
                                    key={index}
                                    display="flex"
                                    justifyContent={getMessageAlignment(
                                        message.role
                                    )}
                                >
                                    <Box
                                        bgcolor={getBubbleBgColor(message.role)}
                                        color={getTextColor(message.role)}
                                        borderRadius={5}
                                        p={3}
                                    >
                                        <ReactMarkdown
                                            rehypePlugins={[rehypeRaw]}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </Box>
                                </Box>
                            );
                        })}
                        <div ref={messageEndRef} />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            label="Message"
                            fullWidth
                            multiline
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyUp={handleKeyPress}
                            sx={{
                                bgcolor: "grey.200",
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
                                            <IconButton
                                                onClick={handleSendMessage}
                                            >
                                                <Send />
                                            </IconButton>
                                            <Button
                                                color="error"
                                                variant="contained"
                                                size="small"
                                                onClick={handleClearChat}
                                            >
                                                Clear
                                            </Button>
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
