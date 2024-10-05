# TODO

## Security Vulnerabilities
- file upload validation for type and size on the client side
- server side validation for type and size, sanitization
- how to configure react markdown to prevent XSS attacks
- make sure all dependencies are secure
- data must be properly deleted from firebase and pinecone when the user deletes their account, and whenever each file is deleted
- configure CORS



## Concerns
- user data stored in firebase
- user data stored in pinecone
- need rate limiting on API requests
- error messages shouldn't reveal too much information
- should be hosted on AWS instead of Vercel
Clerk - DEPRECATION WARNING: "clerkClient singleton" is deprecated and will be removed in the next major release.
Use `clerkClient()` as a function instead.


## Features to make app good
- ability to open app in another window/tab instead of just downloading
- Clerk organizations to support more than 5 people
- Pinecone index for an organization instead of a single user
- better chat UI


## International Concerns
- Firebase is available, but data is stored in the US
- Pinecone is available, but data is stored in the US
- OpenAI may be restriced in other countries
- ChatGPT language support is limited
- Clerk international phone numbers?
- Current text extraction only supports English


### Notes about the app
- can only extract text from .txt, .pdf, and .docx files
    -also images are supported? actually no
- answers are limited to 200 words
- a pinecone namespace is created for each user
    - would need one per organization if we ever add those
