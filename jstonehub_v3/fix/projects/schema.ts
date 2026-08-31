import { Type } from "typebox";
import { Compile } from "typebox/compile";

const createProjectCharacterSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  voiceId: Type.String({ minLength: 1 }),
});

const createProjectItemSchema = Type.Object({
  characterName: Type.String({ minLength: 1 }),
  text: Type.String({ minLength: 1 }),
  orderIndex: Type.Number({ minimum: 0 }),
});

const createProjectSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  characters: Type.Array(createProjectCharacterSchema, { minItems: 1 }),
  items: Type.Array(createProjectItemSchema, { minItems: 1 }),
});

export const createProjectValidator = Compile(createProjectSchema);
