"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { Bot, Send, Trash2 } from "lucide-react";
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
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi, I'm the IntelliDrive support assistant. How can I help you today?",
        },
    ]);

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
            alert("An error occurred while saving user messages.");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleClearChat = async () => {
        await updateMessagesInFirebase([]);
        window.location.reload();
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <main className="flex-1 overflow-hidden">
                <Card className="h-full flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                        {messages.length === 1 && (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Bot className="h-12 w-12 text-muted-foreground" />
                                <h1 className="text-2xl font-bold text-muted-foreground">
                                    How can I help you today?
                                </h1>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <ChatMessage key={index} message={message} />
                        ))}
                    </ScrollArea>

                    <div className="p-4 border-t">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex gap-2"
                        >
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                                onKeyUp={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send message</span>
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={handleClearChat}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Clear chat</span>
                            </Button>
                        </form>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            AI can make mistakes. Consider checking important
                            information.
                        </p>
                    </div>
                </Card>
            </main>
        </div>
    );
}
