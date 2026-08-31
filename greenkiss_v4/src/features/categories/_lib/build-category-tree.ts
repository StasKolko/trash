import type { Category } from "@/shared/api/db/schemas/categories";

export type CategoryTreeNode = {
  category: Category;
  children: CategoryTreeNode[];
  depth: number;
};

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodeMap: Map<string, CategoryTreeNode> = new Map();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodeMap.set(category.id, {
      category,
      children: [],
      depth: 0,
    });
  }

  for (const node of nodeMap.values()) {
    const parentId = node.category.parentId;
    if (!parentId) {
      roots.push(node);
      continue;
    }

    const parentNode = nodeMap.get(parentId);
    if (!parentNode) {
      roots.push(node);
      continue;
    }

    parentNode.children.push(node);
  }

  const stack: CategoryTreeNode[] = [...roots];
  while (stack.length > 0) {
    const node = stack.pop() as CategoryTreeNode;
    for (const child of node.children) {
      child.depth = node.depth + 1;
      stack.push(child);
    }
  }

  return roots;
}

export function collectDescendantIds(root: CategoryTreeNode): Set<string> {
  const result = new Set<string>();
  const stack: CategoryTreeNode[] = [root];

  while (stack.length > 0) {
    const node = stack.pop() as CategoryTreeNode;
    for (const child of node.children) {
      result.add(child.category.id);
      stack.push(child);
    }
  }

  return result;
}
