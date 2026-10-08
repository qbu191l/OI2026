import { AlgoDef } from '../types';
import { treapAlgo } from './treap';
import { fhqTreapAlgo } from './fhq-treap';

export const allAlgorithms: AlgoDef[] =
[
	// 树论
	treapAlgo,
	fhqTreapAlgo,
];
