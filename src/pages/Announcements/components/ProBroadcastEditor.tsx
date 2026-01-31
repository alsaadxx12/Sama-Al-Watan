import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Settings, Type, Sparkles, X, Check } from 'lucide-react';

interface ProBroadcastEditorProps {
    value: string;
    onChange: (val: string) => void;
    accentColor?: string;
    placeholder?: string;
}

const EMOJI_CATEGORIES = {
    "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲"],
    "Hands": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    "Nature": ["🐱", "🐶", "🦊", "🦁", "🐯", "🦒", "🦊", "🐼", "🐹", "🐭", "🐰", "🐨", "🐸", "🐷", "🐮", "🐗", "🐵", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🐣", "🦆", "🦢", "🦉", "🦚", "🦜", "🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌚", "🌛", "🌜", "🌡", "🌞", "🌝", "🌞", "⭐", "🌟", "🌠", "☁️", "⛅", "⛈️", "🌤️", "🌥️", "🌦️", "🌧️", "🌨️", "🌩️", "🌪️", "🌫️", "🌬️", "🌊", "💧", "💦", "☔"],
    "Activities": ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋", "⛸️", "🎿", "🛷", "🛹", "⛸️", "🥌", "🏄", "🏇", "🏊", "⛹️", "🏋️", "🚴", "🚵", "🏃", "💃", "🕺", "🕴️", "🧗", "🧘", "🛀", "🛌"],
    "Business": ["📢", "📣", "💬", "💭", "✉️", "📧", "💼", "🏢", "🏭", "🏦", "🏛️", "🏢", "🏪", "🏫", "🏬", "🏢", "🌇", "🌆", "🏘️", "📈", "📉", "📊", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "DVD", "📼", "📷", "📸", "📹", "🎥", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⏳", "⌛", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🗑️", "🛢️", "🛒", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖️", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🧰", "🧪", "🧪", "🧫", "🧬", "🧪", "🔭", "🔬", "🕳️", "💊", "💉", "🧬", "🌡️", "🧪", "🛡️", "🏹", "⚔️", "🗡️", "🧨", "🧱", "🛒", "💰", "💸", "💎", "⌛", "🔭", "🔬", "🧬"],
    "Symbols": ["✨", "💫", "⭐", "🌟", "🔥", "💥", "⚡", "🌈", "☀️", "❄️", "🍀", "💎", "👑", "📍", "🚩", "🔔", "💡", "🔑", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈺", "🈶", "🈚", "🈯", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗️", "㊙️", "🈺", "🈵", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜", "📁", "📂", "📅", "📆", "🗓️", "📊", "📈", "📉", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🗃️", "🗄️", "🗑️", "🔒", "🔓", "🔏", "🔐", "🔑", "🗝️", "🔨", "🪓", "⛏️", "⚒️", "🛠️", "🗡️", "⚔️", "🔫", "🏹", "🛡️", "🔧", "🪛", "🔩", "⚙️", "🗜️", "⚖️", "🔗", "⛓️", "🪝", "🧰", "🧲", "🪜", "🧪", "🧪", "🧬", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉", "🧬", "🔬", "🔭", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛳️", "⛴️", "🚢", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🛤️", "🛤️", "🚄", "🚅", "🚈", "🚞", "🚋", "🚃", "🚌", "🚐", "🚑", "🚒", "🚓", "🚔", "🚕", "🚖", "🚗", "🚘", "🚙", "🛻", "🚚", "🚛", "🚜", "🏎️", "🏍️", "🛵", "🦽", "🦼", "🛺", "🚲", "🛴", "🛹", "🛼", "⛽", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "⛵", "🛶", "🚤", "🛳️", "⛴️", "🚢", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🚠", "🚡", "🛰️", "🚀", "🛸", "🪐", "🌠", "🌌", "⛱️", "🎆", "🎇", "🎑", "🏙️", "🌉", "🌌"]
};

export const ProBroadcastEditor: React.FC<ProBroadcastEditorProps> = ({
    value,
    onChange,
    accentColor = "indigo",
    placeholder = "اكتب رسالتك الاحترافية هنا..."
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showSigSettings, setShowSigSettings] = useState(false);
    const [sigPrefix, setSigPrefix] = useState(localStorage.getItem('br_sig_prefix') || 'مع تحيات');
    const [sigName, setSigName] = useState(localStorage.getItem('br_sig_name') || 'اسم النشاط');
    const [activeTab, setActiveTab] = useState<keyof typeof EMOJI_CATEGORIES>("Smileys");

    const addText = (text: string) => {
        onChange(value + text);
    };

    const addSignature = () => {
        const sig = `\n\n*${sigPrefix}:* ✨ _${sigName}_ ✨`;
        addText(sig);
    };

    const saveSignature = () => {
        localStorage.setItem('br_sig_prefix', sigPrefix);
        localStorage.setItem('br_sig_name', sigName);
        setShowSigSettings(false);
    };

    const accentClass = accentColor === 'purple' ? 'purple' : 'indigo';
    const accentColorHex = accentColor === 'purple' ? '#a855f7' : '#6366f1';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 text-${accentClass}-500`} /> محرر البث الاحترافي
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 dark:bg-gray-900/50 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-800">
                        {value.length} حرف
                    </span>
                </div>
            </div>

            <div className={`relative transition-all duration-300 rounded-[2.2rem] p-1 ${value.length > 0 ? `bg-${accentClass}-500/5` : 'bg-transparent'}`}>
                <div className={`
                    bg-white dark:bg-gray-950 
                    border-[1.5px] rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300 group
                    ${value.length > 0 ? `border-${accentClass}-500/30` : 'border-gray-200 dark:border-gray-800'}
                    focus-within:border-${accentClass}-500 focus-within:ring-4 focus-within:ring-${accentClass}-500/10 focus-within:shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]
                `}>

                    {/* High-End Toolbar */}
                    <div className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                            {/* Formatting Group */}
                            <div className="flex bg-white dark:bg-gray-900 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                                <button title="عريض" onClick={() => addText("*عريض*")} className={`p-2 hover:bg-${accentClass}-500/10 rounded-lg text-gray-400 hover:text-${accentClass}-500 transition-all font-black text-xs w-8 h-8 flex items-center justify-center`}>B</button>
                                <button title="مائل" onClick={() => addText("_مائل_")} className={`p-2 hover:bg-${accentClass}-500/10 rounded-lg text-gray-400 hover:text-${accentClass}-500 transition-all italic text-xs w-8 h-8 flex items-center justify-center serif`}>I</button>
                                <button title="مشطوب" onClick={() => addText("~مشطوب~")} className={`p-2 hover:bg-${accentClass}-500/10 rounded-lg text-gray-400 hover:text-${accentClass}-500 transition-all line-through text-xs w-8 h-8 flex items-center justify-center`}>S</button>
                                <button title="برمجة" onClick={() => addText("```كود```")} className={`p-2 hover:bg-${accentClass}-500/10 rounded-lg text-gray-400 hover:text-${accentClass}-500 transition-all font-mono text-[10px] w-8 h-8 flex items-center justify-center`}>{"<>"}</button>
                            </div>

                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-0.5" />

                            {/* Emoji Launcher */}
                            <button
                                title="إدراج إيموجي"
                                onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); setShowSigSettings(false); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-${accentClass}-500 transition-all shadow-sm ${showEmojiPicker ? `ring-2 ring-${accentClass}-500/20 text-${accentClass}-500` : ''}`}
                            >
                                <Smile className="w-4 h-4" />
                                <span className="text-[10px] font-black">إيموجي</span>
                            </button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-0.5" />

                            {/* Signature Group */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    title="إضافة التوقيع المحفوظ"
                                    onClick={addSignature}
                                    className={`px-4 py-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-500 hover:text-${accentClass}-600 dark:hover:text-${accentClass}-400 shadow-sm hover:bg-${accentClass}-500/5 transition-all whitespace-nowrap`}
                                >
                                    إدراج التوقيع
                                </button>
                                <button
                                    title="إعدادات التوقيع"
                                    onClick={(e) => { e.preventDefault(); setShowSigSettings(!showSigSettings); setShowEmojiPicker(false); }}
                                    className={`p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-${accentClass}-500 transition-all shadow-sm ${showSigSettings ? `ring-2 ring-${accentClass}-500/20 text-${accentClass}-500` : ''}`}
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-0.5" />

                            {/* Clear Tool */}
                            <button
                                title="مسح النص"
                                onClick={() => onChange("")}
                                className="p-2 hover:bg-rose-500/10 rounded-xl text-gray-300 hover:text-rose-500 transition-all flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={10}
                        className="w-full bg-transparent p-6 text-[15px] font-bold text-black dark:text-white outline-none resize-none hide-scrollbar placeholder-gray-400/70 leading-relaxed"
                    />


                    {/* Advanced Emoji Picker Popover */}
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-14 left-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-[100] flex flex-col max-h-[300px]"
                            >
                                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveTab(cat as any)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${activeTab === cat ? `bg-${accentClass}-500 text-white` : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-8 gap-2 overflow-y-auto hide-scrollbar">
                                    {EMOJI_CATEGORIES[activeTab].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => { onChange(value + emoji); }}
                                            className="text-2xl hover:scale-125 transition-transform active:scale-95"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Signature Settings Popover */}
                    <AnimatePresence>
                        {showSigSettings && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                className="absolute top-14 right-4 w-[280px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-[100] p-5 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تخصيص التوقيع</h3>
                                    <button onClick={() => setShowSigSettings(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 px-1 flex items-center gap-2 uppercase tracking-tighter">
                                            <Type className="w-3 h-3 text-indigo-400" /> عبارة الترحيب
                                        </label>
                                        <input
                                            type="text"
                                            value={sigPrefix}
                                            onChange={(e) => setSigPrefix(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-black dark:text-white"
                                            placeholder="مثال: مع تحيات، من"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 px-1 flex items-center gap-2 uppercase tracking-tighter">
                                            <Sparkles className="w-3 h-3 text-amber-400" /> الهوية / الاسم
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sigName}
                                                onChange={(e) => setSigName(e.target.value)}
                                                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-black dark:text-white"
                                                placeholder="مثال: فريق الدعم"
                                            />
                                            <button
                                                onClick={saveSignature}
                                                className={`p-2 bg-${accentClass}-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-${accentClass}-500/30 flex items-center justify-center`}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <p className="text-[8px] text-gray-400 mb-1.5 uppercase font-black">معاينة الإدراج:</p>
                                    <p className={`text-[11px] font-black text-${accentClass}-600 dark:text-${accentClass}-400 leading-relaxed text-center`}>
                                        *{sigPrefix}:* ✨ _{sigName}_ ✨
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
