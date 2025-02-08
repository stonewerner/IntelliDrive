import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface ChatMessageProps {
    message: {
        role: string;
        content: string;
    };
}

export function ChatMessage({ message }: ChatMessageProps) {
    return (
        <div
            className={cn(
                "flex w-full items-start gap-4 py-4",
                message.role === "user" && "justify-end"
            )}
        >
            {message.role !== "user" && (
                <Avatar>
                    <AvatarFallback>
                        <Bot className="h-4 w-4" />
                    </AvatarFallback>
                    <AvatarImage src="/bot-avatar.png" />
                </Avatar>
            )}
            <Card
                className={cn(
                    "max-w-[80%]",
                    message.role === "user" &&
                        "bg-primary text-primary-foreground"
                )}
            >
                <CardContent className="p-3">
                    <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        className="text-sm"
                    >
                        {message.content}
                    </ReactMarkdown>
                </CardContent>
            </Card>
            {message.role === "user" && (
                <Avatar>
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
