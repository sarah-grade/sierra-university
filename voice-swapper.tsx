// Copyright Sierra

import {
    info,
    jsx,
    useVoice,
    useEffect,
    useState,
    useDetectLanguage,
    addAgentTags,
    LanguageName,
    ResponsePhrasing,
    useConversationInfo,
} from "@sierra/agent";

const ENGLISH = { label: LanguageName.EnglishUS, id: "en-US" };
const SPANISH = { label: LanguageName.SpanishLatam, id: "es-MX" };
const FRENCH = { label: LanguageName.French, id: "fr-FR" };

export function DynamicLanguageSwitching() {
    const voice = useVoice();
    const conversationInfo = useConversationInfo();
    const detectedLanguage = useDetectLanguage([ENGLISH, SPANISH, FRENCH], true);
    const [activeLang, setActiveLang] = useState("en-US");

    useEffect(() => {
        setActiveLang(detectedLanguage.id);
    }, [detectedLanguage.id]);

    // Apply voice settings whenever detected voice changes. Note that, as written,
    // this will only work with the initial customer message.
    useEffect(() => {
        if (activeLang === "es-MX") {
            conversationInfo.updateLocale("es-MX");
            voice.updateVoiceSettings({
                persona: "isabel-rios",
                transcriptionOptions: { locale: "es-MX" },
            });

            addAgentTags(["voice-switched:spanish"]);
        } else if (activeLang === "en-US") {
            conversationInfo.updateLocale("en-US");
            voice.updateVoiceSettings({
                persona: "jade-hardy",
                transcriptionOptions: { locale: "en-US" },
            });
            info(`Switched to English`);
            addAgentTags(["voice-switched:english"]);
        } else if (activeLang === "fr-FR") {
            conversationInfo.updateLocale("fr-FR");
            voice.updateVoiceSettings({
                persona: "guillaume-lefevre",
                transcriptionOptions: { locale: "fr-FR" },
            });
            addAgentTags(["voice-switched:french"]);
        }
    }, [activeLang]);

    return (
        <ResponsePhrasing
            content={`The customer is speaking ${activeLang === "en-US" ? "English" : activeLang === "es-MX" ? "Spanish" : "French"}. So should you.`}
        />
    );
}

/*
If you want your customer to request (in English) that they want to speak a different language, you can use this.
This tends to get a little tricky, because you have to worry about race conditions where the customer is 
speaking English but requesting Spanish. We left it out for simplicity.

      return (
        <>
            <Condition
                when={when.some(
                    when.fact(activeLang === "en-US", "currently_speaking_english"),
                    when.fact(activeLang === "fr-FR", "currently_speaking_french")
                )}
            >
                <Condition when={when.observation(["The customer requests Spanish or español."])}>
                    {activeLang !== "es-MX" && <OnActivation fn={() => setActiveLang("es-MX")} />}
                </Condition>
            </Condition>
            <Condition
                when={when.some(
                    when.fact(activeLang === "es-MX", "currently_speaking_spanish"),
                    when.fact(activeLang === "fr-FR", "currently_speaking_french")
                )}
            >
                <Condition when={when.observation(["The customer requests English."])}>
                    {activeLang !== "en-US" && <OnActivation fn={() => setActiveLang("en-US")} />}
                </Condition>
            </Condition>
            <Condition
                when={when.some(
                    when.fact(activeLang === "en-US", "currently_speaking_english"),
                    when.fact(activeLang === "es-MX", "currently_speaking_spanish")
                )}
            >
                <Condition when={when.observation(["The customer requests French."])}>
                    {activeLang !== "fr-FR" && <OnActivation fn={() => setActiveLang("fr-FR")} />}
                </Condition>
            </Condition>
        </>
 */
