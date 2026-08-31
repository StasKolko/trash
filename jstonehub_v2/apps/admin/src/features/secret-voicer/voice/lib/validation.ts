import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import {
  array,
  boolean,
  maxValue,
  minValue,
  nullable,
  number,
  object,
  partial,
  picklist,
  pipe,
  string,
} from "valibot";

const VOICE_RATING_MIN = 1;
const VOICE_RATING_MAX = 10;

export const updateSecretVoicerVoiceSchema = partial(
  object({
    emotionSupport: picklist(
      secretVoicerContract.voiceEmotionSupport.values() as unknown as [
        string,
        ...string[],
      ],
    ),
    testedLanguages: array(string()),
    rating: pipe(
      number(),
      minValue(VOICE_RATING_MIN),
      maxValue(VOICE_RATING_MAX),
    ),
    notes: nullable(string()),
    isHidden: boolean(),
  }),
);
