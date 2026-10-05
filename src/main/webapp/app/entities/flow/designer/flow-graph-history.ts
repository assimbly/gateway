import { EditResult, FlowGraph } from './flow-graph';

/** The Flow graph being edited, with undo/redo for this session and whether it differs from what was last saved. */
export class FlowGraphHistory {
  private past: FlowGraph[] = [];
  private future: FlowGraph[] = [];
  private saved: FlowGraph;

  constructor(public current: FlowGraph) {
    this.saved = current;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  get hasUnsavedChanges(): boolean {
    return this.current !== this.saved;
  }

  /** Makes an accepted edit the current graph; a rejected edit changes nothing. */
  apply(result: EditResult): EditResult {
    if (result.outcome === 'accepted') {
      this.past.push(this.current);
      this.future = [];
      this.current = result.graph;
    }
    return result;
  }

  undo(): void {
    if (this.canUndo) {
      this.future.push(this.current);
      this.current = this.past.pop()!;
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.past.push(this.current);
      this.current = this.future.pop()!;
    }
  }

  markSaved(): void {
    this.saved = this.current;
  }
}
