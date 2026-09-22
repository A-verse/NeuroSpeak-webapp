# NeuroSpeak chat backend setup

Run these in Supabase SQL Editor, in this order if you have not already run them:

1. `database.sql`
2. `role-persistence-security.sql`
3. `chat-backend.sql`

`chat-backend.sql` creates only communication-chat objects:
- `connection_requests`
- `chat_conversations`
- `chat_messages`
- secure RPCs for profile lookup, contacts, incoming requests, and conversation creation

It does not replace the existing caregiver/patient health relationship tables.
