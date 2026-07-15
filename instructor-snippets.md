These snippets are designed for your Sierra University instructor to help them run the demo portions
of Sierra University with fewer typos. You're free to peruse these examples, but you probably want
to look at the student-workbook.md for code snippets specific to your assignments.

## Demo #1: Updating a brand object

Add the following to your `createAgent` parameters:

```TypeScript
    brand: {
        agentName: "Misty the Moose",
        organizationName: "Sierra Outfitters",
        customerServiceTeamName: "Sierra Outfitters Customer Care",
        customerNoun: "member",
    },
```

Let's do something we can only do in code:

```TypeScript
    brand: ({ info, memory }) => ({
        agentName: info.locale === "fr-FR" ? "Emilie l'Élan" : "Misty the Moose",
        organizationName: "Sierra Outfitters",
        customerServiceTeamName: "Sierra Outfitters Rescue Rangers",
        customerNoun: "member",
    }),
```

## Demo #2: Creating a tool

This will create the tool "skeleton" that still needs to be filled out.

For organizational purposes, I recommend adding it to the tools/workshop.ts file.

```TypeScript
export const CountWordsTool = tools.registerTool({
    type: "lookup",
    name: "CountWords",
    description: "Count the number of words in the conversation so far",
    noCodeId: "count-words-tool",
    params: {},
    func: (ctx, params, controls) => {
        // TODO: Fill this out
        return {};
    },
});
```

And the implementation:

```TypeScript
        const words = ctx.conversation.map(message => message.content).join(" ").split(" ").length;
        return controls.result({
            data: words.toString(),
        });
        // In a case as simple as this, you could also do:
        // return { wordCount: words };
```

Don't forget that you still need to add the tool in Agent Studio to see it.

For fun, try adding an instruction to your result.

```TypeScript
            instructions: "Provide your answer to the user IN ALL CAPS.",
```

## Demo #3: Creating a tool that makes a network call

```TypeScript
export const SearchForItem = tools.registerTool({
    type: "lookup",
    name: "SearchForItem",
    description: "Search for an item in the Sierra Outfitters inventory. This will return a list of products that match the query and include pricing, inventory, review scores, and variants. Use this tool when customers ask if a product is in stock, or have pricing questions – this will have the most up-to-date information",
    noCodeId: "search-for-item-tool",
    params: {
        query: toolParam.string("A word to search for in the product name or description. Keep this general. For example, rather than searching for 'advanced downhill skis', just search for 'skis'."),
    },
    func: (ctx, params, controls) => {
        const response = fetch.jsonSync<any>(
            `https://gosierra.biz/api/v1/products?q=${encodeURIComponent(params.query)}&page=1&limit=5`,
            {
                method: "GET",
                headers: {
                    "X-API-Key": "sierra_u",
                },
            }
        );

        return controls.result({
            data: response.body,
        });
    },
});
```

Try searching for a sleeping bag, kayak, poles, etc.

As the next step, simplify that giant variant object -- it can be pretty big when you start
searching for clothes.

```TypeScript
        // Simplifying the variant information -- don't worry about the details.
        const summarizedResults = response.body!.data.map((result: { variants: any[] | undefined; }) => ({
            ...result,
            variants: undefined,
            variantSummary: summarizeVariants(result.variants),
        }));

        return controls.result({
            data: summarizedResults,
        });

```

You might also want to add this:

```TypeScript
            instructions: "You don't need to tell the user the exact number of items in stock -- just that they're available.",
```

## Demo #4: Saving to root storage

Let's authenticate a user!

Call our endpoint to send an OTP code

```TypeScript
export const SendOtpCode = tools.registerTool({
    type: "action",
    name: "SendOtpCode",
    description: "Send an OTP code to the customer",
    noCodeId: "send-otp-code",
    params: {
        phoneNumber: toolParam.string("The phone number to send the OTP code to"),
    },
    func: (ctx, params, controls) => {
        const response = fetch.jsonSync<any>(`https://gosierra.biz/api/v1/auth/otp/send`, {
            method: "POST",
            headers: {
                "X-API-Key": "sierra_u",
            },
            body: {
                phone: params.phoneNumber,
            },
        });
        const auth_session_id = response.body.data.auth_session_id;

        ctx.store.update(prev => ({
            ...prev,
            auth_session_id: auth_session_id,
        }));
        return controls.result({ data: { status: "initiated" } });
    },
});
```

Call an endpoint to verify an OTP code

```TypeScript
export const VerifyOtpCode = tools.registerTool({
    type: "action",
    name: "VerifyOtpCode",
    description: "Verify an OTP code sent to the customer",
    noCodeId: "verify-otp-code",
    params: {
        otpCode: toolParam.string(
            "The OTP code to verify, submitted by the customer. Should be 6 digits."
        ),
    },
    func: (ctx, params, controls) => {
        const auth_session_id = ctx.store.value["auth_session_id"];
        const response = fetch.jsonSync<any>(`https://gosierra.biz/api/v1/auth/otp/verify`, {
            method: "POST",
            headers: {
                "X-API-Key": "sierra_u",
            },
            body: {
                code: params.otpCode,
                auth_session_id: auth_session_id,
            },
        });
        // check if the response is successful
        if (response.status !== 200 || !response.body || !response.body.data.token) {
            return controls.error("Failed to verify OTP code");
        }

        const sessionToken = response.body.data.token;
        // Store the session token in the root store
        ctx.store.update(prev => ({
            ...prev,
            sessionToken: sessionToken,
            isAuthenticated: true,
        }));
        return controls.result({ data: { status: "verified" } });
    },
});
```

Create the journey in agent studio. It's shockingly simple.

**Condition**: The customer has indicated that they would like to sign in

**Goal**: Sign in the customer by sending and then verifying an OTP code

Add these two tools to the journey, then try using it.

Show how the auth_session_id is returned in the network call when you generate a code, but not sent
to the agent. Now then how it's automatically sent when you verify the code because we fetch it from
root storage.

(We don't actually need to authenticate the user, so just explain how this would be useful in a
real-life scenario, including how this journey might actually be a component instead of a journey)

## Demo 4.5: Actually...

Will this make things more confusing? Perhaps, but we care about security.

You actually might want to store that sessionToken with memory.setSecret instead. Replace that
ctx.store code with this!

```TypeScript
        ctx.store.update(prev => ({
            ...prev,
            isAuthenticated: true,
        }));

        // This is one time writing to memory is appropriate
        ctx.memory.setSecret("sessionToken", sessionToken);
```

And if you want, go ahead and add this tool:

```TypeScript

    export const GetAuthStatus = tools.registerTool({
        type: "action",
        name: "GetAuthStatus",
        description: "Get the authentication status of the customer",
        noCodeId: "get-auth-status",
        params: {},
        func: (ctx, params, controls) => {
            const isAuthenticated = ctx.store.value["isAuthenticated"] as boolean ?? false;
            const lastFourCharsOfSessionToken = (ctx.memory.secret("sessionToken") as string ?? "1234").slice(-4) ;
            return controls.result({ data: { status: isAuthenticated ? "authenticated" : "unauthenticated", sessionSnippet: lastFourCharsOfSessionToken } });
        },
    });
```

## Demo #5: Adding a new endpoint to an integration

First, review the Sierra Outfitters integration

- Look at the cancelOrder function as a simple example
- But it doesn’t have to be a 1:1 correlation with endpoints. The “Determine return eligibility”
  one, for instance, makes multiple calls to multiple endpoints!
- Similarly, our “getCategory” endpoint is pretty interesting, too – we fetch the list of categories
  then make an AskAI call to see which category is closest to the user’s request.

Let's show how to listAllCategories -- it's a simple API call.

```TypeScript
        listAllCategories: makeFunction({
            description: "List all product categories in a simple, human-readable format.",
            params: {},
            output: {
                type: "object",
                description: "List of categories",
                additionalProperties: "any",
            },
            func: (ctx, params) => {
                const response= fetch.jsonSync("https://gosierra.biz/api/v1/categories", {
                    method: "GET",
                    headers: { "X-API-Key": ctx.settings.apiKey },
                });
                return response.body!;
            },
        }),
```

Well, that works, but the object returns more data than we probably need, and there's no typing.
Let's fix both of these.

First, we'll add some typing to our fetch call.

```TypeScript
                const response= fetch.jsonSync<{
                    success: boolean;
                    data: {
                        id: string;
                        name: string;
                        description: string;
                        product_count: number;
                        slug: string;
                    }[];
                }>("https://gosierra.biz/api/v1/categories", {
                    method: "GET",
                    headers: { "X-API-Key": ctx.settings.apiKey },
                });
```

Next, let's simplify the data that gets returned (could be done at the tool level as well!)

```TypeScript

                const simplifiedCategories = response.body!.data.map(c => ({
                    id: c.id,
                    name: c.name,
                }));
                return simplifiedCategories!;
```

But we still get no tab completion in our code. Let's fix that

```TypeScript
            output: {
                type: "array",
                description: "List of categories",
                items: {
                    type: "object",
                    description: "A category",
                    properties: {
                        id: { type: "string", description: "Category ID" },
                        name: { type: "string", description: "Category name" },
                    },
                },
            },
```

Now we get some nice tab completion in Agent Studio

## Demo #6: Knowledge Scrapers

Show off the code for the recreation.gov scraper and the FAQ page

Of note: The first one shows you how you can build a knowledge base from an unconventional source
(namely, grabbing the results from multiple REST API calls).

Note the Sierra API expects a generator for fetchKnowledge, NOT a collection of promises or anything

What’s a generator? It’s a function that kinda executes lazily. It stops when we get to the yield
and doesn’t keep going until Sierra tells it to run again. Better in terms of memory and such for
large datasets, data crawlers, and pipelines

The second shows a custom scraper that grabs the Sierra Outfitters FAQ page and breaks it down into
30 smaller articles based on the content that it finds.

Add the Sierra Outfitters Knowledge Base to your Agent Studio. Source is Agent SDK code. Make sure
to point to the right agent and use the workspace’s current build with your workspace.

Add a top-level tool. This one you can probably use the default description. Ask about things like
who the mascot is, what coffee they serve in their stores, their organized ski trips, and job
opportunities. You might want to add these to your Knowledge Base context hints. "coffee, ski trips,
job opportunities, mascots"

If you want to demo the recreation.gov one, you'll need an API key. You will need to go to the
https://ridb.recreation.gov/docs website in order to generate one.

## Demo #7: Swapping voices on the fly

Start by adding jade hardy with multi language support

```TypeScript
    onVoiceCheck: vcd => {
        return {
            voiceInputSupported: true, // Enable voice.
            persona: "jade-hardy-multi",
            transcriptionOptions: { locale: "multi", provider: "default" },
            enableDynamicTranscriptionSettings: true,
        } satisfies VoiceCheckOutput;
    },
```

Try this first. Honestly, this might be good enough. But if you want to see what it's like to add
specialized voices:

Add `<DynamicLanguageSwitching />` to your AdditionalGoalAgentChildren. (You might need to import
it.)

That's it! Talk to your agent in French or Spanish and it will switch out personas. (Note this only
works with Sierra University at the moment -- other orgs might not support this yet.)

## Demo #8: Transfers and speed bumps

First, create our very own transfer tool.

```TypeScript
export const TransferTool = tools.registerTool({
    type: "action",
    name: "TransferTool",
    description: "Transfer the conversation to a human agent",
    noCodeId: "transfer-tool",
    params: {},
    func: (ctx, params, controls) => {
        ctx.output.send({
            type: "message",
            message: {
                role: "assistant",
                content: "Please wait while we connect you to a human agent.",
            }
        });
        return controls.result({ data: { status: "transferred" } });
    },
});
```

You should probably disable the InitiateTransferToAgent no-code tool.

Add it and give it a try!

Next, add some parameters to your tool.

```TypeScript
    params: {
        name: toolParam.string(
            "The customer's name. Full name if they offer it, but first name is fine. Do not guess. This should be supplied either by the customer or as the result of a tool call where we fetched customer information."
        ),
        reason: toolParam.choice(
            "The reason the user is reaching out to customer support",
            [
                "RETURN_POLICY",
                "ORDER_SEARCH",
                "TECHNICAL_ISSUE",
                "MISSING_ORDER",
                "LOGIN_ISSUE",
                "OTHER_QUESTION",
                "LOYALTY_PROGRAM",
                "DAMAGED_PRODUCT",
                "DID_NOT_SPECIFY",
            ]
        ),
    },
```

Note that if you ask to transfer now, you'll be asked both a reason for the transfer as well as your
name.

Second, replace the implementation block with this:

```TypeScript
  func: (ctx, params, controls) => {
    // Generate a conversation summary! Human agents appreciate this.
    const summary = summarizeConversation({
      brand: ctx.brand,
      messages: ctx.conversation,
      lengthInstructions: ["50 words at most"],
      additionalInstructions: [],
    });
    info(`Summary: ${summary}`);

    info(`This conversation has ${ctx.conversation.length} messages.`);
    if (ctx.conversation.length < 10 && params.reason === "DID_NOT_SPECIFY") {
      return controls.result({
        data: {
          transfer: "failed",
        },
        instructions:
          "The customer should at least tell you why they are reaching out to customer support.",
      });
    }

    ctx.output.send({
      type: "transfer",
      isSync: true,
      data: {},
      transferData: {
        phone: {
          action: "Transfer",
          phoneNumber: "+14155551212",
        },
        custom: {
          reason: params.reason ?? "",
          summary: summary,
          name: params.name ?? "",
        },
      },
    });
    return controls.result({
      data: {
        transfer: "success",
      },
    });
  },
```

Third, feeling brave? Add your phone number in the transfer section! Create a dev: target pointing
to your workspace. Add an inbound PSTN phone number pointing to that dev target, then have somebody
call your agent and request a transfer. If all has gone well, they should be connected to your
phone!

Note that you should turn off any Do Not Disturb settings you might have.

## Demo #9: Load up some user info!

First, add this code to your useWrapper code. This will load up customer information if we find
their ID in memory. (Probably should be more like a session ID, but this will work for now.)

```TypeScript
        const [rootStore, setRootStore] = useRootStore();
        const memory = useMemory();
        const apis = apiContext.apis();
        const voice = useVoice();
        useEffectOnce(() => {
            // Actually, should be more like a session token, but we'll use this for now.
            const customer = memory.variable("customerId") ?? "";
            if (customer !== "") {
                const response = apis.sierraOutfitters.getCustomerInfo({
                    customerId: customer,
                });
                const { addresses, ...customerInfo } = response;
                if (customerInfo) {
                    setRootStore(prev => ({
                        ...prev,
                        customer: customerInfo,
                    }));
                }
            }
        });
```

Then we can add this into our context. Add `<DynamicCustomerInfo>` into your
additionalGoalAgentChildren. (You'll probably need to import it.)

Make sure to let people see what's in this component you're adding.

You can test this by creating a new test customer. Assign it a memory variable. Try setting
`customerId` equal to `cust_123`.

Then say hello. Your agent will probably greet you by name! (Note that you should fully clear your
dev chat and restart it.)

Also, try signing in. It should already know your phone number.

## Demo 9.2: Load up some dynamic keywords!

Now that we have this information, we can add it to our list of keywords.

```typeScript

                const currentKeywords = voice.getCurrentKeywords();
                voice.updateVoiceSettings({
                    transcriptionOptions: {
                        keywords: [...currentKeywords, customerInfo.first_name, customerInfo.last_name]
                    }
                })
```

## Demo #9.5: Need to show a client event?

Silly example? If you want to show a client event handler, here's a simple one to respond to when a
user says "Stop". Good for everybody who grew up in the 90s

```TypeScript

            case "message":
                if (
                    event.message.role === "user" &&
                    event.message.content.toLowerCase() === "stop"
                ) {
                    if (Math.random() < 0.5) {
                        conversation.output.send({
                            type: "message",
                            message: {
                                role: "assistant",
                                content: "Hammertime!",
                            },
                        });
                    } else {
                        conversation.output.send({
                            type: "message",
                            message: {
                                role: "assistant",
                                content: "Collaborate and listen",
                            },
                        });
                    }
                } else {
                    next(props);
                }
                break;
```

What's probably most interesting is what happens when you forget to include next(props)

## Demo #10: Add an attachment

Let's create a function that returns tracking information, but let's put the tracking events inside
of an attachment, so we can maybe show it off in a little widget or something.

```TypeScript
export const GetTrackingInfoWithAttachment = tools.withContexts(apiContext).registerTool({
    type: "lookup",
    name: "GetTrackingInfoWithAttachment",
    description:
        "Get information about a shipment and return a widget to display the tracking information",
    noCodeId: "get-tracking-info-with-attachment",
    params: {
        shipmentId: toolParam.string("The ID of the shipment to get information about"),
    },
    func: (ctx, params, controls) => {
        const trackingInfo = ctx.apis.sierraOutfitters.getShipmentTracking({
            shipmentId: params.shipmentId,
        });
        const { events, ...trackingInfoWithoutEvents } = trackingInfo;
        return controls.result({
            data: { trackingInfo: trackingInfoWithoutEvents },
            attachments: {
                id: "tracking-events-group",
                description: "Tracking events for the shipment",
                data: [
                    {
                        type: "custom",
                        data: {
                            type: "tracking-events",
                            trackingInfo: trackingInfo.events,
                        },
                    },
                ],
            },
        });
    },
});
```

Because you will have to uncomment the line around importing apiContent, you might need to restart
`pnpm sierra watch` for this to import correctly.

Add this to your "Where is my stuff?" journey. Make sure to **disable** any other tools specifically
for detailed tracking you might have already running.

Run this! You should see the events appear in the View Raw Attachment line

Great, next, let's render this somehow.

Run `pnpm sierra init-web` to generate the web project.

Add the payload in web/main.tsx:

```TypeScript
type TrackingEventsPayload = {
    type: "tracking-events";
    trackingInfo: Array<{
        description: string;
        location: string;
        status: string;
        timestamp: string;
    }>;
};
```

And a really boring way to render this

```TypeScript
const TrackingEventsDeclaration = reactDeclaration<TrackingEventsPayload>({
    type: "tracking-events", // this should be a unique string
    name: "Tracking Events",
    description: "Tracking events for the shipment",
    renderPreview: data => {
        return (
            <div>
                {data?.trackingInfo.map(event => (
                    <div>{event.description}</div>
                ))}
            </div>
        );
    },
    render: (data, opts) => {
        return (
            <div>
                {data.trackingInfo.map(event => (
                    <div>==&gt; {event.description} &lt;==</div>
                ))}
            </div>
        );
    },
});
```

Make sure to fix the exports.

```TypeScript
const attachmentTypes = [
    CarouselDeclaration,
    ChatImageDeclaration,
    DateTimeSelectorDeclaration,
    TrackingEventsDeclaration,
];

export default defaultReactWebConfig(attachmentTypes);
```

That's fine, but boy is it boring! Let's make it fancy. Ask cursor to make this fun and interactive.
Here's a sample prompt.

```
Hi, cursor. See this render function here? This is used to share some tracking information to our user. The problem is, it's boring! I would like this to be exciting! Give it some visual flair! Make it fun and exciting to use! Add animations! Make it interactive! Let me view these events one at a time! Feel free to be creative as possible.
```

## Demo #11: Add a test or two!

Create a new file in your `tests` folder, and add the following:

```TypeScript
import { describe, type Scenario } from "@sierra/agent/test/api";

const customerOrders: Scenario[] = [
    {
        testId: "where-is-my-order",
        title: "Where is my order?",
        description: "Where is my order inquiry",
        fixture: {
            instructions: `You are calling to find out the status of your order, which you expected to arrive today.
                It is order number ord_m008 and your email is todd@sierra.ai, but don't offer this information unless the agent asks for it.
                 Once you have the order status, you don't need anything else.`,
        },
        expectedOutcomes: [
            `The agent tells the customer that their order is processing, but hasn't shipped yet.`,
        ],
        assertions: ["intent:order-status"],
        isCritical: false,
    },
    {
        testId: "make-a-sad-customer-happy",
        title: "Make a sad customer happy",
        description: "Where is my order inquiry",
        fixture: {
            instructions: `You are calling to find out the status of your order, which you expected to arrive today.
                It is order number ord_m008 and your email is todd@sierra.ai, but don't offer this information unless the agent asks for it.
                If you are told that your order has arrived late, say that you are quite unhappy about it.
                If the agent offers to send you a coupon, say yes.
                If you are given a coupon or discount, change your tune! Be upbeat and grateful!`,
        },
        expectedOutcomes: [
            `The agent tells the customer that their order is processing, but hasn't shipped yet.`,
            `The agent generates a coupon code to make up for the inconvenience.`,
        ],
        assertions: ["intent:order-status", "intent:unhappy-user"],
        isCritical: false,
    },
    {
        testId: "where-is-my-order-phone-call",
        title: "Where is my order phone call?",
        description: "Where is my order inquiry on phone",
        fixture: {
            userDevice: "voice_phone",
            instructions: `You are calling to find out the status of your order, which you expected to arrive today.
            It is order number ord_e003 and your email is todd@sierra.ai, but don't offer this information unless the agent asks for it.
            Once you have the order status, you don't need anything else.`,
        },
        expectedOutcomes: [`The agent tells the customer that their order was delivered.`],
        assertions: ["intent:order-status"],
        isCritical: false,
    },
];
describe("Order status checks", "customer-order", customerOrders);
```

You can test this with `pnpm sierra test --categories customer-order` from the command line

## Demo #12: Handle file uploads

First, let's create a function to grab the most recent image attachment that our user uploaded.

```TypeScript
function getMostRecentImageUrl(conversation: StandardMessage[]): string {
    // Find the most recent user message that contains any attachments
    const lastUserMessageWithAttachments = [...conversation]
        .reverse()
        .find(
            msg =>
                msg.role === "user" &&
                Array.isArray((msg as StandardMessage).attachments) &&
                (msg as StandardMessage).attachments!.length > 0
        ) as StandardMessage | undefined;

    const attachments = lastUserMessageWithAttachments?.attachments ?? [];

    const firstImageAttachment = attachments.find(
        att => att.type === "file" && att.data?.mimeType?.startsWith("image/")
    );
    info(`Found an image attachment: ${JSON.stringify(firstImageAttachment)}`);
    return firstImageAttachment ? (firstImageAttachment as FileAttachment).data.url : "";
}
```

Next, let's create a tool that helps the user identify what product they're looking for

```TypeScript
export const VisualProductIdentifier = tools.registerTool({
    name: "VisualProductIdentifier",
    type: "lookup",
    noCodeId: "visual-product-identifier",
    description:
        "When the customer uploads a photo of an item they might be interested in, use this tool to identify the product they are looking for",
    params: {},
    func: (ctx, params, controls) => {
        // Let's grab the most recent image that the customer uploaded
        const mostRecentImageUrl = getMostRecentImageUrl(ctx.conversation as StandardMessage[]);

        if (mostRecentImageUrl) {
            const imageResult = analyzeImageFuture(
                "Based on the image, describe the product they are looking for in a few words. If you see more than one item, just pick the item that is most prominently featured. It will probably be an item used in outdoorsy or sporting activities.",
                mostRecentImageUrl
            ).get();
            info(`Image analysis result! ${imageResult.analysis}`);
            return controls.result({
                data: {
                    productDescription: imageResult.analysis,
                },
            });
        }
        return controls.error("No image found in the customer's message.");
    },
});
```

Add it at the top level, and then tell the agent you need help identifying a product. Upload an
image of a tent or a sleeping bag or something. Then ask it to find it for you!

(I thought making this part of a larger journey, like a tool to call to identify a product as part
of a return, but that started to feel too complicated.)
