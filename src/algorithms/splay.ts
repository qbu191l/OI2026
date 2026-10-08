import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
#define int long long
using namespace std;
constexpr int maxn=1e5+10;
int n,m,l,r;
typedef struct SplayTree
{
	int rt,idx;
	int fa[maxn],ch[maxn][2],cnt[maxn],lz[maxn],siz[maxn],val[maxn];
	bool cid(int x)
	{
		return x==ch[fa[x]][1];
	}
	void pushup(int x)
	{
		siz[x]=siz[ch[x][0]]+siz[ch[x][1]]+cnt[x];
	}
	void rotate_(int x)
	{
		int y=fa[x],z=fa[y];
		int id=cid(x);
		ch[y][id]=ch[x][!id];
		ch[x][!id]=y;
		if(z) ch[z][cid(y)]=x;
		if(ch[y][id]) fa[ch[y][id]]=y;
		fa[y]=x,fa[x]=z;
		pushup(y),pushup(x);
	}
	void splay(int &z,int x)
	{
		int y=fa[x],f=fa[z];
		while(y!=f)
		{
			if(fa[y]!=f) rotate_(cid(x)==cid(y)?y:x);
			rotate_(x);
			y=fa[x];
		}
		z=x;
	}
	void lzrev(int x)
	{
		swap(ch[x][0],ch[x][1]);
		lz[x]^=1;
	}
	void pushdown(int x)
	{
		if(lz[x])
		{
			if(ch[x][0]) lzrev(ch[x][0]);
			if(ch[x][1]) lzrev(ch[x][1]);
			lz[x]=0;
		}
	}
	void find_kth(int &rt,int k)
	{
		if(k<0) k+=siz[rt]+1;
		int x=rt;
		while(1)
		{
			pushdown(x);
			if(siz[ch[x][0]]>=k) x=ch[x][0];
			else if(siz[ch[x][0]]+cnt[x]>=k) break;
			else k-=siz[ch[x][0]]+cnt[x],x=ch[x][1];
		}
		splay(rt,x);
	}
	void rev(int l,int r)
	{
		find_kth(rt,l);
		find_kth(ch[rt][1],r+2-l);
		int x=ch[ch[rt][1]][0];
		lzrev(x);
		pushdown(x);
		splay(rt,x);
	}
}SplayTree;
SplayTree splay;
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=1;i<=m;++i)
	{
		scanf("%lld%lld",&l,&r);
		splay.rev(l,r);
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 3
1 3
1 5
2 4`;

export const splayAlgo: AlgoDef =
{
	id: 'splay',
	name: 'Splay 文艺平衡树',
	category: 'tree',
	desc: '文艺平衡树使用 Splay 实现区间翻转操作，通过旋转和懒标记维护序列。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		const n = firstLine[0];
		const m = firstLine[1];

		steps.push({
			desc: `n=${n}, m=${m}，初始序列 [1, 2, 3, ..., ${n}]`,
			line: 62,
			vars: { n, m, seq: Array.from({ length: n }, (_, i) => i + 1) },
		});

		const seq = Array.from({ length: n }, (_, i) => i + 1);

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const l = parts[0];
			const r = parts[1];

			steps.push({
				desc: `翻转区间 [${l}, ${r}]`,
				line: 66,
				vars: { l, r, seq: [...seq] },
			});

			const left = l - 1;
			const right = r - 1;
			for (let j = left; j < (left + right) / 2 + 0.5; ++j)
			{
				[seq[j], seq[left + right - j]] = [seq[left + right - j], seq[j]];
			}

			steps.push({
				desc: `翻转后：[${seq.join(', ')}]`,
				line: 67,
				vars: { l, r, seq: [...seq] },
			});
		}

		steps.push({
			desc: `最终序列：[${seq.join(', ')}]`,
			line: 69,
			vars: { seq: [...seq] },
		});

		return steps;
	}
};
