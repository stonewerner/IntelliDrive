
## IntelliDrive
IntelliDrive allows students to upload all of their files, notes, study materials, and course content and access them anywhere. AI powered search allows students to quickly and easily search their knowledge base for answers.

# Live Demo

Check out our [Live Demo hosted on Vercel](https://drive.stonewerner.com)

# Tools
Next JS
Clerk
Pinecone
OpenAI API
Firebase
Tailwind
Shadcn ui


# Code

There's two main pages: dashboard (for uploading files) and chat (for asking AI questions about the uploads).

The dashboard has two main parts - a file drop area and a table that displays the file info (including a download link).


IntelliGent is an AI chat interface aided by RAG:
Extract the text from uploaded files
Create and store vector in Pinecone with some metadata.
Query the vector store for relevant info when a users asks the chat bot a question

The main logic is in:
utils (helpers for all things related to Pinecone and text extraction).
chat/page.tsx (the code for the actual chat bot page).
api: APIs for communicating with OpenAI (chat), communicating with Pinecone (pinecone), and text extraction (extract)

The rest is pretty much just config type stuff (files like firebase.ts, middleware.ts, etc)
