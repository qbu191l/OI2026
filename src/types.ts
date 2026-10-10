export interface SimStep
{
	desc: string;
	line: number;
	vars: Record<string, any>;
	highlight?: string[];
}

export interface AlgoDef
{
	id: string;
	name: string;
	category: 'math' | 'graph' | 'tree' | 'string' | 'dp';
	desc: string;
	code: string;
	defaultInput: string;
	run: (input: string) => SimStep[];
}
