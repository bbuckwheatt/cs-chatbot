"use client";

import {
  MarkdownParser,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import { type Node } from "prosemirror-model";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

import { documentSchema } from "./config";
import { createSuggestionWidget, type UISuggestion } from "./suggestions";

// Use a markdown parser bound to documentSchema (which includes list nodes).
// The original approach used renderToString(<Response>) which relied on
// Streamdown — a streaming renderer that defers output via useState/useEffect.
// renderToString only captures the initial synchronous render, so it always
// returned empty HTML, producing a blank ProseMirror document.
// prosemirror-markdown's MarkdownParser is synchronous and schema-aware.
//
// Lazy-initialized to avoid a circular dependency TDZ crash in the Turbopack
// SSR bundle: config.ts imports buildContentFromDocument from this file, and
// this file imports documentSchema from config.ts. A module-level `new
// MarkdownParser(documentSchema, ...)` would access documentSchema before
// config.ts finishes evaluating. Deferring creation to first call is safe.
let _parser: MarkdownParser | null = null;
function getMarkdownParser(): MarkdownParser {
  if (!_parser) {
    _parser = new MarkdownParser(
      documentSchema,
      defaultMarkdownParser.tokenizer,
      defaultMarkdownParser.tokens
    );
  }
  return _parser;
}

export const buildDocumentFromContent = (content: string) => {
  return getMarkdownParser().parse(content);
};

export const buildContentFromDocument = (document: Node) => {
  return defaultMarkdownSerializer.serialize(document);
};

export const createDecorations = (
  suggestions: UISuggestion[],
  view: EditorView
) => {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: "suggestion-highlight",
        },
        {
          suggestionId: suggestion.id,
          type: "highlight",
        }
      )
    );

    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (currentView) => {
          const { dom } = createSuggestionWidget(suggestion, currentView);
          return dom;
        },
        {
          suggestionId: suggestion.id,
          type: "widget",
        }
      )
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
};
