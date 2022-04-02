// deno-lint-ignore-file no-explicit-any
export default function contains(root: any | null | undefined, n?: any) {
  if (!root) {
    return false;
  }

  return root.contains(n);
}
