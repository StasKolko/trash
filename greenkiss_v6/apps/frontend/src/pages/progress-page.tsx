import { PROGRESS_ITEMS } from "@/shared/config/progress-config";
import { Title } from "@solidjs/meta";
import { createSignal, Index, Show } from "solid-js";

export default function ProgressPage() {
  const [expandedItems, setExpandedItems] = createSignal<Set<number>>(
    new Set(),
  );

  const toggleExpanded = (index: number) => {
    const current = new Set(expandedItems());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    setExpandedItems(current);
  };

  const isExpanded = (index: number) => expandedItems().has(index);

  return (
    <div>
      <Title>Прогресс разработки</Title>
      <h2 class="mb-4 text-2xl font-bold text-gray-800">Прогресс разработки</h2>
      <div class="custom-scrollbar max-h-96 overflow-y-auto">
        <div class="space-y-2 pr-2">
          <Index each={PROGRESS_ITEMS}>
            {(item, index) => (
              <div class="rounded-lg bg-gray-50 transition-all duration-200">
                {/* Родительская задача */}
                <div
                  class="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                  onClick={() => item().tasks && toggleExpanded(index)}
                >
                  {/* Иконка статуса */}
                  <div class="shrink-0">
                    <Show
                      when={item().completed}
                      fallback={
                        <svg
                          class="h-5 w-5 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    >
                      <svg
                        class="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </Show>
                  </div>

                  {/* Стрелка раскрытия */}
                  <Show when={item().tasks}>
                    <div class="shrink-0">
                      <svg
                        class={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          isExpanded(index) ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Show>

                  {/* Название задачи */}
                  <span
                    class={`flex-1 text-sm font-medium ${
                      item().completed ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {item().name}
                  </span>

                  {/* Прогресс подзадач */}
                  <Show when={item().tasks}>
                    <span class="text-xs font-medium text-gray-500">
                      {item().tasks?.filter((t) => t.completed).length}/
                      {item().tasks?.length}
                    </span>
                  </Show>
                </div>

                {/* Подзадачи */}
                <Show when={item().tasks && isExpanded(index)}>
                  <div class="rounded-b-lg border-t border-gray-200 bg-white">
                    <div class="space-y-1 py-2 pr-3 pl-8">
                      <Index each={item().tasks}>
                        {(subTask) => (
                          <div class="flex items-center gap-3 rounded px-3 py-1.5 transition-colors hover:bg-gray-50">
                            {/* Иконка статуса подзадачи */}
                            <div class="shrink-0">
                              <Show
                                when={subTask().completed}
                                fallback={
                                  <svg
                                    class="h-4 w-4 text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                }
                              >
                                <svg
                                  class="h-4 w-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </Show>
                            </div>

                            {/* Название подзадачи */}
                            <span
                              class={`text-xs ${
                                subTask().completed
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {subTask().name}
                            </span>
                          </div>
                        )}
                      </Index>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </Index>
        </div>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
        `}
      </style>
    </div>
  );
}
