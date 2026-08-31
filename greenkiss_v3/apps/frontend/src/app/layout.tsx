import { ParentProps, createSignal, onMount } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { PROGRESS_ITEMS } from "@/shared/config/progress-config";

export function Layout(props: ParentProps) {
  const [progress, setProgress] = createSignal(0);
  const [displayProgress, setDisplayProgress] = createSignal(0);

  // Общее количество задач (фиксированное значение)
  const TOTAL_TASKS = 400;

  // Подсчет выполненных задач
  const completedTasks = PROGRESS_ITEMS.reduce((total, item) => {
    const completedInCategory = item.tasks.filter(
      (task) => task.completed,
    ).length;
    return total + completedInCategory;
  }, 0);

  // Расчет процента выполнения
  const targetProgress = Math.round((completedTasks / TOTAL_TASKS) * 100);

  const location = useLocation();

  onMount(() => {
    // Анимация прогресса при загрузке
    let current = 0;
    const interval = setInterval(() => {
      if (current <= targetProgress) {
        setDisplayProgress(current);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    // Анимация полосы прогресса
    setTimeout(() => {
      setProgress(targetProgress);
    }, 100);
  });

  return (
    <div class="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      <div class="flex flex-1 items-center justify-center p-4">
        <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
          {/* Заголовок */}
          <div class="mb-8 text-center">
            <h1 class="mb-2 text-4xl font-bold md:text-5xl">
              Интернет-магазин{" "}
              <span class="mt-2 block text-green-600">GREEN KISS</span>
            </h1>
          </div>

          {/* Информация об открытии */}
          <div class="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <div class="text-center">
              <p class="mb-2 text-gray-700">🎉 Открытие</p>
              <p class="text-2xl font-semibold text-gray-900">
                15.11.2025 в 22:00
              </p>
              <p class="mt-1 text-gray-600">по Ноябрьску</p>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div class="mb-8">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">
                Готовность сайта
              </span>
              <span class="text-sm font-bold text-green-600">
                {displayProgress()}%
              </span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress()}%` }}
              />
            </div>
            <div class="mt-2 text-center text-xs text-gray-500">
              Выполнено {completedTasks} из {TOTAL_TASKS} задач
            </div>
          </div>

          {/* Навигация */}
          <nav class="mb-6 flex justify-center gap-4">
            <A
              href="/"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/",
              }}
            >
              Главная
            </A>
            <A
              href="/progress"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/progress",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/progress",
              }}
            >
              Прогресс
            </A>
            <A
              href="/about"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/about",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/about",
              }}
            >
              О нас
            </A>
          </nav>

          {/* Контент страницы */}
          <div class="border-t pt-6">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
