import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface SAMVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface SAMNode
{
	id: number;
	len: number;
	fa: number;
	trans: { char: string; to: number }[];
}

const SAMVisualizer: React.FC<SAMVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const nodes = vars.samNodes as SAMNode[] | undefined;

	if (!nodes || nodes.length === 0) return null;

	const positions = useMemo(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();

		// 按 len 分层
		const levels: number[][] = [];
		for (const node of nodes)
		{
			while (levels.length <= node.len) levels.push([]);
			levels[node.len].push(node.id);
		}

		const nodeRadius = 22;
		const levelHeight = 70;
		const nodeSpacing = 55;

		levels.forEach((level, idx) =>
		{
			const y = 40 + idx * levelHeight;
			const totalWidth = (level.length - 1) * nodeSpacing;
			const startX = 200 - totalWidth / 2;
			level.forEach((nodeId, i) =>
			{
				pos.set(nodeId, { x: startX + i * nodeSpacing, y });
			});
		});

		return pos;
	}, [nodes.map(n => `${n.id}:${n.len}`).join(',')]);

	const svgHeight = useMemo(() =>
	{
		const maxLen = Math.max(...nodes.map(n => n.len));
		return Math.max(300, (maxLen + 1) * 70 + 80);
	}, [nodes]);

	const nodeRadius = 22;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> 后缀自动机 (SAM)
				<span className="text-xs text-gray-500 ml-auto">节点数: {nodes.length}</span>
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="sam-link" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#6b7280" />
						</marker>
						<marker id="sam-link-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#f59e0b" />
						</marker>
						<marker id="sam-trans" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#8b5cf6" />
						</marker>
						<marker id="sam-trans-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#fbbf24" />
						</marker>
					</defs>

					{/* 转移边 (实线) */}
					{nodes.map(node =>
					{
						const fromPos = positions.get(node.id);
						if (!fromPos) return null;
						return node.trans.map((t, idx) =>
						{
							const toPos = positions.get(t.to);
							if (!toPos) return null;

							const isHL = highlight.has(String(node.id)) && highlight.has(String(t.to));

							// 计算边的偏移，避免和反向边重叠
							const dx = toPos.x - fromPos.x;
							const dy = toPos.y - fromPos.y;
							const len = Math.sqrt(dx * dx + dy * dy);
							if (len === 0) return null;
							const nx = -dy / len * 8;
							const ny = dx / len * 8;

							return (
								<g key={`trans-${node.id}-${idx}`}>
									<line
										x1={fromPos.x + nx} y1={fromPos.y + ny}
										x2={toPos.x + nx} y2={toPos.y + ny}
										stroke={isHL ? '#fbbf24' : '#8b5cf6'}
										strokeWidth={isHL ? 2.5 : 1.5}
										markerEnd={isHL ? 'url(#sam-trans-hl)' : 'url(#sam-trans)'}
									/>
									<text
										x={(fromPos.x + toPos.x) / 2 + nx * 1.5}
										y={(fromPos.y + toPos.y) / 2 + ny * 1.5}
										textAnchor="middle" fontSize="10" fontWeight="bold"
										fill={isHL ? '#fbbf24' : '#a78bfa'}
									>
										{t.char}
									</text>
								</g>
							);
						});
					})}

					{/* 后缀链接 (虚线) */}
					{nodes.map(node =>
					{
						if (node.fa === 0 || node.id === 1) return null;
						const fromPos = positions.get(node.id);
						const toPos = positions.get(node.fa);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(node.id)) && highlight.has(String(node.fa));

						return (
							<line
								key={`link-${node.id}`}
								x1={fromPos.x} y1={fromPos.y + nodeRadius}
								x2={toPos.x} y2={toPos.y - nodeRadius}
								stroke={isHL ? '#f59e0b' : '#6b7280'}
								strokeWidth={isHL ? 2 : 1}
								strokeDasharray="4,3"
								markerEnd={isHL ? 'url(#sam-link-hl)' : 'url(#sam-link)'}
							/>
						);
					})}

					{/* 节点 */}
					{nodes.map(node =>
					{
						const pos = positions.get(node.id);
						if (!pos) return null;

						const isHL = highlight.has(String(node.id));
						const isRoot = node.id === 1;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';

						return (
							<g key={`node-${node.id}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 5}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y - 4}
									textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff"
								>
									{node.id}
								</text>
								<text
									x={pos.x} y={pos.y + 9}
									textAnchor="middle" fontSize="8" fill="#d1d5db"
								>
									len:{node.len}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center flex flex-wrap justify-center gap-3">
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-purple-500 inline-block"></span> 转移边
				</span>
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-gray-500 inline-block" style={{ borderTop: '1px dashed' }}></span> 后缀链接
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 根节点
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 当前操作
				</span>
			</div>
		</div>
	);
};

export default SAMVisualizer;
