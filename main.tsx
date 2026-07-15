// Copyright Sierra

import { createAgent } from "@sierra/agent/base";
import {
    AbuseType,
    AgentSafetyVersion,
    CompatibilityDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetch,
    Goal,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info,
    jsx,
    Rule,
} from "@sierra/agent";
import { SierraUniversityAbuseDetection } from "./skills/abuse-detection";
import integrationsRegistry from "./integrations-registry";
import "./tools";

/**
 * Welcome to Sierra University. Below, you'll
 * find the createAgent function, which takes parameters that can
 * customize your agent.
 *
 * All configuration parameters that start with `use` are compatible with Sierra's SDK hooks.
 */
export default createAgent({
    agentSafetyVersion: AgentSafetyVersion.SET_IN_AGENT_STUDIO,
    compatibilityDate: CompatibilityDate.SET_IN_AGENT_STUDIO,
    // General configurations for the agent are available here.
    config: {
        voiceConfig: {
            enabledEvents: ["start", "inactivity"],
            inactivityTimeoutSeconds: 30,
        },
        textConfig: {
            enabledEvents: ["inactivity"],
            inactivityTimeoutSeconds: 100,
        },
        postConversationDelaySeconds: 60 * 15, // 15 minutes
    },
    // Client events are triggered by a sierra client
    // createAgent handles most of these for you.
    onClientEvent: (props, next) => {
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { event, conversation, contactCenter } = props;
        switch (event.type) {
            default:
                next(props);
        }
    },
    // Use `useWrapper` to add contexts needed by your agent and its tools. This enables
    // global state for your agent and its tools.
    useWrapper: agent => {
        return agent;
    }, // Goal agent children are JSX components that can be used to add additional children to the underlying GoalAgent component.
    useAdditionalGoalAgentChildren: () => {
        return (
            <>
                <Goal description="Determine why the customer is reaching out to customer support.">
                    <Rule content="If unclear, ask the customer why they are reaching out to customer support." />
                </Goal>
            </>
        );
    },
    // Abuse detection is a core feature of Sierra. It is used to detect and respond to abuse in a conversation. You can override the default behavior as outlined below.
    useCustomAbuseDetectionProps: () => {
        const allowedBehaviors = [
            "The customer is asking about sports or outdoor activities",
            "The customer has questions about the rules of sports",
            "The customer has a mathematics-related question",
        ];
        return {
            mode: "observe", // Don't do this in an actual app
            foundAbuseDefendAction: () => <SierraUniversityAbuseDetection />,
            abuseOverrides: {
                [AbuseType.OutOfBounds]: {
                    honeypots: allowedBehaviors,
                },
            },
        };
    },
    // You won't need this because we're importing tools from the tools folder
    // in a way that prevents them from being removed by the compiler.
    useTools: () => {
        return {};
    },
    // Use `integrationRegistry` to add integrations to your agent.
    // By default, the integrationsRegistry contains all builtin integrations
    // from the @sierra/integrations-builtin package.
    //
    // To add custom integrations:
    // 1. Run `pnpm sierra init-integration` to create a new integration
    // 2. Run `pnpm sierra watch` to upload your code to Agent Studio
    // 3. The imported `integrationRegistry` in this file will pick up the
    //    changes from the rebuilt `integrations-registry.ts` file.
    integrationsRegistry,
});
