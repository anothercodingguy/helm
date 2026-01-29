import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { FileText, Download, FileSpreadsheet, FileCode, FolderArchive } from 'lucide-react';

const getIcon = (filename: string) => {
    if (filename.endsWith('.csv')) return <FileSpreadsheet size={16} />;
    if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.json')) return <FileCode size={16} />;
    if (filename.endsWith('.zip')) return <FolderArchive size={16} />;
    return <FileText size={16} />;
};

export default function ArtifactsPanel() {
    const { fileList } = useChatStore();

    return (
        <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col w-full">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Workspace Artifacts</h2>
                <span className="bg-zinc-900 text-zinc-600 text-[10px] px-2 py-0.5 rounded-full border border-zinc-800">
                    {fileList.length}
                </span>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {fileList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-700">
                        <FolderArchive size={32} strokeWidth={1} />
                        <span className="text-xs italic">No artifacts generated.</span>
                    </div>
                ) : (
                    fileList.map((file, i) => (
                        <div key={i} className="group flex items-center justify-between p-3 rounded-md bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-zinc-800 rounded text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                    {getIcon(file.filename)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-zinc-300 truncate font-medium">{file.filename}</span>
                                    <span className="text-[10px] text-zinc-600">Generated now</span>
                                </div>
                            </div>
                            <a
                                href={file.url}
                                download
                                className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Download"
                            >
                                <Download size={14} />
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
