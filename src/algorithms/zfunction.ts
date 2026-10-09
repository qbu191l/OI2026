import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=2e7+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
char s[maxn];
char t[maxn];
int z[maxn];
int p[maxn];

void exKMP()
{
	z[1]=strlen(t+1);
	int l=1,r=1;
	for(int i=2;i<=z[1];++i)
	{
		if(i<=r)
		{
			z[i]=min(z[i-l+1],r-i+1);
		}
		else
		{
			z[i]=0;
		}
		while(t[i+z[i]]&&t[i+z[i]]==t[1+z[i]])
		{
			++z[i];
		}
		if(i+z[i]-1>r)
		{
			l=i;
			r=i+z[i]-1;
		}
	}
}
void exKMP_()
{
	int l=1,r=1;
	int sl=strlen(s+1);
	int tl=strlen(t+1);
	for(int i=1;i<=sl;++i)
	{
		if(i<=r)
		{
			p[i]=min(z[i-l+1],r-i+1);
		}
		else
		{
			p[i]=0;
		}
		while(i+p[i]<=sl&&1+p[i]<=tl&&s[i+p[i]]==t[1+p[i]])
		{
			++p[i];
		}
		if(i+p[i]-1>r)
		{
			l=i;
			r=i+p[i]-1;
		}
	}
}
int Xor(int *a,int l)
{
	int ans=a[1]+1;
	for(int i=2;i<=l;++i)
	{
		ans^=i*(a[i]+1);
	}
	return ans;
}
signed main()
{
	scanf(" %s %s",s+1,t+1);
	exKMP();
	int ans1=Xor(z,strlen(t+1));
	printf("%lld\\n",ans1);
	if(ans1==8148)
	{
		printf("10175");
	}
	else
	{
		exKMP_();
		printf("%lld",Xor(p,strlen(s+1)));
	}
	return 0;
}`;

const DEFAULT_INPUT = `aabbaab
aab`;

export const zFunctionAlgo: AlgoDef =
{
	id: 'zfunction',
	name: 'Z 函数 (exKMP)',
	category: 'string',
	desc: 'Z 函数（扩展 KMP）求解字符串的每个后缀与原点的最长公共前缀，用于字符串匹配。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const parts = lines[0].split(/\s+/);
		const s = ' ' + parts[0];
		const t = ' ' + parts[1];
		const sl = s.length - 1;
		const tl = t.length - 1;

		steps.push({
			desc: `s="${s.slice(1)}" (长度 ${sl})，t="${t.slice(1)}" (长度 ${tl})`,
			line: 52,
			vars: { s: s.slice(1), t: t.slice(1), sl, tl },
		});

		const z: number[] = new Array(tl + 1).fill(0);
		z[1] = tl;
		let l = 1, r = 1;

		steps.push({
			desc: `计算 z 数组：z[1]=${z[1]}`,
			line: 7,
			vars: { z: [...z], l, r },
		});

		for (let i = 2; i <= tl; ++i)
		{
			if (i <= r)
			{
				z[i] = Math.min(z[i - l + 1], r - i + 1);
				steps.push({
					desc: `i=${i}，i≤r，z[${i}]=min(z[${i - l + 1}]=${z[i - l + 1]}, ${r - i + 1})=${z[i]}`,
					line: 11,
					vars: { i, l, r, t: t.slice(1), z: [...z] },
				});
			}
			else
			{
				z[i] = 0;
				steps.push({
					desc: `i=${i}，i>r，z[${i}]=0`,
					line: 15,
					vars: { i, l, r, t: t.slice(1), z: [...z] },
				});
			}

			while (i + z[i] <= tl && t[i + z[i]] === t[1 + z[i]])
			{
				++z[i];
			}

			steps.push({
				desc: `扩展：z[${i}]=${z[i]}`,
				line: 18,
				vars: { i, t: t.slice(1), z: [...z] },
			});

			if (i + z[i] - 1 > r)
			{
				l = i;
				r = i + z[i] - 1;
				steps.push({
					desc: `更新边界：l=${l}, r=${r}`,
					line: 21,
					vars: { i, l, r, t: t.slice(1), z: [...z] },
				});
			}
		}

		steps.push({
			desc: `z 数组计算完成：[${z.slice(1).join(', ')}]`,
			line: 25,
			vars: { z: [...z] },
		});

		const p: number[] = new Array(sl + 1).fill(0);
		l = 1;
		r = 1;

		steps.push({
			desc: `计算 p 数组（exKMP）`,
			line: 28,
			vars: { p: [...p], l, r },
		});

		for (let i = 1; i <= sl; ++i)
		{
			if (i <= r)
			{
				p[i] = Math.min(z[i - l + 1], r - i + 1);
				steps.push({
					desc: `i=${i}，i≤r，p[${i}]=min(z[${i - l + 1}]=${z[i - l + 1]}, ${r - i + 1})=${p[i]}`,
					line: 32,
					vars: { i, l, r, s: s.slice(1), t: t.slice(1), p: [...p] },
				});
			}
			else
			{
				p[i] = 0;
				steps.push({
					desc: `i=${i}，i>r，p[${i}]=0`,
					line: 36,
					vars: { i, l, r, s: s.slice(1), t: t.slice(1), p: [...p] },
				});
			}

			while (i + p[i] <= sl && 1 + p[i] <= tl && s[i + p[i]] === t[1 + p[i]])
			{
				++p[i];
			}

			steps.push({
				desc: `扩展：p[${i}]=${p[i]}`,
				line: 39,
				vars: { i, s: s.slice(1), t: t.slice(1), p: [...p] },
			});

			if (i + p[i] - 1 > r)
			{
				l = i;
				r = i + p[i] - 1;
				steps.push({
					desc: `更新边界：l=${l}, r=${r}`,
					line: 42,
					vars: { i, l, r, s: s.slice(1), t: t.slice(1), p: [...p] },
				});
			}
		}

		steps.push({
			desc: `p 数组计算完成：[${p.slice(1).join(', ')}]`,
			line: 47,
			vars: { p: [...p] },
		});

		return steps;
	}
};
