import { Show } from "solid-js";
import { PageHeader } from "#admin/shared/ui/page-header";
import { useSecretVoicerCredentials } from "../model/hooks";
import { CreateSecretVoicerCredentialDialog } from "./create-dialog";
import { DeleteSecretVoicerCredentialDialog } from "./delete-dialog";
import { SecretVoicerCredentialsTable } from "./table";
import { SecretVoicerCredentialsToolbar } from "./toolbar";
import { UpdateSecretVoicerCredentialDialog } from "./update-dialog";
import { ViewSecretVoicerCredentialDialog } from "./view-dialog";

export function SecretVoicerCredentialsPage() {
  const {
    state,
    filteredCredentials,
    selectedCredential,
    fingerprintOptions,
    getFingerprintName,
    setSearchQuery,
    setStatusFilter,
    openDialog,
    closeDialog,
    createCredential,
    updateCredential,
    deleteCredential,
    toggleCredentialStatus,
  } = useSecretVoicerCredentials();

  return (
    <div class="space-y-6">
      <PageHeader
        title="Credentials"
        description="Управление учётными данными для Secret Voicer API"
      />

      <SecretVoicerCredentialsToolbar
        searchQuery={state().searchQuery}
        statusFilter={state().statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onCreateClick={() => openDialog("create")}
      />

      <SecretVoicerCredentialsTable
        credentials={filteredCredentials()}
        totalCount={state().credentials.length}
        isLoading={state().isLoading}
        error={state().error}
        getFingerprintName={getFingerprintName}
        onView={(id) => openDialog("view", id)}
        onUpdate={(id) => openDialog("update", id)}
        onDelete={(id) => openDialog("delete", id)}
        onToggleStatus={toggleCredentialStatus}
      />

      {/* Dialogs */}
      <CreateSecretVoicerCredentialDialog
        open={state().activeDialog === "create"}
        fingerprints={fingerprintOptions()}
        onClose={closeDialog}
        onSubmit={createCredential}
      />

      <Show when={selectedCredential()}>
        {(credential) => (
          <>
            <ViewSecretVoicerCredentialDialog
              open={state().activeDialog === "view"}
              credential={credential()}
              fingerprintName={getFingerprintName(credential().fingerprintId)}
              onClose={closeDialog}
              onUpdate={() => openDialog("update", credential().id)}
            />

            <UpdateSecretVoicerCredentialDialog
              open={state().activeDialog === "update"}
              credential={credential()}
              fingerprints={fingerprintOptions()}
              onClose={closeDialog}
              onSubmit={(data) => updateCredential(credential().id, data)}
            />

            <DeleteSecretVoicerCredentialDialog
              open={state().activeDialog === "delete"}
              credential={credential()}
              onClose={closeDialog}
              onConfirm={() => deleteCredential(credential().id)}
            />
          </>
        )}
      </Show>
    </div>
  );
}
