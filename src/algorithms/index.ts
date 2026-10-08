import { AlgoDef } from '../types';
import { dijkstraAlgo } from './dijkstra';
import { spfaAlgo } from './spfa';
import { bfsAlgo } from './bfs';
import { dfsAlgo } from './dfs';
import { unionFindAlgo } from './unionfind';
import { floydAlgo } from './floyd';
import { kruskalAlgo } from './kruskal';
import { topoSortAlgo } from './toposort';
import { bitAlgo } from './bit';
import { segTreeAlgo } from './segtree';
import { kmpAlgo } from './kmp';
import { manacherAlgo } from './manacher';
import { knapsack01Algo } from './knapsack01';
import { treapAlgo } from './treap';
import { fhqTreapAlgo } from './fhq-treap';

export const allAlgorithms: AlgoDef[] =
[
	// 数学
	// 图论
	dijkstraAlgo,
	spfaAlgo,
	bfsAlgo,
	dfsAlgo,
	unionFindAlgo,
	floydAlgo,
	kruskalAlgo,
	topoSortAlgo,
	// 树论
	bitAlgo,
	segTreeAlgo,
	treapAlgo,
	fhqTreapAlgo,
	// 字符串
	kmpAlgo,
	manacherAlgo,
	// 动态规划
	knapsack01Algo,
];
