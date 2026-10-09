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
	children: { char: string; to: number }[];
	fail: number;
	cnt: number;
	depth: number;
}

const ACVisualizer: React.FC<ACVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const nodes = vars.acNodes as ACNode[] | undefined;

	if (!nodes || nodes.length === 0) return null;

	const positions = useMemo(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();

		// 按深度分层
		const levels: number[][] = [];
		for (const node of nodes)
		{
			while (levels.length <= node.depth) levels.push([]);
			levels[node.depth].push(node.id);
		}

		const nodeRadius = 18;
		const levelHeight = 70;
		const nodeSpacing = 50;

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
	}, [nodes.map(n => `${n.id}:${n.depth}`).join(',')]);

	const svgHeight = useMemo(() =>
	{
		const maxDepth = Math.max(...nodes.map(n => n.depth));
		return Math.max(300, (maxDepth + 1) * 70 + 80);
	}, [nodes]);

	const nodeRadius = 18;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> AC 自动机 (Trie + Fail 指针)
				<span className="text-xs text-gray-500 ml-auto">节点数: {nodes.length}</span>
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="ac-child" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#6b7280" />
						</marker>
						<marker id="ac-child-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#f59e0b" />
						</marker>
						<marker id="ac-fail" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#ef4444" />
						</marker>
						<marker id="ac-fail-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#fbbf24" />
						</marker>
					</defs>

					{/* Trie 边 */}
					{nodes.map(node =>
					{
						const fromPos = positions.get(node.id);
						if (!fromPos) return null;
						return node.children.map((child, idx) =>
						{
							const toPos = positions.get(child.to);
							if (!toPos) return null;

							const isHL = highlight.has(String(node.id)) && highlight.has(String(child.to));

							return (
								<g key={`child-${node.id}-${idx}`}>
									<line
										x1={fromPos.x} y1={fromPos.y + nodeRadius}
										x2={toPos.x} y2={toPos.y - nodeRadius}
										stroke={isHL ? '#f59e0b' : '#6b7280'}
										strokeWidth={isHL ? 2.5 : 1.5}
										markerEnd={isHL ? 'url(#ac-child-hl)' : 'url(#ac-child)'}
									/>
									<text
										x={(fromPos.x + toPos.x) / 2 + 8}
										y={(fromPos.y + toPos.y) / 2}
										fontSize="11" fontWeight="bold"
										fill={isHL ? '#fbbf24' : '#9ca3af'}
									>
										{child.char}
									</text>
								</g>
							);
						});
					})}

					{/* Fail 指针 */}
					{nodes.map(node =>
					{
						if (node.fail === 0 || node.id === 0) return null;
						const fromPos = positions.get(node.id);
						const toPos = positions.get(node.fail);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(node.id)) && highlight.has(String(node.fail));

						// 弯曲的 fail 指针
						const midX = (fromPos.x + toPos.x) / 2;
						const midY = (fromPos.y + toPos.y) / 2 - 15;

						return (
							<g key={`fail-${node.id}`}>
								<path
									d={`M ${fromPos.x} ${fromPos.y - nodeRadius} Q ${midX} ${midY} ${toPos.x} ${toPos.y - nodeRadius}`}
									fill="none"
									stroke={isHL ? '#fbbf24' : '#ef4444'}
									strokeWidth={isHL ? 2 : 1}
									strokeDasharray="3,3"
									markerEnd={isHL ? 'url(#ac-fail-hl)' : 'url(#ac-fail)'}
								/>
							</g>
						);
					})}

					{/* 节点 */}
					{nodes.map(node =>
					{
						const pos = positions.get(node.id);
						if (!pos) return null;

						const isHL = highlight.has(String(node.id));
						const isRoot = node.id === 0;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';

						return (
							<g key={`node-${node.id}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y - 2}
									textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff"
								>
									{node.id}
								</text>
								{node.cnt > 0 && (
									<text
										x={pos.x} y={pos.y + 10}
										textAnchor="middle" fontSize="8" fill="#d1d5db"
									>
										cnt:{node.cnt}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center flex flex-wrap justify-center gap-3">
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-gray-500 inline-block"></span> Trie 边
				</span>
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-red-500 inline-block" style={{ borderTop: '1px dashed' }}></span> Fail 指针
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

export default ACVisualizer;
