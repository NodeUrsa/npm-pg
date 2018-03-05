export type Direction = 'asc' | 'desc';

export interface Sort<T extends Pick<T, K>, K = keyof T> {
    property: K;
    dir: Direction;
}
