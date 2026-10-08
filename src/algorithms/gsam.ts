import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
constexpr int maxt=1e6+10;
constexpr int maxs=maxt<<1;
constexpr int maxk=26;

int n;
char s[maxt];
long long ans;

typedef struct edge
{
	int to,nxt,c;
	edge()=default;
	edge(int x,int y,int z):to(x),nxt(y),c(z){}
}edge;
edge es[maxt];
int heads[maxt];
int enums;
void add_edge(int x,int y,int w)
{
	es[++enums]=edge(y,heads[x],w);
	heads[x]=enums;
}

int tots;
int chs[maxs][maxk];
int fa[maxs];
int len[maxs];
int samid[maxt];
int GSAM_extend(int p,int c)
{
	int np=++tots;
	len[np]=len[p]+1;
	for(;p&&!chs[p][c];p=fa[p])
	{
		chs[p][c]=np;
	}
	if(!p)
	{
		fa[np]=1;
	}
	else
	{
		int q=chs[p][c];
		if(len[q]==len[p]+1)
		{
			fa[np]=q;
		}
		else
		{
			int nq=++tots;
			len[nq]=len[p]+1;
			fa[nq]=fa[q];
			fa[q ]=nq;
			fa[np]=nq;
			for(;p&&chs[p][c]==q;p=fa[p])
			{
				chs[p][c]=nq;
			}
			for(int i=0;i<26;++i)
			{
				chs[nq][i]=chs[q][i];
			}
		}
	}
	return np;
}

void build_GSAM()
{
	tots=1;
	int* q=(int*)malloc(maxt*sizeof(int));
	int top=0;
	int tail=0;
	q[tail]=0;
	++tail;
	samid[0]=1;
	while(top<tail)
	{
		int u=q[top];
		++top;
		for(int i=heads[u];i;i=es[i].nxt)
		{
			int v=es[i].to;
			int c=es[i].c;
			samid[v]=GSAM_extend(samid[u],c);
			q[tail]=v;
			++tail;
		}
	}
}

signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		scanf(" %s",s+1);
		build_Trie(s);
	}
	build_GSAM();
	for(int i=2;i<=tots;++i)
	{
		ans+=len[i]-len[fa[i]];
	}
	printf("%lld",ans);
	return 0;
}`;

const DEFAULT_INPUT = `3
abc
ab
bc`;

export const gsamAlgo: AlgoDef =
{
	id: 'gsam',
	name: '广义后缀自动机 (GSAM)',
	category: 'string',
	desc: '广义后缀自动机可以处理多个字符串的子串问题。先建 Trie，再在 Trie 上构建 SAM。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const strings: string[] = [];

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			strings.push(lines[i]);
		}

		const trie: Map<number, number>[] = [new Map()];
		let trie_tot = 0;
		const tots = 1;
		const len: number[] = [0, 0];
		const fa: number[] = [0, 0];

		steps.push({
			desc: `n=${n} 个字符串：${strings.map(s => `"${s}"`).join(', ')}`,
			line: 68,
			vars: { n, strings, tots, len: [...len], fa: [...fa] },
		});

		for (const str of strings)
		{
			let p = 0;
			for (let j = 0; j < str.length; ++j)
			{
				const c = str.charCodeAt(j) - 'a'.charCodeAt(0);
				if (!trie[p].has(c))
				{
					++trie_tot;
					trie.push(new Map());
					trie[p].set(c, trie_tot);
				}
				p = trie[p].get(c)!;
			}
		}

		steps.push({
			desc: `Trie 构建完成，共 ${trie_tot} 个节点`,
			line: 75,
			vars: { trie_tot, strings, tots, len: [...len], fa: [...fa] },
		});

		const chs: number[][] = Array.from({ length: 2 * trie_tot + 2 }, () => new Array(26).fill(0));
		let gsam_tot = 1;

		function gsam_extend(p: number, c: number): number
		{
			const np = ++gsam_tot;
			len[np] = len[p] + 1;

			while (p && !chs[p][c])
			{
				chs[p][c] = np;
				p = fa[p];
			}

			if (!p)
			{
				fa[np] = 1;
			}
			else
			{
				const q = chs[p][c];
				if (len[q] === len[p] + 1)
				{
					fa[np] = q;
				}
				else
				{
					const nq = ++gsam_tot;
					len[nq] = len[p] + 1;
					fa[nq] = fa[q];
					fa[q] = nq;
					fa[np] = nq;
					for (let i = 0; i < 26; ++i)
					{
						chs[nq][i] = chs[q][i];
					}
					while (p && chs[p][c] === q)
					{
						chs[p][c] = nq;
						p = fa[p];
					}
				}
			}
			return np;
		}

		const samid: number[] = new Array(trie_tot + 1).fill(0);
		const queue: number[] = [];
		queue.push(0);
		samid[0] = 1;

		while (queue.length > 0)
		{
			const u = queue.shift()!;
			if (trie[u])
			{
				for (const [c, v] of trie[u].entries())
				{
					samid[v] = gsam_extend(samid[u], c);
					queue.push(v);
				}
			}
		}

		steps.push({
			desc: `GSAM 构建完成，共 ${gsam_tot} 个节点`,
			line: 80,
			vars: { gsam_tot, len: len.slice(0, gsam_tot + 1), fa: fa.slice(0, gsam_tot + 1) },
		});

		let ans = 0;
		for (let i = 2; i <= gsam_tot; ++i)
		{
			ans += len[i] - len[fa[i]];
		}

		steps.push({
			desc: `不同子串数 = ${ans}`,
			line: 85,
			vars: { ans, tots: gsam_tot, len: len.slice(0, gsam_tot + 1), fa: fa.slice(0, gsam_tot + 1) },
		});

		return steps;
	}
};
