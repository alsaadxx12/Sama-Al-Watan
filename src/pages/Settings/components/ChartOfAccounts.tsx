import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    GitBranch, Plus, ChevronDown, Loader2, AlertTriangle,
    Search, X, Check, Wallet, ShieldAlert, Scale, Coins,
    TrendingDown, Layers, FolderTree, Hash, FileText, Globe
} from 'lucide-react';
import { coaService, COANode } from '../../../lib/services/coaService';

/* ─── helpers ─── */
const getTypeIcon = (type: COANode['type']) => {
    switch (type) {
        case 'asset': return <Wallet className="w-4 h-4" />;
        case 'liability': return <ShieldAlert className="w-4 h-4" />;
        case 'equity': return <Scale className="w-4 h-4" />;
        case 'revenue': return <Coins className="w-4 h-4" />;
        case 'expense': return <TrendingDown className="w-4 h-4" />;
        default: return <Layers className="w-4 h-4" />;
    }
};

const getTypeStyle = (type: COANode['type']) => {
    switch (type) {
        case 'asset': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200/60 dark:border-blue-700/40';
        case 'liability': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 border-rose-200/60 dark:border-rose-700/40';
        case 'equity': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-700/40';
        case 'revenue': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-700/40';
        case 'expense': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 border-orange-200/60 dark:border-orange-700/40';
        default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800/30 border-gray-200/60 dark:border-gray-700/40';
    }
};

const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('en-IQ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

/* ─── tree node type ─── */
interface TreeNode {
    data: COANode;
    children: TreeNode[];
}

/* ─── recursive row component ─── */
const TreeRow = ({
    node,
    depth,
    onAdd,
}: {
    node: TreeNode;
    depth: number;
    onAdd: (parent: COANode) => void;
}) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children.length > 0;
    const isVirtual = (node.data as any).isVirtual;

    return (
        <>
            {/* ── single row ── */}
            <div
                className="group grid items-center border-b border-gray-50 dark:border-gray-800/60 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors"
                style={{ gridTemplateColumns: '1fr 120px 120px 120px' }}
                dir="rtl"
            >
                {/* account name cell */}
                <div
                    className="flex items-center gap-2 py-3 px-4 min-h-[52px]"
                    style={{ paddingRight: `${16 + depth * 28}px` }}
                >
                    {/* expand / collapse toggle */}
                    {hasChildren ? (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shrink-0"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
                        </button>
                    ) : (
                        <div className="w-7 h-7 shrink-0" />
                    )}

                    {/* type icon */}
                    <div className={`p-1.5 rounded-lg border shrink-0 ${getTypeStyle(node.data.type)}`}>
                        {getTypeIcon(node.data.type)}
                    </div>

                    {/* name & code */}
                    <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate leading-tight ${isVirtual ? 'text-indigo-600 dark:text-indigo-400 italic' : 'text-gray-900 dark:text-white'}`}>
                            {node.data.nameAr || node.data.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wider">{node.data.code}</span>
                    </div>

                    {/* add sub-account */}
                    {!isVirtual && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(node.data); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-blue-500 transition-all mr-auto shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* debit */}
                <div className="text-center font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold py-3 border-r border-gray-100 dark:border-gray-800/40">
                    {formatCurrency(node.data.debit)}
                </div>

                {/* credit */}
                <div className="text-center font-mono text-xs text-rose-600 dark:text-rose-400 font-bold py-3 border-r border-gray-100 dark:border-gray-800/40">
                    {formatCurrency(node.data.credit)}
                </div>

                {/* balance */}
                <div className={`text-center font-mono text-xs font-black py-3 border-r border-gray-100 dark:border-gray-800/40 ${(node.data.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(node.data.balance)}
                </div>
            </div>

            {/* ── children ── */}
            {expanded && node.children.map(child => (
                <TreeRow key={child.data.id} node={child} depth={depth + 1} onAdd={onAdd} />
            ))}
        </>
    );
};

/* ─── main component ─── */
const ChartOfAccounts = () => {
    const [accounts, setAccounts] = useState<COANode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<COANode | null>(null);
    const [newNode, setNewNode] = useState({
        name: '',
        nameAr: '',
        code: '',
        type: 'asset' as COANode['type']
    });

    useEffect(() => { fetchAccounts(); }, []);

    useEffect(() => {
        if (isAddModalOpen && selectedParent) {
            // Calculate next code locally using already-loaded accounts
            const siblings = accounts.filter(a => a.parentId === selectedParent.id);
            const parentCode = selectedParent.code;
            let maxSuffix = 0;
            for (const sibling of siblings) {
                if (sibling.code.startsWith(parentCode)) {
                    const suffix = sibling.code.slice(parentCode.length);
                    const num = parseInt(suffix);
                    if (!isNaN(num) && num > maxSuffix) maxSuffix = num;
                }
            }
            const nextCode = parentCode + (maxSuffix + 1).toString();
            setNewNode(prev => ({ ...prev, code: nextCode, type: selectedParent.type }));
        } else if (isAddModalOpen && !selectedParent) {
            // Root-level: find highest root code
            const rootAccounts = accounts.filter(a => a.parentId === null);
            let maxCode = 0;
            for (const acc of rootAccounts) {
                const num = parseInt(acc.code);
                if (!isNaN(num) && num > maxCode) maxCode = num;
            }
            setNewNode(prev => ({ ...prev, code: (maxCode + 1).toString() }));
        }
    }, [isAddModalOpen, selectedParent, accounts]);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const data = await coaService.getHybridAccounts();
            if (data.length === 0) {
                await coaService.initializeDefaultCOA();
                const freshData = await coaService.getHybridAccounts();
                setAccounts(freshData);
            } else {
                setAccounts(data);
            }
        } catch (err: any) {
            setError(err.message || 'فشل تحميل شجرة الحسابات');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAccount = async () => {
        if (!newNode.nameAr || !newNode.code) return;
        try {
            const node: Omit<COANode, 'id'> = {
                name: newNode.name || newNode.nameAr,
                nameAr: newNode.nameAr,
                code: newNode.code,
                parentId: selectedParent?.id || null,
                type: newNode.type,
                level: (selectedParent?.level || 0) + 1,
                isLeaf: true,
                debit: 0,
                credit: 0,
                balance: 0
            };
            await coaService.addAccount(node);
            setIsAddModalOpen(false);
            setNewNode({ name: '', nameAr: '', code: '', type: 'asset' });
            fetchAccounts();
        } catch (err: any) {
            setError(err.message);
        }
    };

    /* build recursive tree */
    const buildTree = (nodes: COANode[], parentId: string | null = null): TreeNode[] =>
        nodes
            .filter(n => n.parentId === parentId)
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(n => ({
                data: n,
                children: buildTree(nodes, n.id),
            }));

    const treeData = buildTree(accounts);

    const handleAdd = (parent: COANode) => {
        setSelectedParent(parent);
        setNewNode(prev => ({ ...prev, name: '', nameAr: '', type: parent.type }));
        setIsAddModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* ── header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                        <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">دليل الحسابات الذكي</h2>
                        <p className="text-xs text-gray-500 font-bold">إدارة الهيكل المالي والموازين بشكل شجري</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="بحث في الشجرة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedParent(null); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة حساب رئيسي
                    </button>
                </div>
            </div>

            {/* ── tree table container ── */}
            <div className="flex-1 min-h-[500px] bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                {/* table header */}
                <div
                    className="grid items-center bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200/80 dark:border-gray-800"
                    style={{ gridTemplateColumns: '1fr 120px 120px 120px' }}
                    dir="rtl"
                >
                    <div className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        اسم الحساب والكود
                    </div>
                    <div className="px-2 py-4 text-center text-[11px] font-black text-emerald-600/80 uppercase tracking-wider border-r border-gray-200/60 dark:border-gray-700/40">
                        مدين
                    </div>
                    <div className="px-2 py-4 text-center text-[11px] font-black text-rose-600/80 uppercase tracking-wider border-r border-gray-200/60 dark:border-gray-700/40">
                        دائن
                    </div>
                    <div className="px-2 py-4 text-center text-[11px] font-black text-blue-600/80 uppercase tracking-wider border-r border-gray-200/60 dark:border-gray-700/40">
                        الرصيد
                    </div>
                </div>

                {/* tree body */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-gray-400 font-bold animate-pulse">جاري تحليل البيانات المالية...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 text-rose-600">
                            <AlertTriangle className="w-12 h-12" />
                            <p className="font-black text-lg">{error}</p>
                            <button onClick={fetchAccounts} className="px-8 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20">إعادة المحاولة</button>
                        </div>
                    ) : (
                        <div>
                            {treeData.map(node => (
                                <TreeRow key={node.data.id} node={node} depth={0} onAdd={handleAdd} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── add account modal via portal ── */}
            {isAddModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />

                    {/* modal card */}
                    <div
                        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden text-right"
                        style={{ animation: 'scaleIn 0.25s ease-out' }}
                    >
                        {/* header */}
                        <div className="px-8 pt-7 pb-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white">إضافة حساب جديد</h4>
                                    {selectedParent && (
                                        <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                                            <FolderTree className="w-3 h-3" />
                                            فرع من: <span className="text-blue-600 font-black">{selectedParent.nameAr || selectedParent.name}</span>
                                            <span className="text-gray-300 mx-1">|</span>
                                            <span className="font-mono text-gray-500">{selectedParent.code}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-8 py-6 space-y-5">
                            {/* type selector with icons */}
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 block">نوع الحساب</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { id: 'asset', name: 'أصول', icon: <Wallet className="w-4 h-4" />, bg: 'bg-blue-600', ring: 'ring-blue-200 dark:ring-blue-800', light: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-800' },
                                        { id: 'liability', name: 'خصوم', icon: <ShieldAlert className="w-4 h-4" />, bg: 'bg-rose-600', ring: 'ring-rose-200 dark:ring-rose-800', light: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border-rose-200 dark:border-rose-800' },
                                        { id: 'equity', name: 'ملكية', icon: <Scale className="w-4 h-4" />, bg: 'bg-amber-600', ring: 'ring-amber-200 dark:ring-amber-800', light: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-200 dark:border-amber-800' },
                                        { id: 'revenue', name: 'إيرادات', icon: <Coins className="w-4 h-4" />, bg: 'bg-emerald-600', ring: 'ring-emerald-200 dark:ring-emerald-800', light: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-800' },
                                        { id: 'expense', name: 'مصاريف', icon: <TrendingDown className="w-4 h-4" />, bg: 'bg-orange-600', ring: 'ring-orange-200 dark:ring-orange-800', light: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 border-orange-200 dark:border-orange-800' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setNewNode({ ...newNode, type: t.id as any })}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-black transition-all ${newNode.type === t.id
                                                ? `${t.bg} text-white border-transparent shadow-lg ring-4 ${t.ring}`
                                                : `${t.light} hover:shadow-md`
                                                }`}
                                        >
                                            {t.icon}
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* code - auto generated */}
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" />
                                    كود الحساب (تلقائي)
                                </label>
                                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/40">
                                    <span className="text-xl font-black text-blue-600 font-mono flex-1 text-center tracking-widest">{newNode.code || '---'}</span>
                                </div>
                            </div>

                            {/* arabic name */}
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" />
                                    اسم الحساب (عربي)
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newNode.nameAr}
                                    onChange={(e) => setNewNode({ ...newNode, nameAr: e.target.value })}
                                    placeholder="مثلاً: صندوق النثرية"
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-right"
                                />
                            </div>

                            {/* english name */}
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" />
                                    Account Name (English)
                                </label>
                                <input
                                    type="text"
                                    value={newNode.name}
                                    onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                                    placeholder="e.g. Petty Cash"
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* footer */}
                        <div className="px-8 py-5 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                            <button
                                onClick={handleAddAccount}
                                disabled={!newNode.nameAr || !newNode.code}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Check className="w-4 h-4" />
                                حفظ الحساب
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-8 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>

                    {/* animations */}
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    `}</style>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ChartOfAccounts;
