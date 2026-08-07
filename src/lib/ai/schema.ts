// Standard JSON Schema for the {matches:[{index,value}]} shape every
// provider must return. Used directly as Claude's tool input_schema and
// OpenAI's json_schema response format. Gemini's SDK uses its own
// Type-enum-based schema representation rather than plain JSON Schema, so
// gemini.ts defines an equivalent using that SDK's own types instead of
// reusing this object directly — kept in sync by hand, same field names.
export const MATCHES_JSON_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", description: "The field's index, exactly as given in the input." },
          value: { type: "string", description: "The value to fill into this field." },
        },
        required: ["index", "value"],
        additionalProperties: false,
      },
    },
  },
  required: ["matches"],
  additionalProperties: false,
} as const;
