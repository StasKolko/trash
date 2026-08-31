import { Title } from "@solidjs/meta";

export default function AboutPage() {
  return (
    <div class="space-y-4">
      <Title>О нас</Title>
      <h2 class="mb-4 text-2xl font-bold text-gray-800">О нас</h2>

      <div class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6">
        <h3 class="mb-3 text-lg font-semibold text-green-700">
          🚚 Бесплатная доставка по Ноябрьску
        </h3>
        <p class="leading-relaxed text-gray-700">
          Мы рады предложить вам уникальную услугу —{" "}
          <span class="font-semibold">бесплатная доставка с примеркой</span> по
          всему городу Ноябрьск!
        </p>
        <ul class="mt-3 space-y-2 text-gray-600">
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Примерка перед покупкой
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Доставка в удобное для вас время
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Оплата при получении
          </li>
        </ul>
      </div>

      <div class="pt-4 text-center">
        <p class="text-sm text-gray-600">
          GREEN KISS — ваш выбор качественной одежды и аксессуаров
        </p>
      </div>
    </div>
  );
}
