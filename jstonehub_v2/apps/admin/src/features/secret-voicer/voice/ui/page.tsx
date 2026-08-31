import { Alert } from "@packages/ui/alert";
import { Button } from "@packages/ui/button";
import { Show } from "solid-js";
import { PageHeader } from "#admin/shared/ui/page-header";
import { useSecretVoicerVoices } from "../model/hooks";
import { SyncEventsPanel } from "./sync-events-panel";
import { SecretVoicerVoicesTable } from "./table";
import { SecretVoicerVoicesToolbar } from "./toolbar";
import { UpdateSecretVoicerVoiceDialog } from "./update-dialog";
import { ViewSecretVoicerVoiceDialog } from "./view-dialog";

export function SecretVoicerVoicesPage() {
  const {
    state,
    genderFilter,
    setGenderFilter,
    filteredVoices,
    selectedVoice,
    criticalEvents,
    nonCriticalEvents,
    isBlocked,
    setSearchQuery,
    setShowHidden,
    openDialog,
    closeDialog,
    updateVoice,
    deleteSyncEvent,
    deleteAllSyncEvents,
    unblock,
    triggerSync,
  } = useSecretVoicerVoices();

  return (
    <div class="space-y-6">
      <PageHeader
        title="Voices"
        description="Управление голосами Secret Voicer"
      >
        <Button
          variant="outline"
          onClick={triggerSync}
          disabled={state().isLoading}
        >
          {state().isLoading ? "Синхронизация..." : "Синхронизировать"}
        </Button>
      </PageHeader>

      {/* Error Alert */}
      <Show when={state().error}>
        {(error) => (
          <Alert
            variant="error"
            title="Ошибка загрузки"
            description={error()}
          />
        )}
      </Show>

      {/* Critical Alert */}
      <Show when={isBlocked()}>
        <Alert
          variant="error"
          title="Синтез заблокирован!"
          description={
            state().syncState?.blockReason ?? "Обнаружены критические изменения"
          }
          onClose={unblock}
        />
      </Show>

      {/* Sync Events */}
      <SyncEventsPanel
        criticalEvents={criticalEvents()}
        nonCriticalEvents={nonCriticalEvents()}
        onDeleteEvent={deleteSyncEvent}
        onDeleteAll={deleteAllSyncEvents}
      />

      {/* Toolbar */}
      <SecretVoicerVoicesToolbar
        searchQuery={state().searchQuery}
        showHidden={state().showHidden}
        genderFilter={genderFilter()}
        onSearchChange={setSearchQuery}
        onShowHiddenChange={setShowHidden}
        onGenderFilterChange={setGenderFilter}
      />

      {/* Table */}
      <SecretVoicerVoicesTable
        voices={filteredVoices()}
        totalCount={state().voices.length}
        isLoading={state().isLoading}
        error={state().error}
        onView={(id) => openDialog("view", id)}
        onUpdate={(id) => openDialog("update", id)}
      />

      {/* Dialogs */}
      <Show when={selectedVoice()}>
        {(voice) => (
          <>
            <ViewSecretVoicerVoiceDialog
              open={state().activeDialog === "view"}
              voice={voice()}
              onClose={closeDialog}
              onUpdate={() => openDialog("update", voice().id)}
            />

            <UpdateSecretVoicerVoiceDialog
              open={state().activeDialog === "update"}
              voice={voice()}
              onClose={closeDialog}
              onSubmit={(data) => updateVoice(voice().id, data)}
            />
          </>
        )}
      </Show>
    </div>
  );
}
