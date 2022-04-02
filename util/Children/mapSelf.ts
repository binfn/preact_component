// deno-lint-ignore-file no-explicit-any
import * as React from "../../deps.ts";
import { Compat } from "../../deps.ts";

function mirror(o: any) {
  return o;
}

export default function mapSelf(children: React.ComponentChildren) {
  // return ReactFragment
  return Compat.Children.map(children, mirror);
}
