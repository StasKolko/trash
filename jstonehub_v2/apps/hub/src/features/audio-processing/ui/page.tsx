import { Container } from "@packages/ui/container";
import { Tabs } from "@packages/ui/tabs";
import { Typography } from "@packages/ui/typography";
import { Show } from "solid-js";
import { useAudioProcessing } from "../model/hooks";
import { CacheList } from "./cache-list";
import { FilePicker } from "./file-picker";
import { ProcessingStatus } from "./processing-status";
import { SettingsPanel } from "./settings-panel";

export function AudioProcessingPage() {
  const {
    files,
    settings,
    currentJob,
    cachedFiles,
    isProcessing,
    isLoadingCache,
    error,
    addFiles,
    removeFile,
    clearFiles,
    setSettings,
    resetSettings,
    startProcessing,
    deleteCachedFile,
    clearCache,
  } = useAudioProcessing();

  return (
    <Container class="py-8 space-y-8">
      <div>
        <Typography type="title" level={1}>
          Обработка аудио
        </Typography>
        <Typography color="muted" class="mt-2">
          Удаление пауз, склейка файлов и настройка тишины
        </Typography>
      </div>

      <Tabs
        items={[
          {
            value: "process",
            label: "Обработать",
            content: (
              <div class="space-y-6 pt-4">
                <FilePicker
                  files={files()}
                  onAdd={addFiles}
                  onRemove={removeFile}
                  onClear={clearFiles}
                  disabled={isProcessing()}
                />

                <Show when={files().length > 0}>
                  <SettingsPanel
                    settings={settings()}
                    onChangeValue={setSettings}
                    onReset={resetSettings}
                    disabled={isProcessing()}
                  />
                </Show>

                <ProcessingStatus
                  job={currentJob()}
                  isProcessing={isProcessing()}
                  error={error()}
                  filesCount={files().length}
                  onStart={startProcessing}
                />
              </div>
            ),
          },
          {
            value: "cache",
            label: `Кэш (${cachedFiles().length})`,
            content: (
              <div class="pt-4">
                <CacheList
                  files={cachedFiles()}
                  isLoading={isLoadingCache()}
                  onDelete={deleteCachedFile}
                  onClearAll={clearCache}
                />
              </div>
            ),
          },
        ]}
      />
    </Container>
  );
}
