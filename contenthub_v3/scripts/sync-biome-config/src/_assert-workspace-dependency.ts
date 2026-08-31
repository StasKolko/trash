import { AppError } from "@packages/util-shared/error";

function assertWorkspaceDependency({
  content,
  workspaceName,
  dependencyValue,
}: {
  content: string;
  workspaceName: string;
  dependencyValue: string;
}) {
  const needle = `"${workspaceName}": "${dependencyValue}"`;

  if (!content.includes(needle)) {
    throw new WorkspaceDependencyNotFoundError({
      workspaceName,
      dependencyValue,
    });
  }
}

class WorkspaceDependencyNotFoundError extends AppError {
  public constructor(context: {
    workspaceName: string;
    dependencyValue: string;
  }) {
    super({
      kind: "workspace_dependency_not_found",
      message:
        "Workspace dependency not found: expected name with value in root package.json",
      context,
    });
  }
}

export { assertWorkspaceDependency, WorkspaceDependencyNotFoundError };
