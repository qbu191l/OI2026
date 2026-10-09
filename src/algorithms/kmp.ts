import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e6+10;
constexpr int maxl=2e7+10;
int n,m;
char s1[maxn],s2[maxn];
int pi[maxn];
void get_pi()
{
	int j=0;
	for(int i=2;i<=n;++i)
	{
		while(j&&s2[i]!=s2[j+1])
		{
			j=pi[j];
		}
		if(s2[i]==s2[j+1])
		{
			++j;
		}
		pi[i]=j;
	}
}
void kmp()
{
	get_pi();
	int j=0;
	for(int i=1;i<=m;++i)
	{
		while(j&&s1[i]!=s2[j+1])
		{
			j=pi[j];
		}
		if(s1[i]==s2[j+1])
		{
			++j;
		}
		if(j==n)
		{
			printf("%lld\\n",i-n+1);
		}
	}
}
signed main()
{
	scanf(" %s %s",s1+1,s2+1);
	m=strlen(s1+1),n=strlen(s2+1);
	kmp();
	for(int i=1;i<=n;++i)
	{
		printf("%lld ",pi[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `ABABABC
ABA`;

export const kmpAlgo: AlgoDef =
{
	id: 'kmp',
	name: 'KMP 字符串匹配',
	category: 'string',
	desc: 'KMP 算法通过预处理模式串的 pi 数组（前缀函数），实现 O(n+m) 的字符串匹配。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 2) return steps;

		const s1 = ' ' + lines[0]; // 主串，1-indexed
		const s2 = ' ' + lines[1]; // 模式串，1-indexed
		const m = s1.length - 1;
		const n = s2.length - 1;

		steps.push({
			desc: `主串 s1="${s1.slice(1)}" (m=${m})，模式串 s2="${s2.slice(1)}" (n=${n})`,
			line: 33,
			vars: { s1: s1.slice(1), s2: s2.slice(1), m, n },
		});

		// 计算 pi 数组
		const pi: number[] = new Array(n + 1).fill(0);
		let j = 0;

		steps.push({
			desc: `开始计算 pi 数组（前缀函数）`,
			line: 7,
			vars: { pi: [...pi], j, s2: s2.slice(1) },
		});

		for (let i = 2; i <= n; ++i)
		{
			while (j > 0 && s2[i] !== s2[j + 1])
			{
				steps.push({
					desc: `i=${i}, s2[${i}]='${s2[i]}' ≠ s2[${j + 1}]='${s2[j + 1]}', j=pi[${j}]=${pi[j]}`,
					line: 10,
					vars: { i, j, pi: [...pi] },
				});
				j = pi[j];
			}
			if (s2[i] === s2[j + 1])
			{
				++j;
				steps.push({
					desc: `i=${i}, s2[${i}]='${s2[i]}' = s2[${j}]='${s2[j]}', ++j=${j}`,
					line: 13,
					vars: { i, j, pi: [...pi] },
				});
			}
			pi[i] = j;
			steps.push({
				desc: `pi[${i}] = ${j}`,
				line: 15,
				vars: { i, j, pi: [...pi] },
			});
		}

		steps.push({
			desc: `pi 数组计算完成：[${pi.slice(1).join(', ')}]`,
			line: 18,
			vars: { pi: [...pi] },
		});

		// KMP 匹配
		j = 0;
		const matches: number[] = [];

		steps.push({
			desc: `开始 KMP 匹配`,
			line: 20,
			vars: { j, pi: [...pi] },
		});

		for (let i = 1; i <= m; ++i)
		{
			while (j > 0 && s1[i] !== s2[j + 1])
			{
				steps.push({
					desc: `i=${i}, s1[${i}]='${s1[i]}' ≠ s2[${j + 1}]='${s2[j + 1]}', j=pi[${j}]=${pi[j]}`,
					line: 23,
					vars: { i, j, s1: s1.slice(1), s2: s2.slice(1), pi: [...pi] },
				});
				j = pi[j];
			}
			if (s1[i] === s2[j + 1])
			{
				++j;
				steps.push({
					desc: `i=${i}, s1[${i}]='${s1[i]}' = s2[${j}]='${s2[j]}', ++j=${j}`,
					line: 26,
					vars: { i, j, s1: s1.slice(1), s2: s2.slice(1), pi: [...pi] },
				});
			}
			if (j === n)
			{
				const pos = i - n + 1;
				matches.push(pos);
				steps.push({
					desc: `找到匹配！位置 ${pos}`,
					line: 28,
					vars: { i, j, s1: s1.slice(1), s2: s2.slice(1), pos, pi: [...pi], matches: [...matches] },
				});
				j = pi[j];
			}
		}

		steps.push({
			desc: `匹配完成，共 ${matches.length} 个匹配：[${matches.join(', ')}]`,
			line: 35,
			vars: { matches: [...matches], pi: [...pi] },
		});

		return steps;
	}
};
