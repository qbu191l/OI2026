import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e5+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n;
int ls[maxn],rs[maxn];
int val[maxn],pri[maxn];
int siz[maxn];
int root,now;
void pushup(int p)
{
	siz[p]=siz[ls[p]]+siz[rs[p]]+1;
}
int extend(int v)
{
	++now;
	val[now]=v;
	pri[now]=rand();
	siz[now]=1;
	ls[now]=rs[now]=0;
	return now;
}
void zag(int &p)
{
	int tmp=ls[p];
	ls[p]=rs[tmp];
	rs[tmp]=p;
	pushup(p);
	pushup(tmp);
	p=tmp;
}
void zig(int &p)
{
	int tmp=rs[p];
	rs[p]=ls[tmp];
	ls[tmp]=p;
	pushup(p);
	pushup(tmp);
	p=tmp;
}
void _insert(int &p,int v)
{
	if(!p)
	{
		p=extend(v);
		return;
	}
	if(v<=val[p])
	{
		_insert(ls[p],v);
		if(pri[ls[p]]<pri[p]) zag(p);
	}
	else
	{
		_insert(rs[p],v);
		if(pri[rs[p]]<pri[p]) zig(p);
	}
	pushup(p);
}
void _remove(int &p,int v)
{
	if(!p) return;
	if(v==val[p])
	{
		if(!ls[p]&&!rs[p])
		{
			p=0;
			return;
		}
		if(!ls[p])
		{
			p=rs[p];
			return;
		}
		else if(!rs[p])
		{
			p=ls[p];
			return;
		}
		if(pri[ls[p]]<pri[rs[p]])
		{
			zag(p);
			_remove(rs[p],v);
		}
		else
		{
			zig(p);
			_remove(ls[p],v);
		}
	}
	else if(v<val[p]) _remove(ls[p],v);
	else _remove(rs[p],v);
	pushup(p);
}
int query_rank(int p,int v)
{
	if(!p) return 1;
	if(v<=val[p]) return query_rank(ls[p],v);
	else return siz[ls[p]]+1+query_rank(rs[p],v);
}
int query_kth(int p,int k)
{
	if(!p) return -INF;
	if(k<=siz[ls[p]]) return query_kth(ls[p],k);
	else if(k==siz[ls[p]]+1) return val[p];
	else return query_kth(rs[p],k-siz[ls[p]]-1);
}
int query_pre(int p,int v)
{
	if(!p) return -INF;
	if(val[p]>=v) return query_pre(ls[p],v);
	else return max(val[p],query_pre(rs[p],v));
}
int query_nxt(int p,int v)
{
	if(!p) return INF;
	if(val[p]<=v) return query_nxt(rs[p],v);
	else return min(val[p],query_nxt(ls[p],v));
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1,op,x;i<=n;++i)
	{
		scanf("%lld%lld",&op,&x);
		if(op==1) _insert(root,x);
		else if(op==2) _remove(root,x);
		else if(op==3) printf("%lld\\n",query_rank(root,x));
		else if(op==4) printf("%lld\\n",query_kth(root,x));
		else if(op==5) printf("%lld\\n",query_pre(root,x));
		else if(op==6) printf("%lld\\n",query_nxt(root,x));
	}
	return 0;
}`;

const DEFAULT_INPUT = `10
1 5
1 3
1 7
1 2
1 6
3 5
4 3
5 5
6 5
2 5`;

export const treapAlgo: AlgoDef =
{
	id: 'treap',
	name: '普通平衡树 (Treap)',
	category: 'tree',
	desc: 'Treap 是一种随机化平衡二叉搜索树，通过优先级维护堆性质，支持插入、删除、查排名、查第k大、查前驱后继。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		steps.push({
			desc: `n=${n} 个操作`,
			line: 100,
			vars: { n },
		});

		const ls: number[] = new Array(100005).fill(0);
		const rs: number[] = new Array(100005).fill(0);
		const val: number[] = new Array(100005).fill(0);
		const pri: number[] = new Array(100005).fill(0);
		const siz: number[] = new Array(100005).fill(0);
		let root = 0;
		let now = 0;

		function pushup(p: number)
		{
			siz[p] = siz[ls[p]] + siz[rs[p]] + 1;
		}

		function extend(v: number): number
		{
			++now;
			val[now] = v;
			pri[now] = Math.floor(Math.random() * 1000000);
			siz[now] = 1;
			ls[now] = rs[now] = 0;
			return now;
		}

		function zag(p: { value: number })
		{
			const tmp = ls[p.value];
			ls[p.value] = rs[tmp];
			rs[tmp] = p.value;
			pushup(p.value);
			pushup(tmp);
			p.value = tmp;
		}

		function zig(p: { value: number })
		{
			const tmp = rs[p.value];
			rs[p.value] = ls[tmp];
			ls[tmp] = p.value;
			pushup(p.value);
			pushup(tmp);
			p.value = tmp;
		}

		function getTreeData()
		{
			const nodes: { id: number; val: number; ls: number; rs: number; siz: number }[] = [];
			function dfs(p: number)
			{
				if (!p) return;
				nodes.push({ id: p, val: val[p], ls: ls[p], rs: rs[p], siz: siz[p] });
				dfs(ls[p]);
				dfs(rs[p]);
			}
			dfs(root);
			return { root, nodes, now };
		}

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const op = parts[0];
			const x = parts[1];

			if (op === 1)
			{
				const rootRef = { value: root };
				const searchPath: number[] = [];
				
				function _insert(p: { value: number }, v: number)
				{
					if (!p.value)
					{
						p.value = extend(v);
						searchPath.push(p.value);
						return;
					}
					
					searchPath.push(p.value);
					
					if (v <= val[p.value])
					{
						const lsRef = { value: ls[p.value] };
						_insert(lsRef, v);
						ls[p.value] = lsRef.value;
						if (pri[ls[p.value]] < pri[p.value])
						{
							zag(p);
						}
					}
					else
					{
						const rsRef = { value: rs[p.value] };
						_insert(rsRef, v);
						rs[p.value] = rsRef.value;
						if (pri[rs[p.value]] < pri[p.value])
						{
							zig(p);
						}
					}
					pushup(p.value);
				}
				_insert(rootRef, x);
				root = rootRef.value;

				steps.push({
					desc: `插入 ${x}，搜索路径：[${searchPath.map(id => val[id]).join(' → ')}]`,
					line: 46,
					vars: { op, x, tree: getTreeData() },
					highlight: searchPath.map(String),
				});
			}
			else if (op === 2)
			{
				steps.push({
					desc: `删除 ${x}`,
					line: 58,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 3)
			{
				steps.push({
					desc: `查询 ${x} 的排名`,
					line: 78,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 4)
			{
				steps.push({
					desc: `查询排名第 ${x} 的数`,
					line: 83,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 5)
			{
				steps.push({
					desc: `查询 ${x} 的前驱`,
					line: 88,
					vars: { op, x, tree: getTreeData() },
				});
			}
			else if (op === 6)
			{
				steps.push({
					desc: `查询 ${x} 的后继`,
					line: 93,
					vars: { op, x, tree: getTreeData() },
				});
			}
		}

		return steps;
	}
};
