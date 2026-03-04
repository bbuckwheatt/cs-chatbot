import { streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { textStream } = streamText({
      model: getArtifactModel(),
      system:
        "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
      prompt: title,
    });

    for await (const text of textStream) {
      draftContent += text;

      dataStream.write({
        type: "data-textDelta",
        data: text,
        transient: true,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { textStream } = streamText({
      model: getArtifactModel(),
      system: updateDocumentPrompt(document.content, "text"),
      prompt: description,
    });

    for await (const text of textStream) {
      draftContent += text;

      dataStream.write({
        type: "data-textDelta",
        data: text,
        transient: true,
      });
    }

    return draftContent;
  },
});
