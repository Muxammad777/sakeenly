-- Roll back the Conversation/Message tables introduced for the
-- ask agent. No production data should be in these — the feature
-- was reverted before rollout.
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Conversation";
DROP TYPE  IF EXISTS "MessageRole";
