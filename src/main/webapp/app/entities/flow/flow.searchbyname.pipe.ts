import { Pipe, PipeTransform } from '@angular/core';
import { IFlow } from 'app/shared/model/flow.model';
import { FlowRuntime, flowTypeLabel } from './flow-status';

const STATUS_RANK = { active: 0, paused: 1, inactive: 2, inactiveError: 3 };

/** The name, case-insensitive; also the tie-breaker of every other column. */
function compareNames(a: IFlow, b: IFlow): number {
    return (a.name ?? '').toLocaleLowerCase().localeCompare((b.name ?? '').toLocaleLowerCase());
}

/** A Flow that has not run shows `—` for its counts, so it sorts below one that ran with a count of `0`. */
function countOf(count: number | null | undefined): number {
    return count ?? -1;
}

/**
 * Compares two Flows on a column of the Flows list, ascending. Status, Completed and Failed are runtime state the
 * rows report; a Flow whose row has not reported yet counts as stopped and never run.
 */
function compareOn(predicate: string, a: IFlow, b: IFlow, runtime: Record<number, FlowRuntime>): number {
    const ra = runtime[a.id!];
    const rb = runtime[b.id!];
    switch (predicate) {
        case 'type':
            return flowTypeLabel(a.type).localeCompare(flowTypeLabel(b.type));
        case 'status':
            return STATUS_RANK[ra?.status ?? 'inactive'] - STATUS_RANK[rb?.status ?? 'inactive'];
        case 'completed':
            return countOf(ra?.completed) - countOf(rb?.completed);
        case 'failed':
            return countOf(ra?.failed) - countOf(rb?.failed);
        default:
            return compareNames(a, b);
    }
}

@Pipe({ name: 'FlowSearchByName' })
export class FlowSearchByNamePipe implements PipeTransform {
    transform(flows: IFlow[], searchText: string, ascending = true, predicate = 'name', runtime: Record<number, FlowRuntime> = {}) {
        if (!flows) {
            return [];
        }

        const direction = ascending ? 1 : -1;
        const result = [...flows].sort(
            (a, b) => direction * compareOn(predicate, a, b, runtime) || (predicate === 'name' ? 0 : compareNames(a, b))
        );

        if (searchText) {
            return result.filter(flow => (flow.name ?? '').toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
        }
        return result;
    }
}
