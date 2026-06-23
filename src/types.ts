export type ItemType = "note" | "image" | "chat";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  type: ItemType;
  content: string; // The generated text, chat message string or image base64 URL
  promptUsed?: string;
  createdAt: string;
  updatedAt: string;
  aspectRatio?: string; // For images
  chatHistory?: ChatMessage[]; // For chat item type
  tags?: string[];
}

export interface RefineOptions {
  template: "professional" | "academic" | "casual" | "summarize" | "expand";
  prompt: string;
}

export interface ImageOptions {
  prompt: string;
  aspectRatio: "1:1" | "4:3" | "16:9" | "9:16";
}
