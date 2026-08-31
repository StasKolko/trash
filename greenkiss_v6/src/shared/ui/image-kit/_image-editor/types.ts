import type {
  AllowedExtensions,
  AspectPreset,
  ImagePayload,
  Size,
  WeightLimits,
} from "../_lib/types";

export type ImageEditorProps = {
  images: ImagePayload[]; // если пусто — компонент можно не показывать
  requiredExt?: "png" | "webp" | "jpeg" | "jpg" | "avif"; // если указано — селект расширений недоступен, всё не соответствующее подсвечено
  allowedExtensions?: AllowedExtensions; // по умолчанию все разрешены
  requiredAspectId?: string; // если указан — селект формата скрыт, несоответствующие подсвечены
  aspectPresets?: AspectPreset[];
  requiredSize?: Size; // TS: разрешить только при наличии requiredAspectId. В рантайме валидируем соответствие аспекту
  weight?: WeightLimits; // по умолчанию {1 МБ, 256 байт}
  onSave: (images: ImagePayload[]) => void; // вызывается, когда нет ошибок, нажата "Сохранить"
};
