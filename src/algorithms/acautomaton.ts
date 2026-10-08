import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e6+10;
constexpr int maxl=1e6+10;
constexpr int maxk=28;
int n;
int idx;
char s[maxl];
int trie[maxl][maxk];
int nxt[maxl],cnt[maxl];
int cvt(char c)
{
	return c-'a';
}
void build()
{
	int p=0;
	for(int i=0;s[i];++i)
	{
		int k=cvt(s[i]);
		if(!trie[p][k])
		{
			trie[p][k]=++idx;
		}
		p=trie[p][k];
	}
	++cnt[p];
}
void build_AC()
{
	queue<int> q;
	for(int i=0;i<maxk;++i)
	{
		if(trie[0][i])
		{
			q.emplace(trie[0][i]);
		}
	}
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(int i=0;i<maxk;++i)
		{
			int &v=trie[u][i];
			if(v)
			{
				nxt[v]=trie[nxt[u]][i];
				q.emplace(v);
			}
			else
			{
				v=trie[nxt[u]][i];
			}
		}
	}
}
int query()
{
	int res=0;
	for(int i=0,ii=0;s[i];++i)
	{
		int k=cvt(s[i]);
		ii=trie[ii][k];
		for(int jj=ii;jj&&~cnt[jj];jj=nxt[jj])
		{
			res+=cnt[jj];
			cnt[jj]=-1;
		}
	}
	return res;
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		scanf(" %s",s);
		build();
	}
	scanf(" %s",s);
	build_AC();
	printf("%lld",query());
}`;

const DEFAULT_INPUT = `5
he
she
her
hers
sher
shersher`;

export const acAutomatonAlgo: AlgoDef =
{
	id: 'acautomaton',
	name: 'AC 自动机',
	category: 'string',
	desc: 'AC 自动机（Aho-Corasick）在 Trie 上构建失配指针，实现多模式串匹配。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const patterns: string[] = [];

		steps.push({
			desc: `n=${n} 个模式串`,
			line: 45,
			vars: { n },
		});

		const trie: number[][] = Array.from({ length: 1000 }, () => new Array(28).fill(0));
		const cnt: number[] = new Array(1000).fill(0);
		let idx = 0;

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const s = lines[i];
			patterns.push(s);
			let p = 0;
			for (let j = 0; j < s.length; ++j)
			{
				const k = s.charCodeAt(j) - 'a'.charCodeAt(0);
				if (!trie[p][k])
				{
					trie[p][k] = ++idx;
				}
				p = trie[p][k];
			}
			++cnt[p];
			steps.push({
				desc: `插入模式串 "${s}"`,
				line: 18,
				vars: { s, idx, cnt: [...cnt] },
			});
		}

		steps.push({
			desc: `Trie 构建完成，共 ${idx} 个节点`,
			line: 22,
			vars: { idx, cnt: [...cnt] },
		});

		const nxt: number[] = new Array(1000).fill(0);
		const queue: number[] = [];

		for (let i = 0; i < 28; ++i)
		{
			if (trie[0][i])
			{
				queue.push(trie[0][i]);
			}
		}

		steps.push({
			desc: `开始 BFS 构建失配指针`,
			line: 25,
			vars: { queue: [...queue] },
		});

		while (queue.length > 0)
		{
			const u = queue.shift()!;
			for (let i = 0; i < 28; ++i)
			{
				const v = trie[u][i];
				if (v)
				{
					nxt[v] = trie[nxt[u]][i];
					queue.push(v);
				}
				else
				{
					trie[u][i] = trie[nxt[u]][i];
				}
			}
		}

		steps.push({
			desc: `AC 自动机构建完成`,
			line: 38,
			vars: { idx, nxt: [...nxt] },
		});

		if (lines.length > n + 1)
		{
			const text = lines[n + 1];
			steps.push({
				desc: `查询文本 "${text}"`,
				line: 47,
				vars: { text },
			});

			let res = 0;
			let ii = 0;
			for (let i = 0; i < text.length; ++i)
			{
				const k = text.charCodeAt(i) - 'a'.charCodeAt(0);
				ii = trie[ii][k];
				for (let jj = ii; jj && cnt[jj] !== -1; jj = nxt[jj])
				{
					res += cnt[jj];
					cnt[jj] = -1;
				}
			}

			steps.push({
				desc: `匹配完成，共 ${res} 个模式串在文本中出现`,
				line: 48,
				vars: { res, text },
			});
		}

		return steps;
	}
};
