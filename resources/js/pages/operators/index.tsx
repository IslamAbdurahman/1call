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

export default function OperatorsIndex({ operators, groups }: { operators: any[], groups: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        extension: '',
        password: '',
        group_id: '',
    });
    const [editingOperator, setEditingOperator] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOperator) {
            router.put(`/operators/${editingOperator.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingOperator(null); }
            });
        } else {
            post('/operators', {
                onSuccess: () => { setIsOpen(false); reset(); }
            });
        }
    };

    const openEdit = (operator: any) => {
        setEditingOperator(operator);
        setData({
            name: operator.name,
            extension: operator.extension,
            password: operator.password || '',
            group_id: operator.group_id?.toString() || '',
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingOperator(null);
        setData({
            name: '',
            extension: '',
            password: '',
            group_id: '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/operators/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Operators', href: '/operators' }]}>
            <Head title="Operators" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Operators</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Operator</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingOperator ? 'Edit Operator' : 'Create Operator'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Operator Name"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="extension">Extension</Label>
                                    <Input
                                        id="extension"
                                        value={data.extension}
                                        onChange={e => setData('extension', e.target.value)}
                                        placeholder="101"
                                    />
                                    {errors.extension && <div className="text-red-500 text-sm">{errors.extension}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        value={data.password || ''}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="SIP Password"
                                    />
                                    {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
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
                                    {editingOperator ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Operator List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Extension</th>
                                        <th className="px-4 py-3">Group</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {operators.map((op) => (
                                        <tr key={op.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3">{op.id}</td>
                                            <td className="px-4 py-3">{op.name}</td>
                                            <td className="px-4 py-3">{op.extension}</td>
                                            <td className="px-4 py-3">{op.group?.name || '-'}</td>
                                            <td className="px-4 py-3 flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(op)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(op.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {operators.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-center text-gray-500">No operators found.</td>
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
