import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface ACVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface ACNode
{
	id: number;
	x: number;
	y: number;
	char?: string;
}

const ACVisualizer: React.FC<ACVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const n = Number(lines[0]);
	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const idx = vars.idx as number | undefined;
	const s = vars.s as string | undefined;

	// Build Trie structure from patterns
	const patterns: string[] = [];
	for (let i = 1; i <= n && i < lines.length; ++i)
	{
		patterns.push(lines[i]);
	}

	// Use useMemo to stabilize Trie structure
	const { trie, positions, svgHeight, nodeChar } = useMemo(() =>
	{
		// Simple Trie layout
		const trieMap: Map<number, Map<string, number>> = new Map();
		trieMap.set(0, new Map());
		let nodeId = 0;

		for (const pattern of patterns)
		{
			let current = 0;
			for (const char of pattern)
			{
				if (!trieMap.has(current)) trieMap.set(current, new Map());
				const currentMap = trieMap.get(current)!;
				if (!currentMap.has(char))
				{
					nodeId++;
					currentMap.set(char, nodeId);
					trieMap.set(nodeId, new Map());
				}
				current = currentMap.get(char)!;
			}
		}

		// Layout nodes by depth
		const depth: Map<number, number> = new Map();
		const queue: number[] = [0];
		depth.set(0, 0);

		while (queue.length > 0)
		{
			const u = queue.shift()!;
			const d = depth.get(u)!;
			const children = trieMap.get(u);
			if (children)
			{
				for (const [_, v] of children)
				{
					depth.set(v, d + 1);
					queue.push(v);
				}
			}
		}

		// Group by depth
		const levels: number[][] = [];
		for (const [node, d] of depth)
		{
			while (levels.length <= d) levels.push([]);
			levels[d].push(node);
		}

		// Calculate positions
		const pos: Map<number, { x: number; y: number }> = new Map();
		const nodeRadius = 18;
		const levelHeight = 70;
		const nodeSpacing = 50;

		levels.forEach((level, idx) =>
		{
			const y = 40 + idx * levelHeight;
			const totalWidth = (level.length - 1) * nodeSpacing;
			const startX = 200 - totalWidth / 2;
			level.forEach((node, i) =>
			{
				pos.set(node, { x: startX + i * nodeSpacing, y });
			});
		});

		const height = Math.max(300, levels.length * levelHeight + 80);

		// Find character for each node
		const charMap: Map<number, string> = new Map();
		for (const [u, children] of trieMap)
		{
			for (const [char, v] of children)
			{
				charMap.set(v, char);
			}
		}

		return { trie: trieMap, positions: pos, svgHeight: height, nodeChar: charMap };
	}, [patterns.join(',')]);

	const nodeRadius = 18;

	return (		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> AC 自动机 (Trie + Fail指针)
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="ac-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="ac-arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
						</marker>
					</defs>

					{/* Trie edges */}
					{Array.from(trie.entries()).map(([u, children]) =>
					{
						const uPos = positions.get(u);
						if (!uPos) return null;

						return Array.from(children.entries()).map(([char, v]) =>
						{
							const vPos = positions.get(v);
							if (!vPos) return null;

							const isHL = highlight.has(String(u)) && highlight.has(String(v));

							return (
								<g key={`edge-${u}-${v}`}>
									<line
										x1={uPos.x} y1={uPos.y + nodeRadius}
										x2={vPos.x} y2={vPos.y - nodeRadius}
										stroke={isHL ? '#f59e0b' : '#6b7280'}
										strokeWidth={isHL ? 2.5 : 1.5}
										markerEnd={isHL ? 'url(#ac-arrow-hl)' : 'url(#ac-arrow)'}
										className="transition-all duration-300"
									/>
									<text
										x={(uPos.x + vPos.x) / 2 + 10}
										y={(uPos.y + vPos.y) / 2}
										fontSize="12" fontWeight="bold"
										fill={isHL ? '#fbbf24' : '#9ca3af'}
									>
										{char}
									</text>
								</g>
							);
						});
					})}

				{/* Nodes */}
				{Array.from(positions.keys()).map(node =>
				{
					const pos = positions.get(node);
					if (!pos) return null;

					const isHL = highlight.has(String(node));
					const isRoot = node === 0;
					const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
					const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';
					const char = nodeChar.get(node);
						return (
							<g key={`node-${node}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y - 3}
									textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff"
								>
									{node}
								</text>
								{char && (
									<text
										x={pos.x} y={pos.y + 10}
										textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d1d5db"
									>
										{char}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				<span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>根节点
				<span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-3 mr-1"></span>当前节点
				<span className="inline-block w-3 h-0.5 bg-gray-500 ml-3 mr-1"></span>Trie边
			</div>
			{s && (
				<div className="mt-2 text-xs text-gray-400 text-center">
					匹配文本: <span className="text-cyan-400 font-mono">"{s}"</span>
				</div>
			)}
		</div>
	);
};

export default ACVisualizer;
