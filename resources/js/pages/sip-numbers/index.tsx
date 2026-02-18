import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function SipNumbersIndex({ sipNumbers, groups }: { sipNumbers: any[], groups: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        number: '',
        group_id: '',
    });
    const [editingSip, setEditingSip] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSip) {
            router.put(`/sip-numbers/${editingSip.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingSip(null); }
            });
        } else {
            post('/sip-numbers', {
                onSuccess: () => { setIsOpen(false); reset(); }
            });
        }
    };

    const openEdit = (sip: any) => {
        setEditingSip(sip);
        setData({
            number: sip.number,
            group_id: sip.group_id?.toString() || '',
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingSip(null);
        setData({
            number: '',
            group_id: '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/sip-numbers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'SIP Numbers', href: '/sip-numbers' }]}>
            <Head title="SIP Numbers" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">SIP Numbers</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add SIP Number</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingSip ? 'Edit SIP Number' : 'Create SIP Number'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="number">Number</Label>
                                    <Input
                                        id="number"
                                        value={data.number}
                                        onChange={e => setData('number', e.target.value)}
                                        placeholder="SIP Number"
                                    />
                                    {errors.number && <div className="text-red-500 text-sm">{errors.number}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="group">Group</Label>
                                    <Select value={data.group_id} onValueChange={val => setData('group_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.group_id && <div className="text-red-500 text-sm">{errors.group_id}</div>}
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {editingSip ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>SIP Number List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Number</th>
                                        <th className="px-4 py-3">Group</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sipNumbers.map((sip) => (
                                        <tr key={sip.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3">{sip.id}</td>
                                            <td className="px-4 py-3">{sip.number}</td>
                                            <td className="px-4 py-3">{sip.group?.name || '-'}</td>
                                            <td className="px-4 py-3 flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(sip)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(sip.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sipNumbers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No numbers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
