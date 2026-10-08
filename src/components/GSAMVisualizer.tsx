import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface GSAMVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

const GSAMVisualizer: React.FC<GSAMVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const n = Number(lines[0]);
	const strings = lines.slice(1, n + 1);

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);

	// Get GSAM state from step
	const tots = vars.tots as number | undefined;
	const len = vars.len as number[] | undefined;
	const fa = vars.fa as number[] | undefined;

	if (!tots || !len || !fa) return null;

	// Use useMemo to stabilize positions across renders
	const positions = useMemo(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();
		
		// Build simple layout - arrange nodes in levels by length
		const levels: number[][] = [];
		for (let i = 1; i <= tots; ++i)
		{
			const l = len[i];
			while (levels.length <= l) levels.push([]);
			levels[l].push(i);
		}

		const nodeRadius = 20;
		const levelHeight = 70;
		const nodeSpacing = 60;

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

		return pos;
	}, [tots, len]);

	const svgHeight = useMemo(() =>
	{
		const maxLen = Math.max(...len.slice(1, tots + 1));
		return Math.max(300, (maxLen + 1) * 70 + 80);
	}, [len, tots]);

	const nodeRadius = 20;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> 广义后缀自动机 (GSAM)
			</h3>
			<div className="mb-2 text-xs text-gray-400">
				输入字符串: {strings.map((s, i) => (
					<span key={i} className="text-cyan-400 font-mono">"{s}"{i < strings.length - 1 ? ', ' : ''}</span>
				))}
			</div>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="gsam-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="gsam-arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
						</marker>
					</defs>

					{/* Suffix links (fa) */}
					{Array.from({ length: tots + 1 }, (_, i) => i).slice(2).map(i =>
					{
						const fromPos = positions.get(i);
						const toPos = positions.get(fa[i]);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(i)) || highlight.has(String(fa[i]));

						return (
							<line
								key={`link-${i}`}
								x1={fromPos.x} y1={fromPos.y + nodeRadius}
								x2={toPos.x} y2={toPos.y - nodeRadius}
								stroke={isHL ? '#f59e0b' : '#6b7280'}
								strokeWidth={isHL ? 2 : 1.5}
								strokeDasharray="4,4"
								markerEnd={isHL ? 'url(#gsam-arrow-hl)' : 'url(#gsam-arrow)'}
							/>
						);
					})}

					{/* Nodes */}
					{Array.from({ length: tots + 1 }, (_, i) => i).slice(1).map(i =>
					{
						const pos = positions.get(i);
						if (!pos) return null;

						const isHL = highlight.has(String(i));
						const fill = isHL ? '#f59e0b' : '#8b5cf6';
						const stroke = isHL ? '#d97706' : '#7c3aed';

						return (
							<g key={`node-${i}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill}
									stroke={stroke}
									strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y - 3}
									textAnchor="middle"
									fontSize="11"
									fontWeight="bold"
									fill="#fff"
								>
									{i}
								</text>
								<text
									x={pos.x} y={pos.y + 10}
									textAnchor="middle"
									fontSize="9"
									fill="#d1d5db"
								>
									len:{len[i]}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				<span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>当前节点
				<span className="inline-block w-3 h-0.5 bg-gray-500 ml-3 mr-1" style={{ borderTop: '1px dashed' }}></span>后缀链接
			</div>
		</div>
	);
};

export default GSAMVisualizer;
