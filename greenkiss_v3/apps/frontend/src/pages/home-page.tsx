import { Title } from "@solidjs/meta";
import { createResource } from "solid-js";

async function fetchMessage() {
  try {
    const res = await fetch("/api/message");
    const data = await res.json();
    return data.message;
  } catch {
    return import.meta.env?.VITE_MESSAGE ?? "💚";
  }
}

export default function HomePage() {
  const [message] = createResource(fetchMessage);

  return (
    <div class="text-center">
      <Title>Добро пожаловать</Title>
      <p class="text-lg text-gray-700">{message() ?? "Загрузка..."}</p>
    </div>
  );
}
