import { AlgoDef } from '../types';
import { dijkstraAlgo } from './dijkstra';
import { spfaAlgo } from './spfa';
import { treapAlgo } from './treap';
import { fhqTreapAlgo } from './fhq-treap';

export const allAlgorithms: AlgoDef[] =
[
	dijkstraAlgo,
	spfaAlgo,
	treapAlgo,
	fhqTreapAlgo,
];
