import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CallLogsIndex({ logs }: { logs: any }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Call Logs', href: '/call-logs' }]}>
            <Head title="Call Logs" />
            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">Call Logs</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Call History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Operator</th>
                                        <th className="px-4 py-3">Number</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log: any) => (
                                        <tr key={log.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3">{log.id}</td>
                                            <td className="px-4 py-3">{log.start_time}</td>
                                            <td className="px-4 py-3">{log.operator?.name || '-'}</td>
                                            <td className="px-4 py-3">{log.sip_number?.number || '-'}</td>
                                            <td className="px-4 py-3">{log.contact?.name || log.contact?.phone || '-'}</td>
                                            <td className="px-4 py-3">{log.duration}s</td>
                                            <td className="px-4 py-3">{log.status}</td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-3 text-center text-gray-500">No logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <div>showing {logs.from} to {logs.to} of {logs.total}</div>
                            <div className="flex gap-1">
                                {logs.links.map((link: any, i: number) => (
                                    link.url ?
                                        <Link key={i} href={link.url} className={`px-2 py-1 border rounded ${link.active ? 'bg-gray-200' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        : <span key={i} className="px-2 py-1 border rounded text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
