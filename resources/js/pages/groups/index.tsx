import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function GroupsIndex({ groups }: { groups: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGroup) {
            router.put(`/groups/${editingGroup.id}`, { name: data.name }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingGroup(null); }
            });
        } else {
            post('/groups', {
                onSuccess: () => { setIsOpen(false); reset(); }
            });
        }
    };

    const openEdit = (group: any) => {
        setEditingGroup(group);
        setData('name', group.name);
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingGroup(null);
        setData('name', '');
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/groups/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Groups', href: '/groups' }]}>
            <Head title="Groups" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Groups</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Group</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingGroup ? 'Edit Group' : 'Create Group'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Group Name"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {editingGroup ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Group List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Operators</th>
                                        <th className="px-4 py-3">Lines</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((group) => (
                                        <tr key={group.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3">{group.id}</td>
                                            <td className="px-4 py-3">{group.name}</td>
                                            <td className="px-4 py-3">{group.operators_count}</td>
                                            <td className="px-4 py-3">{group.sip_numbers_count}</td>
                                            <td className="px-4 py-3 flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(group)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(group.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groups.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-center text-gray-500">No groups found.</td>
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
