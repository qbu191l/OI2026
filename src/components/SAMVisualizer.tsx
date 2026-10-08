import React from 'react';
import { SimStep } from '../types';

interface SAMVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface SAMNode
{
	id: number;
	x: number;
	y: number;
	len: number;
	link: number;
	transitions: Map<string, number>;
}

const SAMVisualizer: React.FC<SAMVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const s = inputText.trim();
	if (s.length === 0) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);

	// Get SAM state from step
	const tot = vars.tot as number | undefined;
	const len = vars.len as number[] | undefined;
	const fa = vars.fa as number[] | undefined;

	if (!tot || !len || !fa) return null;

	// Build simple layout - arrange nodes in levels by length
	const levels: number[][] = [];
	for (let i = 1; i <= tot; ++i)
	{
		const l = len[i];
		while (levels.length <= l) levels.push([]);
		levels[l].push(i);
	}

	// Calculate positions
	const positions: Map<number, { x: number; y: number }> = new Map();
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
			positions.set(node, { x: startX + i * nodeSpacing, y });
		});
	});

	const svgHeight = Math.max(300, levels.length * levelHeight + 80);

	// We need to reconstruct transitions from the algorithm
	// For simplicity, we'll show parent links (fa array)
	const transitions: Map<number, { to: number; label: string }[]> = new Map();
	for (let i = 1; i <= tot; ++i)
	{
		transitions.set(i, []);
	}

	// Show suffix links
	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> 后缀自动机 (SAM)
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="sam-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="sam-arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
						</marker>
					</defs>

					{/* Suffix links (fa) */}
					{Array.from({ length: tot + 1 }, (_, i) => i).slice(2).map(i =>
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
								markerEnd={isHL ? 'url(#sam-arrow-hl)' : 'url(#sam-arrow)'}
								className="transition-all duration-300"
							/>
						);
					})}

					{/* Nodes */}
					{Array.from({ length: tot + 1 }, (_, i) => i).slice(1).map(i =>
					{
						const pos = positions.get(i);
						if (!pos) return null;

						const isHL = highlight.has(String(i));
						const fill = isHL ? '#f59e0b' : '#6366f1';
						const stroke = isHL ? '#d97706' : '#4f46e5';

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
									fill={fill} stroke={stroke} strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y - 3}
									textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff"
								>
									{i}
								</text>
								<text
									x={pos.x} y={pos.y + 10}
									textAnchor="middle" fontSize="9" fill="#d1d5db"
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

export default SAMVisualizer;
