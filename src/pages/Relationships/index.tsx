import { useState, useEffect } from 'react';
import { Users, Link2, TrendingDown, Layers, Search, Loader2 } from 'lucide-react';
import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

const Relationships = () => {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const collections = ['students', 'instructors', 'expenses', 'clients', 'companies'];
                const newCounts: Record<string, number> = {};

                for (const coll of collections) {
                    if (coll === 'students') {
                        const snap = await getDocs(collectionGroup(db, 'students'));
                        newCounts[coll] = snap.size;
                    } else {
                        const snap = await getDocs(collection(db, coll));
                        newCounts[coll] = snap.size;
                    }
                }
                setCounts(newCounts);
            } catch (err) {
                console.error('Error fetching counts:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCounts();
    }, []);

    const categories = [
        { id: 'students', name: 'الطلبة', icon: Users, color: 'bg-blue-500', count: counts['students'] || 0 },
        { id: 'instructors', name: 'الأساتذة', icon: Users, color: 'bg-emerald-500', count: counts['instructors'] || 0 },
        { id: 'expenses', name: 'المصاريف', icon: TrendingDown, color: 'bg-rose-50', iconColor: 'text-rose-600', count: counts['expenses'] || 0 },
        { id: 'clients', name: 'العملاء', icon: Link2, color: 'bg-indigo-50', iconColor: 'text-indigo-600', count: counts['clients'] || 0 },
        { id: 'suppliers', name: 'الموردين', icon: Layers, color: 'bg-orange-50', iconColor: 'text-orange-600', count: counts['companies'] || 0 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-600/20">
                        <Link2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">دليل العلاقات</h1>
                        <p className="text-sm text-gray-500 mt-1 font-bold">إدارة وتصنيف جميع الحسابات والجهات الخارجية</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="بحث في العلاقات..."
                            className="w-full md:w-64 pr-10 pl-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/relationships/${cat.id}`)}
                        className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group text-right relative overflow-hidden"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${cat.id === 'students' || cat.id === 'instructors' ? 'bg-white' : 'bg-current'}`} />

                        <div className="flex items-center gap-5 mb-6 relative z-10">
                            <div className={`p-4 ${cat.id === 'students' || cat.id === 'instructors' ? cat.color : cat.color} ${cat.iconColor || 'text-white'} rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform`}>
                                <cat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{cat.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.id}</span>
                                    {isLoading ? (
                                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                    ) : (
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg">
                                            {cat.count} حساب
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-gray-400 italic group-hover:text-blue-500 transition-colors">عرض التفاصيل والعمليات</span>
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Link2 className="w-5 h-5 rtl:rotate-180" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Relationships;
