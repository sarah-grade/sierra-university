// Copyright Sierra

import { BaseSchema, Guardrails, Intents, extend } from "@sierra/content-schema";

const schema = extend(
    // required
    BaseSchema,

    // optional -- removing these will disable corresponding features in the agent
    Intents,
    Guardrails
    // NOTE: if the agent relies on escalations, use `TransfersWithEscalations`
    // This seems to be handled by the new Live Agent Transfer integration
    // Transfers
);

export default schema;
