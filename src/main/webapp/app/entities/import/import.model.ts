/** The Flow an import created or replaced, and what to tell the user about it. */
export interface IFlowImportResult {
  flowId: number;
  name: string;
  /** `flow` (Visual), `route` or `script`; a Flow from an old export can have any other type, which opens as Visual. */
  type: string;
  replaced: boolean;
  warnings: string[];
}

/** What to do when the imported Flow has the name of an existing Flow. */
export type ImportConflict = 'replace' | 'rename';

export type EditorType = 'flow' | 'route' | 'script';

/** The editor that opens a Flow of this type: Script and Route Flows have their own, every other type is Visual. */
export function editorOf(flowType: string | null | undefined): EditorType {
  return flowType === 'script' || flowType === 'route' ? flowType : 'flow';
}
