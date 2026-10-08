import React from 'react';
import { SimStep } from '../types';

interface StringVisualizerProps
{
	step: SimStep | null;
	inputText: string;
	algoId: string;
}

const StringVisualizer: React.FC<StringVisualizerProps> = ({ step, inputText, algoId }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const s = vars.s as string | undefined;
	const t = vars.t as string | undefined;
	const i = vars.i as number | undefined;
	const j = vars.j as number | undefined;
	const l = vars.l as number | undefined;
	const r = vars.r as number | undefined;

	const cellSize = 32;
	const gap = 2;

	const renderString = (str: string | undefined, label: string, pointers: { name: string; pos: number; color: string }[]) =>
	{
		if (!str) return null;

		return (
			<div className="mb-4">
				<div className="text-xs text-gray-400 mb-2">{label}:</div>
				<div className="relative" style={{ height: '80px' }}>
					{/* 字符串方块 */}
					<div className="flex" style={{ gap: `${gap}px` }}>
						{str.split('').map((c, idx) =>
						{
							const pos = idx + 1;
							const isInRange = l !== undefined && r !== undefined && pos >= l && pos <= r;
							return (
								<div
									key={idx}
									className={`flex flex-col items-center justify-center border-2 transition-all duration-300 ${
										isInRange
											? 'bg-emerald-500/30 border-emerald-600'
											: 'bg-gray-800 border-gray-600'
									}`}
									style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
								>
									<span className="text-sm font-mono font-bold text-gray-200">{c}</span>
								</div>
							);
						})}
					</div>

					{/* 下标 */}
					<div className="flex mt-1" style={{ gap: `${gap}px` }}>
						{str.split('').map((_, idx) => (
							<div
								key={idx}
								className="text-center text-[10px] text-gray-500 font-mono"
								style={{ width: `${cellSize}px` }}
							>
								{idx + 1}
							</div>
						))}
					</div>

					{/* 指针箭头 */}
					{pointers.map((ptr, idx) =>
					{
						if (ptr.pos === undefined || ptr.pos < 1 || ptr.pos > str.length) return null;
						const x = (ptr.pos - 1) * (cellSize + gap) + cellSize / 2;
						return (
							<div
								key={idx}
								className="absolute flex flex-col items-center"
								style={{
									left: `${x}px`,
									top: '-35px',
									transform: 'translateX(-50%)',
								}}
							>
								<span className={`text-xs font-bold ${ptr.color}`}>{ptr.name}</span>
								<svg width="12" height="20" className={ptr.color.replace('text-', 'fill-')}>
									<path d="M6 0 L6 15 M2 11 L6 15 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
								</svg>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// KMP 可视化
	if (algoId === 'kmp')
	{
		const s1 = vars.s1 as string | undefined;
		const s2 = vars.s2 as string | undefined;
		const pi = vars.pi as number[] | undefined;

		const pointers1 = i !== undefined ? [{ name: 'i', pos: i, color: 'text-amber-400' }] : [];
		const pointers2 = j !== undefined ? [{ name: 'j', pos: j, color: 'text-cyan-400' }] : [];

		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔍</span> KMP 字符串匹配
				</h3>

				{s1 && renderString(s1, '主串 s1', pointers1)}

				{s2 && renderString(s2, '模式串 s2', pointers2)}

				{pi && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">pi 数组 (前缀函数):</div>
						<div className="flex" style={{ gap: `${gap}px` }}>
							{pi.slice(1).map((v, idx) => (
								<div
									key={idx}
									className="flex flex-col items-center justify-center bg-purple-500/30 border border-purple-600"
									style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
								>
									<span className="text-xs font-mono text-purple-300">{v}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// Manacher 可视化
	if (algoId === 'manacher')
	{
		const d = vars.d as number[] | undefined;

		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔄</span> Manacher 最长回文子串
				</h3>

				{s && renderString(s, '处理后的字符串', [
					{ name: 'i', pos: i || 0, color: 'text-amber-400' }
				])}

				{l !== undefined && r !== undefined && (
					<div className="text-xs text-gray-400 mt-2">
						当前回文中心: i={i}, 边界: [{l}, {r}]
					</div>
				)}

				{d && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">d 数组 (回文半径):</div>
						<div className="flex flex-wrap" style={{ gap: `${gap}px` }}>
							{d.slice(0, 30).map((v, idx) => (
								<div
									key={idx}
									className={`flex items-center justify-center border ${
										idx === i
											? 'bg-amber-500/50 border-amber-600'
											: 'bg-gray-800 border-gray-600'
									}`}
									style={{ width: `${cellSize}px`, height: `${cellSize / 1.5}px` }}
								>
									<span className="text-[10px] font-mono text-gray-300">{v}</span>
								</div>
							))}
							{d.length > 30 && <div className="text-xs text-gray-600 self-center ml-1">...</div>}
						</div>
					</div>
				)}
			</div>
		);
	}

	return null;
};

export default StringVisualizer;
